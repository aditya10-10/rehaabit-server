const mongoose = require("mongoose");
const { instance } = require("../config/razorpay");
const crypto = require("crypto");
const Cart = require("../models/Cart");
const User = require("../models/User");
const Order = require("../models/Order");
const Service = require("../models/Service");
const OrderStatus = require("../models/OrderStatus");
const Partner = require("../models/Partner");
const { generateOrderId } = require("../utils/generateId");

exports.processPayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { singleOrder, isSingleOrder } = req.body;

    // Find user with cart and addresses
    const user = await User.findById(userId)
      .populate({
        path: "cart",
        populate: {
          path: "services.serviceId",
          model: "Service",
        },
      })
      .populate("address");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Partner
    // const partner = await Partner.findById(partnerId);
    // if (!partner) {
    //   return res.status(404).json({
    //     success: false,
    //     message: "Partner not found",
    //   });
    // }

    // Determine which services to process (from cart or singleOrder)
    const servicesToProcess = isSingleOrder ? singleOrder : user.cart.services;
    const totalAmount = servicesToProcess.reduce(
      (total, service) => total + service.price * service.qty,
      0
    );

    // Find the selected address (default address)
    const selectedAddress = user.address.find(
      (addr) => addr.status === "Default"
    );
    if (!selectedAddress) {
      return res.status(400).json({
        success: false,
        message: "No default address found. Please select or set an address.",
      });
    }

    const options = {
      amount: totalAmount * 100, // amount in the smallest currency unit (INR)
      currency: "INR",
      receipt: `receipt_${crypto.randomBytes(10).toString("hex")}`,
    };

    console.log(options);

    const paymentResponse = await instance.orders.create(options);
    if (!paymentResponse) {
      return res.status(500).json({
        success: false,
        message: "Failed to create payment order",
      });
    }

    return res.json({
      success: true,
      message: "Payment order created successfully",
      paymentDetails: paymentResponse,
    });
  } catch (error) {
    console.error("Error creating payment order:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      isSingleOrder,
      singleOrder,
      // partnerId,
    } = req.body;

    const userId = req.user.id;
    const user = await User.findById(userId)
      .populate({
        path: "cart",
        populate: {
          path: "services.serviceId",
          model: "Service",
        },
      })
      .populate("address");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Partner
    // const partner = await Partner.findById(partnerId);
    // if (!partner) {
    //   return res.status(404).json({
    //     success: false,
    //     message: "Partner not found",
    //   });
    // }

    const selectedAddress = user.address.find(
      (addr) => addr.status === "Default"
    );
    if (!selectedAddress) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Payment details are incomplete" });
    }

    // Verify the payment signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed!",
      });
    }

    // Determine which services to process (from cart or singleOrder)
    const servicesToProcess = isSingleOrder ? singleOrder : user.cart.services;

    // Create a new order status
    const orderStatus = new OrderStatus({
      statuses: [{ status: "pending" }],
    });
    await orderStatus.save();

    // console.log(singleOrder);

    // Create a new order
    const id = await generateOrderId();
    const newOrder = new Order({
      user: userId,
      orderId: id,
      services: servicesToProcess.map((service) => ({
        serviceId: isSingleOrder ? service.serviceId : service.serviceId._id,
        qty: service.qty,
        price: service.price,
        serviceName: isSingleOrder
          ? service.serviceName
          : service.serviceId.serviceName,
        serviceDescription: isSingleOrder
          ? service.serviceDescription
          : service.serviceId.serviceDescription,
      })),
      address: selectedAddress._id,
      paymentId: razorpay_payment_id,
      totalCost: servicesToProcess.reduce(
        (total, service) => total + service.price * service.qty,
        0
      ),
      status: orderStatus._id,
    });

    // Save the new order
    await newOrder.save();

    // If using the cart, clear it
    if (!isSingleOrder) {
      user.cart.services = [];
      user.cart.totalQty = 0;
      user.cart.totalCost = 0;
      await user.cart.save();
    }

    // user.partner = partner;

    // Update user's order list
    user.orders.push(newOrder._id);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Payment Verified and Order Added",
      order: newOrder,
    });
  } catch (error) {
    console.error("Error verifying payment and placing order:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

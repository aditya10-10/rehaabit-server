const mongoose = require("mongoose");
const { instance } = require("../config/razorpay");
const crypto = require("crypto");
const Cart = require("../models/Cart");
const User = require("../models/User");
const Order = require("../models/Order");
const Service = require("../models/Service");

// Process Payment and Create Razorpay Order
exports.processPayment = async (req, res) => {
  const { services } = req.body;
  const userId = req.user.id;

  console.log("Services being sent:", services);

  if (!services || services.length === 0) {
    return res.json({ success: false, message: "Please provide services" });
  }

  let totalAmount = 0;
  for (const serviceId of services) {
    const service = await Service.findById(serviceId);
    console.log("services", service);
    if (!service) {
      return res.json({
        success: false,
        message: `Service ${serviceId} not found`,
      });
    }
    totalAmount += service.price;
  }

  const options = {
    amount: totalAmount * 100, // amount in the smallest currency unit
    currency: "INR",
    receipt: `receipt_${crypto.randomBytes(10).toString("hex")}`,
  };

  try {
    const paymentResponse = await instance.orders.create(options);
    res.json({ success: true, message: paymentResponse });
  } catch (error) {
    console.error("Error creating payment order:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Verify Payment and Update Order
exports.verifyPayment = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    services,
  } = req.body;
  const userId = req.user.id;

  if (
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature ||
    !services ||
    !userId
  ) {
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
    return res
      .status(400)
      .json({ success: false, message: "Payment verification failed!" });
  }

  // Proceed to add services to the order
  try {
    const newOrder = await addToOrder(services, userId);
    return res
      .status(200)
      .json({ success: true, message: "Payment Verified", order: newOrder });
  } catch (error) {
    console.error("Error adding to order:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

// Function to add services to the user's order
const addToOrder = async (services, userId) => {
  try {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, services: [], totalQty: 0, totalCost: 0 });
    }

    let totalQty = cart.totalQty;
    let totalCost = cart.totalCost;

    for (const serviceId of services) {
      const service = await Service.findById(serviceId);

      if (!service) {
        throw new Error(`Service ${serviceId} not found`);
      }

      const existingServiceIndex = cart.services.findIndex(
        (item) => item.serviceId.toString() === serviceId
      );

      if (existingServiceIndex > -1) {
        cart.services[existingServiceIndex].qty += 1;
        cart.services[existingServiceIndex].price = service.price;
      } else {
        cart.services.push({
          serviceId: service._id,
          qty: 1,
          price: service.price,
          serviceName: service.name,
          serviceDescription: service.description,
        });
      }

      totalQty += 1;
      totalCost += service.price;
    }

    cart.totalQty = totalQty;
    cart.totalCost = totalCost;

    await cart.save();

    const order = await Order.findOneAndUpdate(
      { userId },
      {
        $push: { services: { $each: cart.services } },
        totalQty: cart.totalQty,
        totalCost: cart.totalCost,
      },
      { new: true, upsert: true }
    );

    return order;
  } catch (error) {
    console.error("Error adding services to order:", error);
    throw error;
  }
};

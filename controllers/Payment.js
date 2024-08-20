const mongoose = require("mongoose");
const { instance } = require("../config/razorpay");
const crypto = require("crypto");
const Cart = require("../models/Cart");
const User = require("../models/User");
const Order = require("../models/Order");
const Service = require("../models/Service");
const OrderStatus = require("../models/OrderStatus");

// Process Payment and Create Razorpay Order
// exports.processPayment = async (req, res) => {
//   const { services } = req.body; // This should be an array of service objects with serviceId, qty, and price
//   const userId = req.user.id;

//   console.log("Services being sent:", services);

//   if (!services || services.length === 0) {
//     return res.json({ success: false, message: "Please provide services" });
//   }

//   let totalAmount = 0;
//   try {
//     for (const service of services) {
//       const { serviceId, qty, price } = service;
//       const serviceRecord = await Service.findById(serviceId);

//       if (!serviceRecord) {
//         return res.status(404).json({
//           success: false,
//           message: `Service ${serviceId} not found`,
//         });
//       }

//       // Calculate the total amount based on qty and price
//       totalAmount += price * qty;
//     }

//     const options = {
//       amount: totalAmount * 100, // amount in the smallest currency unit
//       currency: "INR",
//       receipt: `receipt_${crypto.randomBytes(10).toString("hex")}`,
//     };

//     const paymentResponse = await instance.orders.create(options);
//     res.json({ success: true, message: paymentResponse });
//   } catch (error) {
//     console.error("Error creating payment order:", error);
//     res.status(500).json({ success: false, message: "Internal Server Error" });
//   }
// };

// Process Payment and Create Razorpay Order

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

// Verify Payment and Update Order
// exports.verifyPayment = async (req, res) => {
//   const {
//     razorpay_order_id,
//     razorpay_payment_id,
//     razorpay_signature,
//     services,
//   } = req.body;

//   const userId = req.user.id;

//   console.log("Payment Verification Details");

//   if (
//     !razorpay_order_id ||
//     !razorpay_payment_id ||
//     !razorpay_signature ||
//     !services ||
//     !userId
//   ) {
//     return res
//       .status(400)
//       .json({ success: false, message: "Payment details are incomplete" });
//   }

//   // Verify the payment signature
//   const generatedSignature = crypto
//     .createHmac("sha256", process.env.RAZORPAY_SECRET)
//     .update(`${razorpay_order_id}|${razorpay_payment_id}`)
//     .digest("hex");

//   if (generatedSignature !== razorpay_signature) {
//     return res
//       .status(400)
//       .json({ success: false, message: "Payment verification failed!" });
//   }

//   // Proceed to add services to the order
//   try {
//     const newOrder = await addToOrder(services, userId);

//     // Add the new order to the user's orders array
//     const addOrderResult = await addOrderToUser(userId, newOrder._id);
//     if (!addOrderResult.success) {
//       return res
//         .status(500)
//         .json({ success: false, message: addOrderResult.message });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Payment Verified and Order Added",
//       order: newOrder,
//     });
//   } catch (error) {
//     console.error("Error adding to order:", error);
//     return res
//       .status(500)
//       .json({ success: false, message: "Internal Server Error" });
//   }
// };

// Verify Payment and Update Order

exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      isSingleOrder,
      singleOrder,
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
      status: "placed",
    });
    await orderStatus.save();

    console.log(singleOrder);

    // Create a new order
    const newOrder = new Order({
      user: userId,
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

// Function to add the order to the user's schema
// Function to add services to the user's order
// const addToOrder = async (services, userId) => {
//   try {
//     let cart = await Cart.findOne({ userId });

//     if (!cart) {
//       cart = new Cart({ userId, services: [], totalQty: 0, totalCost: 0 });
//     }

//     let totalQty = cart.totalQty;
//     let totalCost = cart.totalCost;

//     for (const service of services) {
//       const { serviceId, qty, price } = service;
//       const serviceRecord = await Service.findById(serviceId);

//       if (!serviceRecord) {
//         throw new Error(`Service ${serviceId} not found`);
//       }

//       const existingServiceIndex = cart.services.findIndex(
//         (item) => item.serviceId.toString() === serviceId
//       );

//       if (existingServiceIndex > -1) {
//         cart.services[existingServiceIndex].qty += qty;
//         cart.services[existingServiceIndex].price = price;
//       } else {
//         cart.services.push({
//           serviceId: serviceRecord._id,
//           qty,
//           price,
//           serviceName: serviceRecord.serviceName,
//           serviceDescription: serviceRecord.serviceDescription,
//         });
//       }

//       totalQty += qty;
//       totalCost += price * qty;
//     }

//     cart.totalQty = totalQty;
//     cart.totalCost = totalCost;

//     await cart.save();

//     const order = await Order.findOneAndUpdate(
//       { user: userId }, // Assuming `user` is the reference in your order schema
//       {
//         $push: { services: { $each: cart.services } },
//         totalQty: cart.totalQty,
//         totalCost: cart.totalCost,
//       },
//       { new: true, upsert: true }
//     );

//     return order;
//   } catch (error) {
//     console.error("Error adding services to order:", error);
//     throw error;
//   }
// };

// // Function to add the order to the user's schema
// const addOrderToUser = async (userId, orderId) => {
//   try {
//     // Find the user by their ID
//     const user = await User.findById(userId);

//     if (!user) {
//       throw new Error(`User with ID ${userId} not found`);
//     }

//     // Add the order ID to the user's orders array
//     user.orders.push(orderId);

//     // Save the updated user document
//     await user.save();

//     return {
//       success: true,
//       message: "Order added to user's profile successfully",
//     };
//   } catch (error) {
//     console.error("Error adding order to user:", error);
//     return {
//       success: false,
//       message: error.message,
//     };
//   }
// };

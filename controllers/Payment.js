const mongoose = require("mongoose");
const { instance } = require("../config/razorpay");
const crypto = require("crypto");
const Cart = require("../models/Cart");
const User = require("../models/User");
const Order = require("../models/Order");
const Service = require("../models/Service");

exports.processPayment = async (req, res) => {
  const userId = req.user.id;

  const { services } = req.body;

  if (services.length === 0) {
    return res.json({
      success: false,
      message: "please provide services",
    });
  }

  // // Step 1: Retrieve the user's cart
  // const user = await User.findById(userId).populate({
  //   path: "cart",
  //   populate: {
  //     path: "services.serviceId",
  //     model: "Service",
  //   },
  // });

  // if (!user || !user.cart) {
  //   return res.status(400).json({ message: "No cart found for this user" });
  // }

  // Step 2: Calculate the total value of the services in the cart
  let totalAmount = 0;

  for (const serviceId of services) {
    let service;
    try {
      service = await Service.findById(serviceId);

      if (!service) {
        return res.json({
          success: false,
          message: "please provide services",
        });
      }

      totalAmount = service.price * service.qty;
    } catch (error) {
      console.log("error", error);
      return res.json({
        success: false,
        message: "please provide services",
      });
    }
  }

  // Step 3: Create an order in Razorpay
  const options = {
    amount: totalAmount * 100, // amount in the smallest currency unit
    currency: "INR",
    receipt: `receipt_${crypto.randomBytes(10).toString("hex")}`,
  };

  try {
    const paymentResponse = await instance.orders.create(options);
    res.json({
      success: true,
      message: paymentResponse,
    });
  } catch (error) {
    console.error("Error processing payment:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// const order = await razorpay.orders.create(options);

// // Step 4: Save the order details in the database
// const newOrder = new Order({
//   userId: user._id,
//   orderItems,
//   totalAmount,
//   razorpayOrderId: order.id,
//   status: "Created",
// });

// await newOrder.save();

// // Step 5: Respond with the order details
// res.status(200).json({
//   success: true,
//   order,
//   orderId: newOrder._id,
// });

// Verify Payment and Update Order
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    // Step 6: Verify the payment signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (generatedSignature !== razorpaySignature) {
      return res.status(400).json({ message: "Payment verification failed!" });
    }

    // Step 7: Update payment status to "SUCCESS"
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId },
      { status: "SUCCESS", razorpayPaymentId },
      { new: true }
    );

    // Step 8: Create the order entry after successful payment
    const newOrder = await Order.create({
      user: payment.userId,
      products: payment.orderItems,
      totalAmount: payment.amount,
      payment: payment._id,
      paymentStatus: "PAID",
    });

    // Step 9: Update user's order history
    await User.findByIdAndUpdate(payment.userId, {
      $push: { orders: newOrder._id },
    });

    // Step 10: Respond with success message
    res.status(200).json({
      message: "Payment verified and order placed successfully!",
      order: newOrder,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.verifyPayment = async (req, res) => {
  const razorpay_order_id = req.body?.razorpay_order_id;
  const razorpay_payment_id = req.body?.razorpay_payment_id;
  const razorpay_signature = req.body?.razorpay_signature;
  const services = req.body?.services;

  const userId = req.user.id;

  if (
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature ||
    !services ||
    !userId
  ) {
    return res.status(200).json({ success: false, message: "Payment Failed" });
  }

  let body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    await addToOrder(services, userId, res);
    return res.status(200).json({ success: true, message: "Payment Verified" });
  }

  return res.status(200).json({ success: false, message: "Payment Failed" });
};

// enroll the student in the services
// const addToCart = async (services, userId, res) => {
//   if (!services || !userId) {
//     return res.status(400).json({
//       success: false,
//       message: "Please Provide Course ID and User ID",
//     });
//   }

//   for (const serviceId of services) {
//     try {
//       // Find the course and enroll the student in it
//       const addServicesInOrder = await Order.findOneAndUpdate(
//         { _id: serviceId },
//         { $push: { studentsEnroled: userId } },
//         { new: true }
//       );

//       if (!enrolledCourse) {
//         return res
//           .status(500)
//           .json({ success: false, error: "Course not found" });
//       }
//       console.log("Updated course: ", enrolledCourse);

//       const courseProgress = await CourseProgress.create({
//         serviceId: serviceId,
//         userId: userId,
//         completedVideos: [],
//       });
//       // Find the student and add the course to their list of enrolled services
//       const enrolledStudent = await User.findByIdAndUpdate(
//         userId,
//         {
//           $push: {
//             services: serviceId,
//             courseProgress: courseProgress._id,
//           },
//         },
//         { new: true }
//       );

//       console.log("Enrolled student: ", enrolledStudent);
//       // Send an email notification to the enrolled student
//       const emailResponse = await mailSender(
//         enrolledStudent.email,
//         `Successfully Enrolled into ${enrolledCourse.courseName}`,
//         courseEnrollmentEmail(
//           enrolledCourse.courseName,
//           `${enrolledStudent.firstName} ${enrolledStudent.lastName}`
//         )
//       );

//       console.log("Email sent successfully: ", emailResponse.response);
//     } catch (error) {
//       console.log(error);
//       return res.status(400).json({ success: false, error: error.message });
//     }
//   }
// };

const addToCart = async (services, userId, res) => {
  if (!services || !userId) {
    return res.status(400).json({
      success: false,
      message: "Please provide service IDs and user ID",
    });
  }

  try {
    // Find the user's cart
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // If no cart exists, create a new one
      cart = new Cart({ userId, services: [], totalQty: 0, totalCost: 0 });
    }

    // Iterate over the services and add them to the cart
    for (const serviceId of services) {
      const service = await Service.findById(serviceId);

      if (!service) {
        return res
          .status(404)
          .json({ success: false, message: "Service not found" });
      }

      const existingServiceIndex = cart.services.findIndex(
        (item) => item.serviceId.toString() === serviceId
      );

      if (existingServiceIndex > -1) {
        // If the service already exists in the cart, update the quantity and price
        cart.services[existingServiceIndex].qty += 1;
        cart.services[existingServiceIndex].price = service.price;
      } else {
        // If the service does not exist in the cart, add it
        cart.services.push({
          serviceId: service._id,
          qty: 1,
          price: service.price,
          serviceName: service.name,
          serviceDescription: service.description,
        });
      }

      // Update the total quantity and cost
      cart.totalQty += 1;
      cart.totalCost += service.price;
    }

    // Save the updated cart
    await cart.save();

    // Update the user's order
    const order = await Order.findOneAndUpdate(
      { userId },
      {
        $push: { services: { $each: cart.services } },
        totalQty: cart.totalQty,
        totalCost: cart.totalCost,
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: "Services added to cart and order updated successfully",
      cart,
      order,
    });
  } catch (error) {
    console.error("Error adding services to cart:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = { addToCart };

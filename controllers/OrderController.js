const mongoose = require("mongoose");
const Address = require("../models/Address");
const User = require("../models/User");
const Order = require("../models/Order");
const OrderStatus = require("../models/OrderStatus");
const Service = require("../models/Service");
const Cart = require("../models/Cart");
const path = require("path");

exports.placeOrder = async (req, res) => {
  try {
    const { addressId, paymentId } = req.body;
    const userId = req.user.id;

    // Validate request body
    if (!addressId || !paymentId) {
      return res.status(400).json({
        success: false,
        message: "Address ID and Payment ID are required",
      });
    }

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

    // Check if cart exists and contains services
    const cart = user.cart;
    if (!cart || cart.services.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    // Find the selected address
    const selectedAddress = user.address.find(
      (addr) => addr._id.toString() === addressId
    );
    if (!selectedAddress) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    // Create a new order status
    const orderStatus = new OrderStatus({
      statuses: [{ status: "pending" }],
    });
    await orderStatus.save();

    const newOrder = new Order({
      user: userId,
      services: cart.services.map((service) => ({
        serviceId: service.serviceId._id,
        qty: service.qty,
        price: service.price,
        serviceName: service.serviceId.name,
        serviceDescription: service.serviceId.serviceDescription,
      })),
      address: selectedAddress._id,
      paymentId: paymentId,
      totalCost: cart.totalCost,
      status: orderStatus._id,
    });

    // Save the new order
    await newOrder.save();

    // Update user's order list and clear the cart
    user.orders.push(newOrder._id);

    cart.services = [];
    cart.totalQty = 0;
    cart.totalCost = 0;

    await cart.save();
    await user.save();

    // Return the order details
    return res.status(200).json({
      success: true,
      message: "Order placed successfully",
      data: newOrder,
    });
  } catch (error) {
    console.error("Error placing order", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.purchaseService = async (req, res) => {
  try {
    const { serviceId, qty, paymentId, addressId } = req.body;
    const userId = req.user.id;

    if (!serviceId || !qty || !paymentId || !addressId) {
      return res.status(400).json({
        success: false,
        message:
          "Service ID, Quantity, Payment ID, and Address ID are required",
      });
    }

    const user = await User.findById(userId).populate("address");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const selectedAddress = user.address.find(
      (addr) => addr._id.toString() === addressId
    );
    if (!selectedAddress) {
      return res
        .status(404)
        .json({ success: false, message: "Address not found" });
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return res
        .status(404)
        .json({ success: false, message: "Service not found" });
    }

    const orderStatus = new OrderStatus({
      statuses: [{ status: "pending" }],
    });
    await orderStatus.save();

    const newOrder = new Order({
      user: userId,
      services: [
        {
          serviceId: service._id,
          qty: qty,
          price: service.price,
          serviceName: service.name,
        },
      ],
      address: selectedAddress._id,
      paymentId: paymentId,
      status: orderStatus._id,
    });

    await newOrder.save();

    user.orders.push(newOrder._id);
    await user.save();

    const cartWithDetails = await CartPopulate(cart._id.toString());

    const orderWithDetails = await Order.findById(newOrder._id)
      .populate({
        path: "services",
        cartWithDetails,
      })
      .populate("address")
      .populate("status");

    return res.status(200).json({
      success: true,
      message: "Service purchased successfully",
      data: orderWithDetails,
    });
  } catch (error) {
    console.error("Error purchasing service", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    const order = await Order.findById(orderId).populate("status");
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
    if (user.accountType !== "Admin") {
      if (order.user.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized to cancel this order",
        });
      }
    }
    const currentStatus =
      order.status.statuses[order.status.statuses.length - 1].status;
    if (
      currentStatus === "cancelled by customer" ||
      currentStatus === "cancelled by provider" ||
      currentStatus === "refund initiated" ||
      currentStatus === "refund completed"
    ) {
      return res.status(400).json({
        success: false,
        message: "Order already cancelled or refunded",
      });
    }
    const isProfessionalAssigned = currentStatus === "professional assigned";
    let refundAmount = order.totalCost;

    //Check Admin also can cancel the order
    if (isProfessionalAssigned && user.accountType !== "Admin") {
      const orderCreatedTime = new Date(order.createdAt);
      const currentTime = Date.now();
      const timeDiff = currentTime - orderCreatedTime;
      const threeHoursInMs = 3 * 60 * 60 * 1000;

      if (timeDiff > threeHoursInMs) {
        const hoursAfterThree = Math.floor(
          (timeDiff - threeHoursInMs) / (60 * 60 * 1000)
        );
        const deduction = hoursAfterThree * 50;
        refundAmount -= deduction;

        if (refundAmount < 0) refundAmount = 0;
      }
    }
    const cancelText =
      user.accountType === "Admin"
        ? "cancelled by provider"
        : "cancelled by customer";
    const orderStatus = await OrderStatus.findById(order.status._id);
    orderStatus.statuses.push({ status: cancelText, updatedAt: Date.now() });
    await orderStatus.save();
    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: {
        orderId: order._id,
        newStatus: cancelText,
        refundAmount: refundAmount,
        updatedAt: Date.now(),
      },
    });
  } catch (error) {
    console.error("Error cancelling order", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    // Populate orders and services.serviceId, sorting by createdAt in descending order
    const populatedUser = await User.findById(userId).populate({
      path: "orders",
      populate: [
        {
          path: "services.serviceId",
          model: "Service",
          populate: {
            path: "ratingAndReviews",
            model: "RatingAndReview",
          },
        },
        {
          path: "status",
        },
        {
          path: "address",
        },
        {
          path: "user",
        },
      ],
      options: { sort: { createdAt: -1 } }, // Sort orders by createdAt in descending order
    });

    // console.log(populatedUser);

    if (!populatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Map over the user's orders and replace the serviceId with the actual service object
    const ordersWithServiceDetails = populatedUser.orders.map((order) => ({
      ...order._doc,
      services: order.services.map((service) => ({
        ...service._doc,
        ...service.serviceId._doc, // Include the full service object here
        serviceId: service.serviceId._id, // Keep the serviceId if needed separately
        serviceName: service.serviceId.serviceName, // Optionally add other details directly
        serviceDescription: service.serviceId.serviceDescription,
      })),
    }));

    return res.status(200).json({
      success: true,
      message: "User orders retrieved successfully",
      data: ordersWithServiceDetails,
    });
  } catch (error) {
    console.error("Error getting user orders:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    // Fetch all orders and populate related fields, sorting by createdAt in descending order
    const orders = await Order.find({})
      .populate({
        path: "services.serviceId",
        model: "Service",
        populate: {
          path: "ratingAndReviews",
          model: "RatingAndReview",
        },
      })
      .populate("address")
      .populate("status")
      .populate("user")
      .sort({ createdAt: -1 }); // Sort orders by createdAt in descending order

    // console.log(orders);
    if (!orders || orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No orders found",
      });
    }

    // Map over the orders and replace the serviceId with the actual service object
    const ordersWithServiceDetails = orders.map((order) => ({
      ...order._doc,
      services: order.services.map((service) => {
        if (!service.serviceId) {
          return {
            ...service._doc,
            serviceId: null,
            serviceName: null,
            serviceDescription: null,
          };
        }
        return {
          ...service._doc,
          ...service.serviceId._doc, // Include the full service object
          serviceId: service.serviceId._id, // Keep the serviceId if needed separately
          serviceName: service.serviceId.serviceName, // Add other details directly
          serviceDescription: service.serviceId.serviceDescription,
        };
      }),
    }));

    return res.status(200).json({
      success: true,
      message: "Orders retrieved successfully",
      data: ordersWithServiceDetails,
    });
  } catch (error) {
    console.error("Error getting orders:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.getRevenue = async (req, res) => {
  try {
    // Fetch all orders from the database
    const orders = await Order.find({});

    if (!orders || orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No orders found",
      });
    }

    // Calculate the total revenue by summing up the totalCost of all orders
    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.totalCost,
      0
    );

    // Return the total revenue to the admin dashboard
    return res.status(200).json({
      success: true,
      message: "Total revenue calculated successfully",
      data: {
        totalRevenue,
      },
    });
  } catch (error) {
    console.error("Error calculating total revenue:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.getPendingOrdersCount = async (req, res) => {
  try {
    const orders = await Order.find({}).populate({
      path: "status",
      model: "OrderStatus",
    });

    // Filter orders where the last status in the statuses array is "pending"
    const pendingOrders = orders.filter((order) => {
      const latestStatus =
        order.status.statuses[order.status.statuses.length - 1];
      return latestStatus.status === "pending";
    });

    if (!pendingOrders || pendingOrders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No pending orders found",
      });
    }

    const count = pendingOrders.length;
    return res.status(200).json({
      success: true,
      message: "Pending orders retrieved successfully",
      data: count,
    });
  } catch (error) {
    console.error("Error getting pending orders:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Controller to change order status by admin
exports.changeOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    // Validate request body
    if (!orderId || !status) {
      return res.status(400).json({
        success: false,
        message: "Order ID and new status are required",
      });
    }

    // Validate the provided status
    const allowedStatuses = [
      "pending",
      "confirmed",
      "professional assigned",
      "on the way",
      "service started",
      "service completed",
      "payment pending",
      "paid",
      "cancelled by customer",
      "cancelled by provider",
      "rescheduled",
      "refund initiated",
      "refund completed",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    // Find the order by ID
    const order = await Order.findById(orderId).populate("status");
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Add the new status to the statuses array
    const orderStatus = await OrderStatus.findById(order.status._id);
    orderStatus.statuses.push({ status, updatedAt: Date.now() });

    // Save the updated status
    await orderStatus.save();

    // Return the updated order details
    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: {
        orderId: order._id,
        newStatus: status,
        updatedAt: Date.now(),
      },
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

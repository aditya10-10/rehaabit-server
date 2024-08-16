const mongoose = require("mongoose");
const Address = require("../models/Address");
const User = require("../models/User");
const Order = require("../models/Order");
const OrderStatus = require("../models/OrderStatus");
const Service = require("../models/Service");
const Cart = require("../models/Cart");

const CartPopulate = async (cartId) => {
  const populatedCart = await Cart.findById(cartId).populate({
    path: "services.serviceId",
    model: "Service",
  });

  const servicesWithDetails = populatedCart.services.map((service) => ({
    ...service.serviceId._doc,
    serviceId: service.serviceId._id,
    qty: service.qty,
    price: service.price,
    _id: service._id,
  }));

  const cartWithDetails = {
    ...populatedCart._doc,
    services: servicesWithDetails,
  };

  return cartWithDetails;
};

exports.placeOrder = async (req, res) => {
  try {
    const { addressId, paymentId } = req.body;
    const userId = req.user.id;

    if (!addressId || !paymentId) {
      return res.status(400).json({
        success: false,
        message: "Address ID and Payment ID are required",
      });
    }

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
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const cart = user.cart;
    if (!cart || cart.services.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    const selectedAddress = user.address.find(
      (addr) => addr._id.toString() === addressId
    );
    if (!selectedAddress) {
      return res
        .status(404)
        .json({ success: false, message: "Address not found" });
    }

    const orderStatus = new OrderStatus({
      status: "placed",
    });
    await orderStatus.save();

    const servicesInOrder = cart.services.map((service) => ({
      serviceId: service.serviceId._id,
      qty: service.qty,
      price: service.price,
      serviceName: service.serviceName || service.serviceId.name,
    }));

    const newOrder = new Order({
      user: userId,
      service: servicesInOrder,
      address: selectedAddress._id,
      paymentId: paymentId,
      status: orderStatus._id,
    });

    await newOrder.save();
    user.orders.push(newOrder._id);
    await user.save();

    const orderWithDetails = await Order.findById(newOrder._id)
      .populate("service.serviceId")
      .populate("address")
      .populate("status");

    cart.services = [];
    cart.totalQty = 0;
    cart.totalCost = 0;
    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Order placed successfully",
      data: orderWithDetails,
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
      status: "placed",
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

exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).populate({
      path: "orders",
      populate: [
        {
          path: "service.serviceId",
          model: "Service",
        },
        { path: "address" },
        { path: "status" },
      ],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const ordersWithDetails = user.orders;

    return res.status(200).json({
      success: true,
      message: "User orders retrieved successfully",
      data: ordersWithDetails,
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
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const ordersWithDetails = await Order.find({})
      .populate({
        path: "service.serviceId",
        model: "Service",
      })
      .populate("address")
      .populate("status")
      .populate("user");

    return res.status(200).json({
      success: true,
      message: "Orders retrieved successfully",
      data: ordersWithDetails,
    });
  } catch (error) {
    console.error("Error getting orders:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

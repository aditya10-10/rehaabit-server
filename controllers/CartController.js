const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const User = require("../models/User");

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

exports.addToCart = async (req, res) => {
  try {
    const { serviceId, serviceName, serviceDescription, price, qty } = req.body;
    const userId = req.user.id;

    if (!serviceId) {
      return res
        .status(400)
        .json({ success: false, message: "Service Id is required" });
    }

    const user = await User.findById(userId).populate("cart");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    let cart = user.cart;
    if (!cart) {
      cart = new Cart();
      user.cart = cart._id;
      await user.save();
    } else {
      cart = await Cart.findById(cart._id);
    }

    const existingService = cart.services.find(
      (item) => item.serviceId.toString() === serviceId
    );
    if (existingService) {
      return res
        .status(400)
        .json({ success: false, message: "Service already in cart" });
    }

    cart.services.push({
      serviceId,
      serviceName,
      serviceDescription,
      price,
      qty,
    });
    cart.totalQty += qty;
    cart.totalCost += price * qty;

    await cart.save();
    const cartWithDetails = await CartPopulate(cart._id.toString());

    return res.status(200).json({
      success: true,
      message: "Service added to cart successfully",
      data: cartWithDetails,
    });
  } catch (error) {
    console.error("Error adding service to cart:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

exports.updateCart = async (req, res) => {
  try {
    const { cartServiceId, action } = req.body;
    const userId = req.user.id;

    if (!cartServiceId || !action) {
      return res.status(400).json({
        success: false,
        message: "Cart Service Id and action are required",
      });
    }

    const user = await User.findById(userId).populate("cart");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    let cart = user.cart;
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    } else {
      cart = await Cart.findById(cart._id);
    }

    const service = cart.services.find(
      (item) => item._id.toString() === cartServiceId
    );
    if (!service) {
      return res
        .status(404)
        .json({ success: false, message: "Service not found in cart" });
    }

    if (action === "increment") {
      service.qty += 1;
      cart.totalQty += 1;
      cart.totalCost += service.price;
    } else if (action === "decrement") {
      if (service.qty === 1) {
        return res
          .status(400)
          .json({ success: false, message: "Quantity cannot be less than 1" });
      }
      service.qty -= 1;
      cart.totalQty -= 1;
      cart.totalCost -= service.price;
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid action" });
    }

    await cart.save();
    const cartWithDetails = await CartPopulate(cart._id.toString());

    return res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      data: cartWithDetails,
    });
  } catch (error) {
    console.error("Error updating cart:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { cartServiceId } = req.body;
    const userId = req.user.id;
    if (!cartServiceId) {
      return res
        .status(400)
        .json({ success: false, message: "Cart Service Id is required" });
    }

    const user = await User.findById(userId).populate("cart");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    let cart = user.cart;
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    } else {
      cart = await Cart.findById(cart._id);
    }

    const serviceIndex = cart.services.findIndex(
      (item) => item._id.toString() === cartServiceId
    );
    if (serviceIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Service not found in cart" });
    }

    const service = cart.services[serviceIndex];
    cart.totalQty -= service.qty;
    cart.totalCost -= service.price * service.qty;
    cart.services.splice(serviceIndex, 1);

    await cart.save();
    const cartWithDetails = await CartPopulate(cart._id.toString());

    return res.status(200).json({
      success: true,
      message: "Service removed from cart successfully",
      data: cartWithDetails,
    });
  } catch (error) {
    console.error("Error removing service from cart:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

exports.getAllCartServices = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).populate({
      path: "cart",
      populate: {
        path: "services.serviceId",
        model: "Service",
      },
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const cart = user.cart;
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    const servicesWithDetails = cart.services.map((service) => ({
      ...service.serviceId._doc,
      serviceId: service.serviceId._id,
      qty: service.qty,
      price: service.price,
      _id: service._id,
    }));

    const cartWithDetails = {
      ...cart._doc,
      services: servicesWithDetails,
    };

    return res.status(200).json({
      success: true,
      message: "Cart retrieved successfully",
      data: cartWithDetails,
    });
  } catch (error) {
    console.error("Error retrieving cart items:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

exports.updateCartFromLocalStorage = async (req, res) => {
  try {
    const { cartServices, totalCost, totalQty } = req.body;
    const userId = req.user.id;

    // Find the user's cart ID
    const user = await User.findById(userId).populate("cart");

    if (!user || !user.cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    let cart = await Cart.findById(user.cart._id);

    if (!cart) {
      cart = new Cart({
        services: cartServices,
        totalCost,
        totalQty,
      });
      user.cart = cart._id;
      await user.save();
    } else {
      cartServices.forEach((localService) => {
        const existingService = cart.services.find(
          (service) => service.serviceId.toString() === localService.serviceId
        );

        if (existingService) {
          existingService.qty += localService.qty;
          existingService.price = localService.price;
        } else {
          cart.services.push(localService);
        }
      });

      cart.totalQty += totalQty;
      cart.totalCost += totalCost;
    }

    await cart.save();

    const cartWithDetails = await CartPopulate(cart._id.toString());

    return res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      data: cartWithDetails,
    });
  } catch (error) {
    console.error("Error updating cart:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

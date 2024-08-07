const mongoose = require("mongoose");
const Address = require("../models/Address");
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

exports.addAddress = async (req, res) => {
  try {
    const {
      name,
      locality,
      landmark,
      address,
      pincode,
      city,
      state,
      phoneNo,
      alternativePhone,
      addressType,
    } = req.body;

    const userId = req.user.id;

    const user = await User.findById(userId).populate("address");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const newAddress = new Address({
      user: userId,
      name,
      locality,
      landmark,
      address,
      pincode,
      city,
      state,
      phoneNo,
      alternativePhone,
      addressType,
    });

    await newAddress.save();

    user.address.push(newAddress._id);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Address added successfully",
      data: newAddress,
    });
  } catch (error) {
    console.error("Error adding service to cart:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const { serviceId, action } = req.body;
    const userId = req.user.id;

    if (!serviceId || !action) {
      return res.status(400).json({
        success: false,
        message: "Service Id and action are required",
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
      (item) => item.serviceId.toString() === serviceId
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
      if (service.qty <= 1) {
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
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const { serviceId } = req.body;
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
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    } else {
      cart = await Cart.findById(cart._id);
    }

    const serviceIndex = cart.services.findIndex(
      (item) => item.serviceId.toString() === serviceId
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
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.getUserAddresses = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).populate("address");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const address = user.address;

    return res.status(200).json({
      success: true,
      message: "User Addresses retrieved successfully",
      data: address,
    });
  } catch (error) {
    console.error("Error getting User Addresses:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

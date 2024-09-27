const mongoose = require("mongoose");
const Address = require("../models/Address");
const User = require("../models/User");

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

    const isFirstAddress = user.address.length === 0;

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
      status: isFirstAddress ? "Default" : undefined,
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
    console.error("Error adding Address:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const {
      addressId,
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
      status,
    } = req.body;
    const userId = req.user.id;

    const addressToUpdate = await Address.findOne({ _id: addressId, user: userId });
     console.log(addressToUpdate);
     console.log(status);
    if (!addressToUpdate) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    if (name) addressToUpdate.name = name;
    if (locality) addressToUpdate.locality = locality;
    if (landmark) addressToUpdate.landmark = landmark;
    if (address) addressToUpdate.address = address;
    if (pincode) addressToUpdate.pincode = pincode;
    if (city) addressToUpdate.city = city;
    if (state) addressToUpdate.state = state;
    if (phoneNo) addressToUpdate.phoneNo = phoneNo;
    if (alternativePhone) addressToUpdate.alternativePhone = alternativePhone;
    if (addressType) addressToUpdate.addressType = addressType;

    if (status === "Default") {
      await Address.updateMany(
          { user: userId, status: "Default" },
          { $set: { status: "" } }
      );
      addressToUpdate.status = "Default";
  }
    await addressToUpdate.save();

    return res.status(200).json({
      success: true,
      message: "Address updated successfully",
      data: addressToUpdate,
    });
  } catch (error) {
    console.error("Error updating address:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


exports.deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.body;
    const userId = req.user.id;

    if (!addressId) {
      return res.status(400).json({
        success: false,
        message: "Address ID is required",
      });
    }

    const addressToDelete = await Address.findOne({ _id: addressId, user: userId });

    if (!addressToDelete) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    const isDefault = addressToDelete.status === "Default";

    await Address.deleteOne({ _id: addressId });

    if (isDefault) {
      const otherAddresses = await Address.find({ user: userId });
      if (otherAddresses.length > 0) {
        otherAddresses[0].status = "Default";
        await otherAddresses[0].save();
      }
    }

    return res.status(200).json({
      success: true,
      message: "Address removed successfully",
      data: addressToDelete,
    });
  } catch (error) {
    console.error("Error removing address:", error);
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

const User = require("../models/User");
const Cart = require("../models/Cart");
const Profile = require("../models/Profile");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

const PNF = require("google-libphonenumber").PhoneNumberFormat;
const phoneUtil =
  require("google-libphonenumber").PhoneNumberUtil.getInstance();

const validatePhoneNumber = (contactNumber) => {
  const phoneNumber = phoneUtil.parseAndKeepRawInput(contactNumber, "IN");
  if (!phoneUtil.isValidNumber(phoneNumber)) {
    throw new Error("Invalid phone number.");
  }
  return phoneUtil.format(phoneNumber, PNF.E164);
};

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

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .populate("address")
      .populate("cart")
      .populate("orders")
      .populate({
        path: "additionalDetails",
        model: "Profile", // Ensure this is the correct reference model
        select: "firstName lastName", // Select relevant fields to reduce query size
      });
    if (!users || users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No Users found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: users,
    });
  } catch (error) {
    console.error("Error getting users:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.getUser = async (req, res) => {
  try {
    const { userId } = req.body;

    let user = await User.findById(userId)
      .populate("address")
      .populate("cart")
      .populate("orders")
      .populate("additionalDetails");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.cart) {
      user = user.toObject();
      user.cart = await CartPopulate(user.cart._id.toString());
    }

    return res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error getting user:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.updateUserDetails = async (req, res) => {
  try {
    const { userId, email, firstName, lastName, contactNumber } = req.body;
    const icon = req.files?.image;

    const userDetails = await User.findById(userId).populate(
      "additionalDetails"
    );

    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update the profile fields
    const profile = userDetails.additionalDetails;
    if (firstName) profile.firstName = firstName;
    if (lastName) profile.lastName = lastName;
    if (email) profile.email = email;

    // Save the updated profile
    await profile.save();

    // Update contact number
    if (contactNumber) {
      const formattedPhoneNumber = validatePhoneNumber(contactNumber);
      userDetails.contactNumber = formattedPhoneNumber;
    }

    // Handle image upload if provided
    if (icon) {
      const image = await uploadImageToCloudinary(
        icon,
        process.env.FOLDER_NAME,
        1000,
        1000
      );
      userDetails.image = image.secure_url;
    }

    // Save the updated user details
    await userDetails.save();

    // Populate the updated user details
    const userWithDetails = await User.findById(userDetails._id)
      .populate("address")
      .populate("additionalDetails")
      .populate("cart")
      .populate("orders")
      .exec();

    return res.status(200).json({
      success: true,
      message: "User details updated successfully",
      data: userWithDetails,
    });
  } catch (error) {
    console.error("Error updating user details:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await Profile.findByIdAndDelete(user.additionalDetails);
    await User.findByIdAndDelete(userId);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: userId,
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.createNewUser = async (req, res) => {
  try {
    const { firstName, lastName, email, contactNumber, accountType } = req.body;

    if (typeof contactNumber === "number") {
      contactNumber = contactNumber.toString();
    }

    const formattedPhoneNumber = validatePhoneNumber(contactNumber);

    let user = await User.findOne({ contactNumber: formattedPhoneNumber });
    if (!user) {
      // Create the Additional Profile For User
      const profileDetails = await Profile.create({
        firstName: firstName,
        lastName: lastName,
        email: email,
        contactNumber: formattedPhoneNumber,
      });

      user = await User.create({
        contactNumber: formattedPhoneNumber,
        accountType,
        additionalDetails: profileDetails._id,
        image: "",
      });

      const userWithDetails = await User.findById(user._id)
        .populate("address")
        .populate("additionalDetails")
        .populate("cart")
        .populate("orders")
        .exec();

      return res.status(200).json({
        success: true,
        message: "New User created successfully",
        data: userWithDetails,
      });
    }

    return res.status(200).json({
      success: true,
      message: "User already exists",
    });
  } catch (error) {
    console.error("Error creating new user:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// New method to get the total user count
// UsersController.js
exports.getUserCount = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    // console.log(totalUsers);
    res.json({ totalUsers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching user count" });
  }
};

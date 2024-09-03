const User = require("../models/User");
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

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .populate("address")
      .populate("additionalDetails");

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
    const { firstName, lastName, contactNumber, accountType } = req.body;


    return res.status(200).json({
      success: true,
      message: "New User created successfully",
      data: userId,
    });
  } catch (error) {
    console.error("Error creating new user:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

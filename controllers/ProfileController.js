const Profile = require("../models/Profile");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

// Method for updating a profile
exports.updateProfile = async (req, res) => {
  try {
    const { firstName = "", lastName = "", email = "" } = req.body;
    const id = req.user.id;

    // Find the user by id
    const userDetails = await User.findById(id).populate("additionalDetails");

    if (!userDetails) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Update the profile fields
    const profile = userDetails.additionalDetails;
    profile.firstName = firstName;
    profile.lastName = lastName;
    profile.email = email;

    // Save the updated profile
    await profile.save();

    // Update user fields if necessary
    userDetails.firstName = firstName;
    userDetails.lastName = lastName;
    await userDetails.save();

    return res.json({
      success: true,
      message: "Profile updated successfully",
      data: userDetails,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Method for deleting an account
exports.deleteAccount = async (req, res) => {
  try {
    const id = req.user.id;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Delete associated profile with the user
    await Profile.findByIdAndDelete(user.additionalDetails);

    // // Remove user from enrolled courses
    // for (const courseId of user.courses) {
    //   await Course.findByIdAndUpdate(courseId, {
    //     $pull: { studentsEnroled: id },
    //   });
    // }

    // Now delete the user
    await User.findByIdAndDelete(id);

    // Delete course progress if exists
    // await CourseProgress.deleteMany({ userId: id });

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Method for getting all user details
exports.getAllUserDetails = async (req, res) => {
  try {
    const id = req.user.id;
    const userDetails = await User.findById(id)
      .populate("additionalDetails")
      .exec();

    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User data fetched successfully",
      data: userDetails,
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.updateDisplayPicture = async (req, res) => {
  try {
    const displayPicture = req.files.displayPicture;
    const userId = req.user.id;
    const image = await uploadImageToCloudinary(
      displayPicture,
      process.env.FOLDER_NAME,
      1000,
      1000
    );
    // console.log(image);
    const updatedProfile = await User.findByIdAndUpdate(
      { _id: userId },
      { image: image.secure_url },
      { new: true }
    );
    res.send({
      success: true,
      message: `Image Updated successfully`,
      data: updatedProfile,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

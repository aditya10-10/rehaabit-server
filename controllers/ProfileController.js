const Profile = require("../models/Profile");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const mongoose = require("mongoose");
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

// Method for updating display picture
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

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { image: image.secure_url },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Image updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error updating display picture:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Method for getting enrolled courses
exports.getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id;

    let userDetails = await User.findById(userId)
      .populate({
        path: "courses",
        populate: {
          path: "courseContent",
          populate: {
            path: "subSection",
          },
        },
      })
      .exec();

    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    userDetails = userDetails.toObject();

    for (const course of userDetails.courses) {
      let totalDurationInSeconds = 0;
      let subSectionLength = 0;

      for (const content of course.courseContent) {
        totalDurationInSeconds += content.subSection.reduce(
          (acc, curr) => acc + parseInt(curr.timeDuration),
          0
        );
        subSectionLength += content.subSection.length;
      }

      course.totalDuration = convertSecondsToDuration(totalDurationInSeconds);

      const courseProgress = await CourseProgress.findOne({
        courseId: course._id,
        userId: userId,
      });

      course.progressPercentage =
        subSectionLength === 0
          ? 100
          : ((courseProgress?.completedVideos.length || 0) / subSectionLength) *
            100;
    }

    return res.status(200).json({
      success: true,
      data: userDetails.courses,
    });
  } catch (error) {
    console.error("Error fetching enrolled courses:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const User = require("../models/User");
const OTP = require("../models/OTP");
const jwt = require("jsonwebtoken");
const Profile = require("../models/Profile");
require("dotenv").config();

const otplib = require("otplib");
const PNF = require("google-libphonenumber").PhoneNumberFormat;
const phoneUtil =
  require("google-libphonenumber").PhoneNumberUtil.getInstance();

// Utility function to parse and validate phone number
const validatePhoneNumber = (contactNumber) => {
  const phoneNumber = phoneUtil.parseAndKeepRawInput(contactNumber, "IN");
  if (!phoneUtil.isValidNumber(phoneNumber)) {
    throw new Error("Invalid phone number.");
  }
  return phoneUtil.format(phoneNumber, PNF.E164);
};

// Send OTP to user's phone number
exports.sendOTP = async (req, res) => {
  try {
    let { contactNumber, isSignup } = req.body;

    // Convert contactNumber to string if it's a number
    if (typeof contactNumber === "number") {
      contactNumber = contactNumber.toString();
    }

    // Parse and validate phone number
    const formattedPhoneNumber = validatePhoneNumber(contactNumber);

    // Check if user already exists
    const user = await User.findOne({ contactNumber: formattedPhoneNumber });
    if (user && isSignup) {
      return res.status(400).json({
        success: false,
        message: "User already exists. Please login.",
      });
    }

    if (!user && !isSignup) {
      return res.status(400).json({
        success: false,
        message: "User not found. Please sign up.",
      });
    }

    console.log(process.env.ADMIN_PHONE_NUMBER, process.env.USER_PHONE_NUMBER);

    // Generate OTP
    const otp =
      formattedPhoneNumber === `${process.env.ADMIN_PHONE_NUMBER}` ||
      `${process.env.USER_PHONE_NUMBER}`
        ? otplib.authenticator.generate(otplib.authenticator.generateSecret())
        : 111111;

    // Save OTP to the database
    const otpInstance = new OTP({ contactNumber: formattedPhoneNumber, otp });
    await otpInstance.save();

    res
      .status(200)
      .json({ success: true, message: "OTP sent successfully.", otp });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to send OTP.",
    });
  }
};

// Signup: Verify OTP and create a new user
exports.signup = async (req, res) => {
  try {
    let {
      firstName,
      lastName,
      contactNumber,
      otp,
      accountType = "User",
    } = req.body;

    // Convert contactNumber to string if it's a number
    if (typeof contactNumber === "number") {
      contactNumber = contactNumber.toString();
    }

    // Parse and validate phone number
    const formattedPhoneNumber = validatePhoneNumber(contactNumber);

    // Find the most recent OTP for the phone number
    const latestOTP = await OTP.findOne({
      contactNumber: formattedPhoneNumber,
    }).sort({
      createdAt: -1,
    });

    if (!latestOTP || String(latestOTP.otp) !== String(otp)) {
      return res.status(400).json({ success: false, message: "Invalid OTP." });
    }

    // Check if user already exists
    let user = await User.findOne({ contactNumber: formattedPhoneNumber });
    if (!user) {
      // Create the Additional Profile For User
      const profileDetails = await Profile.create({
        firstName: firstName,
        lastName: lastName,
        email: null,
        contactNumber: formattedPhoneNumber,
      });

      user = await User.create({
        contactNumber: formattedPhoneNumber,
        accountType,
        additionalDetails: profileDetails._id,
        image: "",
      });

      // Delete the OTP after successful verification
      await OTP.deleteOne({ _id: latestOTP._id });

      return res.status(200).json({
        success: true,
        user,
        message: "User registered successfully",
      });
    }

    res
      .status(400)
      .json({ success: false, message: "User already exists. Please login." });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to register user.",
    });
  }
};

// Login: Verify OTP and create a session for the existing user
exports.login = async (req, res) => {
  try {
    let { contactNumber, otp } = req.body;

    // Convert contactNumber to string if it's a number
    if (typeof contactNumber === "number") {
      contactNumber = contactNumber.toString();
    }

    // Parse and validate phone number
    const formattedPhoneNumber = validatePhoneNumber(contactNumber);

    // Find the most recent OTP for the phone number
    const latestOTP = await OTP.findOne({
      contactNumber: formattedPhoneNumber,
    }).sort({
      createdAt: -1,
    });

    if (!latestOTP || String(latestOTP.otp) !== String(otp)) {
      return res.status(400).json({ success: false, message: "Invalid OTP." });
    }

    // Check if user exists
    let user = await User.findOne({ contactNumber: formattedPhoneNumber });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found. Please sign up first.",
      });
    }

    // Generate JWT token for existing user
    const token = jwt.sign(
      { contactNumber: user.contactNumber, id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
      }
    );

    // Set cookie for token and return success response
    const options = {
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };
    res.cookie("token", token, options);

    // Delete the OTP after successful verification
    await OTP.deleteOne({ _id: latestOTP._id });

    return res.status(200).json({
      success: true,
      token,
      user,
      message: "User login successful",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to login user.",
    });
  }
};

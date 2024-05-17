const User = require("../models/User");
const OTP = require("../models/OTP");
const jwt = require("jsonwebtoken");
const Profile = require("../models/Profile");
require("dotenv").config();

const otplib = require("otplib");

const PNF = require("google-libphonenumber").PhoneNumberFormat;
const phoneUtil =
  require("google-libphonenumber").PhoneNumberUtil.getInstance();

// Send OTP to user's phone number
exports.sendOTP = async (req, res) => {
  try {
    let { contactNumber } = req.body;

    // Convert contactNumber to string if it's a number
    if (typeof contactNumber === "number") {
      contactNumber = contactNumber.toString();
    }

    // Parse and validate phone number
    const phoneNumber = phoneUtil.parseAndKeepRawInput(contactNumber, "IN");
    if (!phoneUtil.isValidNumber(phoneNumber)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid phone number." });
    }

    // Convert phone number to E.164 format
    const formattedPhoneNumber = phoneUtil.format(phoneNumber, PNF.E164);

    contactNumber = formattedPhoneNumber;

    // Generate OTP
    const otp = otplib.authenticator.generate(
      otplib.authenticator.generateSecret()
    );

    // Save OTP to the database
    const otpInstance = new OTP({ contactNumber, otp });
    await otpInstance.save();
    res
      .status(200)
      .json({ success: true, message: "OTP sent successfully.", otp: otp });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to send OTP." });
  }
};

// Verify OTP and create user
exports.signup = async (req, res) => {
  try {
    let { contactNumber, otp } = req.body;

    // Convert contactNumber to string if it's a number
    if (typeof contactNumber === "number") {
      contactNumber = contactNumber.toString();
    }

    // Parse and validate phone number
    const phoneNumber = phoneUtil.parseAndKeepRawInput(contactNumber, "IN");
    if (!phoneUtil.isValidNumber(phoneNumber)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid phone number." });
    }

    // Convert phone number to E.164 format
    const formattedPhoneNumber = phoneUtil.format(phoneNumber, PNF.E164);

    contactNumber = formattedPhoneNumber;

    // Check if user already exists
    let user = await User.findOne({ contactNumber });
    console.log("User already exists", user);

    // Find the most recent OTP for the phone number
    const latestOTP = await OTP.findOne({ contactNumber }).sort({
      createdAt: -1,
    });

    console.log("Latest OTP", latestOTP);
    if (!latestOTP || String(latestOTP.otp) !== String(otp)) {
      return res.status(400).json({ success: false, message: "Invalid OTP." });
    }

    if (!user) {
      // Create the Additional Profile For User
      const profileDetails = await Profile.create({
        firstName: null,
        lastName: null,
        email: null,
        contactNumber: contactNumber,
      });

      console.log("Profile Details", profileDetails);
      user = await User.create({
        contactNumber,
        accountType: "User",
        additionalDetails: profileDetails._id,
        image: "",
      });

      console.log("New User", user);
      res.status(200).json({
        success: true,
        user,
        message: "User registered successfully",
      });
    } else {
      console.log(
        "Existing User",
        user.contactNumber,
        user._id,
        user.accountType
      );

      // Debugging JWT_SECRET
      console.log("JWT_SECRET", process.env.JWT_SECRET);

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
      res.cookie("token", token, options).status(200).json({
        success: true,
        token,
        user,
        message: "User login successful",
      });
    }

    // Delete the OTP after successful verification
    await OTP.deleteOne({ _id: latestOTP._id });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to register user." });
  }
};
// Function to generate a random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const express = require("express");
const mailSender = require("../utils/mailSender");
const { welcomeEmail } = require("../templates/mailTemplate");
const { emailOTP } = require("../templates/EmailOTPTemplate");
const User = require("../models/User");
const EmailOTP = require("../models/EmailOTP");
const otplib = require("otplib");

exports.sendEmail = async (req, res) => {
  try {
    // fetch the email from the request body
    const { email } = req.body;

    // validate the email
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // check if the user already exists
    // check user exist or not

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(403).json({
        success: false,
        message: "User already exists",
      });
    }

    // create a new user
    const user = await User.create({ email });

    // Send notification email
    try {
      const emailResponse = await mailSender(
        email,
        "Welcome to Rahaabit!",
        welcomeEmail()
      );
      console.log("Email sent successfully:", emailResponse.response);
    } catch (error) {
      // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
      console.error("Error occurred while sending email:", error);
      return res.status(500).json({
        success: false,
        message: "Error occurred while sending email",
        error: error.message,
      });
    }
    // return response
    return res.status(200).json({
      success: true,
      message: "User Created",
      user: user,
    });
  } catch (err) {
    console.log(err);
  }
};

exports.sendEmailOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const otp = otplib.authenticator.generate(
      otplib.authenticator.generateSecret()
    );

    const otpInstance = new EmailOTP({ email: email, otp });
    await otpInstance.save();

    try {
      const emailResponse = await mailSender(
        email,
        "Welcome to Rahaabit!",
        emailOTP(otpInstance.otp)
      );
      console.log("Email sent successfully:", emailResponse.response);
    } catch (error) {
      // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
      console.error("Error occurred while sending email:", error);
      return res.status(500).json({
        success: false,
        message: "Error occurred while sending email",
        error: error.message,
      });
    }

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

exports.verifyEmailOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find the most recent OTP for the email
    const latestOTP = await EmailOTP.findOne({ email }).sort({ createdAt: -1 });

    if (!latestOTP || String(latestOTP.otp) !== String(otp)) {
      return res.status(400).json({ success: false, message: "Invalid OTP." });
    }

    // Delete the OTP after successful verification
    await EmailOTP.deleteOne({ _id: latestOTP._id });

    return res.status(200).json({
      success: true,
      message: "Email Verified",
    });
  } catch (error) {
    console.error("Error verifying email OTP:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to verify OTP.",
    });
  }
};

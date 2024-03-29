const express = require("express");
const mailSender = require("../utils/mailSender");
const { welcomeEmail } = require("../templates/mailTemplate");
const User = require("../models/User"); // Assuming you have a User model

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

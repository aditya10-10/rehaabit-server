const mongoose = require("mongoose");
require("dotenv").config();
const axios = require("axios");

// Generate an OTP schema
const OTPSchema = new mongoose.Schema({
  contactNumber: {
    type: String,
    required: true,
  },
  otp: {
    type: String, // Ensuring OTP is saved as a string
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 5, // The document will be automatically deleted after 5 minutes of its creation time
  },
});

// Utility function to remove the "+91" prefix from the contact number
const formatContactNumber = (contactNumber) => {
  if (contactNumber.startsWith("+91")) {
    return contactNumber.slice(3); // Remove +91
  }
  return contactNumber;
};

// Function to send OTP using Fast2SMS API
async function sendOTP(contactNumber, otp) {
  try {
    // Remove the "+91" prefix before sending the OTP
    const formattedContactNumber = formatContactNumber(contactNumber);

    // console.log("Sending OTP to: ", formattedContactNumber);
    // console.log("OTP: ", otp);

    // Fast2SMS API data and headers
    const fast2smsData = {
      route: "otp",
      variables_values: otp,
      numbers: formattedContactNumber,
    };

    const fast2smsHeaders = {
      authorization: process.env.FAST2SMS_API_KEY,
      "Content-Type": "application/json",
    };

    // Send the OTP request to Fast2SMS
    const response = await axios.post(
      "https://www.fast2sms.com/dev/bulkV2",
      fast2smsData,
      { headers: fast2smsHeaders }
    );
    // console.log("OTP sent successfully: ", response.data);
  } catch (error) {
    console.log("Error occurred while sending OTP: ", error);
    throw error;
  }
}

// Pre-save hook to send SMS after the document has been saved
OTPSchema.pre("save", async function (next) {
  if (this.isNew) {
    // Ensure OTP and contactNumber are saved as strings
    this.otp = String(this.otp);
    this.contactNumber = String(this.contactNumber);

    // Send the OTP after formatting the contact number
    await sendOTP(this.contactNumber, this.otp);
  }
  next();
});

const OTP = mongoose.model("OTP", OTPSchema);

module.exports = OTP;

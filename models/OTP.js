const mongoose = require("mongoose");
require("dotenv").config();
const twilio = require("twilio")(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Generate an OTP
const OTPSchema = new mongoose.Schema({
  contactNumber: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 5, // The document will be automatically deleted after 5 minutes of its creation time
  },
});

async function sendOTP(contactNumber, otp) {
  try {
    const response = await twilio.messages.create({
      body: `Your OTP for registration is: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: contactNumber,
    });
    console.log("OTP sent successfully: ", response);
  } catch (error) {
    console.log("Error occurred while sending OTP: ", error);
    throw error;
  }
}

// Pre-save hook to send SMS after the document has been saved
OTPSchema.pre("save", async function (next) {
  if (this.isNew) {
    await sendOTP(this.contactNumber, this.otp);
  }
  next();
});

const OTP = mongoose.model("OTP", OTPSchema);

module.exports = OTP;

const mongoose = require("mongoose");

// Generate an OTP
const EmailOTPSchema = new mongoose.Schema({
  email: {
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
    expires: 60 * 5,
  },
});


const OTP = mongoose.model("EmailOTP", EmailOTPSchema);

module.exports = OTP;

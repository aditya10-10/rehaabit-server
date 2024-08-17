// Import the required modules
const express = require("express");
const router = express.Router();

// Import the required controllers and middleware functions
const {
  sendEmailOTP,
  sendEmail,
  verifyEmailOTP,
} = require("../controllers/MailSender");

// Routes for sending welcome email
router.post("/send-email", sendEmail);
router.post("/send-email-otp", sendEmailOTP);
router.post("/verifyEmailOTP", verifyEmailOTP);

// Export the router for use in the main application
module.exports = router;

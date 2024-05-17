// Import the required modules
const express = require("express");
const router = express.Router();

// Import the required controllers and middleware functions
const { signup, sendOTP } = require("../controllers/AuthController");

const { auth } = require("../middlewares/auth");

// Routes for Login, Signup, and Authentication

// ********************************************************************************************************
//                                      Authentication routes
// ********************************************************************************************************

router.post("/login", signup);

// Route for user signup
router.post("/signup", signup);

// Route for sending OTP to the user's email
router.post("/sendotp", sendOTP);

// Export the router for use in the main application
module.exports = router;

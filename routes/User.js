// Import the required modules
const express = require("express");
const router = express.Router();

// Import the required controllers and middleware functions
const { login, signup, sendOTP } = require("../controllers/AuthController");

const { auth, isAdmin } = require("../middlewares/auth");
const {
  getAllUsers,
  getUser,
  updateUserDetails,
  deleteUser,
  createNewUser,
} = require("../controllers/UsersController");

// Routes for Login, Signup, and Authentication

// ********************************************************************************************************
//                                      Authentication routes
// ********************************************************************************************************

router.post("/login", login);

// Route for user signup
router.post("/signup", signup);

// Route for sending OTP to the user's email
router.post("/sendotp", sendOTP);

router.get("/getAllUsers", auth, isAdmin, getAllUsers);
router.post("/getUser", auth, isAdmin, getUser);
router.put("/updateUserDetails", auth, isAdmin, updateUserDetails);
router.delete("/deleteUser", auth, isAdmin, deleteUser);
router.post("/createNewUser", auth, isAdmin, createNewUser);

// Export the router for use in the main application
module.exports = router;

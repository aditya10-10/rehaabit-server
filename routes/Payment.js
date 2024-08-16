// Import the required modules
const express = require("express");
const router = express.Router();

const { processPayment, verifyPayment } = require("../controllers/Payment");
const { auth, isAdmin, isUser } = require("../middlewares/auth");

router.post("/processPayment", auth, isUser, processPayment);
router.post("/verifyPayment", auth, isUser, verifyPayment);

module.exports = router;

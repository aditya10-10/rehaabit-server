// Import the required modules
const express = require("express");
const router = express.Router();

const { capturePayment, verifyPayment } = require("../controllers/Payment");
const { auth, isAdmin, isUser } = require("../middlewares/auth");

router.post("/capturePayment", auth, isUser, capturePayment);
router.post("/verifyPayment", auth, isUser, verifyPayment);
module.exports = router;

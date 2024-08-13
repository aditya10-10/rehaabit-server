// Import the required modules
const express = require("express");
const router = express.Router();

const { processPayment, verifyPayment } = require("../controllers/Payment");
const { auth, isAdmin } = require("../middlewares/auth");

router.post("/processPayment", auth, isAdmin, processPayment);
router.post("/verifyPayment", auth, isAdmin, verifyPayment);

module.exports = router;

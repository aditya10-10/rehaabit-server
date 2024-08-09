const express = require("express");
const router = express.Router();
const { auth, isPartner, isUser, isAdmin } = require("../middlewares/auth");
const { placeOrder, purchaseService } = require("../controllers/OrderController");

router.post("/placeOrder", auth, isAdmin, placeOrder);
router.post("/purchaseService", auth, isAdmin, purchaseService);

module.exports = router;

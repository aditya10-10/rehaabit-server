const express = require("express");
const router = express.Router();
const { auth, isPartner, isUser, isAdmin } = require("../middlewares/auth");
const {
  placeOrder,
  purchaseService,
  getUserOrders,
} = require("../controllers/OrderController");

router.post("/placeOrder", auth, isAdmin, placeOrder);
router.post("/purchaseService", auth, isAdmin, purchaseService);
router.get("/getUserOrders", auth, isAdmin, getUserOrders);

module.exports = router;

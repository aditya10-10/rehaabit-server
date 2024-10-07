const express = require("express");
const router = express.Router();
const { auth, isPartner, isUser, isAdmin } = require("../middlewares/auth");
const {
  placeOrder,
  purchaseService,
  getUserOrders,
  getAllOrders,
  getRevenue,
  getPendingOrdersCount,
  changeOrderStatus,
  cancelOrder
} = require("../controllers/OrderController");

router.post("/placeOrder", auth, isUser, placeOrder);
router.post("/updateorderstatus", auth, isAdmin, changeOrderStatus);
router.post("/purchaseService", auth, isUser, purchaseService);
router.post("/cancelOrder", auth, cancelOrder);
router.get("/getUserOrders", auth, isUser, getUserOrders);
router.get("/getAllOrders", auth, isAdmin, getAllOrders);
router.get("/getRevenue", auth, isAdmin, getRevenue);
router.get("/getPendingOrdersCount", auth, isAdmin, getPendingOrdersCount);


module.exports = router;

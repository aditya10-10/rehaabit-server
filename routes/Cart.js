const express = require("express");
const router = express.Router();
const { auth, isPartner, isUser, isAdmin } = require("../middlewares/auth");

const {
  addToCart,
  updateCart,
  removeFromCart,
  getAllCartServices,
  updateCartFromLocalStorage,
} = require("../controllers/CartController");

router.post("/addToCart", auth, addToCart);
router.put("/updateCart", auth, updateCart);
router.delete("/removeFromCart", auth, removeFromCart);
router.get("/getAllCartServices", auth, getAllCartServices);
router.put("/updateCartFromLocalStorage", auth, updateCartFromLocalStorage);

module.exports = router;

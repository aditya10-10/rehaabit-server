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

router.post("/addToCart", auth, isUser, addToCart);
router.put("/updateCart", auth, isUser, updateCart);
router.delete("/removeFromCart", auth, isUser, removeFromCart);
router.get("/getAllCartServices", auth, getAllCartServices);
router.put(
  "/updateCartFromLocalStorage",
  auth,
  isUser,
  updateCartFromLocalStorage
);

module.exports = router;

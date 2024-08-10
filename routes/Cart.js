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

router.post("/addToCart", auth, isAdmin, addToCart);
router.put("/updateCart", auth, isAdmin, updateCart);
router.delete("/removeFromCart", auth, isAdmin, removeFromCart);
router.get("/getAllCartServices", auth, isAdmin, getAllCartServices);
router.put(
  "/updateCartFromLocalStorage",
  auth,
  isAdmin,
  updateCartFromLocalStorage
);

module.exports = router;

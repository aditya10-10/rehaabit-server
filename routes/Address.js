const express = require("express");
const router = express.Router();
const { auth, isPartner, isUser, isAdmin } = require("../middlewares/auth");

const {
  addAddress,
  updateAddress,
  deleteAddress,
  getUserAddresses,
} = require("../controllers/AddressController");

router.post("/addAddress", auth, isUser, addAddress);
router.put("/updateAddress", auth, isUser, updateAddress);
router.delete("/deleteAddress", auth, isUser, deleteAddress);
router.get("/getUserAddresses", auth, getUserAddresses);

module.exports = router;

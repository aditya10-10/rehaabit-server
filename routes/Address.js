const express = require("express");
const router = express.Router();
const { auth, isPartner, isUser, isAdmin } = require("../middlewares/auth");

const {
  addAddress,
  updateAddress,
  deleteAddress,
  getUserAddresses,
} = require("../controllers/AddressController");

router.post("/addAddress", auth, isAdmin, addAddress);
router.put("/updateAddress", auth, isAdmin, updateAddress);
router.delete("/deleteAddress", auth, isAdmin, deleteAddress);
router.get("/getUserAddresses", auth, isAdmin, getUserAddresses);

module.exports = router;

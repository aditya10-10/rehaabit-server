const express = require("express");
const router = express.Router();
const { auth, isPartner, isUser, isAdmin } = require("../middlewares/auth");
const {
  addPartnerInformation
} = require("../controllers/PartnerController");

router.post("/addPartnerInformation", addPartnerInformation);

module.exports = router;

const express = require("express");
const router = express.Router();
const { auth, isPartner, isUser, isAdmin } = require("../middlewares/auth");
const {
  addPartnerInformation,
  getAllPartners
} = require("../controllers/PartnerController");

router.post("/addPartnerInformation", addPartnerInformation);
router.get("/getAllPartners", getAllPartners);

module.exports = router;

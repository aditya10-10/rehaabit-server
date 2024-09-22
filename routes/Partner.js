const express = require("express");
const router = express.Router();
const { auth, isPartner, isUser, isAdmin } = require("../middlewares/auth");
const {
  addPartnerInformation,
  getAllPartners,
  getPartnerCount,
} = require("../controllers/PartnerController");

router.post("/addPartnerInformation", addPartnerInformation);
router.get("/getAllPartners", getAllPartners);
router.get("/getPartnerCount", auth, isAdmin, getPartnerCount);

module.exports = router;

const express = require("express");
const { createEnquiry, getAllEnquiries, getEnquiryById } = require("../controllers/EnquiryController");
const router = express.Router();

router.post("/enquire", createEnquiry);
router.get("/getAllEnquiries", getAllEnquiries);
router.post("/getEnquiryById", getEnquiryById);

module.exports = router;

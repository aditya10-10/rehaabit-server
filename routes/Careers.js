const express = require("express");
const router = express.Router();
const { auth, isPartner, isUser, isAdmin } = require("../middlewares/auth");
const { addCandidateInformation } = require("../controllers/CareersController");

router.post("/addCandidateInformation", addCandidateInformation);

module.exports = router;

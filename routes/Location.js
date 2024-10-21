const express = require("express");
const router = express.Router();
const { getLocationSuggestions } = require("../controllers/LocationController");

router.get("/getLocationSuggestions", getLocationSuggestions);
module.exports = router;
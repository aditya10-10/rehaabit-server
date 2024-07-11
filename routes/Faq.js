// routes/faqRoutes.js
const express = require("express");
const {
  createFAQ,
  getAllFAQs,
  updateFAQ,
  deleteFAQ,
} = require("../controllers/faqController");
const { auth } = require("../middlewares/auth"); // Assuming you have an auth middleware

const router = express.Router();

router.post("/createFAQ", auth, createFAQ);
router.get("/getAllFAQs", getAllFAQs);
router.put("/updateFAQ/:id", auth, updateFAQ);
router.delete("/deleteFAQ/:id", auth, deleteFAQ);

module.exports = router;

const express = require("express");
const router = express.Router();
const { auth, isAdmin, isUser } = require("../middlewares/auth");
const {
  addCandidateInformation,
  getAllCareers,
  getCareerById,
  deleteCareer,
} = require("../controllers/CareersController");

// Add candidate information (with resume upload)
router.post(
  "/addCandidateInformation",
  addCandidateInformation // Handle resume upload in the controller using Cloudinary
);

// Get all career submissions (only admins)
router.get(
  "/all",
  auth,
  isAdmin, // Only admins can view all submissions
  getAllCareers
);

// Get a single career submission by ID
router.get("/:id", auth, getCareerById);

// Delete career submission (only admins)
router.delete(
  "/:id",
  auth,
  isAdmin, // Only admins can delete
  deleteCareer
);

module.exports = router;

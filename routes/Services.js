// Import the required modules
const express = require("express");
const router = express.Router();

// Import the Controllers

// Course Controllers Import
const {
  createService,
  updateService,
  // deleteService,
  // getAllServices,
} = require("../controllers/ServicesController");

// Categories Controllers Import
const {
  showAllCategories,
  createCategory,
} = require("../controllers/CategoryController");

// Sub Category Controllers Import
const {
  createSubCategory,
  updateSubCategory,
} = require("../controllers/SubCategoryController");

// // Rating Controllers Import
// const {
//   createRating,
//   getAverageRating,
//   getAllRating,
// } = require("../controllers/RatingAndReview");

// const { updateCourseProgress } = require("../controllers/courseProgress");

// Importing Middlewares
const { auth, isPartner, isUser, isAdmin } = require("../middlewares/auth");

// ********************************************************************************************************
//                                      Course routes
// ********************************************************************************************************

// // Delete Sub Section
// router.post("/deleteSubSection", auth, isInstructor, deleteSubSection);
// // Add a Sub Section to a Section
// router.post("/addSubSection", auth, isInstructor, createSubSection);
// // Get all Registered Courses
// router.get("/getAllCourses", getAllCourses);
// // Get Details for a Specific Courses
// router.post("/getCourseDetails", getCourseDetails);
// // Get Details for a Specific Courses
// router.post("/getFullCourseDetails", auth, getFullCourseDetails);
// // Edit Course routes
// router.post("/editCourse", auth, isInstructor, editCourse);
// // Get all Courses Under a Specific Instructor
// router.get("/getInstructorCourses", auth, isInstructor, getInstructorCourses);
// // Delete a Course
// router.delete("/deleteCourse", deleteCourse);

// router.post("/updateCourseProgress", auth, isStudent, updateCourseProgress);

// ********************************************************************************************************
//                                      Category routes (Only by Admin)
// ********************************************************************************************************
// Category can Only be Created by Admin
// TODO: Put IsAdmin Middleware here
router.post("/createCategory", auth, isAdmin, createCategory);
router.get("/showAllCategories", showAllCategories);
// router.post("/getCategoryPageDetails", categoryPageDetails);

//Add a Section to a Course
router.post("/addSubCategory", auth, isAdmin, createSubCategory);
// Update a Section
router.post("/updateSubCategory", auth, isAdmin, updateSubCategory);
// Delete a Section
// router.post("/deleteSection", auth, isInstructor, deleteSection);

// Courses can Only be Created by Instructors
router.post("/createService", auth, isAdmin, createService);

// Edit Sub Section
router.post("/updateService", auth, isAdmin, updateService);

// ********************************************************************************************************
//                                      Rating and Review
// ********************************************************************************************************
// router.post("/createRating", auth, isStudent, createRating);
// router.get("/getAverageRating", getAverageRating);
// router.get("/getReviews", getAllRating);

module.exports = router;

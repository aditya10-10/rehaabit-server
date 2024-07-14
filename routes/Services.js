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
  updateCategoryName,
  updateCategoryIcon,
  deleteCategory,
} = require("../controllers/CategoryController");

// Sub Category Controllers Import
const {
  createSubCategory,
  updateSubCategoryName,
  updateSubCategoryIcon,
  deleteSubCategory,
  showAllSubCategories,
  getSubCategoriesByCategory,
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
//                                      Category routes (Only by Admin)
// ********************************************************************************************************
// Category can Only be Created by Admin
// TODO: Put IsAdmin Middleware here
router.post("/createCategory", auth, isAdmin, createCategory);
router.get("/showAllCategories", showAllCategories);
router.put("/updateCategoryName", auth, isAdmin, updateCategoryName);
router.put("/updateCategoryIcon", auth, isAdmin, updateCategoryIcon);
router.delete("/deleteCategory", auth, isAdmin, deleteCategory);
// router.post("/getCategoryPageDetails", categoryPageDetails);

// ********************************************************************************************************
//                                      Sub-Category routes (Only by Admin)
// ********************************************************************************************************
// Sub - Category can Only be Created by Admin

//Add a subcategory to a category
router.post("/addSubCategory", auth, isAdmin, createSubCategory);
// Update a subcategory
router.put("/updateSubCategoryName", auth, isAdmin, updateSubCategoryName);
router.put("/updateSubCategoryIcon", auth, isAdmin, updateSubCategoryIcon);

// Delete a subcategory
router.delete("/deleteSubCategory", auth, isAdmin, deleteSubCategory);
// show all subcategories
router.get("/showAllSubCategories", auth, isAdmin, showAllSubCategories);
router.get(
  "/getSubCategoriesByCategory",
  auth,
  isAdmin,
  getSubCategoriesByCategory
);

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

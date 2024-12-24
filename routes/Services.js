// Import the required modules
const express = require("express");
const router = express.Router();

// Import the Controllers

// Service Controllers Import
const {
  createService,
  editService,
  deleteService,
  getFullServiceDetails,
  getAllServices,
  getAllPublishedServices,
  getAllNoPricedPublishedServices,
  getTotalServicesCount,
  getServiceRatingAndReviews,
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
  getSubCategoriesBySlug,
} = require("../controllers/SubCategoryController");

// Include Controllers Import
const {
  createInclude,
  updateInclude,
  deleteInclude,
  // getAllIncludes,
} = require("../controllers/includeController");

// Exclude Controllers Import
const {
  createExclude,
  updateExclude,
  deleteExclude,
  // getAllExcludes,
} = require("../controllers/excludeController");

// FAQ Controllers Import
const {
  createFAQ,
  getAllFAQs,
  updateFAQ,
  deleteFAQ,
} = require("../controllers/faqController");

// HowDoesItWorks Controllers Import
const {
  createHowDoesItWorks,
  updateHowDoesItWorks,
  deleteHowDoesItWorks,
  // updateHowDoesItWorksIcon,
  getHowDoesItWorks,
} = require("../controllers/HowDoesItWorks");

// Rating Controllers Import
// const {
//   createRating,
//   getAverageRating,
//   getAllRating,
// } = require("../controllers/RatingAndReview");

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
router.get("/showAllSubCategories", showAllSubCategories);
router.post("/getSubCategoriesByCategory", getSubCategoriesByCategory);
router.get("/getSubCategoriesBySlug/slug/:slug", getSubCategoriesBySlug);

// ********************************************************************************************************
//                                      Service routes
// ********************************************************************************************************

router.post("/createService", auth, isAdmin, createService);

router.put("/editService", auth, isAdmin, editService);

router.delete("/deleteService", auth, isAdmin, deleteService);

router.post("/getFullServiceDetails", getFullServiceDetails);

router.get("/getServiceRatingAndReviews", getServiceRatingAndReviews);

router.get("/getAllServices", getAllServices);

router.get("/getAllPublishedServices", getAllPublishedServices);

router.get("/getAllNoPricedPublishedServices", getAllNoPricedPublishedServices);

router.get("/getTotalServicesCount", auth, isAdmin, getTotalServicesCount);

// ********************************************************************************************************
//                                      Include, Exclude, FAQ, HowDoesItWorks routes
// ********************************************************************************************************

// Include Controllers
router.post("/createInclude", auth, isAdmin, createInclude);
router.put("/updateInclude", auth, isAdmin, updateInclude);
router.delete("/deleteInclude", auth, isAdmin, deleteInclude);
// router.get("/getAllIncludes", auth, isAdmin, getAllIncludes);

// Exclude Controllers

router.post("/createExclude", auth, isAdmin, createExclude);
router.put("/updateExclude", auth, isAdmin, updateExclude);
router.delete("/deleteExclude", auth, isAdmin, deleteExclude);

// FAQ Controllers

router.post("/createFAQ", auth, isAdmin, createFAQ);
router.get("/getAllFAQs", auth, getAllFAQs);
router.put("/updateFAQ", auth, isAdmin, updateFAQ);
router.delete("/deleteFAQ", auth, isAdmin, deleteFAQ);

// HowDoesItWorks Controllers

router.post("/createHowDoesItWorks", auth, isAdmin, createHowDoesItWorks);
router.put("/updateHowDoesItWorks", auth, isAdmin, updateHowDoesItWorks);
router.delete("/deleteHowDoesItWorks", auth, isAdmin, deleteHowDoesItWorks);
// router.post(
//   "/updateHowDoesItWorksIcon",
//   auth,
//   isAdmin,
//   updateHowDoesItWorksIcon
// );
router.get("/getHowDoesItWorks", getHowDoesItWorks);

// ********************************************************************************************************
//                                      Rating and Review
// ********************************************************************************************************
// router.post("/createRating", auth, isStudent, createRating);
// router.get("/getAverageRating", getAverageRating);
// router.get("/getReviews", getAllRating);

module.exports = router;

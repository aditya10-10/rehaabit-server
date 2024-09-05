const express = require("express");
const router = express.Router();
const { auth } = require("../middlewares/auth");
const {
  createRating,
  getAverageRating,
  getAllRating,
  getUsersRatingAndReviews,
} = require("../controllers/RatingAndReviews");

router.post("/createRating", auth, createRating);
router.get("/getAverageRating", auth, getAverageRating);
router.get("/getAllRating", auth, getAllRating);
router.get("/getUsersRatingAndReviews", auth, getUsersRatingAndReviews);

module.exports = router;

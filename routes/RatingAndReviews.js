const express = require("express");
const router = express.Router();
const { auth } = require("../middlewares/auth");
const {
  createRating,
  getAverageRating,
  getAllRating,
  getUsersRatingAndReviews,
  getAllRatingsAndReviewsWithUserNames,
} = require("../controllers/RatingAndReviews");

router.post("/createRating", auth, createRating);
router.get("/getAverageRating", getAverageRating);
router.get("/getAllRating", getAllRating);
router.get(
  "/getAllRatingsAndReviewsWithUserNames",
  getAllRatingsAndReviewsWithUserNames
);
router.get("/getUsersRatingAndReviews", auth, getUsersRatingAndReviews);

module.exports = router;

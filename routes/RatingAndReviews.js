const express = require("express");
const router = express.Router();
const { auth, isAdmin } = require("../middlewares/auth");
const {
  createRating,
  getAverageRating,
  getAllRating,
  getUsersRatingAndReviews,
  getAllRatingsAndReviewsWithUserNames,
  getAllRatingsAndAverage,
} = require("../controllers/RatingAndReviews");

router.post("/createRating", auth, createRating);
router.get("/getAverageRating", getAverageRating);
router.get("/getAllRating", getAllRating);
router.get(
  "/getAllRatingsAndReviewsWithUserNames",
  getAllRatingsAndReviewsWithUserNames
);
router.get("/getUsersRatingAndReviews", auth, getUsersRatingAndReviews);
router.get("/getAllRatingsAndAverage", auth, isAdmin, getAllRatingsAndAverage);

module.exports = router;

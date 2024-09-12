const mongoose = require("mongoose");

// Define the RatingAndReview schema
const ratingAndReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  rating: {
    type: Number,
    required: true,
  },
  review: {
    type: String,
    // required: true,
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Service",
    index: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

// Export the RatingAndReview model
module.exports = mongoose.model("RatingAndReview", ratingAndReviewSchema);

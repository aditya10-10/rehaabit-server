const mongoose = require("mongoose");

// Define the Services schema
const servicesSchema = new mongoose.Schema({
  serviceName: { type: String },
  serviceDescription: { type: String },
  timeToComplete: {
    type: String,
  },
  serviceContent: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "IncludeExclude",
    },
  ],
  ratingAndReviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RatingAndReview",
    },
  ],
  price: {
    type: Number,
  },
  thumbnail: {
    type: String,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Category",
  },
  subCategory: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "SubCategory",
  },
  user: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  partner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  warranty: {
    type: String,
  },
  status: {
    type: String,
    enum: ["pending", "processing", "shipped", "delivered"],
    default: "pending",
  },
  faq: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faq",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Export the Services model
module.exports = mongoose.model("Service", servicesSchema);

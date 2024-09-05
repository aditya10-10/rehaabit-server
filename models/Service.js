const mongoose = require("mongoose");

// Define the Services schema
const servicesSchema = new mongoose.Schema({
  serviceName: {
    type: String,
    required: true,
    unique: true,
  },
  serviceDescription: {
    type: String,
    required: true,
  },
  timeToComplete: {
    type: String,
  },
  price: {
    type: Number,
    // required: true,
  },
  thumbnail: {
    type: String,
  },
  warranty: {
    type: String,
  },
  howDoesItWorks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HowDoesItWorks",
    },
  ],
  includes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Include",
    },
  ],
  excludes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exclude",
    },
  ],
  faqs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faq",
    },
  ],
  ratingAndReviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RatingAndReview",
    },
  ],
  status: {
    type: String,
    enum: ["Draft", "Published"],
  },
  categoryId: { type: String, required: true },
  subCategoryId: { type: String, required: true },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Export the Services model
module.exports = mongoose.model("Service", servicesSchema);

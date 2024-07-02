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
    required: true,
  },
  thumbnail: {
    type: String,
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

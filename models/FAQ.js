// models/FAQ.js
const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, "Question is required"],
      trim: true,
    },
    answer: {
      type: String,
      required: [true, "Answer is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
  },
  { timestamps: true }
);

// Adding indexes for optimized query performance
faqSchema.index({ question: 1 });
faqSchema.index({ category: 1 });

module.exports = mongoose.model("FAQ", faqSchema);

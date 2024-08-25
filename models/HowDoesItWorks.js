// models/Include.js
const mongoose = require("mongoose");

const howDoesItWorksSchema = new mongoose.Schema(
  {
    point: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    icon: {
      type: String,
      required: [true, "Icon is required"],
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HowDoesItWorks", howDoesItWorksSchema);

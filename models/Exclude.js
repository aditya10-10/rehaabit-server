// models/Exclude.js
const mongoose = require("mongoose");

const excludeSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Exclude", excludeSchema);

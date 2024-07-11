// models/Include.js
const mongoose = require("mongoose");

const includeSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Include", includeSchema);

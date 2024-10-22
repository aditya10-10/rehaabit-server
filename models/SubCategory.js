const mongoose = require("mongoose");

// Define the Tags schema
const subCategorySchema = new mongoose.Schema({
  subCategoryName: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  categoryId: { type: String, required: true },
  service: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
    },
  ],
  metaTitle: {
    type: String,
  },
  metaDescription: {
    type: String,
  },
});

// Export the Tags model
module.exports = mongoose.model("SubCategory", subCategorySchema);

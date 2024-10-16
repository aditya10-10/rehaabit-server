const mongoose = require("mongoose");

// Define the Tags schema
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  slugName: {
    type: String,
  },
  icon: {
    type: String,
    required: true,
  },
  subCategory: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
    },
  ],
});

// Export the Tags model
module.exports = mongoose.model("Category", categorySchema);

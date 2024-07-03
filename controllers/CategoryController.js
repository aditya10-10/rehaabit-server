const Category = require("../models/Category");

// Create a new category
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    // Validate input
    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Category name is required" });
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res
        .status(400)
        .json({ success: false, message: "Category already exists" });
    }

    // Create new category
    const CategoryDetails = await Category.create({
      name,
      subCategory: [],
    });

    console.log("Category Created:", CategoryDetails);
    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: CategoryDetails,
    });
  } catch (error) {
    console.error("Error creating category:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Show all categories
exports.showAllCategories = async (req, res) => {
  try {
    console.log("Fetching all categories");
    const allCategories = await Category.find({});

    return res.status(200).json({
      success: true,
      data: allCategories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

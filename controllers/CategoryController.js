const Category = require("../models/Category");
const SubCategory = require("../models/SubCategory");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

// Create a new category
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const icon = req.files.icon;

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

    const image = await uploadImageToCloudinary(
      icon,
      process.env.FOLDER_NAME,
      1000,
      1000
    );
    console.log(image);

    // Create new category
    const slugName = name.toLowerCase().replace(/\s+/g, '-');
    const CategoryDetails = await Category.create({
      name,
      slugName,
      icon: image.secure_url,
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

// UPDATE Category Name
exports.updateCategoryName = async (req, res) => {
  try {
    const { categoryId, name } = req.body;

    // Validate input
    if (!categoryId || !name) {
      return res
        .status(400)
        .json({ success: false, message: "Category ID and name are required" });
    }

    // Update the category name
    const category = await Category.findByIdAndUpdate(
      categoryId,
      { name },
      { new: true }
    );

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    console.log("Category Name Updated:", category);
    return res.status(200).json({
      success: true,
      message: "Category name updated successfully",
      data: category,
    });
  } catch (error) {
    console.error("Error updating category name:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// UPDATE Category Icon
exports.updateCategoryIcon = async (req, res) => {
  try {
    const { categoryId } = req.body;
    const icon = req.files.icon;

    // Validate input
    if (!categoryId || !icon) {
      return res
        .status(400)
        .json({ success: false, message: "Category ID and icon are required" });
    }

    // Upload image to Cloudinary
    const image = await uploadImageToCloudinary(
      icon,
      process.env.FOLDER_NAME,
      1000,
      1000
    );

    console.log(image);

    // Update the category icon
    const category = await Category.findByIdAndUpdate(
      categoryId,
      { icon: image.secure_url },
      { new: true }
    );

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    console.log("Category Icon Updated:", category);
    return res.status(200).json({
      success: true,
      message: "Category icon updated successfully",
      data: category,
    });
  } catch (error) {
    console.error("Error updating category icon:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// exports.updateCategory = async (req, res) => {
//   try {
//     const { categoryId, name } = req.body;
//     const icon = req.files.icon;

//     // Validate input
//     if (!categoryId || !name) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Category ID and name are required" });
//     }

//     const image = await uploadImageToCloudinary(
//       icon,
//       process.env.FOLDER_NAME,
//       1000,
//       1000
//     );

//     console.log(image);

//     // Update the category
//     const category = await Category.findByIdAndUpdate(
//       categoryId,
//       { name },
//       { image: image.secure_url },
//       { new: true }
//     );

//     if (!category) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Category not found" });
//     }

//     console.log("Category Updated:", category);
//     return res.status(200).json({
//       success: true,
//       message: "Category updated successfully",
//       data: category,
//     });
//   } catch (error) {
//     console.error("Error updating category:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// };

// Delete a category
exports.deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.body;

    // Validate input
    if (!categoryId) {
      return res
        .status(400)
        .json({ success: false, message: "Category ID is required" });
    }

    // Find the category
    const category = await Category.findById(categoryId);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    // Delete subcategories associated with the category
    await SubCategory.deleteMany({ _id: { $in: category.subCategory } });

    // Delete the category
    await Category.findByIdAndDelete(categoryId);

    console.log("Category Deleted:", categoryId);
    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      categoryId
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

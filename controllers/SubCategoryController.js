const Category = require("../models/Category");
const SubCategory = require("../models/SubCategory");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const { redisClient } = require("../config/redisSetup");

// CREATE a new SubCategory
exports.createSubCategory = async (req, res) => {
  try {
    // Extract the required properties from the request body
    const { subCategoryName, categoryId, metaTitle, metaDescription } =
      req.body;
    const icon = req.files.icon;

    // Validate the input
    if (!subCategoryName || !categoryId) {
      return res.status(400).json({
        success: false,
        message: "Missing required properties",
      });
    }

    const image = await uploadImageToCloudinary(
      icon,
      process.env.FOLDER_NAME,
      1000,
      1000
    );
    // console.log(image);

    // Create a new SubCategory with the given name
    const newSubCategory = await SubCategory.create({
      subCategoryName,
      icon: image.secure_url,
      categoryId,
      metaTitle,
      metaDescription,
    });

    // Add the new SubCategory to the Category's content array
    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      {
        $push: {
          subCategory: newSubCategory._id,
        },
      },
      { new: true }
    )
      .populate({
        path: "subCategory",
      })
      .exec();
    await redisClient.del("subcategories");
    // Return the updated Category object in the response
    res.status(200).json({
      success: true,
      message: "SubCategory created successfully",
      newSubCategory,
      updatedCategory,
    });
  } catch (error) {
    // Handle errors
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// UPDATE SubCategory Name
exports.updateSubCategoryName = async (req, res) => {
  try {
    const { subCategoryName, subCategoryId, categoryId } = req.body;

    // Validate input
    if (!subCategoryId || !subCategoryName) {
      return res.status(400).json({
        success: false,
        message: "SubCategory ID and name are required",
      });
    }

    // Update the subcategory name
    const updatedSubCategory = await SubCategory.findByIdAndUpdate(
      subCategoryId,
      { subCategoryName },
      { new: true }
    );

    if (!updatedSubCategory) {
      return res.status(404).json({
        success: false,
        message: "SubCategory not found",
      });
    }

    // Find the updated category and return it
    const updatedCategory = await Category.findById(categoryId)
      .populate("subCategory")
      .exec();
    await redisClient.del("subcategories");
    res.status(200).json({
      success: true,
      message: "SubCategory name updated successfully",
      data: updatedCategory,
      updatedSubCategory,
    });
  } catch (error) {
    console.error("Error updating SubCategory name:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// UPDATE SubCategory Icon
exports.updateSubCategoryIcon = async (req, res) => {
  try {
    const { subCategoryId, categoryId } = req.body;
    const icon = req.files.icon;

    // Validate input
    if (!subCategoryId || !icon) {
      return res.status(400).json({
        success: false,
        message: "SubCategory ID and icon are required",
      });
    }

    // Upload image to Cloudinary
    const image = await uploadImageToCloudinary(
      icon,
      process.env.FOLDER_NAME,
      1000,
      1000
    );

    // console.log(image);

    // Update the subcategory icon
    const updatedSubCategory = await SubCategory.findByIdAndUpdate(
      subCategoryId,
      { icon: image.secure_url },
      { new: true }
    );

    if (!updatedSubCategory) {
      return res.status(404).json({
        success: false,
        message: "SubCategory not found",
      });
    }

    // Find the updated category and return it
    const updatedCategory = await Category.findById(categoryId)
      .populate("subCategory")
      .exec();
    await redisClient.del("subcategories");
    res.status(200).json({
      success: true,
      message: "SubCategory icon updated successfully",
      data: updatedCategory,
      updatedSubCategory,
    });
  } catch (error) {
    console.error("Error updating SubCategory icon:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// exports.updateSubCategory = async (req, res) => {
//   try {
//     const { subCategoryName, subCategoryId, categoryId } = req.body;
//     const icon = req.files.icon;

//     console.log("Updating SubCategory:", subCategoryId, subCategoryName);
//     const SubCategory1 = await SubCategory.findByIdAndUpdate(
//       subCategoryId,
//       { subCategoryName: subCategoryName },
//       { image: image.secure_url },
//       { new: true }
//     );

//     const Category1 = await Category.findById(categoryId)
//       .populate({
//         path: "subCategory",
//       })
//       .exec();

//     res.status(200).json({
//       success: true,
//       // message: SubCategory1,
//       data: Category1,
//     });
//   } catch (error) {
//     console.error("Error updating SubCategory:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// };

// DELETE a SubCategory
exports.deleteSubCategory = async (req, res) => {
  try {
    const { subCategoryId, categoryId } = req.body;

    // Validate input
    if (!subCategoryId || !categoryId) {
      return res.status(400).json({
        success: false,
        message: "SubCategory ID and Category ID are required",
      });
    }

    // Remove the SubCategory reference from the Category
    await Category.findByIdAndUpdate(categoryId, {
      $pull: {
        subCategory: subCategoryId,
      },
    });

    // Find the SubCategory to delete
    const subCategory = await SubCategory.findById(subCategoryId);
    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: "SubCategory not found",
      });
    }

    // Delete the SubCategory
    const deletedSubCategory = await SubCategory.findByIdAndDelete(
      subCategoryId
    );

    // Find the updated Category and return
    const updatedCategory = await Category.findById(categoryId)
      .populate("subCategory")
      .exec();
    await redisClient.del("subcategories");
    res.status(200).json({
      success: true,
      message: "SubCategory deleted successfully",
      data: updatedCategory,
      deletedSubCategory,
    });
  } catch (error) {
    console.error("Error deleting SubCategory:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Show all categories
exports.showAllSubCategories = async (req, res) => {
  try {
    // console.log("Fetching all sub-categories");
    const cachedSubCategories = await redisClient.get("subcategories");
    if (cachedSubCategories) {
      try {
        const parsedSubCategories =
          typeof cachedSubCategories === "object"
            ? cachedSubCategories
            : JSON.parse(cachedSubCategories);
        return res.status(200).json({
          success: true,
          data: parsedSubCategories,
        });
      } catch (parseError) {
        console.error("Error parsing cached sub-categories:", parseError);
        await redisClient.del("subcategories");
      }
    }
    const allSubCategories = await SubCategory.find({});
    await redisClient.set("subcategories", JSON.stringify(allSubCategories));
    return res.status(200).json({
      success: true,
      data: allSubCategories,
    });
  } catch (error) {
    console.error("Error fetching sub-categories:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Show all subcategories
exports.showAllSubCategories = async (req, res) => {
  try {
    // console.log("Fetching all subcategories");
    const cachedSubCategories = await redisClient.get("subcategories");
    if (cachedSubCategories) {
      try {
        const parsedSubCategories =
          typeof cachedSubCategories === "object"
            ? cachedSubCategories
            : JSON.parse(cachedSubCategories);
        return res.status(200).json({
          success: true,
          data: parsedSubCategories,
        });
      } catch (parseError) {
        console.error("Error parsing cached sub-categories:", parseError);
        await redisClient.del("subcategories");
      }
    }
    const allSubCategories = await SubCategory.find({});
    await redisClient.set("subcategories", JSON.stringify(allSubCategories));
    return res.status(200).json({
      success: true,
      data: allSubCategories,
    });
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get all subcategories within a specific category
// ! This function is not working as expected because params and body request or get or post
exports.getSubCategoriesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.body;

    // Validate input
    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: "Category ID is required",
      });
    }
    const cachedSubCategories = await redisClient.get(
      `subcategories:${categoryId}`
    );
    if (cachedSubCategories) {
      try {
        const parsedSubCategories =
          typeof cachedSubCategories === "object"
            ? cachedSubCategories
            : JSON.parse(cachedSubCategories);
        return res.status(200).json({
          success: true,
          data: parsedSubCategories,
        });
      } catch (parseError) {
        console.error("Error parsing cached sub-categories:", parseError);
        await redisClient.del(`subcategories:${categoryId}`);
      }
    }
    // Find the category and populate its subcategories
    const category = await Category.findOne({ slugName: categoryId }).populate(
      "subCategory"
    );
    await redisClient.set(
      `subcategories:${categoryId}`,
      JSON.stringify(category.subCategory)
    );
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // console.log("Get Subcategories by Category");

    // Return the subcategories of the category
    return res.status(200).json({
      success: true,
      data: category.subCategory,
    });
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

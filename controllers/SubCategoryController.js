const Category = require("../models/Category");
const SubCategory = require("../models/SubCategory");

// CREATE a new SubCategory
exports.createSubCategory = async (req, res) => {
  try {
    // Extract the required properties from the request body
    const { subCategoryName, categoryId } = req.body;

    // Validate the input
    if (!subCategoryName || !categoryId) {
      return res.status(400).json({
        success: false,
        message: "Missing required properties",
      });
    }

    // Create a new SubCategory with the given name
    const newSubCategory = await SubCategory.create({ subCategoryName });

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

    // Return the updated Category object in the response
    res.status(200).json({
      success: true,
      message: "SubCategory created successfully",
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

// UPDATE a SubCategory
exports.updateSubCategory = async (req, res) => {
  try {
    const { subCategoryName, subCategoryId, categoryId } = req.body;

    console.log("Updating SubCategory:", subCategoryId, subCategoryName);
    const SubCategory1 = await SubCategory.findByIdAndUpdate(
      subCategoryId,
      { subCategoryName: subCategoryName },
      { new: true }
    );

    const Category1 = await Category.findById(categoryId)
      .populate({
        path: "subCategory",
      })
      .exec();

    res.status(200).json({
      success: true,
      // message: SubCategory1,
      data: Category1,
    });
  } catch (error) {
    console.error("Error updating SubCategory:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// DELETE a SubCategory
// exports.deleteSubCategory = async (req, res) => {
//   try {
//     const { SubCategoryId, categoryId } = req.body;
//     await Category.findByIdAndUpdate(categoryId, {
//       $pull: {
//         subCategory: SubCategoryId,
//       },
//     });
//     const SubCategory = await SubCategory.findById(SubCategoryId);
//     console.log(SubCategoryId, categoryId);
//     if (!SubCategory) {
//       return res.status(404).json({
//         success: false,
//         message: "SubCategory not Found",
//       });
//     }

//     //delete sub SubCategory
//     await SubCategory.deleteMany({
//       _id: { $in: SubCategory.SubCategory },
//     });

//     await SubCategory.findByIdAndDelete(SubCategoryId);

//     //find the updated Category and return
//     const Category = await Category.findById(categoryId)
//       .populate({
//         path: "CategoryContent",
//         populate: {
//           path: "subSubCategory",
//         },
//       })
//       .exec();

//     res.status(200).json({
//       success: true,
//       message: "SubCategory deleted",
//       data: Category,
//     });
//   } catch (error) {
//     console.error("Error deleting SubCategory:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// };

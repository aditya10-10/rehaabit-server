const Service = require("../models/Service");
// const IncludeExclude = require("../models/IncludeExclude");
// const RatingAndReview = require("../models/RatingAndReview");
// const Faq = require("../models/Faq");
const SubCategory = require("../models/SubCategory");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

// CREATE a new Service
exports.createService = async (req, res) => {
  try {
    let {
      categoryId,
      subCategoryId,
      serviceName,
      serviceDescription,
      timeToComplete,
      price,
      warranty,
      status,
    } = req.body;

    const thumbnail = req.files.thumbnail;

    // Validate the input
    if (
      !serviceName ||
      !serviceDescription ||
      !price ||
      !subCategoryId ||
      !categoryId ||
      !thumbnail
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required ",
      });
    }

    if (!status || status === undefined) {
      status = "Draft";
    }

    const thumbnailImage = await uploadImageToCloudinary(
      thumbnail,
      process.env.FOLDER_NAME
    );

    console.log(thumbnailImage);

    // Create a new Service
    const newService = await Service.create({
      serviceName,
      serviceDescription,
      timeToComplete,
      price,
      warranty,
      status,
      thumbnail: thumbnailImage.secure_url,
    });

    // Add the new SubCategory to the Category's content array
    const updatedSubCategory = await SubCategory.findByIdAndUpdate(
      subCategoryId,
      {
        $push: {
          service: newService._id,
        },
      },
      { new: true }
    )
      .populate({
        path: "service",
      })
      .exec();

    res.status(201).json({
      success: true,
      message: "Service created successfully",
      service: newService,
      updatedSubCategory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// UPDATE a Service
exports.editService = async (req, res) => {
  try {
    const {
      serviceId,
      serviceName,
      serviceDescription,
      timeToComplete,
      price,
      warranty,
      status,
    } = req.body;

    const thumbnail = req.files ? req.files.thumbnail : null;

    // Validate the input
    if (!serviceId) {
      return res.status(400).json({
        success: false,
        message: "Service ID are required",
      });
    }

    let updates = {
      serviceName,
      serviceDescription,
      timeToComplete,
      price,
      warranty,
      status,
    };

    if (thumbnail) {
      const thumbnailImage = await uploadImageToCloudinary(
        thumbnail,
        process.env.FOLDER_NAME
      );
      updates.thumbnail = thumbnailImage.secure_url;
    }

    // Remove undefined fields from updates
    updates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v != null)
    );

    // Update the service
    const updatedService = await Service.findByIdAndUpdate(serviceId, updates, {
      new: true,
    });

    if (!updatedService) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Service updated successfully",
      service: updatedService,
    });
  } catch (error) {
    console.error("Error updating service:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// // DELETE a Service
// exports.deleteService = async (req, res) => {
//   try {
//     const { serviceId } = req.body;

//     if (!serviceId) {
//       return res.status(400).json({
//         success: false,
//         message: "Missing required property: serviceId",
//       });
//     }

//     const service = await Service.findById(serviceId);

//     if (!service) {
//       return res.status(404).json({
//         success: false,
//         message: "Service not found",
//       });
//     }

//     await Service.findByIdAndDelete(serviceId);

//     res.status(200).json({
//       success: true,
//       message: "Service deleted successfully",
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };

// // GET all Services
// exports.getAllServices = async (req, res) => {
//   try {
//     const services = await Service.find()
//       .populate("serviceContent")
//       .populate("ratingAndReviews")
//       .populate("faq");

//     res.status(200).json({
//       success: true,
//       services,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };

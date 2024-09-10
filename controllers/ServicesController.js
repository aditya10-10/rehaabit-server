const Service = require("../models/Service");
const RatingAndReview = require("../models/RatingAndReviews");
const Faq = require("../models/FAQ");
const Include = require("../models/Include");
const Exclude = require("../models/Exclude");
const HowDoesItWorks = require("../models/HowDoesItWorks");
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
      priceStatus,
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

    if (!priceStatus || priceStatus === undefined) {
      priceStatus = "priced";
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
      priceStatus,
      thumbnail: thumbnailImage.secure_url,
      categoryId,
      subCategoryId,
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
      priceStatus,
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
      priceStatus,
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
      data: updatedService,
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

// DELETE a Service

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

exports.deleteService = async (req, res) => {
  try {
    const { serviceId, subCategoryId } = req.body;

    // Validate input
    if (!serviceId || !subCategoryId) {
      return res.status(400).json({
        success: false,
        message: "Service ID and SubCategory ID are required",
      });
    }

    // Find the service
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    // Remove the service reference from the SubCategory
    await SubCategory.findByIdAndUpdate(subCategoryId, {
      $pull: { services: serviceId },
    });

    // Delete the service
    const deletedService = await Service.findByIdAndDelete(serviceId);

    // Optionally, you may want to delete related documents (howDoesItWorks, includes, excludes, faqs, ratingAndReviews) if needed.
    // Example:
    await HowDoesItWorks.deleteMany({ _id: { $in: service.howDoesItWorks } });
    await Include.deleteMany({ _id: { $in: service.includes } });
    await Exclude.deleteMany({ _id: { $in: service.excludes } });
    await Faq.deleteMany({ _id: { $in: service.faqs } });
    // await RatingAndReview.deleteMany({ _id: { $in: service.ratingAndReviews } });

    return res.status(200).json({
      success: true,
      message: "Service deleted successfully",
      data: deletedService,
    });
  } catch (error) {
    console.error("Error deleting service:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get full service details
exports.getFullServiceDetails = async (req, res) => {
  try {
    const { serviceId } = req.body;

    if (!serviceId) {
      return res.status(400).json({
        success: false,
        message: "Service ID is required",
      });
    }

    const service = await Service.findById(serviceId)
      .populate("howDoesItWorks")
      .populate("includes")
      .populate("excludes")
      .populate("faqs");
    // .populate("ratingAndReviews");

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    res.status(200).json({
      success: true,
      data: service,
    });
  } catch (error) {
    console.error("Error fetching service details:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// GET all Services
exports.getAllServices = async (req, res) => {
  try {
    // Fetch all services from the database
    const allServices = await Service.find({ status: "Published" }).populate([
      {
        path: "howDoesItWorks",
      },
      {
        path: "includes",
      },
      {
        path: "excludes",
      },
      {
        path: "faqs",
      },
      {
        path: "ratingAndReviews",
      },
    ]);

    // Return the fetched services
    return res.status(200).json({
      success: true,
      data: allServices,
    });
  } catch (error) {
    console.error("Error fetching all services:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get the services for the published service
exports.getAllPublishedServices = async (req, res) => {
  try {
    // Fetch all published services
    const allServices = await Service.find({ status: "Published" }).populate([
      {
        path: "howDoesItWorks",
      },
      {
        path: "includes",
      },
      {
        path: "excludes",
      },
      {
        path: "faqs",
      },
      {
        path: "ratingAndReviews",
      },
    ]);

    // Return the fetched services
    return res.status(200).json({
      success: true,
      data: allServices,
    });
  } catch (error) {
    console.error("Error fetching all services:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get services by no priced and published
exports.getAllNoPricedPublishedServices = async (req, res) => {
  try {
    // Fetch all published services without pricing
    const allServices = await Service.find({
      status: "Published",
      price: 0,
    }).populate([
      {
        path: "howDoesItWorks",
      },
      {
        path: "includes",
      },
      {
        path: "excludes",
      },
      {
        path: "faqs",
      },
      {
        path: "ratingAndReviews",
      },
    ]);

    // Return the fetched services
    return res.status(200).json({
      success: true,
      data: allServices,
    });
  } catch (error) {
    console.error("Error fetching all services:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

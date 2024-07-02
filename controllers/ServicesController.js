const Service = require("../models/Service");
// const IncludeExclude = require("../models/IncludeExclude");
// const RatingAndReview = require("../models/RatingAndReview");
// const Faq = require("../models/Faq");
const SubCategory = require("../models/SubCategory");

// CREATE a new Service
exports.createService = async (req, res) => {
  try {
    const {
      serviceName,
      serviceDescription,
      timeToComplete,
      serviceContent,
      ratingAndReviews,
      price,
      thumbnail,
      warranty,
      status,
      faq,
      subCategoryId,
    } = req.body;

    // Validate the input
    if (!serviceName || !serviceDescription || !price || !subCategoryId) {
      return res.status(400).json({
        success: false,
        message: "Missing required properties: serviceName or price",
      });
    }

    // Create a new Service
    const newService = await Service.create({
      serviceName,
      serviceDescription,
      timeToComplete,
      serviceContent,
      ratingAndReviews,
      price,
      thumbnail,
      warranty,
      status,
      faq,
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
exports.updateService = async (req, res) => {
  try {
    const {
      serviceId,
      serviceName,
      serviceDescription,
      timeToComplete,
      serviceContent,
      ratingAndReviews,
      price,
      thumbnail,
      warranty,
      status,
      faq,
    } = req.body;

    // Validate the input
    if (!serviceId) {
      return res.status(400).json({
        success: false,
        message: "Missing required property: serviceId",
      });
    }

    // Update the Service
    const updatedService = await Service.findByIdAndUpdate(
      serviceId,
      {
        serviceName,
        serviceDescription,
        timeToComplete,
        serviceContent,
        ratingAndReviews,
        price,
        thumbnail,
        warranty,
        status,
        faq,
      },
      { new: true }
    );
    //   .populate("serviceContent")
    //   .populate("ratingAndReviews")
    //   .populate("faq");

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

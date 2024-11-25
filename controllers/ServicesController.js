const Service = require("../models/Service");
const RatingAndReview = require("../models/RatingAndReviews");
const Faq = require("../models/FAQ");
const Include = require("../models/Include");
const Exclude = require("../models/Exclude");
const HowDoesItWorks = require("../models/HowDoesItWorks");
const SubCategory = require("../models/SubCategory");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const { redisClient } = require("../config/redisSetup");

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
      metaTitle,
      metaDescription,
    } = req.body;

    // Handle file upload
    let thumbnailImage;
    if (req.files && req.files.thumbnail) {
      thumbnailImage = await uploadImageToCloudinary(
        req.files.thumbnail,
        process.env.FOLDER_NAME,
        serviceName
      );
    }

    // Validate the input
    if (
      !serviceName ||
      !serviceDescription ||
      !price ||
      !subCategoryId ||
      !categoryId ||
      !thumbnailImage
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Create a new Service
    const newService = await Service.create({
      serviceName,
      serviceDescription,
      timeToComplete,
      price,
      warranty,
      status: status || "Draft",
      priceStatus: priceStatus || "priced",
      thumbnail: thumbnailImage.secure_url,
      categoryId,
      subCategoryId,
      metaTitle,
      metaDescription,
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
    await redisClient.del("services");
    // console.log("updatedSubCategory", updatedSubCategory);
    res.status(201).json({
      success: true,
      message: "Service created successfully",
      service: newService,
      updatedSubCategory,
    });
  } catch (error) {
    console.error("Error creating service:", error);
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
      metaTitle,
      metaDescription,
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
      metaTitle,
      metaDescription,
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
    await redisClient.del("services");
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
    await redisClient.del("services");
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
    const cachedService = await redisClient.get(`services:${serviceId}`);
    if (cachedService) {
      try {
        const parsedService =
          typeof cachedService === "object"
            ? cachedService
            : JSON.parse(cachedService);
        return res.status(200).json({
          success: true,
          data: parsedService,
        });
      } catch (parseError) {
        console.error("Error parsing cached service:", parseError);
        await redisClient.del(`services:${serviceId}`);
      }
    }
    const service = await Service.findById(serviceId)
      .populate("howDoesItWorks")
      .populate("includes")
      .populate("excludes")
      .populate("faqs")
      .populate({
        path: "ratingAndReviews",
        populate: {
          path: "user",
          select: "firstName lastName",
          model: "User",
          populate: {
            path: "additionalDetails",
            select: "firstName lastName",
            model: "Profile",
          },
        },
      });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }
    await redisClient.set(`services:${serviceId}`, JSON.stringify(service));
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
    const cachedServices = await redisClient.get("services");
    // console.log("Cached services:", cachedServices);

    if (cachedServices) {
      try {
        // Check if the cached data is already an object
        const parsedServices =
          typeof cachedServices === "object"
            ? cachedServices
            : JSON.parse(cachedServices);

        return res.status(200).json({
          success: true,
          data: parsedServices,
        });
      } catch (parseError) {
        console.error("Error parsing cached services:", parseError);
        await redisClient.del("services");
      }
    }

    const allServices = await Service.find({}).populate([
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
        populate: {
          path: "user",
          select: "firstName lastName",
          model: "User",
          populate: {
            path: "additionalDetails",
            select: "firstName lastName",
            model: "Profile",
          },
        },
      },
    ]);

    // Convert to plain objects and handle any special types
    const servicesForCache = allServices.map((doc) => doc.toObject());

    // Store in Redis
    await redisClient.set("services", JSON.stringify(servicesForCache));

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
    const cachedPublishedServices = await redisClient.get("publishedServices");
    if (cachedPublishedServices) {
      return res.status(200).json({
        success: true,
        data: JSON.parse(cachedPublishedServices),
      });
    }
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
    await redisClient.set("publishedServices", JSON.stringify(allServices));
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
    const cachedNoPricedPublishedServices = await redisClient.get(
      "noPricedPublishedServices"
    );
    if (cachedNoPricedPublishedServices) {
      return res.status(200).json({
        success: true,
        data: JSON.parse(cachedNoPricedPublishedServices),
      });
    }
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
    await redisClient.set(
      "noPricedPublishedServices",
      JSON.stringify(allServices)
    );
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

// GET total number of services in the database
exports.getTotalServicesCount = async (req, res) => {
  try {
    // Get the total count of services
    const cachedTotalServicesCount = await redisClient.get(
      "totalServicesCount"
    );
    if (cachedTotalServicesCount) {
      return res.status(200).json({
        success: true,
        totalServices: JSON.parse(cachedTotalServicesCount),
      });
    }
    const totalServicesCount = await Service.countDocuments();
    await redisClient.set(
      "totalServicesCount",
      JSON.stringify(totalServicesCount)
    );
    // Return the total count
    return res.status(200).json({
      success: true,
      totalServices: totalServicesCount,
    });
  } catch (error) {
    console.error("Error fetching total services count:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get the rating and reviews for the service
exports.getServiceRatingAndReviews = async (req, res) => {
  try {
    const { serviceId, page = 1 } = req.query;
    const service = await Service.findById(serviceId).populate({
      path: "ratingAndReviews",
      populate: {
        path: "user",
        select: "firstName lastName",
        model: "User",
        populate: {
          path: "additionalDetails",
          select: "firstName lastName",
          model: "Profile",
        },
      },
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }
    const ratingAndReviews = service.ratingAndReviews;
    const itemsPerPage = 5;
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = Math.min(
      startIndex + itemsPerPage,
      ratingAndReviews.length
    );
    const paginatedRatingAndReviews = ratingAndReviews.slice(
      startIndex,
      endIndex
    );
    // console.log(paginatedRatingAndReviews);
    return res.status(200).json({
      success: true,
      data: paginatedRatingAndReviews,
      totalRatingAndReviews: ratingAndReviews.length,
    });
  } catch (error) {
    console.error("Error fetching service rating and reviews:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

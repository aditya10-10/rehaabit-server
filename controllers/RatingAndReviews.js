const RatingAndReview = require("../models/RatingAndReviews");
const Service = require("../models/Service");
const { mongo, default: mongoose } = require("mongoose");

//createRating
exports.createRating = async (req, res) => {
  try {
    const { rating, review, serviceId } = req.body;

    // console.log(rating, review, serviceId);

    const userId = req.user.id;

    const serviceDetails = await Service.findOne({
      _id: serviceId,
      // order: { $elemMatch: { $eq: userId } },
    });

    // console.log(serviceDetails);

    if (!serviceDetails) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }
    //check if user already reviewed the course
    const alreadyReviewed = await RatingAndReview.findOne({
      user: userId,
      service: serviceId,
    });

    if (alreadyReviewed) {
      return res.status(403).json({
        success: false,
        message: "Service is already reviewed by the user",
      });
    }
    //create rating and review
    const ratingReview = await RatingAndReview.create({
      rating,
      review,
      service: serviceId,
      user: userId,
    });

    //update service with this rating/review
    const updatedServiceDetails = await Service.findByIdAndUpdate(
      { _id: serviceId },
      {
        $push: {
          ratingAndReviews: ratingReview._id,
        },
      },
      { new: true }
    );
    console.log(updatedServiceDetails);
    //return response
    return res.status(200).json({
      success: true,
      message: "Rating and Review created Successfully",
      data: ratingReview,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//getAverageRating
exports.getAverageRating = async (req, res) => {
  try {
    //get course ID
    const { serviceId } = req.body;
    //calculate avg rating

    const result = await RatingAndReview.aggregate([
      {
        $match: {
          service: new mongoose.Types.ObjectId(serviceId),
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
        },
      },
    ]);

    //return rating
    if (result.length > 0) {
      return res.status(200).json({
        success: true,
        averageRating: result[0].averageRating,
      });
    }

    //if no rating/Review exist
    return res.status(200).json({
      success: true,
      message: "Average Rating is 0, no ratings given till now",
      averageRating: 0,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//getAllRatingAndReviews

exports.getAllRating = async (req, res) => {
  try {
    const allReviews = await RatingAndReview.find({});

    return res.status(200).json({
      success: true,
      message: "All reviews fetched successfully",
      data: allReviews,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// //getAllRatingAndReviews

// exports.getAllRating = async (req, res) => {
//   try {
//     const allReviews = await RatingAndReview.find({})
//       .sort({ rating: "desc" })
//       .populate({
//         path: "user",
//         select: "firstName lastName email image",
//       })
//       .populate({
//         path: "service",
//         select: "serviceName",
//       })
//       .exec();
//     return res.status(200).json({
//       success: true,
//       message: "All reviews fetched successfully",
//       data: allReviews,
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

//getUsersRatingAndReviews
exports.getUsersRatingAndReviews = async (req, res) => {
  try {
    const userId = req.user.id;

    const allReviews = await RatingAndReview.find({ user: userId });

    return res.status(200).json({
      success: true,
      message: "All reviews fetched successfully",
      data: allReviews,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const User = require("../models/User");

exports.getAllUsers = async (req, res) => {
  try {
    // Fetch all orders and populate related fields
    const users = await User.find({})
      .populate("address")
      .populate("additionalDetails")

    if (!users || users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No Users found",
      });
    }

    // Map over the orders and replace the serviceId with the actual service object
    // const ordersWithServiceDetails = orders.map((order) => ({
    //   ...order._doc,
    //   services: order.services.map((service) => ({
    //     ...service._doc,
    //     ...service.serviceId._doc, // Include the full service object
    //     serviceId: service.serviceId._id, // Keep the serviceId if needed separately
    //     serviceName: service.serviceId.serviceName, // Add other details directly
    //     serviceDescription: service.serviceId.serviceDescription,
    //   })),
    // }));

    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: users,
    });
  } catch (error) {
    console.error("Error getting users:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

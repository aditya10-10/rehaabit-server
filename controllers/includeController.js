// controllers/includeController.js
const Include = require("../models/Include");
const Service = require("../models/Service");

// CREATE a new Include
exports.createInclude = async (req, res) => {
  try {
    const { content, serviceId } = req.body;

    if (!content || !serviceId) {
      return res.status(400).json({
        success: false,
        message: "Missing required properties",
      });
    }

    const newInclude = await Include.create({ content });

    const updatedService = await Service.findByIdAndUpdate(
      serviceId,
      {
        $push: { includes: newInclude._id },
      },
      { new: true }
    )
      .populate("includes")
      .exec();

    res.status(200).json({
      success: true,
      message: "Include created successfully",
      service : updatedService,
    });
  } catch (error) {
    console.error("Error creating Include:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// UPDATE an Include
exports.updateInclude = async (req, res) => {
  try {
    const { content, serviceId, id } = req.body;

    const include = await Include.findByIdAndUpdate(
      id,
      { content },
      { new: true }
    );

    if (!include) {
      return res.status(404).json({
        success: false,
        message: "Include not found",
      });
    }

    const service = await Service.findById(serviceId)
      .populate("includes")
      .exec();

    res.status(200).json({
      success: true,
      message: "Include updated successfully",
      data: service,
    });
  } catch (error) {
    console.error("Error updating Include:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// DELETE an Include
exports.deleteInclude = async (req, res) => {
  try {
    const { id, serviceId } = req.body;

    await Service.findByIdAndUpdate(serviceId, {
      $pull: { includes: id },
    });

    const include = await Include.findById(id);

    if (!include) {
      return res.status(404).json({
        success: false,
        message: "Include not found",
      });
    }

    await Include.findByIdAndDelete(id);

    const service = await Service.findById(serviceId)
      .populate("includes")
      .exec();

    res.status(200).json({
      success: true,
      message: "Include deleted successfully",
      data: service,
    });
  } catch (error) {
    console.error("Error deleting Include:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

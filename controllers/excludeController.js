// controllers/excludeController.js
const Exclude = require("../models/Exclude");
const Service = require("../models/Service");

// CREATE a new Exclude
exports.createExclude = async (req, res) => {
  try {
    const { content, serviceId } = req.body;

    if (!content || !serviceId) {
      return res.status(400).json({
        success: false,
        message: "Missing required properties",
      });
    }

    const newExclude = await Exclude.create({ content });

    const updatedService = await Service.findByIdAndUpdate(
      serviceId,
      {
        $push: { excludes: newExclude._id },
      },
      { new: true }
    )
      .populate("excludes")
      .exec();

    res.status(200).json({
      success: true,
      message: "Exclude created successfully",
      service: updatedService,
    });
  } catch (error) {
    console.error("Error creating Exclude:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// UPDATE an Exclude
exports.updateExclude = async (req, res) => {
  try {
    const { content, serviceId, id } = req.body;

    const exclude = await Exclude.findByIdAndUpdate(
      id,
      { content },
      { new: true }
    );

    if (!exclude) {
      return res.status(404).json({
        success: false,
        message: "Exclude not found",
      });
    }

    const service = await Service.findById(serviceId)
      .populate("excludes")
      .exec();

    res.status(200).json({
      success: true,
      message: "Exclude updated successfully",
      data: service,
    });
  } catch (error) {
    console.error("Error updating Exclude:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// DELETE an Exclude
exports.deleteExclude = async (req, res) => {
  try {
    const { id, serviceId } = req.body;

    await Service.findByIdAndUpdate(serviceId, {
      $pull: { excludes: id },
    });

    const exclude = await Exclude.findById(id);

    if (!exclude) {
      return res.status(404).json({
        success: false,
        message: "Exclude not found",
      });
    }

    await Exclude.findByIdAndDelete(id);

    const service = await Service.findById(serviceId)
      .populate("excludes")
      .exec();

    res.status(200).json({
      success: true,
      message: "Exclude deleted successfully",
      data: service,
    });
  } catch (error) {
    console.error("Error deleting Exclude:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

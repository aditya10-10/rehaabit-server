// controllers/HowDoesItWorksController.js
const HowDoesItWorks = require("../models/HowDoesItWorks");
const Service = require("../models/Service");

// CREATE a new HowDoesItWorks
exports.createHowDoesItWorks = async (req, res) => {
  try {
    const { point, serviceId } = req.body;

    if (!point || !serviceId) {
      return res.status(400).json({
        success: false,
        message: "Missing required properties",
      });
    }

    const newHowDoesItWorks = await HowDoesItWorks.create({ point });

    const updatedService = await Service.findByIdAndUpdate(
      serviceId,
      {
        $push: { howDoesItWorks: newHowDoesItWorks._id },
      },
      { new: true }
    )
      .populate("howDoesItWorks")
      .exec();

    res.status(200).json({
      success: true,
      message: "HowDoesItWorks created successfully",
      service: updatedService,
    });
  } catch (error) {
    console.error("Error creating HowDoesItWorks:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// UPDATE an HowDoesItWorks
exports.updateHowDoesItWorks = async (req, res) => {
  try {
    const { point, serviceId, id } = req.body;

    const HowDoesItWorksDetail = await HowDoesItWorks.findByIdAndUpdate(
      id,
      { point },
      { new: true }
    );

    if (!HowDoesItWorksDetail) {
      return res.status(404).json({
        success: false,
        message: "HowDoesItWorks not found",
      });
    }

    const service = await Service.findById(serviceId)
      .populate("howDoesItWorks")
      .exec();

    res.status(200).json({
      success: true,
      message: "HowDoesItWorks updated successfully",
      data: service,
    });
  } catch (error) {
    console.error("Error updating HowDoesItWorks:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// DELETE an HowDoesItWorks
exports.deleteHowDoesItWorks = async (req, res) => {
  try {
    const { id, serviceId } = req.body;

    await Service.findByIdAndUpdate(serviceId, {
      $pull: { howDoesItWorks: id },
    });

    const HowDoesItWorksDetail = await HowDoesItWorks.findById(id);

    if (!HowDoesItWorksDetail) {
      return res.status(404).json({
        success: false,
        message: "HowDoesItWorks not found",
      });
    }

    await HowDoesItWorks.findByIdAndDelete(id);

    const service = await Service.findById(serviceId)
      .populate("howDoesItWorks")
      .exec();

    res.status(200).json({
      success: true,
      message: "HowDoesItWorks deleted successfully",
      data: service,
    });
  } catch (error) {
    console.error("Error deleting HowDoesItWorks:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

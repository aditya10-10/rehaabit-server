const HowDoesItWorks = require("../models/HowDoesItWorks");
const Service = require("../models/Service");
const { uploadImageToCloudinary } = require("../utils/imageUploader"); // Assuming you have a utility to upload images

// CREATE a new HowDoesItWorks
exports.createHowDoesItWorks = async (req, res) => {
  try {
    const { point, description, serviceId } = req.body;
    const iconFile = req.files?.icon;

    if (!point || !description || !iconFile || !serviceId) {
      return res.status(400).json({
        success: false,
        message: "Missing required properties",
      });
    }

    // Upload icon image to Cloudinary (or any other service you are using)
    const icon = await uploadImageToCloudinary(
      iconFile,
      "how_does_it_work_icons"
    );

    const newHowDoesItWorks = await HowDoesItWorks.create({
      point,
      description,
      icon: icon.secure_url,
    });

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

// UPDATE HowDoesItWorks Icon
// UPDATE HowDoesItWorks Icon
exports.updateHowDoesItWorksIcon = async (req, res) => {
  try {
    const { id, serviceId } = req.body; // Assuming the ID of the HowDoesItWorks entry and service ID are provided in the request body
    const icon = req.files.icon; // Icon file from the request

    // Validate input
    if (!id || !serviceId || !icon) {
      return res.status(400).json({
        success: false,
        message: "ID, service ID, and icon are required",
      });
    }

    // Upload the icon image to Cloudinary
    const image = await uploadImageToCloudinary(
      icon,
      process.env.FOLDER_NAME,
      1000,
      1000
    );

    console.log(image);

    // Update the HowDoesItWorks icon
    const howDoesItWorks = await HowDoesItWorks.findByIdAndUpdate(
      id,
      { icon: image.secure_url },
      { new: true }
    );

    if (!howDoesItWorks) {
      return res
        .status(404)
        .json({ success: false, message: "HowDoesItWorks entry not found" });
    }

    // Populate the service with the updated HowDoesItWorks details
    const service = await Service.findById(serviceId)
      .populate("howDoesItWorks")
      .exec();

    console.log("HowDoesItWorks Icon Updated:", howDoesItWorks);
    return res.status(200).json({
      success: true,
      message: "HowDoesItWorks icon updated successfully",
      data: service,
    });
  } catch (error) {
    console.error("Error updating HowDoesItWorks icon:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// UPDATE a HowDoesItWorks
// UPDATE a HowDoesItWorks
exports.updateHowDoesItWorks = async (req, res) => {
  try {
    const { point, description, serviceId, id } = req.body;

    // Prepare the data to be updated
    let updateData = { point, description };

    // Update the HowDoesItWorks entry
    const HowDoesItWorksDetail = await HowDoesItWorks.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!HowDoesItWorksDetail) {
      return res.status(404).json({
        success: false,
        message: "HowDoesItWorks not found",
      });
    }

    // Populate the service with the updated HowDoesItWorks details
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

// DELETE a HowDoesItWorks
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

// GET all HowDoesItWorks entries for a specific service
exports.getHowDoesItWorks = async (req, res) => {
  try {
    const { serviceId } = req.body;

    if (!serviceId) {
      return res.status(400).json({
        success: false,
        message: "Service ID is required",
      });
    }

    // Find the service and populate its HowDoesItWorks entries
    const service = await Service.findById(serviceId).populate(
      "howDoesItWorks"
    );

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "HowDoesItWorks entries retrieved successfully",
      data: service.howDoesItWorks,
    });
  } catch (error) {
    console.error("Error fetching HowDoesItWorks entries:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

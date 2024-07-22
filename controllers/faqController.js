// controllers/faqController.js
const FAQ = require("../models/FAQ");
const Service = require("../models/Service"); // Assuming there is a Service model related to FAQs

// CREATE a new FAQ
exports.createFAQ = async (req, res) => {
  try {
    const { question, answer, serviceId } = req.body;

    if (!question || !answer || !serviceId) {
      return res.status(400).json({
        success: false,
        message: "Missing required properties",
      });
    }

    const newFAQ = await FAQ.create({ question, answer });

    const updatedService = await Service.findByIdAndUpdate(
      serviceId,
      {
        $push: {
          faqs: newFAQ._id,
        },
      },
      { new: true }
    )
      .populate("faqs")
      .exec();

    res.status(200).json({
      success: true,
      message: "FAQ created successfully",
      service: updatedService,
    });
  } catch (error) {
    console.error("Error creating FAQ:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// GET all FAQs
exports.getAllFAQs = async (req, res) => {
  try {
    const faqs = await FAQ.find();
    res.status(200).json({
      success: true,
      faqs,
    });
  } catch (error) {
    console.error("Error getting FAQs:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// UPDATE an FAQ
exports.updateFAQ = async (req, res) => {
  try {
    const { question, answer, serviceId, id } = req.body;

    const faq = await FAQ.findByIdAndUpdate(
      id,
      { question, answer },
      { new: true }
    );

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found",
      });
    }

    const service = await Service.findById(serviceId).populate("faqs").exec();

    res.status(200).json({
      success: true,
      message: "FAQ updated successfully",
      data: service,
    });
  } catch (error) {
    console.error("Error updating FAQ:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// DELETE an FAQ
exports.deleteFAQ = async (req, res) => {
  try {
    const { id, serviceId } = req.body;

    await Service.findByIdAndUpdate(serviceId, {
      $pull: {
        faqs: id,
      },
    });

    const faq = await FAQ.findById(id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found",
      });
    }

    await FAQ.findByIdAndDelete(id);

    const service = await Service.findById(serviceId).populate("faqs").exec();

    res.status(200).json({
      success: true,
      message: "FAQ deleted successfully",
      data: service,
    });
  } catch (error) {
    console.error("Error deleting FAQ:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

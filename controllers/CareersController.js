const Careers = require("../models/Careers");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const fs = require("fs").promises; // For file handling

// Add candidate information with resume upload to Cloudinary
exports.addCandidateInformation = async (req, res) => {
  try {
    const { name, email, phoneNumber } = req.body;
    const file = req.files?.resume; // Access the uploaded file using `req.files`

    if (!name || !email || !phoneNumber) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (!file) {
      return res.status(400).json({ message: "Resume file is required." });
    }

    // console.log("File received:", file); // Log the received file to verify

    // Upload resume to Cloudinary
    const result = await uploadImageToCloudinary(file, process.env.FOLDER_NAME);
    // console.log("File uploaded to Cloudinary:", result);

    // Create a new candidate entry in the database
    const newCareer = new Careers({
      name,
      email,
      phoneNumber,
      resume: result.secure_url, // Save Cloudinary URL for the resume
    });

    await newCareer.save();

    // Delete the temp file after upload to Cloudinary
    await fs.unlink(file.tempFilePath);

    // console.log("Successfully uploaded resume:", result.secure_url);

    res.status(201).json({
      message: "Candidate information submitted successfully.",
      data: newCareer,
    });
  } catch (error) {
    console.error("Error submitting candidate information:", error); // Add detailed error logging
    res.status(500).json({
      message: "Error submitting candidate information.",
      error: error.message,
    });
  }
};

// Get all candidate submissions (only for admins)
exports.getAllCareers = async (req, res) => {
  try {
    const careers = await Careers.find();
    res.status(200).json(careers);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching career submissions.",
      error: error.message,
    });
  }
};

// Get candidate submission by ID
exports.getCareerById = async (req, res) => {
  try {
    const career = await Careers.findById(req.params.id);
    if (!career) {
      return res.status(404).json({ message: "Career submission not found." });
    }
    res.status(200).json(career);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching career submission.",
      error: error.message,
    });
  }
};

// Delete candidate submission and resume from Cloudinary
exports.deleteCareer = async (req, res) => {
  try {
    const career = await Careers.findByIdAndDelete(req.params.id);
    if (!career) {
      return res.status(404).json({ message: "Career submission not found." });
    }

    // Extract public_id from the Cloudinary URL to delete the file
    const publicId = career.resume.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(`careers/resumes/${publicId}`, {
      resource_type: "auto",
    });

    res
      .status(200)
      .json({ message: "Career submission and resume deleted successfully." });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting career submission.",
      error: error.message,
    });
  }
};

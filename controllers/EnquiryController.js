const Enquiry = require("../models/Enquiry");
const { contactUsEmail } = require("../templates/Contact");
const mailSender = require("../utils/mailSender");
const { generateEnquiryId } = require("../utils/generateId");

const PNF = require("google-libphonenumber").PhoneNumberFormat;
const phoneUtil =
  require("google-libphonenumber").PhoneNumberUtil.getInstance();

// Utility function to parse and validate phone number
const validatePhoneNumber = (contactNumber) => {
  const phoneNumber = phoneUtil.parseAndKeepRawInput(contactNumber, "IN");
  if (!phoneUtil.isValidNumber(phoneNumber)) {
    throw new Error("Invalid phone number.");
  }
  return phoneUtil.format(phoneNumber, PNF.E164);
};

// Create a new enquiry
exports.createEnquiry = async (req, res) => {
  try {
    let { firstName, lastName, email, contactNumber, serviceId, query } =
      req.body;

    if (typeof contactNumber === "number") {
      contactNumber = contactNumber.toString();
    }

    // Parse and validate phone number
    const formattedPhoneNumber = validatePhoneNumber(contactNumber);

    const id = await generateEnquiryId();

    const newEnquiry = new Enquiry({
      enquiryId: id,
      firstName,
      lastName,
      email,
      contactNumber: formattedPhoneNumber,
      serviceId,
      query,
    });

    // Save the enquiry to the database
    const savedEnquiry = await newEnquiry.save();

    // Send a confirmation email
    const emailRes = await mailSender(
      email,
      "Your Enquiry was submitted successfully",
      contactUsEmail(email, firstName, lastName, contactNumber, query)
    );

    console.log("Email Response:", emailRes);

    res.status(201).json({
      message: "Enquiry submitted successfully",
      data: savedEnquiry,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to submit enquiry", error });
  }
};

// Get all enquiries
exports.getAllEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find().populate("serviceId");
    res.status(200).json({ data: enquiries });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch enquiries", error });
  }
};

// Get an enquiry by ID
exports.getEnquiryById = async (req, res) => {
  try {
    const enquiry = await Enquiry.findOne({
      enquiryId: req.params.id,
    }).populate("serviceId");
    if (!enquiry) {
      return res.status(404).json({ message: "Enquiry not found" });
    }
    res.status(200).json({ data: enquiry });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch enquiry", error });
  }
};

// Update an enquiry (status, priority, response, or response log)
exports.updateEnquiry = async (req, res) => {
  try {
    const { id } = req.params; // enquiryId
    const { status, priority, response, adminId } = req.body;

    // Find the enquiry by enquiryId
    const enquiry = await Enquiry.findOne({ enquiryId: id });
    if (!enquiry) {
      return res.status(404).json({ message: "Enquiry not found" });
    }

    // Update fields if provided in the request body
    if (status) enquiry.status = status;
    if (priority) enquiry.priority = priority;

    // If there's a new response, log it in the response log
    if (response && adminId) {
      enquiry.response = response; // Update current response
      enquiry.responseLog.push({
        adminId,
        response,
        respondedAt: Date.now(),
      });
    }

    // Save the updated enquiry
    const updatedEnquiry = await enquiry.save();

    res.status(200).json({
      message: "Enquiry updated successfully",
      data: updatedEnquiry,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update enquiry", error });
  }
};

// Delete an enquiry by ID
exports.deleteEnquiry = async (req, res) => {
  try {
    const { id } = req.params; // enquiryId

    // Find the enquiry by ID and delete
    const enquiry = await Enquiry.findOneAndDelete({ enquiryId: id });
    if (!enquiry) {
      return res.status(404).json({ message: "Enquiry not found" });
    }

    res.status(200).json({
      message: "Enquiry deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete enquiry", error });
  }
};

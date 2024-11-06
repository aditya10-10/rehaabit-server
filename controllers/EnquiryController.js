const Enquiry = require("../models/Enquiry");
const {
  newEnquirySubmissionEmail,
} = require("../templates/newEnquirySubmissionEmail");
const { enquiryClosedEmail } = require("../templates/enquiryClosedEmail");
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
    let { firstName, lastName, email, contactNumber, serviceName, query } =
      req.body;

    // Ensure contactNumber is a string
    if (typeof contactNumber === "number") {
      contactNumber = contactNumber.toString();
    }

    // Validate and format the phone number
    const formattedPhoneNumber = validatePhoneNumber(contactNumber);

    // Generate a unique enquiry ID
    const enquiryId = await generateEnquiryId();

    // Create a new Enquiry instance
    const newEnquiry = new Enquiry({
      enquiryId,
      firstName,
      lastName,
      email,
      contactNumber: formattedPhoneNumber,
      serviceName,
      query,
    });

    // Send a confirmation email
    const emailRes = await mailSender(
      email,
      "Your Enquiry was submitted successfully",
      newEnquirySubmissionEmail(firstName, enquiryId, serviceName)
    );

    // Save the enquiry to the database
    const savedEnquiry = await newEnquiry.save();

    // Log the email response
    console.log("Email Response:", emailRes);

    // Respond with success
    res.status(201).json({
      message: "Enquiry submitted successfully",
      data: savedEnquiry,
    });
  } catch (error) {
    // Handle errors gracefully
    res.status(500).json({ message: "Failed to submit enquiry", error });
  }
};

// Get all enquiries
// Get all enquiries, sorted by newest first
exports.getAllEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find()
      .populate([
        {
          path: "assignedAdmin",
          model: "User",
          populate: {
            path: "additionalDetails",
            select: "firstName lastName",
            model: "Profile",
          },
        },
      ])
      .sort({ createdAt: -1 }); // Sort by createdAt in descending order (newest first)
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
    });
    if (!enquiry) {
      return res.status(404).json({ message: "Enquiry not found" });
    }
    res.status(200).json({ data: enquiry });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch enquiry", error });
  }
};

// Update an enquiry (status, priority, response, or response log)
exports.updateEnquiryAndStatusAssignment = async (req, res) => {
  const { enquiryId, newStatus, newPriority, assignedAdmin } = req.body;

  try {
    // Find the enquiry by custom enquiryId
    const enquiry = await Enquiry.findOne({ enquiryId });
    if (!enquiry) {
      return res.status(404).json({ message: "Enquiry not found" });
    }

    // Update fields if provided in the request body
    if (newStatus) {
      enquiry.status = newStatus;
      if (newStatus === "closed") {
        await mailSender(
          enquiry.email,
          "Your Issue has been Resolved ✔️",
          enquiryClosedEmail(enquiryId, enquiry.serviceName)
        );
        enquiry.closedAt = Date.now();
      }
    }
    if (newPriority) enquiry.priority = newPriority;
    if (assignedAdmin) enquiry.assignedAdmin = assignedAdmin;

    // Save the updated enquiry
    await enquiry.save();

    // Use the updated populate syntax
    await enquiry.populate({
      path: "assignedAdmin",
      model: "User",
      populate: {
        path: "additionalDetails",
        select: "firstName lastName",
        model: "Profile",
      },
    });

    res.status(200).json({
      message: "Enquiry updated successfully",
      data: enquiry,
    });
  } catch (error) {
    console.error("Error updating enquiry:", error);
    res.status(500).json({ message: "Failed to update enquiry", error });
  }
};

// Admin route for responding to enquiries
exports.adminResponse = async (req, res) => {
  const { id, adminId, response } = req.body;
  // console.log({ id, adminId, response });
  if (!id || !adminId || !response) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields",
    });
  }

  try {
    const enquiry = await Enquiry.findById(id);
    if (!enquiry) {
      return res.status(404).json({ message: "Enquiry not found" });
    }

    enquiry.response = response;
    enquiry.responseLog.push({
      adminId,
      response,
      respondedAt: Date.now(),
    });

    await enquiry.save();
    const populatedEnquiry = await enquiry.populate([
      {
        path: "assignedAdmin",
        model: "User",
        populate: {
          path: "additionalDetails",
          select: "firstName lastName",
          model: "Profile",
        },
      },
    ]);

    res.status(200).json({
      message: "Admin response added successfully",
      data: populatedEnquiry,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to respond to enquiry", error });
  }
};

// Delete an enquiry by ID
exports.deleteEnquiry = async (req, res) => {
  try {
    const { id } = req.body; // enquiryId

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

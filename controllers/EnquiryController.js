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
    let { firstName, lastName, email, contactNumber, serviceName, query } =
      req.body;
    console.log({ firstName, lastName, email, contactNumber, serviceName, query });
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
      serviceName,
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
  const { enquiryId, id, newStatus, newPriority, assignedAdmin } = req.body;

  // console.log({enquiryId,id, newStatus, newPriority, assignedAdmin});
  try {
    // Find the enquiry by enquiryId
    const enquiry = await Enquiry.findById(id);
    if (!enquiry) {
      return res.status(404).json({ message: "Enquiry not found" });
    }

    // Update fields if provided in the request body
    if (newStatus) {
      enquiry.status = newStatus;
      if (newStatus === "closed") {
        enquiry.closedAt = Date.now();
      }
    }
    if (newPriority) enquiry.priority = newPriority;
    if (assignedAdmin) enquiry.assignedAdmin = assignedAdmin;

    // Save the updated enquiry
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
      }
    ]);

    console.log("populatedEnquiry", populatedEnquiry);
    res.status(200).json({
      message: "Enquiry updated successfully",
      data: populatedEnquiry,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update enquiry", error });
  }
};

// Admin route for responding to enquiries
exports.adminResponse = async (req, res) => {
  const { id, adminId, response } = req.body;
  console.log({ id, adminId, response });
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
      }
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

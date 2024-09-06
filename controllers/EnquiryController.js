const Enquiry = require("../models/Enquiry");
const { contactUsEmail } = require("../templates/Contact");
const mailSender = require("../utils/mailSender");

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
    const { firstName, lastName, email, contactNumber, serviceId, query } =
      req.body;

    if (typeof contactNumber === "number") {
      contactNumber = contactNumber.toString();
    }

    // Parse and validate phone number
    const formattedPhoneNumber = validatePhoneNumber(contactNumber);

    const newEnquiry = new Enquiry({
      firstName,
      lastName,
      email,
      contactNumber: formattedPhoneNumber,
      serviceId,
      query,
    });

    console.log(newEnquiry);

    const savedEnquiry = await newEnquiry.save();

    const emailRes = await mailSender(
      email,
      "Your Data was sent successfully",
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
    const enquiry = await Enquiry.findById(req.body.id).populate("serviceId");
    if (!enquiry) {
      return res.status(404).json({ message: "Enquiry not found" });
    }
    res.status(200).json({ data: enquiry });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch enquiry", error });
  }
};

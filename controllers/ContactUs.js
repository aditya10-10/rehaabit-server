const Contact = require("../models/Contact");
const {
  newContactSubmissionEmail,
} = require("../templates/newContactSubmissionEmail");
const mailSender = require("../utils/mailSender");
const { generateContactId } = require("../utils/generateId");

const PNF = require("google-libphonenumber").PhoneNumberFormat;
const phoneUtil =
  require("google-libphonenumber").PhoneNumberUtil.getInstance();

// Utility function to parse and validate phone number
const validatePhoneNumber = (contactNumber) => {
  try {
    const phoneNumber = phoneUtil.parseAndKeepRawInput(contactNumber, "IN");
    if (!phoneUtil.isValidNumber(phoneNumber)) {
      throw new Error("Invalid phone number.");
    }
    return phoneUtil.format(phoneNumber, PNF.E164);
  } catch (error) {
    throw new Error("Invalid phone number format");
  }
};

exports.contactUsController = async (req, res) => {
  try {
    let { firstName, lastName, email, phoneNumber, subject, message } =
      req.body;

    // Validate required fields
    if (!firstName || !email || !phoneNumber || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    // Convert phone number to string if it's a number
    if (typeof phoneNumber === "number") {
      phoneNumber = phoneNumber.toString();
    }

    const formattedPhoneNumber = validatePhoneNumber(phoneNumber);

    // Generate a unique caseId for the contact
    const caseId = await generateContactId(); // Await the result of generateOrderId

    // Create a new contact instance
    const newContact = new Contact({
      caseId,
      firstName,
      lastName,
      email,
      phoneNumber: formattedPhoneNumber,
      subject,
      message,
    });

    // Send confirmation email
    await mailSender(
      email,
      "We've Received Your Message! Our Team is Ready to Assist You 💬",
      newContactSubmissionEmail(firstName, caseId, subject)
    );

    newContact.save();

    return res.status(201).json({
      success: true,
      message: "Your message has been sent successfully",
      data: newContact,
    });
  } catch (error) {
    console.error("Error creating contact:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to send your message",
    });
  }
};

// Remaining controller functions with similar fixes...
// 2. Retrieve all contacts
exports.getAllContactsController = async (req, res) => {
  try {
    const contacts = await Contact.find()
      .select("-__v")
      .populate({
        path: "assignedAdmin", // Ensure 'assignedAdmin' references 'User'
        model: "User",
        populate: {
          path: "additionalDetails",
          select: "firstName lastName",
          model: "Profile",
        },
      })
      .sort({ createdAt: -1 }); // Sort by createdAt in descending order (newest first)

    // Exclude version key
    return res.status(200).json({
      success: true,
      data: contacts,
    });
  } catch (error) {
    console.error("Error fetching all contacts:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch contacts",
    });
  }
};

// 3. Retrieve a contact by caseId
exports.getContactByIdController = async (req, res) => {
  const { id } = req.body;

  try {
    const contact = await Contact.findOne({ _id: id })
      .select("-__v")
      .populate({
        path: "assignedAdmin", // Ensure 'assignedAdmin' references 'User'
        model: "User",
        populate: {
          path: "additionalDetails",
          select: "firstName lastName",
          model: "Profile",
        },
      });
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }
    return res.status(200).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    console.error("Error fetching contact by caseId:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch contact",
    });
  }
};

// 4. Update contact status, priority, assignment, and notes (admin only)
exports.updateContactStatusAndAssignmentController = async (req, res) => {
  const { id, caseId, newStatus, newPriority, assignedAdmin, adminNotes } =
    req.body;

  console.log(id, caseId, newStatus, newPriority, assignedAdmin, adminNotes);

  try {
    // Find the contact by id
    const contact = await Contact.findById(id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    // Update contact details
    if (newStatus) {
      contact.status = newStatus;
      if (newStatus === "resolved") {
        contact.resolvedAt = Date.now();
      }
    }

    if (newPriority) {
      contact.priority = newPriority;
    }

    if (assignedAdmin) {
      contact.assignedAdmin = assignedAdmin;
    }

    if (adminNotes) {
      contact.adminNotes = adminNotes;
    }

    // Save the updated contact
    await contact.save();

    // Populate the assignedAdmin field and include caseId in the response
    const populatedContact = await Contact.findById(contact._id).populate({
      path: "assignedAdmin",
      model: "User",
      populate: {
        path: "additionalDetails",
        select: "firstName lastName",
        model: "Profile",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Contact updated successfully",
      data: populatedContact,
    });
  } catch (error) {
    console.error("Error updating contact:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update contact",
    });
  }
};

// 5. Admin responds to contact (logs response and updates status)
exports.adminResponseController = async (req, res) => {
  const { id, adminId, response, newStatus, newPriority } = req.body;

  console.log("Received Data:", {
    id,
    adminId,
    response,
    newStatus,
    newPriority,
  }); // Debug log

  if (!id || !adminId || !response) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields",
    });
  }

  try {
    // Find the contact by caseId
    const contact = await Contact.findOne({ _id: id });
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    // Update status if provided
    if (newStatus) {
      contact.status = newStatus;
      if (newStatus === "resolved") {
        contact.resolvedAt = Date.now();
      }
    }

    // Update priority if provided
    if (newPriority) {
      contact.priority = newPriority;
    }

    // Ensure responseLog is initialized
    if (!contact.responseLog) {
      contact.responseLog = [];
    }

    // Log the admin response in the response log
    contact.responseLog.push({
      adminId,
      response,
      respondedAt: Date.now(),
    });

    // Update the latest response
    contact.adminResponse = response;

    // Save the updated contact
    await contact.save();
    const populatedContact = await Contact.findById(contact._id).populate({
      path: "assignedAdmin",
      model: "User",
      populate: {
        path: "additionalDetails",
        select: "firstName lastName",
        model: "Profile",
      },
    });
    return res.status(200).json({
      success: true,
      message: "Admin response added successfully",
      data: populatedContact,
    });
  } catch (error) {
    console.error("Error responding to contact:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to respond to contact",
    });
  }
};

// 6. (Optional) Delete a contact by caseId (admin only)
exports.deleteContactController = async (req, res) => {
  const { caseId } = req.body;

  try {
    const contact = await Contact.findOneAndDelete({ caseId });
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Contact deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting contact:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete contact",
    });
  }
};

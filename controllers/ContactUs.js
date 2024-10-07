const Contact = require("../models/Contact");
const { contactUsEmail } = require("../templates/Contact");
const mailSender = require("../utils/mailSender");
const { generateContactId } = require("../utils/generateId");

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

// 1. Create a new contact submission
exports.contactUsController = async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber, subject, message } =
      req.body;

    if (typeof phoneNumber === "number") {
      phoneNumber = phoneNumber.toString();
    }

    // Parse and validate phone number
    const formattedPhoneNumber = validatePhoneNumber(phoneNumber);

    // Generate a unique caseId
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
      status: "pending", // Default status
      priority: "medium", // Default priority
    });

    // Save the new contact
    await newContact.save();

    // Send confirmation email to the user
    const emailResponse = await mailSender(
      email,
      "Your message has been received",
      contactUsEmail(email, firstName, lastName, message, phoneNumber, subject)
    );

    // Return success response
    return res.status(200).json({
      success: true,
      message: "Your message has been sent successfully",
      data: newContact,
    });
  } catch (error) {
    console.error("Error creating contact:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send your message",
    });
  }
};

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
  const { caseId, newStatus, newPriority, assignedAdmin, adminNotes } =
    req.body;

  console.log(caseId, newStatus, newPriority, assignedAdmin, adminNotes);

  try {
    // Find the contact by caseId
    const contact = await Contact.findOne({ caseId });
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

    // Return the updated contact including caseId
    return res.status(200).json({
      success: true,
      message: "Contact updated successfully",
      data: contact,
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

  console.log(id, adminId, response, newStatus, newPriority);

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

    return res.status(200).json({
      success: true,
      message: "Admin response added successfully",
      data: contact,
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

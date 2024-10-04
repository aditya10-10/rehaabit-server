const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  caseId: {
    type: String,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    trim: true,
  },
  contactId:{
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  phoneNumber: {
    type: String,
    trim: true,
  },
  subject: {
    type: String,
    required: true,
    enum: ["General Inquiry", "Support", "Feedback", "Other"],
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  // Additional fields for admin handling
  status: {
    type: String,
    enum: ["pending", "in progress", "resolved", "closed"], // Added 'in progress' status for admin handling
    default: "pending",
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high", "urgent"], // Added priority field for better task management
    default: "medium",
  },
  assignedAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Referencing the User model
  },
  adminResponse: {
    type: String,
    trim: true,
  },
  responseLog: {
    type: [
      new mongoose.Schema({
        adminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
        response: String,
        respondedAt: Date,
      }),
    ],
    default: [],
  },
  adminNotes: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  resolvedAt: {
    type: Date, // Track when the issue is resolved
    default: null, // Initially null, will be updated when the status is set to 'resolved'
  },
});

const Contact = mongoose.model("Contact", contactSchema);

module.exports = Contact;

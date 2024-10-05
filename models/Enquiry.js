const mongoose = require("mongoose");

const enquirySchema = new mongoose.Schema({
  enquiryId: {
    type: String,
    unique: true,
    required: true,
  },
  firstName: {
    type: String,
    required: true, // Customer's first name is required
  },
  lastName: {
    type: String,
    required: true, // Customer's last name is required
  },
  email: {
    type: String,
    required: true, // Email is required for communication
  },
  contactNumber: {
    type: String,
    required: true, // Phone number for follow-up
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service", // Reference to the service being enquired about
    required: true,
  },
  // serviceName: {
  //   type: String,
  //   required: true, // Name of the service for admin clarity
  // },
  query: {
    type: String,
    required: true, // Customer's enquiry details are required
  },
  attachments: {
    type: [String], // Optionally allow URLs or file paths to uploaded files
  },
  status: {
    type: String,
    enum: ["new", "in-progress", "closed"], // Enquiry status
    default: "new",
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high", "urgent"], // Priority level
    default: "medium",
  },
  assignedAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the admin handling this enquiry
  },
  response: {
    type: String, // Admin's response to the enquiry
  },
  responseLog: [
    {
      adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Referencing User for adminId
      response: { type: String, trim: true },
      respondedAt: { type: Date, default: Date.now },
    },
  ],
  address: {
    type: mongoose.Schema.Types.ObjectId, // Assuming address is also an ObjectId
    ref: "Address",
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically set when the enquiry is created
  },
  updatedAt: {
    type: Date,
    default: Date.now, // Automatically updated on save
  },
});

// Middleware to update `updatedAt` on save
enquirySchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Enquiry", enquirySchema);

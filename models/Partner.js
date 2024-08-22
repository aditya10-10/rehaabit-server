const mongoose = require("mongoose");

const PartnerSchema = new mongoose.Schema({
  // Personal information
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
    required: true,
  },
  nationality: {
    type: String,
    required: true,
  },
  identificationType: {
    type: String,
    enum: ["Passport", "Driving License", "National ID", "Other"],
    required: true,
  },
  identificationNumber: {
    type: String,
    required: true,
  },
  photo: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  address: {
    street: String,
    city: String,
    state: String,
    parseIntCode: String,
    country: String,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  // additional fields for partners
  companySize: {
    type: String,
    enum: ["Micro", "Small", "Medium", "Large", "Enterprise"],
    required: true,
  },
  numberOfEmployees: {
    type: Number,
    required: true,
  },
  industry: {
    type: String,
    required: true,
  },
  yearsOfExperience: {
    type: Number,
    required: true,
  },
  specialization: [String],

  // Account Information

  accountStatus: {
    type: String,
    enum: ["Active", "Pending", "Inactive"],
    default: "Pending",
  },
  verificationStatus: {
    type: String,
    enum: ["Verified", "Not Verified"],
    default: "Not Verified",
  },

  // Bank Account Information
  bankName: String,
  accountNumber: String,
  routingNumber: String,

  // Additional Information
  additionalInformation: String,

  // Business Information
  businessName: {
    type: String,
  },
  businessStructure: {
    type: String,
    enum: ["Individual", "Corporation", "Partnership", "Other"],
    required: true,
  },
  businessAddress: {
    street: String,
    city: String,
    state: String,
    pinCode: String,
    country: String,
  },

  // Contact Information
  primaryContact: {
    name: String,
    phoneNumber: String,
    email: String,
  },
  alternativeContact: {
    name: String,
    phoneNumber: String,
    email: String,
  },

  // Service Details
  servicesOffered: {
    type: [String],
    required: true,
  },
  serviceAreas: [String],

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
});

const Partner = mongoose.model("Partner", PartnerSchema);

module.exports = Partner;

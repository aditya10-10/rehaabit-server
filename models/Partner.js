const mongoose = require("mongoose");

const PartnerSchema = new mongoose.Schema({
  // Personal information********
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
    enum: [
      "Passport",
      "Driving License",
      "National ID",
      "Birth Certificate",
      "Aadhaar Card",
      "VoterID",
      "Other",
    ],
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

  // Business Information**********
  businessName: {
    type: String,
  },
  businessStructure: {
    type: String,
    enum: ["Individual", "Contractor", "Corporation", "Partnership", "Other"],
    required: true,
  },
  businessAddress: {
    street: String,
    city: String,
    state: String,
    pinCode: String,
    country: String,
  },

  alternativeContact: {
    name: String,
    phoneNumber: String,
    // email: String,
  },

  // Additional Information********

  numberOfEmployees: {
    type: Number,
    required: true,
  },

  yearsOfExperience: {
    type: Number,
    required: true,
  },

  // Service Details
  servicesOffered: {
    type: [String],
    required: true,
  },
  serviceAreas: [String],

  // Bank Account Information
  bankName: String,
  accountNumber: String,
  routingNumber: String,

  // Account Information --- Admin
  verificationStatus: {
    type: String,
    enum: ["Verified", "Not Verified"],
    default: "Not Verified",
  },

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

//

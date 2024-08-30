const mongoose = require('mongoose');

const careersSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address.'],
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true,
    match: [/^\+?\d{10,15}$/, 'Please enter a valid phone number.'],
  },
  resume: {
    type: String, // Assuming you'll store the file path or URL as a string
    required: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

const Careers = mongoose.model('Careers', careersSchema);

module.exports = Careers;

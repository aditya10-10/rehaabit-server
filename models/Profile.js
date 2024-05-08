const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  firstName: {
    type: String,
    trim: true,
  },
  lastName: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    trim: true,
  },
  contactNumber: {
    type: Number,
    trim: true,
  },
});

module.exports = mongoose.model("Profile", profileSchema);

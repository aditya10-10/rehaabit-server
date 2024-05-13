const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  contactNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  accountType: {
    type: String,
    enum: ["User", "Partner", "Admin"],
    required: true,
  },
  token: {
    type: String,
  },
  additionalDetails: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Profile",
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
  },
  image: {
    type: String,
    required: true,
  },
  cart: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cart",
  },
  address: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
    },
  ],
});

module.exports = mongoose.model("User", userSchema);

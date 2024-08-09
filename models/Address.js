const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID is required"],
  },
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
  },
  phoneNo: {
    type: String,
    required: [true, "Phone number is required"],
    trim: true,
    validate: {
      validator: function (v) {
        return /^\d{10}$/.test(v);
      },
      message: (props) => `${props.value} is not a valid phone number!`,
    },
  },
  pincode: {
    type: String,
    required: [true, "Pincode is required"],
    trim: true,
    validate: {
      validator: function (v) {
        return /^\d{6}$/.test(v);
      },
      message: (props) => `${props.value} is not a valid pincode!`,
    },
  },
  locality: {
    type: String,
    trim: true,
  },
  address: {
    type: String,
    required: [true, "Address is required"],
    trim: true,
  },
  city: {
    type: String,
    required: [true, "City is required"],
    trim: true,
  },
  state: {
    type: String,
    required: [true, "State is required"],
    trim: true,
  },
  landmark: {
    type: String,
    trim: true,
  },
  alternativePhone: {
    type: String,
    trim: true,
    validate: {
      validator: function (v) {
        return v ? /^\d{10}$/.test(v) : true;
      },
      message: (props) => `${props.value} is not a valid phone number!`,
    },
  },
  addressType: {
    type: String,
    enum: ["Home", "Office"],
    required: [true, "Address type is required"],
    default: "Home",
  },
  status: {
    type: String,
    enum: ["Default", ""],
  },
});

// Adding indexes for optimized query performance
// addressSchema.index({ user: 1 });
// addressSchema.index({ city: 1 });

const Address = mongoose.model("Address", addressSchema);

module.exports = Address;

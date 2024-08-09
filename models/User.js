const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    contactNumber: {
      type: String,
      required: [true, "Contact number is required"],
      unique: true,
      trim: true,
      validate: {
        validator: function (v) {
          return /^\+\d{1,3}\d{9,15}$/.test(v); // E.164 format validation
        },
        message: (props) => `${props.value} is not a valid contact number!`,
      },
    },
    accountType: {
      type: String,
      enum: ["User", "Partner", "Admin"],
      required: [true, "Account type is required"],
    },
    token: {
      type: String,
    },
    additionalDetails: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Additional details are required"],
      ref: "Profile",
    },
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
    image: {
      type: String,
      trim: true,
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
  },
  { timestamps: true }
);

// Adding indexes for optimized query performance
userSchema.index({ contactNumber: 1 });
userSchema.index({ accountType: 1 });

module.exports = mongoose.model("User", userSchema);

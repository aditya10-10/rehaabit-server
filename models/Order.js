const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  services: [
    {
      serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service", // Reference to Service model
        required: true,
      },
      qty: {
        type: Number,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      serviceName: String,
      serviceDescription: String,
    },
  ],
  address: {
    type: mongoose.Schema.Types.ObjectId, // Assuming address is also an ObjectId
    ref: "Address",
    required: true,
  },
  paymentId: {
    type: String,
    required: true,
  },
  totalCost: {
    type: Number,
    required: true,
  },
  status: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "OrderStatus",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Order", orderSchema);

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = Schema({
  service: [
    {
      serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
      qty: {
        type: Number,
        default: 0,
      },
      price: {
        type: Number,
        default: 0,
      },
      serviceName: {
        type: String,
      },
    },
  ],
  address: {
    type: String,
    required: true,
  },
  paymentId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    default: "pending",
  },
  Delivered: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Order", orderSchema);

// models/OrderStatus.js
const mongoose = require("mongoose");

const orderStatusSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
    enum: ["placed", "shipped", "out for delivery", "delivered", "cancelled"],
    default: "placed",
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

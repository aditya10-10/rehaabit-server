const mongoose = require("mongoose");

const statusUpdateSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
    enum: [
      "pending", // Initial status when the customer makes a request (order is awaiting confirmation)
      "confirmed", // When the service provider confirms the order
      "professional assigned", // When a professional has been assigned to the service
      "on the way", // When the professional is en route to the service location
      "service started", // When the professional begins the service
      "service completed", // When the service is completed
      "payment pending", // When the service is completed but payment is yet to be processed
      "paid", // When the payment is successfully processed
      "cancelled by customer", // If the customer cancels the service
      "cancelled by provider", // If the service provider cancels the service
      "rescheduled", // If the customer or provider reschedules the service
      "refund initiated", // When a refund is initiated due to cancellation or other reasons
      "refund completed", // When the refund is successfully processed
    ],
    default: "pending",
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});
const orderStatusSchema = new mongoose.Schema({
  statuses: {
    type: [statusUpdateSchema],
    default: [{ status: "pending" }], // Initialize with a "pending" status
  },
});

module.exports = mongoose.model("OrderStatus", orderStatusSchema);

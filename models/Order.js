const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  cart: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cart",
  },
  services: [
    {
      serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
      },
      qty: {
        type: Number,
        default: 0,
      },
      price: {
        type: Number,
      },
      serviceName: {
        type: String,
      },
    },
  ],
  address: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Address",
    required: true,
  },
  paymentId: {
    type: String,
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




// const mongoose = require("mongoose");
// const Schema = mongoose.Schema;

// const orderSchema = Schema({
//   user: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true,
//   },
//   service: [
//     {
//       serviceId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Service",
//       },
//       qty: {
//         type: Number,
//         default: 0,
//       },
//       price: {
//         type: Number,
//       },
//       serviceName: {
//         type: String,
//       },
//     },
//   ],
//   address: {
//     type: String,
//     required: true,
//   },
//   paymentId: {
//     type: String,
//     required: true,
//   },
//   status: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "OrderStatus",
//     required: true,
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// module.exports = mongoose.model("Order", orderSchema);
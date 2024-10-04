const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // This will tell whose model is using this counter
  seq: { type: Number, default: 0 } // This will store the current count
});

module.exports = mongoose.model('Counter', counterSchema);

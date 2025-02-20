// models/Vehicle.js
const mongoose = require("mongoose");

const VehicleSchema = new mongoose.Schema({
  vehicleRegNumber: { type: String, required: true, unique: true }, // Unique Vehicle Registration Number
  make: { type: String, required: false }, // Optional make of the vehicle
  model: { type: String, required: false }, // Optional model of the vehicle
  year: { type: Number, required: false }, // Optional year of manufacture
  ownerName: { type: String, required: false }, // Optional owner's name
  createdAt: { type: Date, default: Date.now }, // Auto-generated creation date
});

module.exports = mongoose.model("Vehicle", VehicleSchema);

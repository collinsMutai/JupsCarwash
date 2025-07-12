const mongoose = require("mongoose");

const weeklyServiceSchema = new mongoose.Schema({
  registration: String,
  description: String,
  clientName: String, // <-- Add clientName here
  numberOfWashes: Number,
  totalServiceFee: Number,
});

const weeklySummarySchema = new mongoose.Schema({
  weekStart: Date,
  weekEnd: Date,
  services: [weeklyServiceSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = weeklySummarySchema;

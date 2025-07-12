const mongoose = require("mongoose");

const weeklyServiceSchema = new mongoose.Schema({
  registration: String,
  description: String,
  clientName: String,
  numberOfWashes: Number,
  totalServiceFee: Number,
});

const weeklySummarySchema = new mongoose.Schema({
  weekStart: Date,
  weekEnd: Date,
  services: [weeklyServiceSchema],
  invoiced: {
    type: Boolean,
    default: false, // defaults to not invoiced
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("WeeklySummary", weeklySummarySchema);


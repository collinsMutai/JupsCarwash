const mongoose = require("mongoose");

const InvoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true },
  clientName: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("Invoice", InvoiceSchema);

const mongoose = require("mongoose");
const Counter = require("./Counter"); // Import Counter Model

const InvoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, unique: true }, // Unique Invoice Number
  clientName: { type: String, required: true },
  items: [
    {
      vehicleRegNumber: { type: String, required: true }, // Vehicle Registration
      description: { type: String, required: true }, // Service/Repair Description
      amount: { type: Number, required: true }, // Charge for this vehicle
    },
  ],
  totalAmount: { type: Number, required: true }, // Total for all vehicles
  date: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

// ✅ Auto-generate invoiceNumber in format "INV-0001"
InvoiceSchema.pre("save", async function (next) {
  if (!this.invoiceNumber) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { name: "invoiceNumber" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );

      this.invoiceNumber = `INV-${String(counter.seq).padStart(4, "0")}`;
    } catch (error) {
      return next(error);
    }
  }

  next();
});

module.exports = mongoose.model("Invoice", InvoiceSchema);

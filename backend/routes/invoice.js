const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Invoice = require("../models/Invoice");
const Counter = require("../models/Counter"); // ✅ Import Counter model
const generateInvoicePDF = require("../utils/generateInvoicePdf");

// ✅ GET Next Invoice Number (DO NOT INCREMENT)
router.get("/next-invoice-number", auth, async (req, res) => {
  try {
    let counter = await Counter.findOne({ name: "invoiceNumber" });

    const nextInvoiceNumber = `INV-${String((counter?.seq || 0) + 1).padStart(
      4,
      "0"
    )}`;
    res.json({ nextInvoiceNumber });
  } catch (error) {
    res.status(500).send({ error: "Failed to fetch the next invoice number" });
  }
});

// ✅ CREATE Invoice (Admin Only)
router.post("/", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).send({ error: "Access denied" });
  }

  try {
    let counter = await Counter.findOneAndUpdate(
      { name: "invoiceNumber" },
      { $inc: { seq: 1 } }, // ✅ Increment invoice number
      { new: true, upsert: true }
    );

    const invoiceNumber = `INV-${String(counter.seq).padStart(4, "0")}`;

    // ✅ Calculate total amount from items
    const totalAmount = req.body.items.reduce(
      (sum, item) => sum + item.amount,
      0
    );

    const invoice = new Invoice({
      invoiceNumber,
      clientName: req.body.clientName,
      items: req.body.items, // ✅ Multiple vehicles
      totalAmount, // ✅ Auto-calculated total
      createdBy: req.user._id,
    });

    await invoice.save();
    res.status(201).send(invoice);
  } catch (e) {
    res.status(400).send({ error: "Invoice creation failed" });
  }
});

// ✅ GET All Invoices (Both Admin & Users See All)
router.get("/", auth, async (req, res) => {
  try {
    const invoices = await Invoice.find();
    res.send(invoices);
  } catch (e) {
    res.status(500).send({ error: "Fetching invoices failed" });
  }
});

// ✅ GENERATE PDF for an Invoice (Allow All Users)
router.get("/:id/pdf", auth, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).send({ error: "Invoice not found" });

    generateInvoicePDF(invoice, res); // ✅ All users can download/print
  } catch (e) {
    res.status(500).send({ error: "Failed to generate PDF" });
  }
});

module.exports = router;

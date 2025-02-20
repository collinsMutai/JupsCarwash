const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Invoice = require("../models/Invoice");
const Counter = require("../models/Counter"); // ✅ Import Counter model
const generateInvoicePDF = require("../utils/generateInvoicePdf");

// ✅ GET Next Invoice Number (DO NOT INCREMENT)
router.get("/next-invoice-number", auth, async (req, res) => {
  try {
    // Find the most recent invoice number
    const lastInvoice = await Invoice.findOne()
      .sort({ invoiceNumber: -1 })
      .limit(1);

    let lastInvoiceNumber = "INV-0000"; // Default if no invoices exist

    if (lastInvoice) {
      // Extract the numeric part of the last invoice number
      lastInvoiceNumber = lastInvoice.invoiceNumber;
    }

    const lastInvoiceSeq = parseInt(lastInvoiceNumber.split("-")[1], 10) || 0; // Get the number part of the last invoice number
    const nextInvoiceNumber = `INV-${String(lastInvoiceSeq + 1).padStart(
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
    // Get the next invoice number based on the most recent invoice
    const lastInvoice = await Invoice.findOne()
      .sort({ invoiceNumber: -1 })
      .limit(1);
    let lastInvoiceNumber = "INV-0000"; // Default if no invoices exist

    if (lastInvoice) {
      lastInvoiceNumber = lastInvoice.invoiceNumber;
    }

    const lastInvoiceSeq = parseInt(lastInvoiceNumber.split("-")[1], 10) || 0; // Get the numeric part of the last invoice number
    const invoiceNumber = `INV-${String(lastInvoiceSeq + 1).padStart(4, "0")}`;

    // Calculate total amount from items, including quantity
    const totalAmount = req.body.items.reduce((sum, item) => {
      return sum + item.amount * item.quantity;
    }, 0);

    // Use provided date, or fallback to now
    const invoiceDate = req.body.date ? new Date(req.body.date) : new Date();

    // Ensure the provided date is valid
    if (isNaN(invoiceDate.getTime())) {
      return res.status(400).send({ error: "Invalid date format" });
    }

    const invoice = new Invoice({
      invoiceNumber,
      clientName: req.body.clientName,
      items: req.body.items, // Multiple vehicles with quantity
      totalAmount, // Auto-calculated total based on quantity
      date: invoiceDate, // Use frontend date
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

    generateInvoicePDF(invoice, res); // All users can download/print
  } catch (e) {
    res.status(500).send({ error: "Failed to generate PDF" });
  }
});

module.exports = router;

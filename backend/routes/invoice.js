const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Invoice = require("../models/Invoice");
const generateInvoicePDF = require("../utils/generateInvoicePdf");
const { createInvoice } = require("../services/invoiceService");

// GET Next Invoice Number (DO NOT INCREMENT)
router.get("/next-invoice-number", auth, async (req, res) => {
  try {
    const lastInvoice = await Invoice.findOne()
      .sort({ invoiceNumber: -1 })
      .limit(1);

    let lastInvoiceNumber = "INV-0000";
    if (lastInvoice) {
      lastInvoiceNumber = lastInvoice.invoiceNumber;
    }

    const lastInvoiceSeq = parseInt(lastInvoiceNumber.split("-")[1], 10) || 0;
    const nextInvoiceNumber = `INV-${String(lastInvoiceSeq + 1).padStart(
      4,
      "0"
    )}`;

    res.json({ nextInvoiceNumber });
  } catch (error) {
    res.status(500).send({ error: "Failed to fetch the next invoice number" });
  }
});

// CREATE Invoice (Admin Only)
router.post("/", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).send({ error: "Access denied" });
  }

  try {
    const invoice = await createInvoice({
      clientName: req.body.clientName,
      items: req.body.items,
      date: req.body.date,
      createdBy: req.user._id,
    });
    res.status(201).send(invoice);
  } catch (e) {
    res.status(400).send({ error: e.message || "Invoice creation failed" });
  }
});

// GET All Invoices (Admin sees all, users see their own)
router.get("/", auth, async (req, res) => {
  try {
    if (req.user.role === "admin") {
      const invoices = await Invoice.find();
      return res.send(invoices);
    } else {
      const invoices = await Invoice.find({ clientName: req.user.name });
      return res.send(invoices);
    }
  } catch (e) {
    res.status(500).send({ error: "Fetching invoices failed" });
  }
});

// GENERATE PDF for an Invoice (Allow All Users)
router.get("/:id/pdf", auth, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).send({ error: "Invoice not found" });

    generateInvoicePDF(invoice, res);
  } catch (e) {
    res.status(500).send({ error: "Failed to generate PDF" });
  }
});

// DELETE Invoice (Admin Only)
router.delete("/:id", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).send({ error: "Access denied" });
  }

  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);

    if (!invoice) {
      return res.status(404).send({ error: "Invoice not found" });
    }

    res.send({ message: "Invoice deleted successfully" });
  } catch (e) {
    res.status(500).send({ error: "Failed to delete the invoice" });
  }
});

module.exports = router;

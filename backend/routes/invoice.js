const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Invoice = require("../models/Invoice");
const PDFDocument = require("pdfkit");

// Create Invoice (Admin Only)
router.post("/", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).send({ error: "Access denied" });
  }

  try {
    const invoice = new Invoice({ ...req.body, createdBy: req.user._id });
    await invoice.save();
    res.status(201).send(invoice);
  } catch (e) {
    res.status(400).send({ error: "Invoice creation failed" });
  }
});

// Get All Invoices (Only Owned Invoices for Regular Users)
router.get("/", auth, async (req, res) => {
  try {
    const filter = req.user.role === "admin" ? {} : { createdBy: req.user._id };
    const invoices = await Invoice.find(filter);
    res.send(invoices);
  } catch (e) {
    res.status(500).send({ error: "Fetching invoices failed" });
  }
});

// Generate PDF for an Invoice (Only Owner or Admin)
router.get("/:id/pdf", auth, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).send({ error: "Invoice not found" });

    if (
      req.user.role !== "admin" &&
      invoice.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).send({ error: "Unauthorized access" });
    }

    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice_${invoice.invoiceNumber}.pdf`
    );

    doc.pipe(res);
    doc.fontSize(25).text("Invoice", { align: "center" }).moveDown();
    doc.fontSize(14).text(`Invoice Number: ${invoice.invoiceNumber}`);
    doc.text(`Client: ${invoice.clientName}`);
    doc.text(`Amount: $${invoice.amount.toFixed(2)}`);
    doc.text(`Date: ${invoice.date.toDateString()}`).moveDown();

    doc.end();
  } catch (e) {
    res.status(500).send({ error: "Failed to generate PDF" });
  }
});

module.exports = router;

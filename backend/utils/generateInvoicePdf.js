const PDFDocument = require("pdfkit");

function generateInvoicePDF(invoice, res) {
  try {
    const doc = new PDFDocument({ size: "A4", margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice_${invoice.invoiceNumber}.pdf`
    );

    doc.pipe(res);

    // ✅ HEADER
    doc
      .fontSize(22)
      .font("Helvetica-Bold")
      .fillColor("#333")
      .text("Jups Carwash", 50, 50);

    doc
      .fontSize(12)
      .font("Helvetica-Oblique")
      .fillColor("#777")
      .text("We know dirt!", 50, doc.y)
      .moveDown(2);

    doc
      .fontSize(20)
      .font("Helvetica-Bold")
      .fillColor("black")
      .text("INVOICE", 50, 50, { align: "right" })
      .moveDown(2);

    // ✅ CUSTOMER DETAILS
    doc
      .fontSize(12)
      .fillColor("black")
      .text(`Invoice Number: ${invoice.invoiceNumber}`)
      .moveDown(0.5)
      .text(`Client: ${invoice.clientName}`)
      .moveDown(0.5)
      .text(`Date: ${new Date(invoice.date).toLocaleDateString()}`)
      .moveDown(2);

    // ✅ TABLE HEADER
    const tableTop = doc.y;
    doc
      .fillColor("#333")
      .rect(50, tableTop, 500, 20)
      .fill()
      .fillColor("white")
      .fontSize(12)
      .text("Vehicle Reg #", 55, tableTop + 5)
      .text("Description", 200, tableTop + 5)
      .text("Quantity", 380, tableTop + 5) // Add the Quantity column header
      .text("Amount (KES)", 460, tableTop + 5)
      .fillColor("black")
      .moveDown();

    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

    // ✅ TABLE ROWS (Invoice Items)
    invoice.items.forEach((item) => {
      const rowTop = doc.y + 5;
      doc
        .fontSize(12)
        .text(item.vehicleRegNumber, 55, rowTop)
        .text(item.description, 200, rowTop)
        .text(item.quantity.toString(), 380, rowTop) // Display quantity
        .text(`KES ${item.amount.toFixed(2)}`, 460, rowTop)
        .moveDown();

      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    });

    // ✅ TOTAL AMOUNT
    doc
      .moveDown(2)
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("Total:", 400, doc.y, { continued: true })
      .text(`KES ${invoice.totalAmount.toFixed(2)}`);

    // ✅ FOOTER
    doc
      .moveDown(3)
      .fontSize(12)
      .text("Contact Us:", 50, doc.y + 10)
      .fontSize(10)
      .text("Jups Carwash", 50, doc.y + 10)
      .text("Opp Stabex Petrol Station, Litein.", 50, doc.y + 10)
      .text("Email: chebethyjupiter@gmail.com", 50, doc.y + 10)
      .text("Phone: 0729138753 | 0726097666", 50, doc.y + 10)
      .moveDown(2);

    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("Thank You for Your Business!", { align: "center" });

    // ✅ Finalize PDF
    doc.end();
  } catch (error) {
    console.error("❌ Error generating PDF:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = generateInvoicePDF;

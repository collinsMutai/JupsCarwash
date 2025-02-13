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

    // ✅ BRAND HEADER
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

    // ✅ INVOICE TITLE
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
      .text("Invoice #", 55, tableTop + 5)
      .text("Client", 160, tableTop + 5)
      .text("Amount (KES)", 330, tableTop + 5, { align: "left" })
      .text("Date", 460, tableTop + 5, { align: "left" })
      .fillColor("black")
      .moveDown();

    // ✅ DRAW SEPARATOR LINE
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

    // ✅ TABLE ROW
    const rowTop = doc.y + 5;
    doc
      .fontSize(12)
      .text(invoice.invoiceNumber, 55, rowTop)
      .text(invoice.clientName, 160, rowTop)
      .text(invoice.totalAmount.toFixed(2), 330, rowTop, { align: "left" })
      .text(new Date(invoice.date).toLocaleDateString(), 460, rowTop, {
        align: "left",
      })
      .moveDown();

    // ✅ DRAW SEPARATOR LINE
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

    // ✅ TOTAL
    const labelX = 410;
    const valueX = 420;
    doc
      .moveDown(2)
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("Total:", labelX, doc.y, { continued: true })
      .text(` KES ${invoice.totalAmount.toFixed(2)}`, valueX);

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

    // ✅ "THANK YOU" MESSAGE
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("Thank You for Your Business!", { align: "center" });

    // ✅ Finalize PDF and end response
    doc.end();

    // ✅ Handle Response Stream Closing Gracefully
    res.on("finish", () => {
      console.log(
        `✅ PDF successfully sent for invoice: ${invoice.invoiceNumber}`
      );
    });
  } catch (error) {
    console.error("❌ Error generating PDF:", error);

    if (!res.headersSent) {
      res.status(500).send({ error: "Failed to generate PDF" });
    }
  }
}

module.exports = generateInvoicePDF;

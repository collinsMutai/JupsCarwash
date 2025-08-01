const PDFDocument = require("pdfkit");

function generateInvoicePDF(invoice, res) {
  console.log(
    "Invoice data received for PDF:",
    JSON.stringify(invoice, null, 2)
  );

  try {
    const doc = new PDFDocument({ size: "A4", margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice_${invoice.invoiceNumber}.pdf`
    );

    doc.pipe(res);

    // Header
    doc
      .fontSize(22)
      .font("Helvetica-Bold")
      .fillColor("#333")
      .text("H&C Carwash", 50, 50);

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

    // Customer Info
    doc
      .fontSize(12)
      .fillColor("black")
      .text(`Invoice Number: ${invoice.invoiceNumber}`)
      .moveDown(0.5)
      .text(`Client: ${invoice.clientName}`)
      .moveDown(0.5)
      .text(`Date: ${new Date(invoice.date).toLocaleDateString()}`)
      .moveDown(2);

    // Table Header
    const tableTop = doc.y;
    doc
      .fillColor("#333")
      .rect(50, tableTop, 500, 20)
      .fill()
      .fillColor("white")
      .fontSize(12)
      .text("Vehicle Reg #", 55, tableTop + 5)
      .text("Description", 200, tableTop + 5)
      .text("Quantity", 380, tableTop + 5)
      .text("Amount (KES)", 460, tableTop + 5)
      .fillColor("black")
      .moveDown();

    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

    // Table Rows
    invoice.items.forEach((item) => {
      const startX = 55;
      const startY = doc.y + 5;

      const vehicleRegWidth = 130;
      const descriptionWidth = 160;
      const quantityX = 380;
      const amountX = 460;

      // Sort and format wash dates
      const sortedDates = Array.isArray(item.vehicleDates)
        ? item.vehicleDates
            .map((d) => new Date(d))
            .sort((a, b) => b - a)
            .map((d) => d.toLocaleDateString())
            .join(", ")
        : "";

      const vehicleInfo = `${item.vehicleRegNumber}\n${sortedDates}`;

      doc.fontSize(12).text(vehicleInfo, startX, startY, {
        width: vehicleRegWidth,
      });

      const vehicleInfoHeight = doc.heightOfString(vehicleInfo, {
        width: vehicleRegWidth,
      });

      doc.text(item.description, startX + vehicleRegWidth + 10, startY, {
        width: descriptionWidth,
      });

      const descriptionHeight = doc.heightOfString(item.description, {
        width: descriptionWidth,
      });

      const rowHeight = Math.max(vehicleInfoHeight, descriptionHeight);

      // ✅ Quantity based on number of wash dates
      const washesCount = Array.isArray(item.vehicleDates)
        ? item.vehicleDates.length
        : 1;

      doc.text(washesCount.toString(), quantityX, startY, {
        width: 40,
        align: "right",
      });

      const itemTotal = item.amount * washesCount;

      doc.text(`KES ${itemTotal.toFixed(2)}`, amountX, startY, {
        width: 80,
        align: "right",
      });

      doc.y = startY + rowHeight + 5;

      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    });

    // Total
    doc
      .moveDown(2)
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("Total:", 400, doc.y, { continued: true })
      .text(`KES ${invoice.totalAmount.toFixed(2)}`);

    // Footer
    doc
      .moveDown(3)
      .fontSize(12)
      .text("Contact Us:", 50, doc.y + 10)
      .fontSize(10)
      .text("H&C Carwash", 50, doc.y + 10)
      .text("Opp Stabex Petrol Station, Litein.", 50, doc.y + 10)
      .text("Email: h&C@gmail.com", 50, doc.y + 10)
      .text("Phone: 0726097666", 50, doc.y + 10)
      .moveDown(2);

    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("Thank You for Your Business!", { align: "center" });

    doc.end();
  } catch (error) {
    console.error("❌ Error generating PDF:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = generateInvoicePDF;

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

    // === Header ===
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

    // === Customer Info ===
    doc
      .fontSize(12)
      .fillColor("black")
      .text(`Invoice Number: ${invoice.invoiceNumber}`)
      .moveDown(0.5)
      .text(`Client: ${invoice.clientName}`)
      .moveDown(0.5)
      .text(`Date: ${new Date(invoice.date).toLocaleDateString()}`)
      .moveDown(2);

    // === Table Header ===
    const tableTop = doc.y;
    doc
      .fillColor("#333")
      .rect(50, tableTop, 500, 20)
      .fill()
      .fillColor("white")
      .fontSize(12)
      .text("Vehicle Reg #", 55, tableTop + 5)
      .text("Description", 140, tableTop + 5)
      .text("Dates Washed", 270, tableTop + 5)
      .text("Qty", 390, tableTop + 5, { width: 30, align: "right" })
      .text("Amount (KES)", 430, tableTop + 5, { width: 100, align: "right" })
      .fillColor("black");

    // Bottom border of header
    doc
      .moveTo(50, tableTop + 20)
      .lineTo(550, tableTop + 20)
      .stroke();

    doc.y = tableTop + 30; // add spacing after header

    // === Table Rows ===
invoice.items.forEach((item) => {
  const startX = 55;
  const startY = doc.y;

  const vehicleRegWidth = 80;
  const descriptionWidth = 110;
  const datesWidth = 100;
  const quantityX = 390;
  const amountX = 430;

  // Format dates
  const sortedDates =
    Array.isArray(item.vehicleDates) && item.vehicleDates.length > 0
      ? item.vehicleDates
          .map((d) => new Date(d))
          .sort((a, b) => b - a)
          .map((d) => d.toLocaleDateString())
          .join(", ")
      : "";

  // Quantity fallback
  const washesCount =
    Array.isArray(item.vehicleDates) && item.vehicleDates.length > 0
      ? item.vehicleDates.length
      : item.quantity ?? 1;

  const itemTotal = item.amount * washesCount;

  // Measure heights
  const heightVehicleReg = doc.heightOfString(item.vehicleRegNumber, {
    width: vehicleRegWidth,
  });
  const heightDescription = doc.heightOfString(item.description, {
    width: descriptionWidth,
  });
  const heightDates = doc.heightOfString(sortedDates, {
    width: datesWidth,
  });

  const contentHeight = Math.max(
    heightVehicleReg,
    heightDescription,
    heightDates
  );

  // Increase padding here (total padding, split top and bottom)
  const rowPadding = 6;

  // Total row height = content height + padding (top + bottom)
  const rowHeight = contentHeight + rowPadding;

  // Adjust text start position to include top padding (half of total padding)
  const textY = startY + rowPadding / 2;

  // Draw row content with padding
  doc.fontSize(12).text(item.vehicleRegNumber, startX, textY, {
    width: vehicleRegWidth,
  });

  doc.text(item.description, startX + vehicleRegWidth + 5, textY, {
    width: descriptionWidth,
  });

  doc.text(
    sortedDates,
    startX + vehicleRegWidth + descriptionWidth + 10,
    textY,
    {
      width: datesWidth,
    }
  );

  doc.text(washesCount.toString(), quantityX, textY, {
    width: 30,
    align: "right",
  });

  doc.text(`KES ${itemTotal.toFixed(2)}`, amountX, textY, {
    width: 100,
    align: "right",
  });

  // Move cursor to bottom of row to start next row
  doc.y = startY + rowHeight;

  // Draw separator line
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
});




    // === Total Amount ===
    doc
      .moveDown(2)
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("Total:", 400, doc.y, { continued: true })
      .text(`KES ${invoice.totalAmount.toFixed(2)}`);

    // === Footer ===
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

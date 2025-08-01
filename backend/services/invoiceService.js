const Invoice = require("../models/Invoice");

/**
 * Create an invoice with the given data.
 * Returns the saved invoice.
 */
async function createInvoice({ clientName, items, date, createdBy }) {
  if (!items || items.length === 0) {
    throw new Error("Invoice must have at least one item");
  }

  // Calculate total amount considering number of wash dates per item
  const totalAmount = items.reduce((sum, item) => {
    const washesCount =
      Array.isArray(item.vehicleDates) && item.vehicleDates.length > 0
        ? item.vehicleDates.length
        : 1; // default 1 if no dates
    return sum + item.amount * item.quantity * washesCount;
  }, 0);

  const invoiceDate = date ? new Date(date) : new Date();
  if (isNaN(invoiceDate.getTime())) {
    throw new Error("Invalid date format");
  }

  // Generate next invoice number
  const lastInvoice = await Invoice.findOne()
    .sort({ invoiceNumber: -1 })
    .limit(1);
  let lastInvoiceNumber = "INV-0000";
  if (lastInvoice) {
    lastInvoiceNumber = lastInvoice.invoiceNumber;
  }

  const lastInvoiceSeq = parseInt(lastInvoiceNumber.split("-")[1], 10) || 0;
  const invoiceNumber = `INV-${String(lastInvoiceSeq + 1).padStart(4, "0")}`;

  const invoice = new Invoice({
    invoiceNumber,
    clientName,
    items,
    totalAmount,
    date: invoiceDate,
    createdBy,
  });

  await invoice.save();
  return invoice;
}


module.exports = { createInvoice };

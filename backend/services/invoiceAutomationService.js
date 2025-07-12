const WeeklySummary = require("../models/WeeklySummary.model");
const { createInvoice } = require("./invoiceService");

async function runAutomatedInvoiceJob() {
  // Find weekly summaries not yet invoiced
  const summaries = await WeeklySummary.find({ invoiced: { $ne: true } });

  for (const summary of summaries) {
    for (const service of summary.services) {
      const items = [
        {
          description: service.description,
          amount: service.totalServiceFee / service.numberOfWashes,
          quantity: service.numberOfWashes,
        },
      ];

      try {
        await createInvoice({
          clientName: service.clientName,
          items,
          date: summary.weekEnd,
          createdBy: null, // or admin user id if you have one
        });
      } catch (error) {
        console.error(
          `Failed to create invoice for client ${service.clientName}`,
          error
        );
      }
    }

    // Mark this summary as invoiced so it doesn't get processed again
    summary.invoiced = true;
    await summary.save();
  }
}

module.exports = { runAutomatedInvoiceJob };

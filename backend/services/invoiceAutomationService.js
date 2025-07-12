const WeeklySummary = require("../models/WeeklySummary.model");
const { createInvoice } = require("./invoiceService");

async function runAutomatedInvoiceJob() {
  // Find weekly summaries not yet invoiced
  const summaries = await WeeklySummary.find({ invoiced: { $ne: true } });

  for (const summary of summaries) {
    // Group services by clientName
    const servicesByClient = summary.services.reduce((acc, service) => {
      if (!acc[service.clientName]) {
        acc[service.clientName] = [];
      }
      acc[service.clientName].push(service);
      return acc;
    }, {});

    // Create one invoice per client
    for (const clientName of Object.keys(servicesByClient)) {
      const services = servicesByClient[clientName];

      // Create invoice items array combining all services for this client
      const items = services.map((service) => ({
        description: service.description,
        amount: service.totalServiceFee / service.numberOfWashes,
        quantity: service.numberOfWashes,
        vehicleRegNumber: service.registration, // add if your Invoice model requires this
      }));

      try {
        await createInvoice({
          clientName,
          items,
          date: summary.weekEnd,
          createdBy: null, // or admin user id if available
        });
        console.log(`✅ Invoice created for client ${clientName}`);
      } catch (error) {
        console.error(
          `❌ Failed to create invoice for client ${clientName}`,
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

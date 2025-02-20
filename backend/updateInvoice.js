const mongoose = require("mongoose");
const Invoice = require("./models/Invoice"); // Import your Invoice model
require("dotenv").config();

// MongoDB Atlas connection string



// Connect to MongoDB Atlas
mongoose
  .connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("Connected to MongoDB Atlas");

    try {
      // Find the invoice by invoiceNumber
      const invoice = await Invoice.findOne({ invoiceNumber: "INV-0001" });

      if (invoice) {
        // Update each item to include a 'quantity' field (default to 1)
        invoice.items.forEach((item) => {
          if (!item.hasOwnProperty("quantity")) {
            item.quantity = 1; // Add quantity field with default value of 1
          }
        });

        // Recalculate the totalAmount considering the quantity
        invoice.totalAmount = invoice.items.reduce(
          (sum, item) => sum + item.amount * item.quantity,
          0
        );

        // Save the updated invoice
        await invoice.save();
        console.log("Invoice updated successfully with quantity.");
      } else {
        console.log("Invoice not found.");
      }
    } catch (error) {
      console.error("Error updating invoice:", error);
    } finally {
      // Close the database connection after operation
      mongoose.disconnect();
    }
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB Atlas:", err);
  });

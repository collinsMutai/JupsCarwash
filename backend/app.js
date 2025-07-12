const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const connectDB = require("./config/db");
const cron = require("node-cron");
const {
  runAutomatedInvoiceJob,
} = require("./services/invoiceAutomationService"); // ✅ New automation logic

const app = express();

// ✅ Connect to Database
connectDB();

// ✅ Security Headers with Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// ✅ Enable JSON & URL-Encoded Parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ CORS Configuration
app.use(
  cors({
    origin: "https://jupscarwash.onrender.com",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ✅ Global Headers Middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://jupscarwash.onrender.com");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Content-Type", "application/json");
  res.header("X-Content-Type-Options", "nosniff");
  res.header("X-Frame-Options", "DENY");
  res.header("X-XSS-Protection", "1; mode=block");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

// ✅ Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/invoices", require("./routes/invoice"));
app.use("/api/vehicles", require("./routes/vehicle"));

// === CRON JOB SETUP ===
// 🕙 Runs every Monday at 10:10 PM Africa/Nairobi time
cron.schedule(
  "10 22 * * 1", // Monday 10:10 PM
  async () => {
    console.log(
      "⏰ Running automated invoice job at 10:10 PM (after summaries)"
    );
    try {
      await runAutomatedInvoiceJob();
      console.log("✅ Automated invoices generated successfully");
    } catch (err) {
      console.error("❌ Error in automated invoice job:", err);
    }
  },
  {
    timezone: "Africa/Nairobi", // Match summary cron timezone
  }
);

// === RUN ONCE FOR TESTING ON APP START ===
// Uncomment only for development or testing

(async () => {
  try {
    console.log("🚀 Running invoice automation on app start (for testing)...");
    await runAutomatedInvoiceJob();
    console.log("✅ Test automation complete");
  } catch (e) {
    console.error("❌ Error running invoice automation on app start:", e);
  }
})();


module.exports = app;

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const connectDB = require("./config/db");
const cron = require("node-cron");
require("dotenv").config();
const {
  runAutomatedInvoiceJob,
} = require("./services/invoiceAutomationService");

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

// ✅ Get allowed origins from .env
const allowedOrigins = process.env.FRONTEND_URLS.split(",");

// ✅ CORS Configuration (dynamic)
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Allow requests without origin (like Postman)
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ✅ Global Headers Middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }

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
// cron.schedule(
//   "10 22 * * 1",
//   async () => {
//     console.log("⏰ Running automated invoice job at 10:10 PM (after summaries)");
//     try {
//       await runAutomatedInvoiceJob();
//       console.log("✅ Automated invoices generated successfully");
//     } catch (err) {
//       console.error("❌ Error in automated invoice job:", err);
//     }
//   },
//   {
//     timezone: "Africa/Nairobi",
//   }
// );

// === RUN ONCE FOR TESTING ON APP START ===
// (async () => {
//   try {
//     console.log("🚀 Running invoice automation on app start (for testing)...");
//     await runAutomatedInvoiceJob();
//     console.log("✅ Test automation complete");
//   } catch (e) {
//     console.error("❌ Error running invoice automation on app start:", e);
//   }
// })();

module.exports = app;

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const connectDB = require("./config/db");

const app = express();

// ✅ Connect to Database
connectDB();

// ✅ Security Headers with Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: false, // ✅ Allow cross-origin resource sharing
  })
);

// ✅ Enable JSON & URL-Encoded Parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ CORS Configuration (Handles Frontend Requests)
app.use(
  cors({
    origin: "http://localhost:4200", // ✅ Allow only frontend
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // ✅ Allow sending cookies & auth headers
  })
);

// ✅ Global Headers Middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://jupscarwash.onrender.com"); // ✅ Allow frontend
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Content-Type", "application/json"); // ✅ Force JSON response format
  res.header("X-Content-Type-Options", "nosniff");
  res.header("X-Frame-Options", "DENY");
  res.header("X-XSS-Protection", "1; mode=block");

  // ✅ Handle Preflight Requests for CORS
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

// ✅ Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/invoices", require("./routes/invoice"));

module.exports = app;

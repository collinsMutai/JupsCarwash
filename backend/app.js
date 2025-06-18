// app.js
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
    origin: "https://jupscarwash.onrender.com",
    // origin: 'http://localhost:4200',
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ✅ Global Headers Middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://jupscarwash.onrender.com");
  // res.header("Access-Control-Allow-Origin", "http://localhost:4200");
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
app.use("/api/vehicles", require("./routes/vehicle")); // ✅ Add Vehicle Routes

module.exports = app;

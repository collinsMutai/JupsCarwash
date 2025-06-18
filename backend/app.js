const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const connectDB = require("./config/db");
const path = require("path");

const app = express();

// ✅ Connect to MongoDB
connectDB();

// ✅ Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "https://jupscarwash.onrender.com",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://jupscarwash.onrender.com");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

// ✅ API Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/invoices", require("./routes/invoice"));
app.use("/api/vehicles", require("./routes/vehicle"));

// ✅ Serve Angular Frontend (from dist/frontend/browser)
const frontendPath = path.join(__dirname, "dist/frontend/browser");
app.use(express.static(frontendPath));

// ✅ Catch-all route for Angular client-side routing
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

module.exports = app;

const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Check SMTP connection
transporter.verify((err, success) => {
  if (err) {
    console.error("❌ SMTP connection failed:", err.message);
  } else {
    console.log("✅ SMTP transporter is ready.");
  }
});

// REGISTER
router.post("/register", async (req, res) => {
  const { username, email, password, role, name } = req.body;
  try {
    console.log("🔧 Register request:", req.body);
    const user = new User({ username, email, password, role, name });
    await user.save();

    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).send({ user, token });
  } catch (e) {
    console.error("❌ Registration error:", e.message);
    res.status(400).send({ error: "Registration failed" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    console.log("🔐 Login attempt for:", username);
    const user = await User.findOne({ username });
    if (!user) return res.status(404).send({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send({ error: "Invalid credentials" });

    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.send({ user, token });
  } catch (e) {
    console.error("❌ Login error:", e.message);
    res.status(400).send({ error: "Login failed" });
  }
});

// REQUEST PASSWORD RESET
router.post("/request-password-reset", async (req, res) => {
  const { email } = req.body;
  try {
    console.log("🔁 Password reset requested for:", email);

    const user = await User.findOne({ email });
    if (!user) {
      console.warn("⚠️ No user found with email:", email);
      return res.status(404).send({ error: "User not found" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpiration = Date.now() + 3600000;
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    console.log("🔗 Reset link generated:", resetLink);

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <p>You requested a password reset.</p>
        <p>Click <a href="${resetLink}">here</a> to reset your password.</p>
        <p>This link expires in 1 hour.</p>
      `,
    });

    console.log("✅ Reset email sent to:", user.email);
    res.send({ message: "Password reset email sent" });
  } catch (e) {
    console.error("❌ Error in /request-password-reset:", e);
    res
      .status(500)
      .send({ error: "Failed to send reset email", details: e.message });
  }
});

// RESET PASSWORD
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    console.log("🔄 Resetting password with token:", token);
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });

    if (!user) {
      console.warn("⚠️ Invalid or expired reset token");
      return res.status(400).send({ error: "Invalid or expired token" });
    }

    user.password = newPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();

    console.log("✅ Password reset successful for user:", user.email);
    res.send({ message: "Password reset successful" });
  } catch (e) {
    console.error("❌ Password reset error:", e.message);
    res.status(500).send({ error: "Password reset failed" });
  }
});

// CHANGE PASSWORD (JWT)
router.post("/change-password", async (req, res) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  const { currentPassword, newPassword } = req.body;

  if (!token) {
    console.warn("⚠️ Missing auth token");
    return res.status(401).send({ error: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded._id);
    if (!user) return res.status(404).send({ error: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(400).send({ error: "Current password is incorrect" });

    user.password = newPassword;
    await user.save();

    console.log("✅ Password changed for user:", user.username);
    res.send({ message: "Password changed successfully" });
  } catch (error) {
    console.error("❌ Password change error:", error.message);
    res.status(500).send({ error: "Something went wrong" });
  }
});

module.exports = router;

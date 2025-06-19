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

// Verify SMTP (useful for debugging in dev/deploy)
transporter.verify((err) => {
  if (err) {
    console.error("SMTP connection failed:", err.message);
  }
});

// REGISTER
router.post("/register", async (req, res) => {
  const { username, email, password, role, name } = req.body;
  try {
    const user = new User({ username, email, password, role, name });
    await user.save();

    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).send({ user, token });
  } catch {
    res.status(400).send({ error: "Registration failed" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
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
  } catch {
    res.status(400).send({ error: "Login failed" });
  }
});

// REQUEST PASSWORD RESET
router.post("/request-password-reset", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).send({ error: "User not found" });

    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpiration = Date.now() + 3600000;
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

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

    res.send({ message: "Password reset email sent" });
  } catch (e) {
    res
      .status(500)
      .send({ error: "Failed to send reset email", details: e.message });
  }
});

// RESET PASSWORD
router.post("/reset-password", (req, res) => {
  const { token, newPassword } = req.body;

  User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
  })
    .then((user) => {
      if (!user) {
        return res.status(400).send({ error: "Invalid or expired token" });
      }

      user.password = newPassword;
      user.resetToken = undefined;
      user.resetTokenExpiration = undefined;

      return user.save().then(() => {
        res.send({ message: "Password reset successful" });

        // Send confirmation email
        return transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: "Your Password Has Been Reset",
          html: `
            <p>Hello ${user.username},</p>
            <p>Your password has been successfully reset.</p>
            <p>If you didn't do this, please contact support immediately.</p>
          `,
        });
      });
    })
    .catch(() => {
      res.status(500).send({ error: "Password reset failed" });
    });
});

// CHANGE PASSWORD (JWT)
router.post("/change-password", async (req, res) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  const { currentPassword, newPassword } = req.body;

  if (!token) return res.status(401).send({ error: "Authentication required" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded._id);
    if (!user) return res.status(404).send({ error: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(400).send({ error: "Current password is incorrect" });

    user.password = newPassword;
    await user.save();

    res.send({ message: "Password changed successfully" });
  } catch {
    res.status(500).send({ error: "Something went wrong" });
  }
});

module.exports = router;

const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return res.status(401).send({ error: "Token required" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded._id);

    if (!user) throw new Error("User not found");

    req.user = user;
    next();
  } catch (e) {
    res.status(401).send({ error: "Invalid authentication" });
  }
};

module.exports = auth;

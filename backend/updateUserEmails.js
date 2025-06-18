const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User"); // adjust the path if needed

dotenv.config(); // load .env for DB connection string

async function updateEmails() {
  try {
    await mongoose.connect(process.env.DB_URI); // or use a direct MongoDB URI

    // Example: update specific user by username
    const username = "admin"; // change to loop all users if needed
    const email = "collinsfrontend@gmail.com";

    const result = await User.updateOne({ username }, { $set: { email } });

    console.log(`✅ Updated user ${username} with email: ${email}`);
    console.log(result);
  } catch (err) {
    console.error("❌ Failed to update user email:", err);
  } finally {
    await mongoose.disconnect();
  }
}

updateEmails();

const mongoose = require("mongoose");
const User = require("./models/User"); // Make sure this path points to your User model
require("dotenv").config();

// Connect to MongoDB
mongoose
  .connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("Failed to connect to MongoDB", err));

async function updateUsers() {
  try {
    // Find all users that don't have a 'name' field
    const users = await User.find({ name: { $exists: false } });

    // Iterate over users and update them with a default name or custom logic
    for (let user of users) {
      user.name = user.username; // Or set a custom name logic
      await user.save();
      console.log(`Updated user ${user.username} with name ${user.name}`);
    }

    console.log("All users updated successfully");
    mongoose.connection.close(); // Close the connection after script runs
  } catch (err) {
    console.log("Error during update:", err);
    mongoose.connection.close();
  }
}

// Run the update function
updateUsers();

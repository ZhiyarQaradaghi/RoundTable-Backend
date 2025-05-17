require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./src/app");
const { setupSocket } = require("./src/config/socket");

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI is not defined in environment variables");
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    // Setup Socket.io
    setupSocket(server);
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

const mongoose = require("mongoose");
require("dotenv").config();

exports.connect = () => {
  const connectToDB = () => {
    mongoose
      .connect(process.env.MONGODB_URL, {
        autoIndex: false,
      })
      .then(() => {
        console.log("Database connected");
      })
      .catch((err) => {
        console.error("Initial database connection error:", err);
        setTimeout(connectToDB, 5000); // Retry connection after 5 seconds
      });
  };

  // Start the connection process
  connectToDB();

  // Event listeners for the connection
  mongoose.connection.on("connected", () => {
    console.log("MongoDB connected successfully.");
  });

  mongoose.connection.on("error", (err) => {
    console.error("MongoDB connection error:", err);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected. Attempting reconnection...");
    connectToDB(); // Reconnect on disconnection
  });

  mongoose.connection.on("reconnected", () => {
    console.log("MongoDB reconnected successfully.");
  });

  mongoose.connection.on("close", () => {
    console.warn("MongoDB connection closed.");
  });

  // Handle uncaught exceptions to avoid crashes
  process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
  });

  process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection:", reason);
  });
};

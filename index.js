const express = require("express");
const app = express();

const database = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const userRoutes = require("./routes/welcomeMail");

const dotenv = require("dotenv");
dotenv.config();
const PORT = process.env.PORT || 4000;

// database connect
database.connect();

// middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "https://rehaabit-client-csfrho9oh-aditya10-10s-projects.vercel.app",
    credentials: true,
  })
);

// routes
app.use("/api/v1", userRoutes);

// default route
app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "Welcome to Rehaabit!",
  });
});

// server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

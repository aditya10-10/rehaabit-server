const express = require("express");
const app = express();

const userRoutes = require("./routes/User");
const mailRoutes = require("./routes/welcomeMail");
const serviceRoutes = require("./routes/Services");
const contactRoutes = require("./routes/Contact");
const profileRoutes = require("./routes/Profile");

const database = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();
const PORT = process.env.PORT || 4000;

// database connect
database.connect();

//middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// routes
app.use("/api/v1", userRoutes);
app.use("/api/v1", mailRoutes);
app.use("/api/v1", profileRoutes);
app.use("/api/v1", serviceRoutes);
app.use("/api/v1", contactRoutes);

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

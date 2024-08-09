const express = require("express");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// Load environment variables
dotenv.config();

const userRoutes = require("./routes/User");
const mailRoutes = require("./routes/welcomeMail");
const serviceRoutes = require("./routes/Services");
const contactRoutes = require("./routes/Contact");
const profileRoutes = require("./routes/Profile");
const faqRoutes = require("./routes/Faq");
const cartRoutes = require("./routes/Cart");
const addressRoutes = require("./routes/Address");
const orderRoutes = require("./routes/Order");

// Connect to Cloudinary
const database = require("./config/database");
const { cloudinaryConnect } = require("./config/cloudinary");

const app = express();
const PORT = process.env.PORT || 4000;

// Connect to the database
database.connect();

// Apply middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp",
  })
);
//cloudinary connection
cloudinaryConnect();
// Routes
app.use("/api/v1", userRoutes);
app.use("/api/v1", mailRoutes);
app.use("/api/v1", profileRoutes);
app.use("/api/v1", serviceRoutes);
app.use("/api/v1", contactRoutes);
app.use("/api/v1", faqRoutes);
app.use("/api/v1", cartRoutes);
app.use("/api/v1", addressRoutes);
app.use("/api/v1", orderRoutes);

// Default route
app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "Welcome to Rehaabit!",
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

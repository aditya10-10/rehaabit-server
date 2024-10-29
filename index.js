const express = require("express");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const morgan = require("morgan");

// Load environment variables for development
dotenv.config();

const userRoutes = require("./routes/User");
const mailRoutes = require("./routes/Mail");
const serviceRoutes = require("./routes/Services");
const contactRoutes = require("./routes/Contact");
const profileRoutes = require("./routes/Profile");
const faqRoutes = require("./routes/Faq");
const cartRoutes = require("./routes/Cart");
const addressRoutes = require("./routes/Address");
const orderRoutes = require("./routes/Order");
const paymentRoutes = require("./routes/Payment");
const partnerRoutes = require("./routes/Partner");
const careersRoutes = require("./routes/Careers");
const ratingAndreviewsRoutes = require("./routes/RatingAndReviews");
const enquiryRoutes = require("./routes/Enquiry");
const locationRoutes = require("./routes/Location");

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
app.use(morgan("tiny"));
// CORS

const allowedOrigins = [
  "http://localhost:3000",
  "https://rehaabit-server.onrender.com",
];

const corsOptions = {
  origin: ["https://www.rehaabit.com", "http://localhost:3000"],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // allow cookies or other credentials
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

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
app.use("/api/v1", paymentRoutes);
app.use("/api/v1", partnerRoutes);
app.use("/api/v1", ratingAndreviewsRoutes);
app.use("/api/v1", enquiryRoutes);
app.use("/api/v1/carrer", careersRoutes);
app.use("/api/v1", locationRoutes);

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

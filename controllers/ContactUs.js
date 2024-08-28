const Contact = require('../models/Contact');
const { contactUsEmail } = require("../templates/Contact");
const mailSender = require("../utils/mailSender");

exports.contactUsController = async (req, res) => {
  const { firstName, lastName, email, phoneNumber, subject, message } = req.body;

  try {
    // Save contact form data to the database
    const newContact = new Contact({
      firstName,
      lastName,
      email,
      phoneNumber,
      subject,
      message,
    });

    await newContact.save();

    // Send confirmation email
    const emailRes = await mailSender(
      email,
      "Your Data was sent successfully",
      contactUsEmail(email, firstName, lastName, message, phoneNumber, subject)
    );

    console.log("Email Response:", emailRes);
    return res.json({
      success: true,
      message: "Your message has been sent successfully",
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong...",
    });
  }
};

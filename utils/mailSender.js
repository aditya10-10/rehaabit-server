const nodemailer = require("nodemailer");
require("dotenv").config();

const mailSender = async (email, title, body) => {
  try {
    let transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST, // smtp.zoho.com
      port: 465, // Port 587 for TLS or 465 for SSL
      secure: true, // Set to false for TLS (587), true for SSL (465)
      auth: {
        user: process.env.MAIL_USER, // Your Zoho email address
        pass: process.env.MAIL_PASS, // Your Zoho app password
      },
    });

    let info = await transporter.sendMail({
      from: `"Rehaabit" <${process.env.MAIL_USER}>`, // Sender address
      to: `${email}`, // Receiver's email
      subject: `${title}`, // Email subject
      html: `${body}`, // HTML content for email body
    });

    console.log("Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error.message);
    return error;
  }
};

module.exports = mailSender;

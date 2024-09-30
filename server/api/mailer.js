const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const nodemailer = require("nodemailer");

function createTransporter() {
  return nodemailer.createTransport({
    service: "gmail", 
    auth: {
      user: process.env.MAIL_USER, 
      pass: process.env.MAIL_PASS,
    },
  });
}

async function sendEmail(to, subject, text, html) {
  let transporter = createTransporter();
  try {
    let info = await transporter.sendMail({
      from: process.env.MAIL_USER, 
      to, // Destinatário
      subject, 
      text, 
      html, 
    });
    console.log("Email sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

module.exports = { sendEmail };

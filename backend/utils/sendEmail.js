const nodemailer = require("nodemailer");
const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      family: 4,
      connectionTimeout: 30000,
      greetingTimeout: 30000,
      socketTimeout: 30000,
      tls: {
        rejectUnauthorized: false,
      },
    });
    await transporter.verify();
    console.log("SMTP Server Ready");
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log("Email Sent:", info.response);
  } catch (e) {
    console.error("MAIL ERROR:", e);
  }
};
module.exports = sendEmail;
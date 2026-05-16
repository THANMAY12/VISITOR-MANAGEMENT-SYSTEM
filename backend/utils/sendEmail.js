const nodemailer = require("nodemailer");
const dns = require("dns");
const { promisify } = require("util");
const lookup = promisify(dns.lookup);
const sendEmail = async (to, subject, text) => {
  try {
    const { address: ipv4Host } = await lookup("smtp.gmail.com", 4);
    console.log(`Resolved SMTP host to IPv4: ${ipv4Host}`);

    const transporter = nodemailer.createTransport({
      host: ipv4Host,
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        servername: "smtp.gmail.com",
        rejectUnauthorized: false,
      },
      connectionTimeout: 30000,
      greetingTimeout: 30000,
      socketTimeout: 30000,
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
    throw e;
  }
};
module.exports = sendEmail;
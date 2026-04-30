const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_TOKEN
);

const sendSMS = async (to, message) => {
  try {
    // send message
    const res = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE,
      to: to,
    });
  } catch (err) {
    console.error(err);
  }
};
module.exports = sendSMS;
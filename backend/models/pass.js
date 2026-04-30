const mongoose = require("mongoose");
const passSchema = new mongoose.Schema({
    visitorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref:"Visitor"
    },
    appointmentId: {
      type:mongoose.Schema.Types.ObjectId,
      ref:"Appointment"
    },
    qrCode: String,
    pdfUrl: String,
    validFrom: Date,
    validTo: Date
  },
  { timestamps: true }
);





module.exports = mongoose.model("Pass", passSchema);
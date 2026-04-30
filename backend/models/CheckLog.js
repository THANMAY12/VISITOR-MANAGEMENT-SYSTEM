const mongoose = require("mongoose");
const checkLogSchema = new mongoose.Schema({
  passId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Pass",
    required: true
  },
  checkInTime: Date,
  checkOutTime: Date,
  scannedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, {timestamps:true });
module.exports = mongoose.model("CheckLog",checkLogSchema);
const CheckLog = require("../models/CheckLog")
const Pass = require("../models/pass")
const Visitor = require('../models/visitor')
const Appointment = require('../models/Appointment')


exports.scanTheQr = async (req, res) => {
  try {
    const { passId } = req.body

    const pass = await Pass.findById(passId)
    if (!pass) {
      return res.status(404).json({ error: "pass not found" })
    }

    const now = new Date()

    if (now < pass.validFrom) {
      return res.status(400).json({ error: "pass not started yet" })
    }
    if (now > pass.validTo) {
      return res.status(400).json({ error: "pass expired" })
    }

    // check if already scanned before
    const log = await CheckLog.findOne({ passId: passId })

    if (!log) {
      // first time scan = check in
      const newLog = await CheckLog.create({
        passId: passId,
        checkInTime: now,
        checkOutTime: null,
        scannedBy: req.user._id
      })
      return res.json({ message: "checked in", log: newLog })
    }

    if (!log.checkOutTime) {
      // second scan = check out
      log.checkOutTime = now
      await log.save()
      return res.json({ message: "checked out", log: log })
    }

    // already used
    return res.status(400).json({ error: "pass already used" })

  } catch (e) {
    console.log(e)
    res.status(500).json({ error: e.message })
  }
}


exports.getLogs = async (req, res) => {
  try {
    const logs = await CheckLog.find()
      .populate({
        path: "passId",
        populate: { path: "visitorId" }
      })
      .populate("scannedBy")
      .sort({ checkInTime: -1 })

    res.json({ logs: logs })

  } catch (e) {
    console.log(e)
    res.status(500).json({ error: e.message })
  }
}


exports.getStats = async (req, res) => {
  try {
    // get counts for dashboard
    const v = await Visitor.countDocuments()
    const a = await Appointment.countDocuments()
    const p = await Pass.countDocuments()
    const l = await CheckLog.countDocuments()

    res.json({ 
      visitorCount: v, 
      appointmentCount: a, 
      passCount: p, 
      logCount: l 
    })

  } catch (e) {
    console.log(e)
    res.status(500).json({ error: "cant get stats" })
  }
}
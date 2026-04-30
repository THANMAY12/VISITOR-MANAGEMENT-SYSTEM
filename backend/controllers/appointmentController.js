const Appointment = require("../models/Appointment")
const Pass = require("../models/pass")
const QRCode = require("qrcode")
const PDFDocument = require("pdfkit")
const cloudinary = require("../config/cloudinary")
const sendEmail = require("../utils/sendEmail")
const Visitor = require('../models/visitor')

exports.createAppointment = async (req, res) => {
  try {
    const { visitorId, date, purpose } = req.body

    const appt = await Appointment.create({
      visitorId: visitorId,
      hostId: req.user._id,
      date: date,
      purpose: purpose,
      status: "approved"
    })

    res.json(appt)

  } catch (e) {
    console.log(e)
    res.status(500).json({ error: e.message })
  }
}


exports.createMyAppointment = async (req, res) => {
  try {
    const { phone, date, purpose, photo } = req.body

    const Visitor = require('../models/visitor')

    // find the visitor profile linked to this user
    let vProfile = await Visitor.findOne({ email: req.user.email })

    if (!vProfile) {
      vProfile = await Visitor.create({
        name: req.user.name,
        email: req.user.email,
        phone: phone,
        photo: photo || "",
        status: "pending"
      })
    } else {
      vProfile.phone = phone
      if (photo) vProfile.photo = photo
      await vProfile.save()
    }

    const appt = await Appointment.create({
      visitorId: vProfile._id,
      hostId: req.user._id,
      date: date,
      purpose: purpose,
      status: "pending"
    })

    res.json({ message: "request submitted", appointment: appt })

  } catch (e) {
    console.log(e)
    res.status(500).json({ error: e.message })
  }
}


exports.getAppointments = async (req, res) => {
  try {
    let filter = {}

    if (req.user.role === "visitor") {
      
      const vProfile = await Visitor.findOne({ email: req.user.email })
      if (!vProfile) {
        return res.json([])
      }
      filter.visitorId = vProfile._id
    }

    const list = await Appointment.find(filter)
      .populate("visitorId")
      .populate("hostId")
      .populate("passId")
      .sort({ date: -1 })

    res.json(list)

  } catch (e) {
    console.log(e)
    res.status(500).json({ error: e.message })
  }
}


exports.updateStatus = async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id)

    if (!appt) {
      return res.status(404).json({ error: "not found" })
    }

    appt.status = req.body.status
    await appt.save()

    res.json(appt)

  } catch (e) {
    console.log(e)
    res.status(500).json({ error: e.message })
  }
}


// generate pdf buffer in memory
const generatePDF = (visitor, appt, from, to, qrImg) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument()
      let chunks = []
      
      doc.on("data", (c) => chunks.push(c))
      
      doc.on("end", () => {
        resolve(Buffer.concat(chunks))
      })

      doc.fontSize(16).text("Visitor Pass", { align: "center" })
      doc.moveDown()
      doc.text("Visitor Name: " + visitor.name)
      doc.text("Visitor Email: " + visitor.email)
      doc.text("Meeting Purpose: " + appt.purpose)
      doc.text("Valid From: " + from.toLocaleString())
      doc.text("Valid To: " + to.toLocaleString())
      doc.moveDown()
      
      doc.image(qrImg, { width: 150 })
      doc.end()
    } catch (err) {
      reject(err)
    }
  })
}

// upload pdf to cloudinary
const uploadToCloudinary = async (pdfBuf) => {
  const b64 = "data:application/pdf;base64," + pdfBuf.toString("base64")
  
  const result = await cloudinary.uploader.upload(b64, {
    resource_type: "image",
    format: "pdf"
  })
  
  return result.secure_url
}

// send email and sms
const sendNotifications = async (visitor, link) => {
  const msg = "Hello " + visitor.name + ", your pass is ready. Download it here: " + link
  
  try {
    await sendEmail(visitor.email, "Your Visitor Pass", msg)
  } catch (err) {
    console.log("email fail", err)
  }

  const sendSMS = require("../utils/sendSMS")
  try {
    if (visitor.phone && visitor.phone !== "N/A") {
      await sendSMS(visitor.phone, msg)
    }
  } catch (err) {
    console.log("sms fail", err)
  }
}

exports.issuePass = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate("visitorId")
    
    if (!appointment) {
      return res.status(404).json({ error: "not found" })
    }

    if (appointment.status !== "approved") {
      return res.status(400).json({ error: "not approved" })
    }

    const existingPass = await Pass.findOne({ appointmentId: appointment._id })
    if (existingPass) {
      return res.status(400).json({ error: "already issued" })
    }

    const visitor = appointment.visitorId
    const startTime = new Date()
    const endTime = new Date(Date.now() + 8 * 60 * 60 * 1000) 

    const newPass = await Pass.create({
      visitorId: visitor._id,
      appointmentId: appointment._id,
      validFrom: startTime,
      validTo: endTime
    })

    const qrStr = JSON.stringify({ passId: newPass._id })
    const qrImage = await QRCode.toDataURL(qrStr)

    const pdfBuffer = await generatePDF(visitor, appointment, startTime, endTime, qrImage)
    const cloudLink = await uploadToCloudinary(pdfBuffer)

    newPass.pdfUrl = cloudLink
    await newPass.save()

    // link pass to appointment so dashboard can show download button
    appointment.passId = newPass._id
    await appointment.save()

    await sendNotifications(visitor, cloudLink)

    res.json({ message: "pass issued", pass: newPass })

  } catch (err) {
    console.log("issue error", err)
    res.status(500).json({ error: "failed to issue" })
  }
}
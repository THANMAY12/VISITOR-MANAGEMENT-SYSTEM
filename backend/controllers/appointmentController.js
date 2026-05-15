const Appointment = require("../models/Appointment")
const Pass = require("../models/pass")
const QRCode = require("qrcode")
const PDFDocument = require("pdfkit")
const cloudinary = require("../config/cloudinary")
const sendEmail = require("../utils/sendEmail")
const Visitor = require('../models/visitor')
const axios = require("axios")
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
const generatePDF = async (visitor, appt, from, to, qrImg) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 })
      let chunks = []
      
      doc.on("data", (c) => chunks.push(c))
      doc.on("end", () => {
        resolve(Buffer.concat(chunks))
      })

      // 1. Header Title
      doc.fontSize(22).text("Visitor Pass Management System", { align: "center" })
      doc.moveDown(0.5)

      // 2. Horizontal Line
      doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#000000").lineWidth(1).stroke()
      doc.moveDown(2)

      const startY = doc.y

      // 3. Visitor Photo (Left)
      if (visitor.photo) {
        try {
          const response = await axios.get(visitor.photo, { responseType: 'arraybuffer', timeout: 3000 })
          const photoBuffer = Buffer.from(response.data, 'binary')
          doc.image(photoBuffer, 50, startY, { width: 150, height: 150 })
        } catch (err) {
          console.error("Could not load visitor photo for PDF", err)
          doc.rect(50, startY, 150, 150).stroke()
          doc.fontSize(10).text("Photo Not Available", 50, startY + 70, { width: 150, align: "center" })
        }
      } else {
        doc.rect(50, startY, 150, 150).stroke()
        doc.fontSize(10).text("No Photo Provided", 50, startY + 70, { width: 150, align: "center" })
      }

      // 4. QR Code (Right)
      doc.image(qrImg, 395, startY, { width: 150 })

      // 5. Visitor Details
      doc.moveDown(8) 
      doc.fontSize(14).fillColor("#000000")

      const detailX = 50
      const labelWidth = 100

      const addDetail = (label, value) => {
        doc.font("Helvetica-Bold").text(`${label} : `, detailX, doc.y, { continued: true })
        doc.font("Helvetica").text(value)
        doc.moveDown(0.5)
      }

      addDetail("Name", visitor.name)
      addDetail("Email", visitor.email)
      addDetail("Phone", visitor.phone || "N/A")
      addDetail("Purpose", appt.purpose)
      addDetail("Valid From", from.toLocaleString())
      addDetail("Valid To", to.toLocaleString())

      // 6. Footer Message
      doc.moveDown(3)
      doc.fontSize(10).font("Helvetica").text("Please carry this pass during your visit. Thank You", { align: "center" })

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
const sendNotifications = async (visitor, link, validFrom, validTo) => {
  const msg = `Hello ${visitor.name},
Your Visitor pass has been approved and issued.

Click here to view your pass:
${link}

Valid From: ${validFrom}
Valid To: ${validTo}

Thank you.`
  
  try {
    await sendEmail(visitor.email, "Your Visitor Pass - Issued", msg)
  } catch (err) {
    console.log("email fail", err)
  }

  const sendSMS = require("../utils/sendSMS")
  try {
    if (visitor.phone && visitor.phone !== "N/A") {
      
      const smsMsg = `Hello ${visitor.name}, your pass is approved and issued. View it here: ${link}`
      await sendSMS(visitor.phone, smsMsg)
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

    // 1. Save the pass record immediately — this is all we need to respond
    const newPass = await Pass.create({
      visitorId: visitor._id,
      appointmentId: appointment._id,
      validFrom: startTime,
      validTo: endTime
    })

    appointment.passId = newPass._id
    await appointment.save()

    // 2. Respond right away — the pass is valid from this point
    res.json({ message: "pass issued", pass: newPass })

    // 3. Do the slow work in the background after responding
    ;(async () => {
      try {
        const qrStr = JSON.stringify({ passId: newPass._id })
        const qrImage = await QRCode.toDataURL(qrStr)
        const pdfBuffer = await generatePDF(visitor, appointment, startTime, endTime, qrImage)
        const cloudLink = await uploadToCloudinary(pdfBuffer)
        newPass.pdfUrl = cloudLink
        await newPass.save()
        sendNotifications(visitor, cloudLink, startTime, endTime)
      } catch (bgErr) {
        console.log("background pdf/notify error", bgErr)
      }
    })()

  } catch (err) {
    console.log("issue error", err)
    res.status(500).json({ error: "failed to issue" })
  }
}
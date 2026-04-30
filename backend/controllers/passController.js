const axios = require('axios');
const Pass = require("../models/pass");

// Get all passes — for admin/security to see everyone
exports.getAllPasses = async (req, res) => {
  try {
    const { email } = req.query;
    
    let passes = await Pass.find()
      .populate("visitorId")
      .populate("appointmentId")
      .lean();

    if (email) {
      passes = passes.filter((p) => p.visitorId?.email === email);
    }

    res.json(passes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Get a single pass by its ID — used by the QR scan page
exports.getPassById = async (req, res) => {
  try {
    const pass = await Pass.findById(req.params.id)
      .populate("visitorId")
      .populate("appointmentId");

    if (!pass) {
      return res.status(404).json({ error: "Pass not found" });
    }

    res.json(pass);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Get passes for a visitor by their email — used by visitor dashboard and check-pass page
exports.getPasses = async (req, res) => {
  try {
    const { email } = req.query;

    const passes = await Pass.find().populate("visitorId").lean();

    // Filter to only return passes that belong to this email address
    const myPasses = passes.filter((p) => p.visitorId?.email === email);

    res.json(myPasses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// download pass as pdf using axios
exports.downloadPass = async (req, res) => {
  try {
    const pass = await Pass.findById(req.params.id)

    if (!pass) {
      return res.status(404).json({ error: "not found" })
    }

    // fetch pdf from cloud as arraybuffer
    const response = await axios.get(pass.pdfUrl, {
      responseType: "arraybuffer",
      timeout: 10000 
    })

    // set headers so browser downloads it
    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", `attachment; filename=pass_${pass._id}.pdf`)
    
    return res.send(response.data)

  } catch (err) {
    console.log("axios error", err.message)
    
    if (err.code==='ECONNABORTED') {
      return res.status(504).json({ error: "timeout" })
    }
    
    return res.status(500).json({ error: "failed to download" })
  }
}
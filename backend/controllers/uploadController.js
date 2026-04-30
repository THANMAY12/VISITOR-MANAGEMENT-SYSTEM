const cloudinary = require("../config/cloudinary")
const fs = require("fs")

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "no file" })
    }

    const result = await cloudinary.uploader.upload(req.file.path)
    
    // Delete temporary file from local uploads folder
    if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path)
    }

    res.json({ url: result.secure_url })

  } catch (e) {
    console.log(e)
    
    // Clean up if upload failed
    if (req.file && req.file.path) {
      try { 
        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path) 
        }
      } catch (err) {}
    }

    res.status(500).json({ error: "upload failed" })
  }
}
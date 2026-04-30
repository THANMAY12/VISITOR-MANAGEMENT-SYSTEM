const express = require("express")
const router = express.Router()
const multer = require("multer")
const {uploadImage} = require("../controllers/uploadController")

const upload = multer({ dest: "uploads/" })

router.post("/", upload.single("file"), uploadImage)
module.exports = router;
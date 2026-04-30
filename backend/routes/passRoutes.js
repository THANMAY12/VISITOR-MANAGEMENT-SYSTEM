const express = require("express");
const router = express.Router();
const { getAllPasses, getPassById, getPasses, downloadPass } = require("../controllers/passController");
const requireAuth = require("../middleware/requireAuth");
const authorizeRole = require('../middleware/roleMiddleWare');

// Visitor looks up their own passes by email
router.get("/my-passes", requireAuth, authorizeRole("visitor"), getPasses);

//Admin or security can download a pass PDF
router.get("/download/:id", requireAuth, authorizeRole("security", "admin", "visitor"), downloadPass);

//Admin and security can see all passes
router.get("/", requireAuth, authorizeRole("admin", "security"), getAllPasses);

//Get a single pass by ID — used by the scan page to show visitor details
router.get("/:id", requireAuth, authorizeRole("admin", "security", "employee"), getPassById);

module.exports = router;
const express = require('express');
const { createVisitor, getVisitors, createVisitorPublic, approveVisitor } = require('../controllers/visitorController');
const requireAuth = require('../middleware/requireAuth');
const authorizeRole = require('../middleware/roleMiddleWare');

const router = express.Router();
router.post("/", requireAuth, authorizeRole("employee", "admin"), createVisitor);
router.get("/", requireAuth, authorizeRole("admin", "security", "employee"), getVisitors);
router.post("/public", createVisitorPublic);
router.patch("/:id", requireAuth, authorizeRole("admin", "employee"), approveVisitor);
module.exports = router;
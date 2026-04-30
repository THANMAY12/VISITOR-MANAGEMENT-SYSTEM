const express = require('express');
const { createAppointment, createMyAppointment, getAppointments, updateStatus, issuePass } = require('../controllers/appointmentController');
const requireAuth = require('../middleware/requireAuth');
const authorizeRole = require('../middleware/roleMiddleWare');

const router = express.Router();

router.post("/", requireAuth, authorizeRole("employee", "admin"), createAppointment);

router.post("/my-request", requireAuth, authorizeRole("visitor"), createMyAppointment);

router.get("/", requireAuth, authorizeRole("admin", "security", "employee", "visitor"), getAppointments);

router.patch("/:id", requireAuth, authorizeRole("employee", "admin"), updateStatus);

router.post("/:id/issue-pass", requireAuth, authorizeRole("security", "admin"), issuePass);

module.exports = router;
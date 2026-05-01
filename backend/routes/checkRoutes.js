const express = require("express");
const router = express.Router();

const { scanTheQr, getLogs, getStats } = require("../controllers/checkController");
const requireAuth = require("../middleware/requireAuth");
const authorizeRole = require("../middleware/roleMiddleWare");

router.post("/scan", requireAuth, authorizeRole("security", "admin"), scanTheQr);

router.get("/logs", requireAuth, authorizeRole("admin", "security"), getLogs);

router.get("/stats", requireAuth, authorizeRole("admin"), getStats);

module.exports = router;
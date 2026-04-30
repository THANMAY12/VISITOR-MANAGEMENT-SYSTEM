const express = require('express');
const { registerUser, loginUser, logoutUser } = require('../controllers/authController');
const authorizeRole = require('../middleware/roleMiddleWare');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

router.get("/admin", requireAuth, authorizeRole("admin"), (req, res) => {
  res.send("Admin access");
});

router.post("/register", requireAuth, authorizeRole("admin"), registerUser);

router.post("/register-visitor", require('../controllers/authController').registerVisitor);

router.post("/login", loginUser);

router.post("/logout", logoutUser);

module.exports = router;
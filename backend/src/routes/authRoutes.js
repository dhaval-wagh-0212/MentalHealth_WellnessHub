const express = require("express");
const {
  registerHandler,
  loginHandler,
  meHandler,
  logoutHandler
} = require("../controllers/authController");

const router = express.Router();

router.post("/auth/register", registerHandler);
router.post("/auth/login", loginHandler);
router.get("/auth/me", meHandler);
router.post("/auth/logout", logoutHandler);

module.exports = router;

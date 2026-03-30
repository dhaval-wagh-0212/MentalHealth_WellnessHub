const express = require("express");
const { chatHandler } = require("../controllers/chatController");
const { requireApiAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/chat", requireApiAuth, chatHandler);

module.exports = router;

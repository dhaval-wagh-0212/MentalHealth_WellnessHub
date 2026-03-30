const express = require("express");
const { getHistoryHandler } = require("../controllers/moodController");
const { requireApiAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/history", requireApiAuth, getHistoryHandler);

module.exports = router;

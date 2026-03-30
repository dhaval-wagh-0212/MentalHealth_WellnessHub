const express = require("express");
const { saveMoodHandler } = require("../controllers/moodController");
const { requireApiAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/mood", requireApiAuth, saveMoodHandler);

module.exports = router;

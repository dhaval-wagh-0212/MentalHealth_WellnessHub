const express = require("express");
const { deleteUserDataHandler } = require("../controllers/moodController");
const { requireApiAuth } = require("../middleware/auth");

const router = express.Router();

router.delete("/data", requireApiAuth, deleteUserDataHandler);

module.exports = router;

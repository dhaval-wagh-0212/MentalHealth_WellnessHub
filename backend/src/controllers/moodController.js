const MoodLog = require("../models/MoodLog");
const User = require("../models/User");
const Memory = require("../models/Memory");
const { analyzeMoodRisk, summarizeMemory } = require("../../aiEngine");

function toIntInRange(value, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  const rounded = Math.round(number);
  return Math.max(min, Math.min(max, rounded));
}

async function saveMoodHandler(req, res, next) {
  try {
    if (!req.session?.userDbId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { text = "", mood, risk, summary, date } = req.body || {};

    let record = { mood, risk };
    let memorySummary = typeof summary === "string" ? summary.trim().toLowerCase() : "";

    if ((!mood || risk === undefined) && text) {
      const generated = await analyzeMoodRisk(text);
      record = { mood: generated.mood, risk: generated.risk };
    }

    if (!memorySummary && text) {
      memorySummary = await summarizeMemory(text);
    }

    if (!memorySummary) {
      memorySummary = `${String(record.mood || "general").toLowerCase()} check in`;
    }

    if (!record.mood || typeof record.mood !== "string") {
      return res.status(400).json({ error: "mood is required." });
    }

    const normalizedMood = record.mood.toLowerCase().trim();
    if (!["happy", "sad", "anxious", "stressed"].includes(normalizedMood)) {
      return res.status(400).json({ error: "mood must be one of happy, sad, anxious, stressed." });
    }

    const normalizedRisk = toIntInRange(record.risk, 0, 100);
    if (normalizedRisk === null) {
      return res.status(400).json({ error: "risk is required and must be a number." });
    }

    const user = await User.findById(req.session.userDbId);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const memory = await Memory.create({
      user: user._id,
      summary: memorySummary.slice(0, 160),
      date: date ? new Date(date) : new Date()
    });

    const doc = await MoodLog.create({
      user: user._id,
      memory: memory._id,
      mood: normalizedMood,
      risk: normalizedRisk,
      date: date ? new Date(date) : new Date()
    });

    return res.status(201).json({
      id: doc._id,
      userId: user.userId,
      mood: doc.mood,
      risk: doc.risk,
      date: doc.date,
      summary: memory.summary
    });
  } catch (error) {
    return next(error);
  }
}

async function getHistoryHandler(req, res, next) {
  try {
    if (!req.session?.userDbId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const queryLimit = Number(req.query.limit);
    const limit = Number.isFinite(queryLimit) ? Math.min(Math.max(Math.round(queryLimit), 1), 200) : 50;
    const history = await MoodLog.find({ user: req.session.userDbId })
      .populate("memory", "summary date")
      .populate("user", "userId username")
      .sort({ date: -1 })
      .limit(limit);

    return res.json(
      history.map((entry) => ({
        id: entry._id,
        userId: entry.user?.userId || null,
        username: entry.user?.username || null,
        mood: entry.mood,
        risk: entry.risk,
        date: entry.date,
        summary: entry.memory?.summary || ""
      }))
    );
  } catch (error) {
    return next(error);
  }
}

async function deleteUserDataHandler(req, res, next) {
  try {
    if (!req.session?.userDbId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await User.findById(req.session.userDbId);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    await MoodLog.deleteMany({ user: user._id });
    await Memory.deleteMany({ user: user._id });

    return res.json({ deleted: true });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  saveMoodHandler,
  getHistoryHandler,
  deleteUserDataHandler
};

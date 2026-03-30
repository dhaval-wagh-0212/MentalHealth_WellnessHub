const mongoose = require("mongoose");

const moodLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    memory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Memory",
      required: true,
      index: true
    },
    mood: {
      type: String,
      enum: ["happy", "sad", "anxious", "stressed"],
      required: true
    },
    risk: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("MoodLog", moodLogSchema);

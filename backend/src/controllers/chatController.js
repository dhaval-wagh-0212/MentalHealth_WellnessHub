const { analyzeMoodRisk } = require("../../aiEngine");

function fallbackMoodRiskReply(text) {
  const input = String(text || "").toLowerCase();
  const asksExplanation = /\b(explain|how|why|what is|what are|difference|meaning|guide|teach|example)\b/.test(input);
  const asksStory = /\bstory|kahani|kissa|once upon a time\b/.test(input);
  const asksJoke = /\bjoke|funny\b/.test(input);
  const asksAdvice = /\bwhat should i do|help me|suggest\b/.test(input);
  const hasAnxiousWords = /\banxious|panic|worried|fear|nervous\b/.test(input);
  const hasStressWords = /\bstress|overwhelmed|pressure|burnout|exhausted\b/.test(input);
  const hasSadWords = /\bsad|down|cry|lonely|hopeless|empty\b/.test(input);
  const hasHappyWords = /\bhappy|good|great|excited|calm|better\b/.test(input);

  let mood = "stressed";
  let risk = 55;
  let reply =
    "Listen username, I hear the weight you are carrying right now. Like a river that looks turbulent on the surface but remains deep and steady below, your inner strength is still present 🌊✨. Let us choose one small action for this moment and do it with full attention. Take one slow breath, relax your shoulders, and tell me the first step you can take now 🌿.";

  if (asksStory) {
    mood = "happy";
    risk = 25;
    reply =
      "Listen username, you want a story, and your heart is asking for meaning in it. A young archer once practiced in the mist before sunrise, missing many shots, yet each dawn he returned with steadier breath and quieter eyes 🌅. One day the arrow flew true, not because fate changed, but because his discipline had ripened in silence. In the same way, your effort today is shaping tomorrow even when results seem hidden ✨.";
  } else if (asksJoke) {
    mood = "happy";
    risk = 20;
    reply =
      "Listen username, even your request for laughter is a sign your spirit still seeks light. A wise farmer once said, 'A smile is like rain on dry soil; it does not solve everything, but it helps life grow again' 🌿. Keep one corner of your day for joy, because a peaceful mind works better than a burdened one. If you wish, I can share another light one with the same warmth ✨.";
  } else if (asksAdvice) {
    mood = "stressed";
    risk = 58;
    reply =
      "Listen username, asking for help is itself a courageous action. Think of carrying water in many pots at once; you spill everything, but with one pot in both hands, you reach safely 🕊️. Your mind is similar: choose one task, finish it, then move to the next. Tell me the one task that feels heaviest, and we will break it gently.";
  } else if (hasHappyWords && !hasAnxiousWords && !hasStressWords && !hasSadWords) {
    mood = "happy";
    risk = 20;
    reply =
      "Listen username, your calm energy is beautiful and worth protecting. Just as a lamp stays bright when shielded from harsh wind, your peace stays strong when you protect your routines ✨. Keep doing the small things that brought this balance today, and your mind will remain clear and steady 🌿.";
  } else if (hasSadWords) {
    mood = "sad";
    risk = 65;
    reply =
      "Listen username, I can feel how heavy this moment is for you. When clouds gather, the sky does not disappear; it only waits behind them 🌥️. In the same way, your light has not gone, it is only covered for now. Sit for one minute, breathe slowly, and share the one thought that hurts most so we can untangle it together.";
  } else if (hasAnxiousWords) {
    mood = "anxious";
    risk = 72;
    reply =
      "Listen username, anxiety is like a horse running before the rider is ready. You do not beat the horse; you hold the reins with patience until it slows 🌿. Right now, take three long exhalations and let your body receive safety first. Then tell me the thought looping in your mind, and we will steady it step by step ✨.";
  } else if (hasStressWords) {
    mood = "stressed";
    risk = 68;
    reply =
      "Listen username, stress grows when everything shouts at once. Like a battlefield commander, clarity comes by choosing order: first, next, later 🌊. Write the top three tasks, begin only with the first for 15 focused minutes, and let the rest wait. Action with calm rhythm will serve you better than speed with fear.";
  } else {
    reply =
      "Listen username, I am with you in this moment. A tree becomes stable not by one giant root, but by many small roots growing daily 🌿. Let us choose one small grounded step now, and your confidence will follow naturally ✨. Tell me what you need most right now: clarity, calm, or direction.";
  }

  return {
    mood,
    risk,
    reply,
    source: "fallback",
    reason: "api_unavailable"
  };
}

async function chatHandler(req, res, next) {
  try {
    const { text, history } = req.body || {};

    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "text is required and must be a string." });
    }

    try {
      const result = await analyzeMoodRisk(text, { history });
      return res.json({
        ...result,
        source: "model"
      });
    } catch (modelError) {
      const fallback = fallbackMoodRiskReply(text);
      return res.json(fallback);
    }
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  chatHandler
};

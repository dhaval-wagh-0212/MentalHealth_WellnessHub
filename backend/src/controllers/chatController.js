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
    "Thank you for sharing this with me. You are not alone, and we can take this one gentle step at a time.";

  if (asksStory) {
    mood = "happy";
    risk = 25;
    reply =
      "Once there was a tired student who planted a tiny seed every evening and called it hope. The first week, nothing changed, but they kept watering it with one small act of courage each day. One morning, a green sprout appeared, and the student realized growth was happening quietly all along. By the end of the month, that little plant had become a reminder that progress does not need to be loud to be real. Would you like a motivational story, a funny story, or a bedtime story next?";
  } else if (asksJoke) {
    mood = "happy";
    risk = 20;
    reply =
      "Here is one: Why did the calendar go to therapy? Because it felt too many dates were stressing it out. You are doing better than you think, and a little laughter can really help. Want another light joke or a short funny story?";
  } else if (asksAdvice) {
    mood = "stressed";
    risk = 58;
    reply =
      "I hear you, and I am glad you asked for help. A good first step is to choose one tiny action you can finish in five minutes, then pause and breathe before the next step. This keeps your mind from feeling overloaded. What is one specific thing you are struggling with right now so I can suggest something more focused?";
  } else if (hasHappyWords && !hasAnxiousWords && !hasStressWords && !hasSadWords) {
    mood = "happy";
    risk = 20;
    reply =
      "I am really glad to hear that. Keep nurturing what is helping you feel this way, even in small ways. What has helped you feel this good today?";
  } else if (hasSadWords) {
    mood = "sad";
    risk = 65;
    reply =
      "I am sorry you are carrying this right now. Your feelings are valid, and I am here with you. A small pause and a few slow breaths can help in this moment. Do you want to talk about what made today feel hard?";
  } else if (hasAnxiousWords) {
    mood = "anxious";
    risk = 72;
    reply =
      "That sounds really heavy, and it makes sense to feel this way. Let us slow down together: inhale for 4, exhale for 6, for a few rounds. What thought is repeating in your mind the most right now?";
  } else if (hasStressWords) {
    mood = "stressed";
    risk = 68;
    reply =
      "You have a lot on your plate right now. You are doing your best, and that matters. We can break this into one small next step. Which task feels most urgent to you at this moment?";
  } else {
    reply =
      "Thank you for sharing this with me. I am here to support you, and we can handle this one step at a time. What kind of help would feel most useful right now?";
  }

  let enrichedReply = reply;
  if (!/\bsuggestion\s*:?\b/i.test(enrichedReply)) {
    enrichedReply = `${enrichedReply} Suggestion: take a short pause, do 3 slow breaths, and focus on one small next step.`;
  }
  if ((asksExplanation || !asksStory) && !/\bexample\b/i.test(enrichedReply)) {
    enrichedReply = `${enrichedReply} Example: if someone feels stressed before a deadline, a kind approach is to prioritize one task, avoid self-blame, and ask for help early if needed.`;
  }

  return {
    mood,
    risk,
    reply: enrichedReply,
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

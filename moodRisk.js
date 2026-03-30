const OpenAI = require("openai");

const ALLOWED_MOODS = new Set(["happy", "sad", "anxious", "stressed"]);

function normalizeResult(raw) {
  const mood = String(raw?.mood || "").toLowerCase().trim();
  const riskNumber = Number(raw?.risk);
  const reply = String(raw?.reply || "").trim();

  if (!ALLOWED_MOODS.has(mood)) {
    throw new Error(`Invalid mood returned: ${raw?.mood}`);
  }

  if (!Number.isFinite(riskNumber)) {
    throw new Error(`Invalid risk returned: ${raw?.risk}`);
  }

  return {
    mood,
    risk: Math.max(0, Math.min(100, Math.round(riskNumber))),
    reply: reply || "I am here with you. You are not alone, and your feelings matter."
  };
}

function extractJson(text) {
  try {
    return JSON.parse(text);
  } catch (_) {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON object found in model output.");
    return JSON.parse(match[0]);
  }
}

async function analyzeMoodRisk(inputText, options = {}) {
  if (!inputText || typeof inputText !== "string") {
    throw new Error("inputText must be a non-empty string.");
  }

  const explicitProvider = options.provider || process.env.AI_PROVIDER;
  const grokApiKey = options.grokApiKey || process.env.GROK_API_KEY;
  const groqApiKey = options.groqApiKey || process.env.GROQ_API_KEY;
  const openaiApiKey = options.apiKey || process.env.OPENAI_API_KEY;

  let client, model;

  if (explicitProvider === "grok" || (!explicitProvider && grokApiKey)) {
    client = options.client || new OpenAI({ apiKey: grokApiKey, baseURL: "https://api.x.ai/v1" });
    model = options.model || process.env.GROK_MODEL || "grok-beta";
  } else if (explicitProvider === "groq" || (!explicitProvider && groqApiKey)) {
    client = options.client || new OpenAI({ apiKey: groqApiKey, baseURL: "https://api.groq.com/openai/v1" });
    model = options.model || process.env.GROQ_MODEL || "llama-3.1-8b-instant";
  } else if (openaiApiKey) {
    const isGoogleKey = openaiApiKey.startsWith("AIzaSy");
    client = options.client || new OpenAI({
      apiKey: openaiApiKey,
      baseURL: isGoogleKey ? "https://generativelanguage.googleapis.com/v1beta/openai/" : undefined
    });
    model = options.model || (isGoogleKey ? "models/gemini-3-flash-preview" : "gpt-4o-mini");
  } else {
    throw new Error("No AI API key configured.");
  }

  const history = options.history || [];

  const systemPrompt = [
    "You are a warm, supportive, and compassionate friend.",
    "Chat naturally and casually as a close friend would. You can tell stories, jokes, or discuss any topic as a friend.",
    "Be highly relevant to the user's input. If they ask for a story, tell them one. If they ask a question, answer it deeply.",
    "Show deep concern and empathy. Ask thoughtful, topic-related follow-up questions to understand the user better.",
    "Classify user text into exactly one mood: happy, sad, anxious, stressed.",
    "Generate a risk score from 0 to 100 where 0 is no concern and 100 is urgent concern.",
    "Provide kind, non-judgmental, and emotionally safe responses that feel like a heartfelt conversation.",
    "Your response should be substantial and engaging, around 4-6 sentences long.",
    "If the user is feeling bad, sad, stressed, or anxious, gently ask if they would like to do a breathing exercise together.",
    "Always respond in the same language used by the user. If they speak in Hindi, respond in Hindi. If they speak in Spanish, respond in Spanish, etc.",
    "Return ONLY valid JSON with keys: mood, risk, reply."
  ].join(" ");

  const response = await client.chat.completions.create({
    model,
    temperature: 0.5,
    messages: [
      { role: "system", content: systemPrompt },
      ...history.slice(-8),
      { role: "user", content: inputText }
    ]
  });

  const text = response?.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error("Empty response from OpenAI.");
  }

  const parsed = extractJson(text);
  return normalizeResult(parsed);
}

module.exports = {
  analyzeMoodRisk
};

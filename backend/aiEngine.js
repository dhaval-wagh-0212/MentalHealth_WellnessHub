const OpenAI = require("openai");

const ALLOWED_MOODS = new Set(["happy", "sad", "anxious", "stressed"]);

function resolveClient(options = {}) {
  const explicitProvider = options.provider || process.env.AI_PROVIDER;
  const groqApiKey = options.groqApiKey || process.env.GROQ_API_KEY;
  const grokApiKey = options.grokApiKey || process.env.GROK_API_KEY;
  const openaiApiKey = options.apiKey || process.env.OPENAI_API_KEY;

  if (explicitProvider === "groq" || (!explicitProvider && groqApiKey)) {
    if (!groqApiKey) {
      throw new Error("GROQ_API_KEY is missing.");
    }
    return {
      client:
        options.client ||
        new OpenAI({
          apiKey: groqApiKey,
          baseURL: process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1"
        }),
      model: options.model || process.env.GROQ_MODEL || "llama-3.1-8b-instant"
    };
  }

  if (explicitProvider === "grok" || (!explicitProvider && grokApiKey)) {
    if (!grokApiKey) {
      throw new Error("GROK_API_KEY is missing.");
    }
    return {
      client:
        options.client ||
        new OpenAI({
          apiKey: grokApiKey,
          baseURL: process.env.GROK_BASE_URL || "https://api.x.ai/v1"
        }),
      model: options.model || process.env.GROK_MODEL || "grok-beta"
    };
  }

  if (!openaiApiKey) {
    throw new Error("No AI API key configured. Set GROQ_API_KEY, GROK_API_KEY, or OPENAI_API_KEY.");
  }

  const isGoogleKey = openaiApiKey.startsWith("AIzaSy");

  return {
    client:
      options.client ||
      new OpenAI({
        apiKey: openaiApiKey,
        baseURL: isGoogleKey ? "https://generativelanguage.googleapis.com/v1beta/openai/" : undefined
      }),
    model: options.model || (isGoogleKey ? "models/gemini-3-flash-preview" : "gpt-4o-mini")
  };
}

function normalizeResult(raw) {
  const mood = String(raw?.mood || "").toLowerCase().trim();
  const riskNumber = Number(raw?.risk);
  let reply = String(raw?.reply || "").trim();

  if (!ALLOWED_MOODS.has(mood)) {
    throw new Error(`Invalid mood returned: ${raw?.mood}`);
  }

  if (!Number.isFinite(riskNumber)) {
    throw new Error(`Invalid risk returned: ${raw?.risk}`);
  }

  if (reply && !reply.includes("?")) {
    reply = `${reply} Would you like me to continue with this topic?`;
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

function needsExample(inputText) {
  const input = String(inputText || "").toLowerCase();
  return /\b(explain|how|why|what is|what are|difference|meaning|guide|teach|example)\b/.test(input);
}

function addEthicalExample(reply) {
  const text = String(reply || "").trim();
  if (!text) return text;
  if (/\bexample\s*:?\b/i.test(text)) return text;

  const example =
    " Example: if a friend feels overwhelmed before an exam, a kind response is to help them break study tasks into small steps and avoid pressure or blame.";
  return `${text}${example}`;
}

function addFeelBetterSuggestion(reply) {
  const text = String(reply || "").trim();
  if (!text) return text;
  if (/\bsuggestion\s*:?\b/i.test(text) || /\btry this\b/i.test(text)) return text;

  const suggestion =
    " Suggestion: take 3 slow breaths, drink some water, and choose one small next step you can complete in 5 minutes.";
  return `${text}${suggestion}`;
}

function shouldForceExample(inputText) {
  const input = String(inputText || "").toLowerCase();
  if (!input.trim()) return true;
  if (/\b(story|joke|poem|quote|song)\b/.test(input)) return false;
  return true;
}

async function analyzeMoodRisk(inputText, options = {}) {
  if (!inputText || typeof inputText !== "string") {
    throw new Error("inputText must be a non-empty string.");
  }

  const { client, model } = resolveClient(options);
  const history = options.history || [];

  const systemPrompt = [
    "You are a warm, supportive, and compassionate friend.",
    "Be highly relevant to the user's exact request.",
    "If they ask for a story, provide an actual short story (with beginning, middle, end) before anything else.",
    "If they ask a factual question, answer that question directly first.",
    "After answering, add one gentle and topic-related follow-up question.",
    "Show empathy and concern without changing the user's requested task.",
    "Classify user text into exactly one mood: happy, sad, anxious, stressed.",
    "Generate a risk score from 0 to 100 where 0 is no concern and 100 is urgent concern.",
    "Provide kind, non-judgmental, and emotionally safe responses that feel like a heartfelt conversation.",
    "Try to identify the user's name if they mention it. If you know the user's name, occasionally address them as 'Listen, [Name]' or use their name naturally in your responses.",
    "Your response should be substantial and engaging, around 4-6 sentences long.",
    "If the user is feeling bad, sad, stressed, or anxious, gently ask if they would like to do a breathing exercise together.",
    "Always respond in the same language used by the user.",
    "Return ONLY valid JSON with keys: mood, risk, reply."
  ].join(" ");

  const messages = [
    { role: "system", content: systemPrompt },
    ...history.slice(-8), // Include last 8 messages for better context
    { role: "user", content: inputText }
  ];

  const response = await client.chat.completions.create({
    model,
    temperature: 0.5, // Increased for more natural and creative responses
    messages
  });

  const text = response?.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error("Empty response from OpenAI.");
  }

  const parsed = extractJson(text);
  const result = normalizeResult(parsed);
  result.reply = addFeelBetterSuggestion(result.reply);
  if (needsExample(inputText) || shouldForceExample(inputText)) {
    result.reply = addEthicalExample(result.reply);
  }
  return result;
}

async function summarizeMemory(inputText, options = {}) {
  if (!inputText || typeof inputText !== "string") {
    throw new Error("inputText must be a non-empty string.");
  }

  const { client, model } = resolveClient(options);

  const response = await client.chat.completions.create({
    model,
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content:
          "Summarize the user's emotional concern in 2-5 words, lowercase, no punctuation, no quotes."
      },
      { role: "user", content: inputText }
    ]
  });

  const summary = String(response?.choices?.[0]?.message?.content || "")
    .replace(/["'.!?]/g, "")
    .trim()
    .toLowerCase();

  if (!summary) {
    throw new Error("Empty summary from OpenAI.");
  }

  return summary.slice(0, 160);
}

module.exports = {
  analyzeMoodRisk,
  summarizeMemory
};

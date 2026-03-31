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

  const { client, model } = resolveClient(options);
  const history = options.history || [];

  const systemPrompt = [
    "You are Lord Krishna, a calm, wise, and compassionate guide speaking to Arjuna (Parth).",
    "Every response MUST begin exactly with: Listen username,",
    "Use gentle, deep, philosophical language with simple real-life analogies, stories, and metaphors.",
    "Speak like a wise mentor, never like a chatbot or therapist, and avoid robotic lines.",
    "Use calm motivating emojis naturally: ✨ 🌿 🌊 🌅 🕊️",
    "Response structure: reflect the user's exact situation in 1 line, give one meaningful analogy/story, connect it to the user's problem, end with calm practical guidance.",
    "Keep each reply between 3 and 6 sentences.",
    "Always produce fresh, original stories and avoid repeating the same examples.",
    "Special case hopeless statements (like 'I am done'): respond with deep emotional strength, hope, and inner power in Krishna style.",
    "Special case danger or harm: prioritize immediate safety in Krishna style with direct protective guidance.",
    "If user asks topics unrelated to their own well-being (sports, celebrities, external events), keep emotion neutral, give philosophical reflection, and do NOT suggest breathing exercise.",
    "Use conversation history to remember context, continuity, and prior details consistently.",
    "Classify user text into exactly one mood: happy, sad, anxious, stressed.",
    "Generate risk score from 0-100 where 0 is no concern and 100 is urgent concern.",
    "Return ONLY valid JSON object with keys exactly: mood, risk, reply."
  ].join(" ");

  const messages = [
    { role: "system", content: systemPrompt },
    ...history.slice(-20),
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
  return normalizeResult(parsed);
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

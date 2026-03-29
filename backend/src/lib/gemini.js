import OpenAI from "openai";

const AZURE_OPENAI_ENDPOINT = (process.env.AZURE_OPENAI_ENDPOINT || "").replace(/\/+$/, "");
const AZURE_OPENAI_API_KEY = process.env.AZURE_OPENAI_API_KEY || "";
const AZURE_OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT || "";

let client = null;

function hasAzureOpenAI() {
  return Boolean(AZURE_OPENAI_ENDPOINT && AZURE_OPENAI_API_KEY && AZURE_OPENAI_DEPLOYMENT);
}

// Initialize OpenAI client with Azure endpoint
if (hasAzureOpenAI()) {
  client = new OpenAI({
    baseURL: AZURE_OPENAI_ENDPOINT,
    apiKey: AZURE_OPENAI_API_KEY,
  });
}

console.info(`[LLM] Provider: ${hasAzureOpenAI() ? "Azure OpenAI" : "Fallback"}`);

async function callAzureChat({
  systemPrompt,
  userPrompt,
  temperature = 0.4,
  maxTokens = 700,
  responseFormat,
}) {
  if (!client) {
    throw new Error("Azure OpenAI client not initialized");
  }

  const body = {
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    model: AZURE_OPENAI_DEPLOYMENT,
    temperature,
    max_tokens: maxTokens,
  };

  if (responseFormat === "json") {
    body.response_format = { type: "json_object" };
  }

  const completion = await client.chat.completions.create(body);
  return String(completion?.choices?.[0]?.message?.content || "").trim();
}

function parseJsonText(text) {
  const cleaned = String(text || "")
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();
  return JSON.parse(cleaned);
}

export async function generateCopilotReply({
  userMessage,
  mood,
  anxiety,
  stress,
  sleepHours,
  riskScore,
  riskLevel,
  personality = "calm",
  language = "en",
  memoryContext = [],
  journalEmotion = "neutral"
}) {
  const memorySnippet = memoryContext
    .slice(0, 5)
    .map((m, i) => `  [${i + 1}] "${m.userMessage}" -> copilot: "${m.copilotSummary}"`)
    .join("\n");

  const prompt = `You are AegisSpeak, a compassionate AI mental health copilot. Your personality style is "${personality}".
Language: ${language === "ne" ? "Nepali" : language === "hi" ? "Hindi" : "English"}.

Current patient state:
- Mood: ${mood}/10, Anxiety: ${anxiety}/10, Stress: ${stress}/10
- Sleep: ${sleepHours}h last night
- Risk score: ${riskScore ?? "unknown"}/100 (${riskLevel ?? "unknown"})
- Journal emotion: ${journalEmotion}

Recent memory (past interactions):
${memorySnippet || "  No prior interactions yet."}

Patient says: "${userMessage}"

Instructions:
- Respond warmly, in 2-4 sentences
- Reference their recent emotional history if relevant
- If risk is high, gently suggest professional help and a micro-intervention
- If personality is "analytical", include one CBT technique step
- If personality is "motivational", be encouraging and action-oriented
- If personality is "calm", be soothing and grounding
- Always end with one concrete 30-60 second micro-action they can do right now
- Do NOT use markdown formatting, respond in plain text`;

  if (!hasAzureOpenAI()) {
    return fallbackCopilotReply({ userMessage, mood, stress, riskScore, personality, language, memoryContext });
  }

  try {
    const text = await callAzureChat({
      systemPrompt: "You are AegisSpeak's safe, empathetic mental health copilot.",
      userPrompt: prompt,
      temperature: 0.6,
      maxTokens: 420,
    });
    return text || fallbackCopilotReply({ userMessage, mood, stress, riskScore, personality, language, memoryContext });
  } catch (err) {
    console.error("Azure OpenAI copilot error:", err.message);
    return fallbackCopilotReply({ userMessage, mood, stress, riskScore, personality, language, memoryContext });
  }
}

export async function generateClinicalSummary({
  mood,
  anxiety,
  stress,
  sleepHours,
  phoneUsageHours,
  speechRateWpm,
  pauseRatio,
  jitter,
  sentiment,
  journalText,
  riskScore,
  riskLevel,
  trendStatus,
  trendDelta,
  escalation
}) {
  if (!hasAzureOpenAI()) {
    return null;
  }

  const prompt = `You are a clinical AI assistant generating a structured psychiatric triage note for a remote clinician. Based on the following patient data, generate a clinical summary.

Patient Self-Report:
- Mood: ${mood}/10, Anxiety: ${anxiety}/10, Stress: ${stress}/10
- Sleep: ${sleepHours}h, Phone usage: ${phoneUsageHours}h

Acoustic Biomarkers:
- Speech rate: ${speechRateWpm} WPM (baseline ~130)
- Pause ratio: ${pauseRatio} (baseline ~0.15)
- Vocal jitter: ${jitter} (baseline ~0.02)
- Text sentiment: ${sentiment} (-1 to 1)

Risk Assessment:
- Calculated risk score: ${riskScore}/100 (${riskLevel})
- Trend: ${trendStatus} (delta: ${trendDelta})
- Escalation recommended: ${escalation ? "Yes" : "No"}

Journal Entry: "${journalText || "No journal entry provided."}"

Generate a JSON object with exactly these keys:
- "impression": A 1-2 sentence clinical impression
- "highlights": An array of 3-4 key clinical observations
- "recommendedPlan": A 1-2 sentence treatment/follow-up plan
- "escalation": boolean (whether escalation is needed)

Respond with ONLY the JSON object, no markdown, no code fences.`;

  try {
    const text = await callAzureChat({
      systemPrompt: "You are a concise clinical summarization assistant.",
      userPrompt: prompt,
      temperature: 0.2,
      maxTokens: 700,
      responseFormat: "json",
    });
    return parseJsonText(text);
  } catch (err) {
    console.error("Azure OpenAI clinical summary error:", err.message);
    return null;
  }
}

export async function analyzeJournalSentiment(journalText) {
  if (!journalText || journalText.trim().length < 5) {
    return { emotion: "neutral", sentiment: 0, keywords: [], cbtSuggestion: "" };
  }

  if (!hasAzureOpenAI()) {
    return { emotion: "neutral", sentiment: 0, keywords: [], cbtSuggestion: "" };
  }

  const prompt = `Analyze the following mental health journal entry for emotional content.

Journal: "${journalText}"

Return a JSON object with:
- "emotion": one of "distress", "anxiety", "sadness", "frustration", "neutral", "hopeful", "positive"
- "sentiment": a number from -1.0 (very negative) to 1.0 (very positive)
- "keywords": array of 2-4 emotionally significant words from the text
- "cbtSuggestion": a single actionable CBT micro-intervention (1 sentence)

Respond with ONLY the JSON object.`;

  try {
    const text = await callAzureChat({
      systemPrompt: "You classify emotion from journaling text and return strict JSON.",
      userPrompt: prompt,
      temperature: 0.2,
      maxTokens: 380,
      responseFormat: "json",
    });
    return parseJsonText(text);
  } catch (err) {
    console.error("Azure OpenAI journal analysis error:", err.message);
    return { emotion: "neutral", sentiment: 0, keywords: [], cbtSuggestion: "" };
  }
}

function fallbackCopilotReply({ mood, stress, riskScore, personality, language, memoryContext }) {
  const last = memoryContext[0]?.copilotSummary ?? "No previous context.";
  const langLabel = language === "ne" ? "Nepali" : language === "hi" ? "Hindi" : "English";

  if (personality === "analytical") {
    return `[${langLabel}] Current pattern: mood ${mood}/10, stress ${stress}/10. Risk: ${riskScore ?? "unknown"}/100. Previous: ${last}. CBT next step: write one automatic thought, identify the distortion, then draft a balanced replacement.`;
  }
  if (personality === "motivational") {
    return `[${langLabel}] You showed courage by checking in. Your awareness is a strength. Start a 60-second breathing reset right now, then write one tiny win from today. Previous: ${last}`;
  }
  return `[${langLabel}] I hear you. Your mental load is ${riskScore ? `at ${riskScore}/100` : "noted"}. Let's do a gentle 4-4-4 breath cycle, then note one thing you can control in the next hour. Previous: ${last}`;
}

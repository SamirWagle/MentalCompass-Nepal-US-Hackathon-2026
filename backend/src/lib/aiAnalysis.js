/**
 * AegisSpeak — Background AI Analysis Engine
 *
 * CRITICAL RULES:
 * - NEVER diagnose the user
 * - NEVER use terms like "depressed", "mad", "mentally ill", "disorder"
 * - ONLY suggest gentle lifestyle habits: music, articles, exercises, breathing, social
 * - Output is ALWAYS framed as "things that might help" not "treatment"
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

const MODEL_ID = 'gemini-2.0-flash';

/**
 * Analyze 30 days of journal entries + wearable data for a patient.
 * Returns safe lifestyle suggestions and a trend signal.
 * NEVER diagnoses. NEVER labels the user.
 */
export async function analyzePatientJourney(entries, stats) {
  const recentEntries = entries.slice(0, 30);

  if (!recentEntries.length) {
    return buildFallbackAnalysis(stats);
  }

  // Build a safe, anonymized summary of entries for the prompt
  const entrySummary = recentEntries
    .slice(0, 15) // limit prompt size
    .map((e, i) => {
      const s = e.sentiment;
      const scoreStr = s?.score != null ? `sentiment ${s.score}/100` : 'no sentiment data';
      const levelStr = s?.level ? `, level: ${s.level}` : '';
      const wearable = e.wearableData
        ? `, sleep: ${e.wearableData.sleepHours}h, HR: ${e.wearableData.heartRate}`
        : '';
      const typeStr = e.type !== 'text' ? ` [${e.type}]` : '';
      return `Entry ${i + 1}${typeStr}: ${scoreStr}${levelStr}${wearable}`;
    })
    .join('\n');

  const trendStr = stats
    ? `Trend: avg sentiment ${stats.avgSentiment?.toFixed(1) ?? 'unknown'}/100, ` +
      `last 7 days avg: ${stats.last7DayAvg?.toFixed(1) ?? 'n/a'}, ` +
      `prev 7 days avg: ${stats.prev7DayAvg?.toFixed(1) ?? 'n/a'}, ` +
      `declining: ${stats.declining}`
    : 'No trend data available.';

  if (!genAI) {
    return buildFallbackAnalysis(stats);
  }

  const model = genAI.getGenerativeModel({ model: MODEL_ID });

  const prompt = `You are AegisSpeak's wellness companion AI. You are analyzing an ANONYMOUS patient's journal pattern to suggest supportive lifestyle habits.

Patient data summary (completely anonymized):
${entrySummary}

${trendStr}

STRICT RULES:
1. You are NOT a doctor. Do NOT diagnose.
2. NEVER use words like: depressed, anxious disorder, mental illness, mad, crazy, clinical, pathological, psychiatric.
3. ONLY suggest gentle habits from: music, short walks, breathing exercises, journaling prompts, social connection, sleep hygiene, hydration, articles/podcasts, stretching.
4. Frame everything as "things that might help you feel better" NOT as treatment.
5. If the declining trend is true, gently suggest talking to a professional — phrase it as "connecting with someone" not "seeing a psychiatrist".

Output a JSON object with EXACTLY these keys:
{
  "suggestions": [
    { "category": "music|article|exercise|breathing|social|selfcare", "title": "...", "desc": "...", "icon": "emoji" }
  ],
  "encouragement": "A single warm, non-clinical sentence",
  "declining": true|false,
  "declineMessage": "If declining: a gentle, sensitive message suggesting connection. Null if not declining.",
  "trendSummary": "A 1-sentence non-clinical description of the pattern"
}

Respond with ONLY the JSON object. No markdown, no code fences. Maximum 5 suggestions.`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '');
    const parsed = JSON.parse(cleaned);
    return {
      ...parsed,
      generatedAt: new Date().toISOString(),
      source: 'gemini',
    };
  } catch (err) {
    console.error('AI analysis error:', err.message);
    return buildFallbackAnalysis(stats);
  }
}

/**
 * Fallback when Gemini is unavailable — uses rule-based suggestions.
 * Same safe-mode rules apply.
 */
function buildFallbackAnalysis(stats) {
  const declining = stats?.declining ?? false;
  const avg = stats?.avgSentiment ?? 50;

  const suggestions = [];

  // Always include breathing
  suggestions.push({ category: 'breathing', title: '4-7-8 Breathing', desc: 'Inhale 4s, hold 7s, exhale 8s — repeat 3 times', icon: '🫁' });

  if (avg < 40 || declining) {
    suggestions.push({ category: 'music', title: 'Calm Piano Playlist', desc: 'Soft instrumental tracks to help you unwind', icon: '🎵' });
    suggestions.push({ category: 'selfcare', title: 'Drink a Glass of Water', desc: 'Hydration affects how you feel more than you think', icon: '💧' });
    suggestions.push({ category: 'article', title: '5 Simple Grounding Techniques', desc: 'Quick exercises when things feel overwhelming', icon: '📝' });
    suggestions.push({ category: 'social', title: 'Reach Out to a Friend', desc: 'A quick message to someone you trust', icon: '💬' });
  } else if (avg < 70) {
    suggestions.push({ category: 'exercise', title: 'Take a 10-Minute Walk', desc: 'A gentle walk can shift your perspective', icon: '🚶' });
    suggestions.push({ category: 'article', title: 'The Power of Daily Routines', desc: 'Small habits that make a big difference', icon: '📋' });
    suggestions.push({ category: 'music', title: 'Nature Sounds', desc: 'Rain, ocean waves, and forest ambience', icon: '🌊' });
  } else {
    suggestions.push({ category: 'exercise', title: 'Morning Yoga Flow', desc: 'A gentle 10-minute sequence to start your day', icon: '🏃' });
    suggestions.push({ category: 'social', title: 'Write a Thank-You Note', desc: 'Express gratitude to someone who matters', icon: '💌' });
  }

  return {
    suggestions: suggestions.slice(0, 5),
    encouragement: declining
      ? 'Thank you for sharing your journey with us. Small steps forward still count. 🌱'
      : 'You\'re doing great by keeping up with your wellness practice! 🌟',
    declining,
    declineMessage: declining
      ? 'We noticed some shifts in your wellness patterns recently. Connecting with someone who can listen — a friend, family member, or counselor — can make a real difference. Would you like to explore that?'
      : null,
    trendSummary: declining
      ? 'Your recent wellness patterns suggest you might benefit from some extra support.'
      : 'Your wellness patterns look stable and consistent.',
    generatedAt: new Date().toISOString(),
    source: 'fallback',
  };
}

/**
 * Check if the AI analysis indicates a severe/declining trend
 * that should trigger the consultation suggestion UI.
 */
export function shouldTriggerConsultationAlert(analysis, stats) {
  if (!analysis && !stats) return false;

  const declining = analysis?.declining ?? stats?.declining ?? false;
  const avgSentiment = stats?.avgSentiment ?? 100;
  const hasEnoughData = (stats?.totalEntries ?? 0) >= 5;

  return hasEnoughData && (declining || avgSentiment < 30);
}

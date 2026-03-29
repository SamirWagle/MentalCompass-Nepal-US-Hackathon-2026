/**
 * Mental Compass — Gentle AI Suggestion Engine
 *
 * CRITICAL RULE: This engine NEVER diagnoses. It NEVER says "you are depressed/crazy."
 * It ONLY provides gentle lifestyle habit suggestions: music, articles, exercises, breathing.
 */

// Suggestion categories
const SUGGESTION_POOL = {
  music: [
    { title: 'Calm Piano Playlist', desc: 'Soft instrumental tracks to help you unwind', icon: '🎵' },
    { title: 'Nature Sounds', desc: 'Rain, ocean waves, and forest ambience for relaxation', icon: '🌊' },
    { title: 'Lo-Fi Study Beats', desc: 'Gentle background music for focus and calm', icon: '🎧' },
    { title: 'Morning Meditation Music', desc: 'Start your day with peaceful melodies', icon: '🌅' },
    { title: 'Sleep Soundscapes', desc: 'Drift off with soothing nighttime sounds', icon: '🌙' },
  ],
  article: [
    { title: 'Understanding Your Emotions', desc: 'A short guide to recognizing what you feel', icon: '📖' },
    { title: '5 Simple Grounding Techniques', desc: 'Quick exercises when things feel overwhelming', icon: '📝' },
    { title: 'The Power of Daily Routines', desc: 'Small habits that make a big difference', icon: '📋' },
    { title: 'Journaling for Clarity', desc: 'How writing helps organize thoughts', icon: '✍️' },
    { title: 'Sleep Hygiene Basics', desc: 'Simple tips for better rest tonight', icon: '😴' },
    { title: 'Building Supportive Connections', desc: 'Reaching out doesn\'t have to be hard', icon: '🤝' },
  ],
  exercise: [
    { title: 'Take a 10-Minute Walk', desc: 'A gentle walk can shift your perspective', icon: '🚶' },
    { title: 'Stretch at Your Desk', desc: '5 simple stretches to release tension', icon: '🧘' },
    { title: 'Dance for 3 Minutes', desc: 'Put on your favorite song and move your body', icon: '💃' },
    { title: 'Morning Yoga Flow', desc: 'A gentle 10-minute sequence to start your day', icon: '🏃' },
  ],
  breathing: [
    { title: '4-7-8 Breathing', desc: 'Inhale 4s, hold 7s, exhale 8s — repeat 3 times', icon: '🫁' },
    { title: 'Box Breathing', desc: 'Equal counts of inhale, hold, exhale, hold', icon: '⬜' },
    { title: '5-Minute Calm Down', desc: 'Slow, deep breaths with gentle counting', icon: '🌬️' },
  ],
  social: [
    { title: 'Reach Out to a Friend', desc: 'A quick message to someone you trust', icon: '💬' },
    { title: 'Write a Thank-You Note', desc: 'Express gratitude to someone who matters', icon: '💌' },
    { title: 'Join a Community Activity', desc: 'Shared experiences can brighten your day', icon: '🏘️' },
  ],
  selfcare: [
    { title: 'Drink a Glass of Water', desc: 'Hydration affects how you feel more than you think', icon: '💧' },
    { title: 'Step Outside for Fresh Air', desc: 'Even 2 minutes of sunlight helps', icon: '☀️' },
    { title: 'Eat Something Nourishing', desc: 'A healthy meal is an act of self-care', icon: '🍎' },
    { title: 'Take a Warm Shower', desc: 'Reset your body and mind', icon: '🚿' },
  ],
};

/**
 * Analyze journal text and return a simple sentiment object.
 * This is a basic keyword-based approach; in production, use Azure OpenAI/NLP.
 */
export function analyzeJournalContent(content) {
  const text = (content || '').toLowerCase();
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  // Positive indicators
  const positiveWords = ['happy', 'good', 'great', 'better', 'smile', 'grateful', 'hopeful', 'peaceful',
    'calm', 'relaxed', 'enjoyed', 'fun', 'love', 'friend', 'helped', 'progress', 'achieved', 'proud'];
  // Concern indicators (NOT used for diagnosis, only for suggestion weighting)
  const concernWords = ['stressed', 'anxious', 'worried', 'tired', 'exhausted', 'lonely', 'sad',
    'overwhelmed', 'pressure', 'scared', 'angry', 'frustrated', 'sleep', 'insomnia', 'headache',
    'difficult', 'hard', 'struggle', 'crying', 'hurt'];

  let positiveCount = 0;
  let concernCount = 0;
  for (const w of positiveWords) if (text.includes(w)) positiveCount++;
  for (const w of concernWords) if (text.includes(w)) concernCount++;

  // Score: 0 (very concerning patterns) to 100 (very positive)
  const rawScore = wordCount === 0 ? 50 : Math.min(100, Math.max(0,
    50 + (positiveCount * 8) - (concernCount * 6)
  ));

  const level = rawScore >= 70 ? 'positive' : rawScore >= 40 ? 'neutral' : 'needs_support';

  return {
    score: rawScore,
    level,
    positiveIndicators: positiveCount,
    concernIndicators: concernCount,
    wordCount,
    analyzedAt: new Date().toISOString(),
  };
}

/**
 * Generate gentle AI suggestions based on journal content and doctor assessments.
 * NEVER diagnoses. ONLY suggests helpful habits.
 */
export function generateSuggestions(sentiment, doctorAssessments = []) {
  const suggestions = [];
  const score = sentiment?.score ?? 50;

  // Always include at least one breathing exercise
  suggestions.push(pickRandom(SUGGESTION_POOL.breathing));

  if (score < 40) {
    // More support needed — suggest calming activities
    suggestions.push(pickRandom(SUGGESTION_POOL.music));
    suggestions.push(pickRandom(SUGGESTION_POOL.selfcare));
    suggestions.push(pickRandom(SUGGESTION_POOL.article));
    suggestions.push(pickRandom(SUGGESTION_POOL.social));
  } else if (score < 70) {
    // Neutral — balanced suggestions
    suggestions.push(pickRandom(SUGGESTION_POOL.exercise));
    suggestions.push(pickRandom(SUGGESTION_POOL.article));
    suggestions.push(pickRandom(SUGGESTION_POOL.music));
  } else {
    // Positive — encourage continued habits
    suggestions.push(pickRandom(SUGGESTION_POOL.exercise));
    suggestions.push(pickRandom(SUGGESTION_POOL.social));
  }

  // If doctor has given assessments, weight toward relevant suggestions
  if (doctorAssessments.length > 0) {
    const latest = doctorAssessments[doctorAssessments.length - 1];
    if (latest.stressLevel >= 7) {
      suggestions.push(pickRandom(SUGGESTION_POOL.breathing));
    }
    if (latest.depressionScore >= 6) {
      suggestions.push(pickRandom(SUGGESTION_POOL.social));
      suggestions.push(pickRandom(SUGGESTION_POOL.selfcare));
    }
  }

  // Deduplicate by title
  const seen = new Set();
  const unique = suggestions.filter(s => {
    if (seen.has(s.title)) return false;
    seen.add(s.title);
    return true;
  });

  return {
    sentiment,
    suggestions: unique.slice(0, 5), // max 5 suggestions
    generatedAt: new Date().toISOString(),
    // Gentle encouragement message — NEVER a diagnosis
    message: getEncouragementMessage(score),
  };
}

/**
 * Determine if the AI should suggest meeting a doctor.
 * Based on pattern analysis over time, NOT a diagnosis.
 */
export function shouldSuggestConsultation(stats) {
  if (!stats) return { suggest: false };

  // Suggest if:
  // 1. Declining trend detected (last 7 days worse than previous 7)
  // 2. Very low average sentiment
  // 3. Has been journaling for at least 7 entries
  const reasons = [];

  if (stats.declining) {
    reasons.push('Your wellness patterns have shifted recently');
  }
  if (stats.avgSentiment !== null && stats.avgSentiment < 35) {
    reasons.push('Your journal entries suggest you might benefit from extra support');
  }
  if (stats.daysSinceLastEntry > 5 && stats.totalEntries > 10) {
    reasons.push('We noticed you haven\'t journaled in a while');
  }

  return {
    suggest: reasons.length > 0 && stats.totalEntries >= 7,
    // GENTLE message — never a diagnosis
    message: reasons.length > 0
      ? 'Your wellness journey shows you might benefit from connecting with a professional. Would you like to schedule a conversation?'
      : null,
    reasons,
  };
}

function getEncouragementMessage(score) {
  if (score >= 70) {
    const msgs = [
      'You\'re doing great! Keep up the positive habits. 🌟',
      'Your journal shows wonderful self-awareness. Keep going! 💪',
      'It\'s great to see your positive reflections today. 😊',
    ];
    return msgs[Math.floor(Math.random() * msgs.length)];
  }
  if (score >= 40) {
    const msgs = [
      'Thank you for journaling today. Every entry is a step forward. 🌱',
      'Taking time to reflect shows real strength. You\'re doing well. 🌿',
      'Some days are tougher than others — and that\'s completely okay. 💚',
    ];
    return msgs[Math.floor(Math.random() * msgs.length)];
  }
  // Gentle support — NEVER a diagnosis
  const msgs = [
    'We hear you. Consider trying one of these gentle activities today. 💛',
    'Thank you for sharing. Small steps can make a real difference. 🌻',
    'You\'re not alone in this. Here are some things that might help. 🤗',
  ];
  return msgs[Math.floor(Math.random() * msgs.length)];
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORE_PATH = path.resolve(__dirname, '../../data/journals.json');

function readStore() {
  try {
    if (!fs.existsSync(STORE_PATH)) {
      fs.writeFileSync(STORE_PATH, '[]', 'utf-8');
      return [];
    }
    return JSON.parse(fs.readFileSync(STORE_PATH, 'utf-8'));
  } catch {
    return [];
  }
}

function writeStore(data) {
  fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// Journal entry types
export const ENTRY_TYPES = ['text', 'voice', 'wearable', 'call'];

/**
 * Create a new journal entry.
 * Stored with anonymousId — never the user's real name.
 */
export function createJournalEntry({ userId, anonymousId, type, content, voiceMetrics, wearableData, sentiment }) {
  const entries = readStore();

  const entry = {
    id: uuidv4(),
    journalId: `JE-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    userId,          // internal only — never exposed to doctors
    anonymousId,     // this is what doctors see (e.g., JRN-A7X3)
    type: ENTRY_TYPES.includes(type) ? type : 'text',
    content: content || '',
    voiceMetrics: voiceMetrics || null,       // { jitter, pitch, energy, speechRate }
    wearableData: wearableData || null,       // { heartRate, sleepHours, steps, stressLevel }
    sentiment: sentiment || null,             // AI-computed after creation
    aiSuggestions: [],                        // populated by AI engine
    doctorAssessments: [],                    // populated by doctor reviews
    createdAt: new Date().toISOString(),
    declineNote: null,                        // if user declined scheduled call
  };

  entries.push(entry);
  writeStore(entries);
  return entry;
}

/**
 * Get journals for a patient (by userId — for patient's own view)
 */
export function getJournalsByUserId(userId, limit = 50) {
  const entries = readStore();
  return entries
    .filter(e => e.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit);
}

/**
 * Get journals by anonymous ID — this is what DOCTORS see.
 * No real user info is returned.
 */
export function getJournalsByAnonymousId(anonymousId, limit = 50) {
  const entries = readStore();
  return entries
    .filter(e => e.anonymousId === anonymousId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit)
    .map(sanitizeForDoctor);
}

/**
 * Get a single journal entry by its ID
 */
export function getJournalById(id) {
  const entries = readStore();
  return entries.find(e => e.id === id) || null;
}

/**
 * List all unique anonymous IDs that have journal entries (for doctor queue)
 */
export function listAnonymousJournalPatients() {
  const entries = readStore();
  const map = new Map();

  for (const entry of entries) {
    if (!entry.anonymousId) continue;
    const existing = map.get(entry.anonymousId);
    if (!existing || new Date(entry.createdAt) > new Date(existing.latestEntry)) {
      map.set(entry.anonymousId, {
        anonymousId: entry.anonymousId,
        totalEntries: (existing?.totalEntries || 0) + (existing ? 0 : 0),
        latestEntry: entry.createdAt,
        types: new Set(existing?.types || []),
      });
    }
  }

  // Rebuild with correct counts
  const result = [];
  for (const [anonId, _] of map) {
    const patientEntries = entries.filter(e => e.anonymousId === anonId);
    const types = [...new Set(patientEntries.map(e => e.type))];
    const assessed = patientEntries.filter(e => e.doctorAssessments && e.doctorAssessments.length > 0).length;
    result.push({
      anonymousId: anonId,
      totalEntries: patientEntries.length,
      assessedEntries: assessed,
      unassessedEntries: patientEntries.length - assessed,
      latestEntry: patientEntries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]?.createdAt,
      entryTypes: types,
    });
  }

  return result.sort((a, b) => new Date(b.latestEntry) - new Date(a.latestEntry));
}

/**
 * Add AI suggestions to a journal entry
 */
export function addAiSuggestions(entryId, suggestions) {
  const entries = readStore();
  const idx = entries.findIndex(e => e.id === entryId);
  if (idx === -1) return null;
  entries[idx].aiSuggestions = suggestions;
  entries[idx].sentiment = suggestions.sentiment || entries[idx].sentiment;
  writeStore(entries);
  return entries[idx];
}

/**
 * Add a doctor assessment to a journal entry
 */
export function addDoctorAssessment(entryId, assessment) {
  const entries = readStore();
  const idx = entries.findIndex(e => e.id === entryId);
  if (idx === -1) return null;
  entries[idx].doctorAssessments.push({
    id: uuidv4(),
    ...assessment,
    createdAt: new Date().toISOString(),
  });
  writeStore(entries);
  return sanitizeForDoctor(entries[idx]);
}

/**
 * Update sentiment on a journal entry (after AI analysis)
 */
export function updateSentiment(entryId, sentiment) {
  const entries = readStore();
  const idx = entries.findIndex(e => e.id === entryId);
  if (idx === -1) return null;
  entries[idx].sentiment = sentiment;
  writeStore(entries);
  return entries[idx];
}

/**
 * Get aggregated stats for a patient (for AI decline detection)
 */
export function getPatientJournalStats(anonymousId) {
  const entries = readStore().filter(e => e.anonymousId === anonymousId);
  if (!entries.length) return null;

  const recent30 = entries
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 30);

  const sentiments = recent30
    .filter(e => e.sentiment && typeof e.sentiment.score === 'number')
    .map(e => e.sentiment.score);

  const avgSentiment = sentiments.length
    ? sentiments.reduce((a, b) => a + b, 0) / sentiments.length
    : null;

  // Detect decline: if last 7 entries average is lower than previous 7
  const last7 = sentiments.slice(0, 7);
  const prev7 = sentiments.slice(7, 14);
  const last7Avg = last7.length ? last7.reduce((a, b) => a + b, 0) / last7.length : null;
  const prev7Avg = prev7.length ? prev7.reduce((a, b) => a + b, 0) / prev7.length : null;
  const declining = last7Avg !== null && prev7Avg !== null && last7Avg < prev7Avg * 0.85;

  return {
    anonymousId,
    totalEntries: entries.length,
    recentEntries: recent30.length,
    avgSentiment,
    last7DayAvg: last7Avg,
    prev7DayAvg: prev7Avg,
    declining,
    latestEntry: entries[0]?.createdAt,
    daysSinceLastEntry: Math.floor((Date.now() - new Date(entries[0]?.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
  };
}

/**
 * Strip userId from entries before sending to doctor — they only see anonymousId.
 */
function sanitizeForDoctor(entry) {
  const { userId, ...safe } = entry;
  return safe;
}

export type { CheckinInput, CheckinResponse, EscalationRecord, PredictiveInsights, SmsPayloadResult, TrendPoint, JournalAnalysis, ChatResponse } from "./types";

export type ScreenKey = "copilot" | "checkin" | "signals" | "insights" | "clinician" | "privacy" | "milestones" | "vault" | "community" | "wipelog" | "triage" | "alerts" | "compliance" | "journal" | "settings" | "booking";
export type LanguageCode = "en" | "ne" | "hi";
export type Personality = "calm" | "analytical" | "motivational";

export type MemoryItem = {
  id: string;
  createdAt: string;
  userMessage: string;
  copilotSummary: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
};

export type Preferences = {
  language: LanguageCode;
  personality: Personality;
  notificationsEnabled: boolean;
  offlineMode: boolean;
  lowBandwidthMode: boolean;
  locationTag: string;
  calendarLoad: "light" | "moderate" | "heavy";
};

export const defaultPreferences: Preferences = {
  language: "en",
  personality: "calm",
  notificationsEnabled: true,
  offlineMode: false,
  lowBandwidthMode: false,
  locationTag: "Kathmandu",
  calendarLoad: "moderate"
};

export const USER_ID = "demo-user-nepal";
export const MEMORY_KEY = "aegisspeak_memory_v2";
export const CHAT_KEY = "aegisspeak_chat_v1";
export const PREFS_KEY = "aegisspeak_prefs_v1";

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function getLanguageLabel(language: LanguageCode): string {
  if (language === "ne") return "नेपाली";
  if (language === "hi") return "हिन्दी";
  return "English";
}

export function getPersonalityLabel(p: Personality): string {
  if (p === "analytical") return "Analytical";
  if (p === "motivational") return "Motivational";
  return "Calm";
}

export function riskColor(score: number): string {
  if (score >= 70) return "#f87171";
  if (score >= 40) return "#fbbf24";
  return "#34d399";
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleString();
}

export function getJournalEmotion(text: string): string {
  const lower = text.toLowerCase();
  const heavy = ["hopeless", "panic", "overwhelmed", "alone", "burnout", "die", "suicide", "hurt"];
  const positive = ["grateful", "better", "hopeful", "calm", "progress", "happy", "good"];
  if (heavy.some((t) => lower.includes(t))) return "distress";
  if (positive.some((t) => lower.includes(t))) return "positive";
  return "neutral";
}

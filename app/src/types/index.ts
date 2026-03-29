// Type definitions for AegisSpeak application

export type RiskLevel = "low" | "moderate" | "high";
export type ScreenKey = "dashboard" | "copilot" | "checkin" | "career" | "support" | "voice" | "screening" | "signals" | "insights" | "clinician" | "privacy" | "milestones" | "vault" | "community" | "wipelog" | "triage" | "alerts" | "compliance" | "journal" | "settings" | "booking" | "admin" | "ccall" | "legacy";
export type LanguageCode = "en" | "ne" | "hi";
export type Personality = "calm" | "analytical" | "motivational";
export type UxMode = "calm" | "full";

export interface CheckinInput {
  userId: string;
  mood: number;
  anxiety: number;
  stress: number;
  sleepHours: number;
  phoneUsageHours: number;
  typingSpeedDelta: number;
  speechRateWpm: number;
  pauseRatio: number;
  jitter: number;
  sentiment: number;
  crisisSignals: string[];
  journalText: string;
}

export interface CheckinResponse {
  checkinId: string;
  risk: {
    score: number;
    riskLevel: RiskLevel;
  };
  trend: {
    trend: string;
    delta: number;
  };
  interventions: string[];
  escalation: boolean;
  clinicalSummary: {
    impression: string;
    highlights: string[];
    recommendedPlan: string;
    escalation: boolean;
  };
  journalAnalysis: JournalAnalysis | null;
  auditHash: string;
  deletedRawAudio: boolean;
}

export interface JournalAnalysis {
  emotion: string;
  sentiment: number;
  keywords: string[];
  cbtSuggestion: string;
}

export interface TrendPoint {
  timestamp: string;
  mood: number;
  score: number;
}

export interface PredictiveInsights {
  burnoutRisk: "unknown" | "low" | "moderate" | "high";
  depressionRisk: "unknown" | "low" | "moderate" | "high";
  confidence: number;
  narrative: string;
  next72hRiskScore: number | null;
}

export interface EscalationRecord {
  id: string;
  timestamp: string;
  userId: string;
  severity: string;
  reason: string;
  contacts: string[];
  acknowledged: boolean;
  auditHash: string;
}

export interface ChatResponse {
  reply: string;
  timestamp: string;
  powered: "gemini" | "template";
}

export interface SmsPayloadResult {
  sent: boolean;
  channel: string;
  payload: string;
  payloadLength: number;
  truncatedForSms: boolean;
  receiptHash: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
}

export interface MemoryItem {
  id: string;
  createdAt: string;
  userMessage: string;
  copilotSummary: string;
}

export interface Preferences {
  language: LanguageCode;
  personality: Personality;
  notificationsEnabled: boolean;
  offlineMode: boolean;
  lowBandwidthMode: boolean;
  locationTag: string;
  calendarLoad: "light" | "moderate" | "heavy";
}

export interface WearableData {
  heartRate: number;
  sleepHours: number;
  steps: number;
  stressLevel: number;
  recordedAt?: string;
  source?: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  riskScore: number;
  riskLevel: RiskLevel;
  lastCheckin?: string;
  avatar?: string;
  mood?: number;
  anxiety?: number;
  vitalsHistory?: Array<{ time: string; anxiety: number; sleep: number }>;
  recoverySignals?: Array<{ label: string; value: number }>;
  medications?: string[];
  treatmentDays?: number;
  checkinFrequency?: number;
  voiceSummary?: string;
  liveAlert?: string;
}

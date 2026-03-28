export type RiskLevel = "low" | "moderate" | "high";

export type CheckinInput = {
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
};

export type JournalAnalysis = {
  emotion: string;
  sentiment: number;
  keywords: string[];
  cbtSuggestion: string;
};

export type CheckinResponse = {
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
};

export type TrendPoint = {
  timestamp: string;
  mood: number;
  score: number;
};

export type PredictiveInsights = {
  burnoutRisk: "unknown" | "low" | "moderate" | "high";
  depressionRisk: "unknown" | "low" | "moderate" | "high";
  confidence: number;
  narrative: string;
  next72hRiskScore: number | null;
};

export type SmsPayloadResult = {
  sent: boolean;
  channel: string;
  payload: string;
  payloadLength: number;
  truncatedForSms: boolean;
  receiptHash: string;
};

export type EscalationRecord = {
  id: string;
  timestamp: string;
  userId: string;
  severity: string;
  reason: string;
  contacts: string[];
  acknowledged: boolean;
  auditHash: string;
};

export type ChatResponse = {
  reply: string;
  timestamp: string;
  powered: "gemini" | "template";
};

// ─── New types ───────────────────────────────────

export type WearableData = {
  heartRate: number;
  sleepHours: number;
  steps: number;
  stressLevel: number;
  recordedAt?: string;
  source?: string;
};

export type AiSuggestion = {
  category: "music" | "article" | "exercise" | "breathing" | "social" | "selfcare";
  title: string;
  desc: string;
  icon: string;
};

export type AiAnalysis = {
  suggestions: AiSuggestion[];
  encouragement: string;
  declining: boolean;
  declineMessage: string | null;
  trendSummary: string;
  generatedAt: string;
  source: "gemini" | "fallback";
};

export type JournalEntry = {
  id: string;
  journalId: string;
  anonymousId: string;
  type: "text" | "voice" | "wearable" | "call";
  content: string;
  audioUrl: string | null;
  wearableData: WearableData | null;
  sentiment: {
    score: number;
    level: "positive" | "neutral" | "needs_support";
    positiveIndicators: number;
    concernIndicators: number;
  } | null;
  aiSuggestions: any;
  createdAt: string;
  checkinDecline: { reason: string; declinedAt: string } | null;
};

export type Appointment = {
  id: string;
  anonymousPatientId: string;
  requestedAt: string;
  scheduledAt: string | null;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  consultationFee: number;
  paymentStatus: "unpaid" | "paid" | "refunded";
  paymentRef: string | null;
  confirmedAt: string | null;
};

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  role: "super_admin" | "doctor" | "patient" | "guardian" | "chv";
  anonymousId: string | null;
  doctorCode: string | null;
  doctorType: string | null;
  wearableConnected: boolean;
  checkinSchedule: { hour: number; minute: number; timezone: string } | null;
  paymentVerified: boolean;
  subscriptionStatus: string | null;
};

export type AvailableDoctor = {
  doctorCode: string;
  doctorType: string;
  isActive: boolean;
  consultationFee: number;
};


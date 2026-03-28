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

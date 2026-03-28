import {
  ChatResponse,
  CheckinInput,
  CheckinResponse,
  EscalationRecord,
  JournalAnalysis,
  PredictiveInsights,
  SmsPayloadResult,
  TrendPoint
} from "./types";

const API_BASE =
  (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env
    ?.EXPO_PUBLIC_API_BASE || "http://localhost:4000";

type ApiEnvelope<T> = {
  ok?: boolean;
  data?: T;
  error?: {
    code?: string;
    message?: string;
  };
};

async function parseApiResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  let parsed: ApiEnvelope<T> | T | null = null;
  try {
    parsed = await response.json();
  } catch {
    parsed = null;
  }

  if (!response.ok) {
    const envelope = parsed as ApiEnvelope<T>;
    const message = envelope?.error?.message || `${fallbackMessage}: ${response.status}`;
    throw new Error(message);
  }

  const envelope = parsed as ApiEnvelope<T>;
  if (envelope && typeof envelope === "object" && "data" in envelope && envelope.data) {
    return envelope.data;
  }

  return parsed as T;
}

export async function submitCheckin(payload: CheckinInput): Promise<CheckinResponse> {
  const response = await fetch(`${API_BASE}/api/checkins`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  return parseApiResponse<CheckinResponse>(response, "Check-in failed");
}

export async function fetchTrends(userId: string): Promise<TrendPoint[]> {
  const response = await fetch(`${API_BASE}/api/users/${userId}/trends`);
  const data = await parseApiResponse<{ points: TrendPoint[] }>(response, "Trend fetch failed");
  return data.points || [];
}

export async function fetchRecords(userId: string): Promise<any[]> {
  const response = await fetch(`${API_BASE}/api/users/${userId}/records`);
  const data = await parseApiResponse<{ records: any[] }>(response, "Record fetch failed");
  return data.records || [];
}

export async function fetchPredictiveInsights(userId: string): Promise<PredictiveInsights> {
  const response = await fetch(`${API_BASE}/api/users/${userId}/insights`);
  const data = await parseApiResponse<{ insights: PredictiveInsights }>(response, "Insights fetch failed");
  return data.insights;
}

export async function sendSmsFallback(payload: {
  userId: string;
  riskScore: number;
  riskLevel: string;
  escalation: boolean;
}): Promise<SmsPayloadResult> {
  const response = await fetch(`${API_BASE}/api/transport/sms`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  return parseApiResponse<SmsPayloadResult>(response, "SMS fallback failed");
}

export async function createEscalation(payload: {
  userId: string;
  severity: string;
  reason: string;
  contacts: string[];
}): Promise<{ escalationId: string; record: EscalationRecord }> {
  const response = await fetch(`${API_BASE}/api/escalations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  return parseApiResponse<{ escalationId: string; record: EscalationRecord }>(response, "Escalation create failed");
}

export async function fetchEscalations(userId: string): Promise<EscalationRecord[]> {
  const response = await fetch(`${API_BASE}/api/users/${userId}/escalations`);
  const data = await parseApiResponse<{ records: EscalationRecord[] }>(response, "Escalation fetch failed");
  return data.records || [];
}

export async function sendChatMessage(payload: {
  message: string;
  mood: number;
  anxiety: number;
  stress: number;
  sleepHours: number;
  riskScore?: number;
  riskLevel?: string;
  personality: string;
  language: string;
  memoryContext: Array<{ userMessage: string; copilotSummary: string }>;
  journalEmotion: string;
}): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  return parseApiResponse<ChatResponse>(response, "Chat failed");
}

export async function analyzeJournal(text: string): Promise<JournalAnalysis> {
  const response = await fetch(`${API_BASE}/api/journal/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  });

  const data = await parseApiResponse<{ analysis: JournalAnalysis }>(response, "Journal analysis failed");
  return data.analysis;
}

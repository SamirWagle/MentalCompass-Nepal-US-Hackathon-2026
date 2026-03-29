import type { CheckinInput, CheckinResponse, EscalationRecord, PredictiveInsights, SmsPayloadResult, TrendPoint, ChatResponse } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

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

  return parseApiResponse<{ escalationId: string; record: EscalationRecord }>(response, "Escalation failed");
}

export async function fetchEscalations(userId: string): Promise<EscalationRecord[]> {
  const response = await fetch(`${API_BASE}/api/escalations?userId=${userId}`);
  const data = await parseApiResponse<{ escalations: EscalationRecord[] }>(response, "Escalation fetch failed");
  return data.escalations || [];
}

export async function sendChatMessage(payload: { userId: string; message: string }): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  return parseApiResponse<ChatResponse>(response, "Chat failed");
}

export async function authenticateUser(credentials: { email: string; password: string }): Promise<{ token: string; userId: string }> {
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials)
  });

  return parseApiResponse<{ token: string; userId: string }>(response, "Login failed");
}

export async function getHealth(): Promise<{ status: string }> {
  const response = await fetch(`${API_BASE}/health`);
  return parseApiResponse<{ status: string }>(response, "Health check failed");
}

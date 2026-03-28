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

// ─── Auth ───────────────────────────────────────

export async function loginUser(email: string, password: string): Promise<{ token: string; user: any }> {
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return parseApiResponse<{ token: string; user: any }>(response, "Login failed");
}

export async function getCurrentUser(token: string): Promise<{ user: any }> {
  const response = await fetch(`${API_BASE}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseApiResponse<{ user: any }>(response, "Auth check failed");
}

// ─── Journals (authenticated) ───────────────────

export async function createJournalEntry(payload: {
  type: string;
  content?: string;
  wearableData?: any;
  voiceMetrics?: any;
}, token: string): Promise<any> {
  const response = await fetch(`${API_BASE}/api/journals`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseApiResponse<any>(response, "Journal create failed");
}

export async function fetchMyJournals(token: string): Promise<any> {
  const response = await fetch(`${API_BASE}/api/journals/mine`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseApiResponse<any>(response, "Journal fetch failed");
}

export async function declineConsultation(reason: string, token: string): Promise<any> {
  const response = await fetch(`${API_BASE}/api/journals/decline-consult`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ reason }),
  });
  return parseApiResponse<any>(response, "Decline consultation failed");
}

export async function declineCheckin(reason: string, token: string): Promise<any> {
  const response = await fetch(`${API_BASE}/api/journals/decline-checkin`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ reason }),
  });
  return parseApiResponse<any>(response, "Decline check-in failed");
}

// ─── Wearable ───────────────────────────────────

export async function syncWearable(data: {
  heartRate: number;
  sleepHours: number;
  steps: number;
  stressLevel: number;
}, token: string): Promise<any> {
  const response = await fetch(`${API_BASE}/api/wearables/sync`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return parseApiResponse<any>(response, "Wearable sync failed");
}

export async function disconnectWearable(token: string): Promise<any> {
  const response = await fetch(`${API_BASE}/api/wearables/sync`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseApiResponse<any>(response, "Wearable disconnect failed");
}

// ─── Settings ───────────────────────────────────

export async function updateCheckinSchedule(schedule: { hour: number; minute: number; timezone?: string }, token: string): Promise<any> {
  const response = await fetch(`${API_BASE}/api/settings/checkin-schedule`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(schedule),
  });
  return parseApiResponse<any>(response, "Schedule update failed");
}

export async function fetchMySettings(token: string): Promise<any> {
  const response = await fetch(`${API_BASE}/api/settings/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseApiResponse<any>(response, "Settings fetch failed");
}

// ─── AI Analysis ────────────────────────────────

export async function requestMyAiAnalysis(token: string): Promise<any> {
  const response = await fetch(`${API_BASE}/api/ai/my-analysis`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: "{}",
  });
  return parseApiResponse<any>(response, "AI analysis failed");
}

// ─── Appointments ────────────────────────────────

export async function fetchAvailableDoctors(token: string): Promise<any> {
  const response = await fetch(`${API_BASE}/api/appointments/available-doctors`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseApiResponse<any>(response, "Doctor fetch failed");
}

export async function requestAppointment(payload: { doctorCode: string; scheduledAt?: string }, token: string): Promise<any> {
  const response = await fetch(`${API_BASE}/api/appointments`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseApiResponse<any>(response, "Appointment request failed");
}

export async function fetchMyAppointments(token: string): Promise<any> {
  const response = await fetch(`${API_BASE}/api/appointments/mine`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseApiResponse<any>(response, "Appointments fetch failed");
}

// ─── Payments ───────────────────────────────────

export async function payForAppointment(appointmentId: string, token: string): Promise<any> {
  const response = await fetch(`${API_BASE}/api/payments/appointment/${appointmentId}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: "{}",
  });
  return parseApiResponse<any>(response, "Payment failed");
}

export async function payDoctorSubscription(token: string): Promise<any> {
  const response = await fetch(`${API_BASE}/api/payments/mock-checkout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: "{}",
  });
  return parseApiResponse<any>(response, "Subscription payment failed");
}

// ─── Admin ───────────────────────────────────────

export async function fetchAdminAnalytics(token: string): Promise<any> {
  const response = await fetch(`${API_BASE}/api/admin/analytics`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseApiResponse<any>(response, "Analytics fetch failed");
}

// ─── CHV / Doctor ────────────────────────────────

export async function fetchDoctorQueue(token: string): Promise<any> {
  const response = await fetch(`${API_BASE}/api/doctor/queue`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseApiResponse<any>(response, "Doctor queue fetch failed");
}

export async function fetchDoctorJournals(anonymousId: string, token: string): Promise<any> {
  const response = await fetch(`${API_BASE}/api/doctor/journals/${anonymousId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseApiResponse<any>(response, "Journal fetch failed");
}

export async function submitDoctorAssessment(entryId: string, payload: {
  depressionScore: number;
  stressLevel: number;
  anxietyLevel: number;
  clinicalNotes?: string;
  recommendsConsultation?: boolean;
}, token: string): Promise<any> {
  const response = await fetch(`${API_BASE}/api/doctor/assess/${entryId}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseApiResponse<any>(response, "Assessment submit failed");
}

export async function fetchChvMyPatients(token: string): Promise<any> {
  const response = await fetch(`${API_BASE}/api/chv/my-patients`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseApiResponse<any>(response, "CHV patients fetch failed");
}

export async function chvCreatePatient(payload: {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}, token: string): Promise<any> {
  const response = await fetch(`${API_BASE}/api/chv/create-patient`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseApiResponse<any>(response, "CHV create patient failed");
}


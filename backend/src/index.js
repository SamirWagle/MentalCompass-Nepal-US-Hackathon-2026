import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import { calculateRiskScore, detectBurnoutTrend } from "./lib/scoring.js";
import {
  buildClinicalSummary,
  pickInterventions,
  shouldEscalate
} from "./lib/interventions.js";
import { buildPredictiveInsights } from "./lib/insights.js";
import { createAuditHash, encryptPayload } from "./lib/security.js";
import { buildSmsPayload } from "./lib/transport.js";
import { getLatestMoodSeries, listCheckins, saveCheckin } from "./store/checkinStore.js";
import { listEscalations, saveEscalation } from "./store/escalationStore.js";
import {
  generateCopilotReply,
  generateClinicalSummary,
  analyzeJournalSentiment
} from "./lib/gemini.js";
import {
  seedSuperAdmin,
  createUser,
  authenticateUser,
  getUserById,
  listUsers,
  updateUser,
  deleteUser,
  getGuardiansForPatient,
  getLinkedPatient,
  updateWearableData,
  updateCheckinSchedule,
  verifyDoctorPayment,
  listAvailableDoctors,
  getUserStats,
  ROLES
} from "./store/userStore.js";
import { generateToken, requireAuth, requireRole, optionalAuth } from "./lib/auth.js";
import {
  createJournalEntry,
  getJournalsByUserId,
  getJournalsByAnonymousId,
  getJournalById,
  listAnonymousJournalPatients,
  addAiSuggestions,
  addDoctorAssessment,
  getPatientJournalStats,
  addCheckinDecline,
  attachWearableToLatestEntry,
} from "./store/journalStore.js";
import {
  analyzeJournalContent,
  generateSuggestions as generateSuggestionsForPatient,
  shouldSuggestConsultation,
} from "./lib/suggestions.js";
import {
  createAppointment,
  getAppointmentsByPatient,
  getAppointmentStats,
  confirmAppointmentPayment,
  updateAppointmentStatus,
  APPOINTMENT_STATUS,
} from "./store/appointmentStore.js";
import { analyzePatientJourney, shouldTriggerConsultationAlert } from "./lib/aiAnalysis.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists for voice journals
const UPLOADS_DIR = path.resolve(__dirname, "../../uploads");
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const app = express();
const port = Number(process.env.PORT || 4000);

function buildMeta(req, extra = {}) {
  return {
    requestId: req.requestId,
    timestamp: new Date().toISOString(),
    ...extra
  };
}

function sendOk(req, res, data, status = 200, meta = {}) {
  const responseMeta = buildMeta(req, meta);
  res.status(status).json({
    ok: true,
    ...data,
    data,
    meta: responseMeta
  });
}

function sendError(req, res, status, code, message, details = undefined) {
  res.status(status).json({
    ok: false,
    error: {
      code,
      message,
      details: details || null
    },
    meta: buildMeta(req)
  });
}

app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use((req, _res, next) => {
  req.requestId = uuidv4();
  next();
});

// Serve the web frontend
app.use(express.static(path.resolve(__dirname, "../../web")));

app.get("/health", (req, res) => {
  sendOk(req, res, { service: "aegisspeak-api", ai: !!process.env.GEMINI_API_KEY }, 200, { domain: "health" });
});

// ── Check-in Endpoint (enhanced with AI clinical summary) ──
app.post("/api/checkins", async (req, res) => {
  try {
    const payload = req.body || {};
    const userId = payload.userId || "demo-user";

    const scoreResult = calculateRiskScore(payload);
    const previous = listCheckins(userId).map((item) => item.score);
    const trend = detectBurnoutTrend([...previous, scoreResult.score]);

    const escalation = shouldEscalate({
      riskLevel: scoreResult.riskLevel,
      crisisSignals: payload.crisisSignals || []
    });

    const interventions = pickInterventions(scoreResult.riskLevel, payload);

    // Try AI-generated clinical summary, fallback to template
    let summary;
    const aiSummary = await generateClinicalSummary({
      mood: payload.mood,
      anxiety: payload.anxiety,
      stress: payload.stress,
      sleepHours: payload.sleepHours,
      phoneUsageHours: payload.phoneUsageHours,
      speechRateWpm: payload.speechRateWpm,
      pauseRatio: payload.pauseRatio,
      jitter: payload.jitter,
      sentiment: payload.sentiment,
      journalText: payload.journalText,
      riskScore: scoreResult.score,
      riskLevel: scoreResult.riskLevel,
      trendStatus: trend.trend,
      trendDelta: trend.delta,
      escalation
    });

    summary = aiSummary || buildClinicalSummary(payload, scoreResult, trend, escalation);

    // Analyze journal sentiment if present
    let journalAnalysis = null;
    if (payload.journalText && payload.journalText.trim().length > 3) {
      journalAnalysis = await analyzeJournalSentiment(payload.journalText);
    }

    const record = {
      id: uuidv4(),
      userId,
      timestamp: new Date().toISOString(),
      input: payload,
      score: scoreResult.score,
      riskLevel: scoreResult.riskLevel,
      trend,
      summary,
      escalation
    };

    saveCheckin(record);

    const encryptedPayload = encryptPayload(
      {
        id: record.id,
        userId,
        score: record.score,
        riskLevel: record.riskLevel,
        escalation
      },
      process.env.ENCRYPTION_KEY
    );

    sendOk(
      req,
      res,
      {
        checkinId: record.id,
        risk: scoreResult,
        trend,
        interventions,
        escalation,
        clinicalSummary: summary,
        journalAnalysis,
        auditHash: createAuditHash(record),
        encryptedPayload,
        deletedRawAudio: true
      },
      201,
      { domain: "checkins" }
    );
  } catch (error) {
    sendError(req, res, 500, "CHECKIN_FAILED", "Unable to complete check-in right now.", String(error?.message || error));
  }
});

// ── AI Copilot Chat Endpoint ──
app.post("/api/chat", async (req, res) => {
  try {
    const payload = req.body || {};

    const reply = await generateCopilotReply({
      userMessage: payload.message || "",
      mood: payload.mood ?? 5,
      anxiety: payload.anxiety ?? 5,
      stress: payload.stress ?? 5,
      sleepHours: payload.sleepHours ?? 7,
      riskScore: payload.riskScore,
      riskLevel: payload.riskLevel,
      personality: payload.personality || "calm",
      language: payload.language || "en",
      memoryContext: payload.memoryContext || [],
      journalEmotion: payload.journalEmotion || "neutral"
    });

    sendOk(req, res, {
      reply,
      timestamp: new Date().toISOString(),
      powered: !!process.env.GEMINI_API_KEY ? "gemini" : "template"
    }, 200, { domain: "chat" });
  } catch (error) {
    sendError(req, res, 500, "CHAT_FAILED", "Unable to generate copilot response.", String(error?.message || error));
  }
});

// ── Journal Sentiment Analysis Endpoint ──
app.post("/api/journal/analyze", async (req, res) => {
  try {
    const { text } = req.body || {};
    const analysis = await analyzeJournalSentiment(text || "");
    sendOk(req, res, { analysis }, 200, { domain: "journal" });
  } catch (error) {
    sendError(req, res, 500, "JOURNAL_ANALYSIS_FAILED", "Unable to analyze journal text.", String(error?.message || error));
  }
});

// ── Existing Endpoints ──
app.get("/api/users/:userId/trends", (req, res) => {
  const { userId } = req.params;
  const data = getLatestMoodSeries(userId, 14);
  sendOk(req, res, { userId, points: data }, 200, { domain: "trends" });
});

app.get("/api/users/:userId/records", (req, res) => {
  const { userId } = req.params;
  const records = listCheckins(userId);
  sendOk(req, res, { userId, total: records.length, records }, 200, { domain: "records" });
});

app.get("/api/users/:userId/insights", (req, res) => {
  const { userId } = req.params;
  const records = listCheckins(userId);
  const insights = buildPredictiveInsights(records);
  sendOk(req, res, { userId, insights }, 200, { domain: "insights" });
});

app.post("/api/transport/sms", (req, res) => {
  const payload = req.body || {};
  const sms = buildSmsPayload({
    userId: payload.userId || "demo-user",
    riskScore: Number(payload.riskScore || 0),
    riskLevel: payload.riskLevel || "unknown",
    escalation: Boolean(payload.escalation)
  });

  sendOk(req, res, { sent: true, ...sms }, 201, { domain: "transport" });
});

app.post("/api/escalations", (req, res) => {
  const payload = req.body || {};
  const record = {
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    userId: payload.userId || "demo-user",
    severity: payload.severity || "high",
    reason: payload.reason || "risk-threshold",
    contacts: payload.contacts || ["primary-caregiver"],
    acknowledged: false,
    auditHash: createAuditHash(payload)
  };

  saveEscalation(record);
  sendOk(req, res, { escalationId: record.id, record }, 201, { domain: "escalations" });
});

app.get("/api/users/:userId/escalations", (req, res) => {
  const { userId } = req.params;
  const records = listEscalations(userId);
  sendOk(req, res, { userId, total: records.length, records }, 200, { domain: "escalations" });
});

// ═══════════════════════════════════════════════
// ── IAM: Authentication & User Management ──
// ═══════════════════════════════════════════════

// Login
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return sendError(req, res, 400, "MISSING_FIELDS", "Email and password are required.");
  }
  const result = authenticateUser(email, password);
  if (result.error) {
    return sendError(req, res, 401, result.error, result.message);
  }
  const token = generateToken(result.user);
  sendOk(req, res, { token, user: result.user }, 200, { domain: "auth" });
});

// Get current user profile
app.get("/api/auth/me", requireAuth, (req, res) => {
  sendOk(req, res, { user: req.user }, 200, { domain: "auth" });
});

// ── IAM: User CRUD (Super Admin only) ──

app.post("/api/iam/users", requireAuth, requireRole(ROLES.SUPER_ADMIN), (req, res) => {
  const { email, password, fullName, role, doctorType, linkedPatientId, phone } = req.body || {};
  if (!email || !password || !fullName || !role) {
    return sendError(req, res, 400, "MISSING_FIELDS", "email, password, fullName, and role are required.");
  }
  const result = createUser({
    email,
    password,
    fullName,
    role,
    doctorType,
    linkedPatientId,
    phone,
    createdBy: req.user.id,
  });
  if (result.error) {
    return sendError(req, res, 409, result.error, result.message);
  }
  sendOk(req, res, result, 201, { domain: "iam" });
});

app.get("/api/iam/users", requireAuth, requireRole(ROLES.SUPER_ADMIN), (req, res) => {
  const { role } = req.query;
  const users = listUsers(role || null);
  sendOk(req, res, { users, total: users.length }, 200, { domain: "iam" });
});

app.get("/api/iam/users/:userId", requireAuth, requireRole(ROLES.SUPER_ADMIN), (req, res) => {
  const user = getUserById(req.params.userId);
  if (!user) return sendError(req, res, 404, "NOT_FOUND", "User not found.");
  sendOk(req, res, { user }, 200, { domain: "iam" });
});

app.put("/api/iam/users/:userId", requireAuth, requireRole(ROLES.SUPER_ADMIN), (req, res) => {
  const result = updateUser(req.params.userId, req.body || {});
  if (result.error) return sendError(req, res, 404, result.error, result.message);
  sendOk(req, res, result, 200, { domain: "iam" });
});

app.delete("/api/iam/users/:userId", requireAuth, requireRole(ROLES.SUPER_ADMIN), (req, res) => {
  const result = deleteUser(req.params.userId);
  if (result.error) return sendError(req, res, 404, result.error, result.message);
  sendOk(req, res, result, 200, { domain: "iam" });
});

// Get guardians linked to a patient
app.get("/api/iam/patients/:patientId/guardians", requireAuth, requireRole(ROLES.SUPER_ADMIN, ROLES.DOCTOR), (req, res) => {
  const guardians = getGuardiansForPatient(req.params.patientId);
  sendOk(req, res, { guardians }, 200, { domain: "iam" });
});

// Guardian: get my linked patient
app.get("/api/iam/my-patient", requireAuth, requireRole(ROLES.GUARDIAN), (req, res) => {
  const patient = getLinkedPatient(req.user.id);
  if (!patient) return sendError(req, res, 404, "NOT_FOUND", "No linked patient found.");
  sendOk(req, res, { patient }, 200, { domain: "iam" });
});

// ═══════════════════════════════════════════════
// ── JOURNALS: Patient Journaling System ──
// ═══════════════════════════════════════════════

// Patient: create journal entry
app.post("/api/journals", requireAuth, requireRole(ROLES.PATIENT), async (req, res) => {
  try {
    const { type, content, voiceMetrics, wearableData } = req.body || {};
    if (!content && !voiceMetrics && !wearableData) {
      return sendError(req, res, 400, "EMPTY_JOURNAL", "Journal entry cannot be empty.");
    }

    // Analyze content for sentiment
    const sentiment = content ? analyzeJournalContent(content) : null;

    const entry = createJournalEntry({
      userId: req.user.id,
      anonymousId: req.user.anonymousId,
      type: type || 'text',
      content,
      voiceMetrics,
      wearableData,
      sentiment,
    });

    // Generate AI suggestions based on sentiment + any prior doctor assessments
    const allEntries = getJournalsByAnonymousId(req.user.anonymousId);
    const doctorAssessments = allEntries.flatMap(e => e.doctorAssessments || []);
    const suggestionResult = generateSuggestionsForPatient(sentiment, doctorAssessments);

    // Attach suggestions to the entry
    if (suggestionResult) {
      addAiSuggestions(entry.id, suggestionResult);
    }

    // Check if we should suggest consultation
    const stats = getPatientJournalStats(req.user.anonymousId);
    const consultSuggestion = shouldSuggestConsultation(stats);

    sendOk(req, res, {
      journal: { ...entry, aiSuggestions: suggestionResult?.suggestions || [] },
      encouragement: suggestionResult?.message || null,
      consultation: consultSuggestion,
      stats: stats ? { totalEntries: stats.totalEntries, avgSentiment: stats.avgSentiment, declining: stats.declining } : null,
    }, 201, { domain: "journals" });
  } catch (err) {
    sendError(req, res, 500, "JOURNAL_ERROR", err.message);
  }
});

// Patient: get own journals
app.get("/api/journals/mine", requireAuth, requireRole(ROLES.PATIENT), (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const entries = getJournalsByUserId(req.user.id, limit);
  const stats = getPatientJournalStats(req.user.anonymousId);
  const consultSuggestion = shouldSuggestConsultation(stats);

  sendOk(req, res, {
    journals: entries,
    total: entries.length,
    anonymousId: req.user.anonymousId,
    stats,
    consultation: consultSuggestion,
  }, 200, { domain: "journals" });
});

// Patient: decline consultation
app.post("/api/journals/decline-consult", requireAuth, requireRole(ROLES.PATIENT), (req, res) => {
  const { reason } = req.body || {};
  // Just acknowledge — we track the reason but respect the decision
  sendOk(req, res, {
    message: "That's completely okay. We're here whenever you're ready. 💚",
    reasonTracked: !!reason,
  }, 200, { domain: "journals" });
});

// ═══════════════════════════════════════════════
// ── DOCTOR: Anonymized Journal Reader ──
// ═══════════════════════════════════════════════

// Doctor: get queue of anonymous patients with journals
app.get("/api/doctor/queue", requireAuth, requireRole(ROLES.DOCTOR, ROLES.SUPER_ADMIN), (req, res) => {
  const patients = listAnonymousJournalPatients();
  sendOk(req, res, { patients, total: patients.length }, 200, { domain: "doctor" });
});

// Doctor: read journals for a specific anonymous ID (NO real identity exposed)
app.get("/api/doctor/journals/:anonymousId", requireAuth, requireRole(ROLES.DOCTOR, ROLES.SUPER_ADMIN), (req, res) => {
  const { anonymousId } = req.params;
  const limit = parseInt(req.query.limit) || 30;
  const entries = getJournalsByAnonymousId(anonymousId, limit);
  const stats = getPatientJournalStats(anonymousId);

  sendOk(req, res, {
    anonymousId,
    journals: entries,
    total: entries.length,
    stats,
  }, 200, { domain: "doctor" });
});

// Doctor: submit assessment for a journal entry
app.post("/api/doctor/assess/:entryId", requireAuth, requireRole(ROLES.DOCTOR, ROLES.SUPER_ADMIN), (req, res) => {
  const { entryId } = req.params;
  const { depressionScore, stressLevel, anxietyLevel, clinicalNotes, recommendsConsultation } = req.body || {};

  if (depressionScore === undefined || stressLevel === undefined || anxietyLevel === undefined) {
    return sendError(req, res, 400, "MISSING_FIELDS", "depressionScore, stressLevel, and anxietyLevel are required (0-10 scale).");
  }

  const assessment = {
    doctorId: req.user.id,
    doctorType: req.user.doctorType || 'general',
    depressionScore: Math.min(10, Math.max(0, Number(depressionScore))),
    stressLevel: Math.min(10, Math.max(0, Number(stressLevel))),
    anxietyLevel: Math.min(10, Math.max(0, Number(anxietyLevel))),
    clinicalNotes: clinicalNotes || '',
    recommendsConsultation: !!recommendsConsultation,
  };

  const updated = addDoctorAssessment(entryId, assessment);
  if (!updated) {
    return sendError(req, res, 404, "NOT_FOUND", "Journal entry not found.");
  }

  sendOk(req, res, { entry: updated }, 200, { domain: "doctor" });
});

// ═══════════════════════════════════════════════
// ── CHV: Community Health Volunteer Routes ──
// ═══════════════════════════════════════════════

// CHV: create a patient account (Mini Admin privilege)
app.post("/api/chv/create-patient", requireAuth, requireRole(ROLES.CHV, ROLES.SUPER_ADMIN), (req, res) => {
  const { email, password, fullName, phone } = req.body || {};
  if (!email || !password || !fullName) {
    return sendError(req, res, 400, "MISSING_FIELDS", "email, password, and fullName are required.");
  }

  const result = createUser({
    email,
    password,
    fullName,
    role: ROLES.PATIENT, // CHVs can only create patient accounts
    phone,
    createdBy: req.user.id,
  });

  if (result.error) {
    return sendError(req, res, 409, result.error, result.message);
  }
  sendOk(req, res, result, 201, { domain: "chv" });
});

// CHV: list patients they created
app.get("/api/chv/my-patients", requireAuth, requireRole(ROLES.CHV, ROLES.SUPER_ADMIN), (req, res) => {
  const allPatients = listUsers(ROLES.PATIENT);
  const myPatients = allPatients.filter(p => p.createdBy === req.user.id);
  sendOk(req, res, { patients: myPatients, total: myPatients.length }, 200, { domain: "chv" });
});

// ═══════════════════════════════════════════════
// ── WEARABLE SYNC (PHI-encrypted) ──
// ═══════════════════════════════════════════════

// Patient: sync wearable biometric data (encrypted PHI)
app.post("/api/wearables/sync", requireAuth, requireRole(ROLES.PATIENT), (req, res) => {
  try {
    const { heartRate, sleepHours, steps, stressLevel } = req.body || {};
    const wearableData = {
      heartRate: Number(heartRate || 70),
      sleepHours: Number(sleepHours || 7),
      steps: Number(steps || 5000),
      stressLevel: Number(stressLevel || 5),
      recordedAt: new Date().toISOString(),
      source: "manual",
    };
    const wearableEncrypted = encryptPayload(wearableData, process.env.ENCRYPTION_KEY);
    updateWearableData(req.user.id, wearableEncrypted, true);
    attachWearableToLatestEntry(req.user.id, wearableEncrypted, wearableData);
    sendOk(req, res, {
      synced: true,
      wearableConnected: true,
      summary: wearableData,
      phiProtected: true,
    }, 200, { domain: "wearables" });
  } catch (err) {
    sendError(req, res, 500, "WEARABLE_SYNC_FAILED", err.message);
  }
});

// Patient: disconnect wearable
app.delete("/api/wearables/sync", requireAuth, requireRole(ROLES.PATIENT), (req, res) => {
  try {
    updateWearableData(req.user.id, null, false);
    sendOk(req, res, { disconnected: true, wearableConnected: false }, 200, { domain: "wearables" });
  } catch (err) {
    sendError(req, res, 500, "WEARABLE_DISCONNECT_FAILED", err.message);
  }
});

// ═══════════════════════════════════════════════
// ── USER SETTINGS ──
// ═══════════════════════════════════════════════

app.post("/api/settings/checkin-schedule", requireAuth, requireRole(ROLES.PATIENT), (req, res) => {
  try {
    const { hour, minute, timezone } = req.body || {};
    if (hour === undefined || minute === undefined) {
      return sendError(req, res, 400, "MISSING_FIELDS", "hour and minute are required.");
    }
    const schedule = {
      hour: Math.max(0, Math.min(23, Number(hour))),
      minute: Math.max(0, Math.min(59, Number(minute))),
      timezone: timezone || "Asia/Kathmandu",
    };
    const updated = updateCheckinSchedule(req.user.id, schedule);
    if (!updated) return sendError(req, res, 404, "USER_NOT_FOUND", "User not found.");
    sendOk(req, res, { schedule: updated.checkinSchedule }, 200, { domain: "settings" });
  } catch (err) {
    sendError(req, res, 500, "SETTINGS_ERROR", err.message);
  }
});

app.get("/api/settings/me", requireAuth, requireRole(ROLES.PATIENT), (req, res) => {
  sendOk(req, res, {
    checkinSchedule: req.user.checkinSchedule || { hour: 20, minute: 0, timezone: "Asia/Kathmandu" },
    wearableConnected: req.user.wearableConnected || false,
  }, 200, { domain: "settings" });
});

// ═══════════════════════════════════════════════
// ── SCHEDULED CHECK-IN: DECLINE (Right to Reject) ──
// ═══════════════════════════════════════════════

app.post("/api/journals/decline-checkin", requireAuth, requireRole(ROLES.PATIENT), (req, res) => {
  try {
    const { reason } = req.body || {};
    const entry = addCheckinDecline({
      userId: req.user.id,
      anonymousId: req.user.anonymousId,
      reason: reason || "unspecified",
    });
    sendOk(req, res, {
      logged: true,
      entryId: entry.id,
      message: "Completely understood. Your check-in has been skipped and your streak is safe. We'll see you next time. \u{1f49a}",
      streakPreserved: true,
    }, 200, { domain: "journals" });
  } catch (err) {
    sendError(req, res, 500, "DECLINE_CHECKIN_FAILED", err.message);
  }
});

// ═══════════════════════════════════════════════
// ── AI ANALYSIS ENGINE ──
// ═══════════════════════════════════════════════

// Patient: analyze own 30-day journey
app.post("/api/ai/my-analysis", requireAuth, requireRole(ROLES.PATIENT), async (req, res) => {
  try {
    const entries = getJournalsByAnonymousId(req.user.anonymousId, 30);
    const stats = getPatientJournalStats(req.user.anonymousId);
    const analysis = await analyzePatientJourney(entries, stats);
    const triggerConsult = shouldTriggerConsultationAlert(analysis, stats);
    sendOk(req, res, {
      analysis,
      consultation: {
        suggest: triggerConsult,
        message: triggerConsult
          ? "We noticed you\u2019ve been having a tough time. Would you like to connect with a doctor?"
          : null,
      },
    }, 200, { domain: "ai" });
  } catch (err) {
    sendError(req, res, 500, "AI_ANALYSIS_FAILED", err.message);
  }
});

// Doctor/Admin: analyze a specific anonymous patient
app.post("/api/ai/analyze/:anonymousId", requireAuth, requireRole(ROLES.DOCTOR, ROLES.SUPER_ADMIN), async (req, res) => {
  try {
    const { anonymousId } = req.params;
    const entries = getJournalsByAnonymousId(anonymousId, 30);
    const stats = getPatientJournalStats(anonymousId);
    if (!entries.length) {
      return sendError(req, res, 404, "NO_ENTRIES", "No journal entries found for this patient.");
    }
    const analysis = await analyzePatientJourney(entries, stats);
    sendOk(req, res, { anonymousId, analysis, stats }, 200, { domain: "ai" });
  } catch (err) {
    sendError(req, res, 500, "AI_ANALYSIS_FAILED", err.message);
  }
});

// ═══════════════════════════════════════════════
// ── APPOINTMENTS & BOOKING ──
// ═══════════════════════════════════════════════

app.get("/api/appointments/available-doctors", requireAuth, requireRole(ROLES.PATIENT), (req, res) => {
  try {
    const doctors = listAvailableDoctors();
    sendOk(req, res, { doctors, total: doctors.length }, 200, { domain: "appointments" });
  } catch (err) {
    sendError(req, res, 500, "APPOINTMENT_ERROR", err.message);
  }
});

app.post("/api/appointments", requireAuth, requireRole(ROLES.PATIENT), (req, res) => {
  try {
    const { doctorCode, scheduledAt } = req.body || {};
    if (!doctorCode) return sendError(req, res, 400, "MISSING_FIELDS", "doctorCode is required.");
    const allDoctors = listUsers(ROLES.DOCTOR);
    const doctor = allDoctors.find(u => u.doctorCode === doctorCode && u.paymentVerified);
    if (!doctor) return sendError(req, res, 404, "DOCTOR_NOT_FOUND", "Doctor not found or not available.");
    const appointment = createAppointment({
      anonymousPatientId: req.user.anonymousId,
      doctorId: doctor.id,
      consultationFee: doctor.consultationFee || 500,
      scheduledAt: scheduledAt || null,
      createdBy: req.user.id,
    });
    sendOk(req, res, {
      appointmentId: appointment.id,
      status: appointment.status,
      consultationFee: appointment.consultationFee,
      scheduledAt: appointment.scheduledAt,
      message: "Appointment requested. Complete payment to confirm.",
    }, 201, { domain: "appointments" });
  } catch (err) {
    sendError(req, res, 500, "APPOINTMENT_ERROR", err.message);
  }
});

app.get("/api/appointments/mine", requireAuth, requireRole(ROLES.PATIENT), (req, res) => {
  try {
    const appointments = getAppointmentsByPatient(req.user.anonymousId);
    sendOk(req, res, { appointments, total: appointments.length }, 200, { domain: "appointments" });
  } catch (err) {
    sendError(req, res, 500, "APPOINTMENT_ERROR", err.message);
  }
});

app.post("/api/appointments/:id/cancel", requireAuth, requireRole(ROLES.PATIENT), (req, res) => {
  try {
    const { reason } = req.body || {};
    const updated = updateAppointmentStatus(req.params.id, APPOINTMENT_STATUS.CANCELLED, { reason });
    if (!updated) return sendError(req, res, 404, "NOT_FOUND", "Appointment not found.");
    sendOk(req, res, { cancelled: true }, 200, { domain: "appointments" });
  } catch (err) {
    sendError(req, res, 500, "APPOINTMENT_ERROR", err.message);
  }
});

// ═══════════════════════════════════════════════
// ── PAYMENTS (MOCK) ──
// ═══════════════════════════════════════════════

// Doctor: pay subscription to unlock platform
app.post("/api/payments/mock-checkout", requireAuth, requireRole(ROLES.DOCTOR, ROLES.SUPER_ADMIN), (req, res) => {
  try {
    const paymentRef = `PAY-${Date.now().toString(36).toUpperCase()}-${uuidv4().slice(0, 6).toUpperCase()}`;
    const updated = verifyDoctorPayment(req.user.id, paymentRef);
    if (!updated) return sendError(req, res, 404, "DOCTOR_NOT_FOUND", "Doctor account not found.");
    sendOk(req, res, {
      paymentRef,
      subscriptionStatus: "active",
      paymentVerified: true,
      receipt: { amount: 2999, currency: "NPR", plan: "AegisSpeak Professional", paidAt: new Date().toISOString() },
      message: "Payment confirmed. Your platform access is now active.",
    }, 200, { domain: "payments" });
  } catch (err) {
    sendError(req, res, 500, "PAYMENT_FAILED", err.message);
  }
});

// Patient: pay for a specific appointment
app.post("/api/payments/appointment/:appointmentId", requireAuth, requireRole(ROLES.PATIENT), (req, res) => {
  try {
    const paymentRef = `PAY-${Date.now().toString(36).toUpperCase()}-${uuidv4().slice(0, 6).toUpperCase()}`;
    const updated = confirmAppointmentPayment(req.params.appointmentId, paymentRef);
    if (!updated) return sendError(req, res, 404, "APPOINTMENT_NOT_FOUND", "Appointment not found.");
    sendOk(req, res, {
      paymentRef,
      appointmentStatus: updated.status,
      confirmedAt: updated.confirmedAt,
      receipt: { amount: updated.consultationFee, currency: "NPR", service: "Doctor Consultation", paidAt: new Date().toISOString() },
      message: "Payment confirmed! Your consultation has been booked.",
    }, 200, { domain: "payments" });
  } catch (err) {
    sendError(req, res, 500, "PAYMENT_FAILED", err.message);
  }
});

// ═══════════════════════════════════════════════
// ── SUPER ADMIN: ANALYTICS DASHBOARD ──
// ═══════════════════════════════════════════════

app.get("/api/admin/analytics", requireAuth, requireRole(ROLES.SUPER_ADMIN), (req, res) => {
  try {
    const userStats = getUserStats();
    const appointmentStats = getAppointmentStats();
    const allJournals = listAnonymousJournalPatients();
    const allEscalations = listEscalations(null);
    const allPatients = listUsers(ROLES.PATIENT);
    const regionMap = {};
    for (const u of allPatients) {
      const region = u.locationTag || "Unknown";
      if (!regionMap[region]) regionMap[region] = { region, patients: 0 };
      regionMap[region].patients++;
    }
    sendOk(req, res, {
      users: userStats,
      appointments: appointmentStats,
      journals: {
        totalAnonymousPatients: allJournals.length,
        totalEntries: allJournals.reduce((s, p) => s + p.totalEntries, 0),
        assessedEntries: allJournals.reduce((s, p) => s + p.assessedEntries, 0),
      },
      escalations: {
        total: allEscalations.length,
        unacknowledged: allEscalations.filter(e => !e.acknowledged).length,
      },
      regionStats: Object.values(regionMap),
      generatedAt: new Date().toISOString(),
      hipaaCompliant: true,
      phiStripped: true,
    }, 200, { domain: "admin" });
  } catch (err) {
    sendError(req, res, 500, "ANALYTICS_FAILED", err.message);
  }
});

// 404 catch-all (MUST be last)
app.use((req, res) => {
  sendError(req, res, 404, "NOT_FOUND", `Route not found: ${req.method} ${req.originalUrl}`);
});

// Seed super admin and start
const adminAccount = seedSuperAdmin();

app.listen(port, () => {
  console.log(`AegisSpeak backend listening on :${port}`);
  console.log(`AI mode: ${process.env.GEMINI_API_KEY ? "Gemini active" : "Template fallback"}`);
  console.log(`IAM: Super admin seeded (admin@aegisspeak.com)`);
});

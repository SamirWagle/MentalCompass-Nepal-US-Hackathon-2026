import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { v4 as uuidv4 } from "uuid";
import path from "path";
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
  ROLES
} from "./store/userStore.js";
import { generateToken, requireAuth, requireRole, optionalAuth } from "./lib/auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

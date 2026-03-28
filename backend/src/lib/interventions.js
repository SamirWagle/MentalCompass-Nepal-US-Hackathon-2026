const interventions = {
  low: [
    "30-second reset: unclench your jaw, lower shoulders, take 4 slow breaths.",
    "Micro-journal: write one thing that felt okay today.",
    "Hydration cue: drink water, then do one 60-second walk."
  ],
  moderate: [
    "Box breathing (60 sec): inhale 4s, hold 4s, exhale 4s, hold 4s.",
    "Grounding: name 5 things you can see, 4 touch, 3 hear, 2 smell, 1 taste.",
    "CBT thought check: write the worry, evidence for, evidence against, balanced thought."
  ],
  high: [
    "Immediate intervention: 4-7-8 breathing for 90 seconds.",
    "Reach out now: message a trusted contact with one sentence about your current state.",
    "Safety step: move to a quieter space, sip water, and avoid being alone right now."
  ]
};

export function shouldEscalate({ riskLevel, crisisSignals = [] }) {
  return riskLevel === "high" || crisisSignals.length > 0;
}

function pickCareerInterventions(payload = {}) {
  const items = [];
  if ((payload.deadlinePressure || 0) >= 7) {
    items.push("Deadline triage: write Top 3 must-do tasks, defer one noncritical task today.");
  }
  if ((payload.roleUncertainty || 0) >= 7) {
    items.push("Uncertainty reset: choose one 20-minute exploration action (mentor message, role research, or mock interview).");
  }
  if ((payload.financialStress || 0) >= 7) {
    items.push("Financial pressure step: identify one practical action within 24h (budget review, stipend inquiry, or support request).");
  }
  if ((payload.belongingSafety || 10) <= 4) {
    items.push("Belonging plan: connect with one psychologically safe person before ending the day.");
  }
  if (payload.stigmaSafePreferred) {
    items.push("Use stigma-safe wording: describe this as stress load and wellbeing support to lower social friction.");
  }
  return items;
}

export function pickInterventions(riskLevel, payload = {}) {
  const base = interventions[riskLevel] || interventions.low;
  const career = pickCareerInterventions(payload);
  return [...new Set([...base, ...career])].slice(0, 6);
}

export function buildClinicalSummary(payload, scoreResult, trend, escalation) {
  const { score, riskLevel } = scoreResult;
  const roleContext = payload.roleContext ? String(payload.roleContext) : "general";
  const deadline = Number(payload.deadlinePressure || 0);
  const uncertainty = Number(payload.roleUncertainty || 0);
  const financial = Number(payload.financialStress || 0);
  const belonging = Number(payload.belongingSafety || 0);
  const highCareerLoad = deadline >= 7 || uncertainty >= 7 || financial >= 7;
  const stigmaSafeNote = payload.stigmaSafePreferred
    ? "Language should emphasize stress load and wellbeing support to reduce stigma barriers."
    : "";

  return {
    impression: highCareerLoad
      ? `Risk level is ${riskLevel} (${score}/100) with elevated career-pressure signals in ${roleContext} context.`
      : `Risk level is ${riskLevel} with score ${score}/100.`,
    highlights: [
      `Mood: ${payload.mood}/10, Anxiety: ${payload.anxiety}/10, Stress: ${payload.stress}/10.`,
      `Career load — Deadline: ${deadline}/10, Uncertainty: ${uncertainty}/10, Financial: ${financial}/10, Belonging safety: ${belonging}/10.`,
      `Sleep: ${payload.sleepHours}h, Phone usage: ${payload.phoneUsageHours}h, Speech rate: ${payload.speechRateWpm} WPM.`,
      `Trend status: ${trend.trend} (delta ${trend.delta}).`,
      stigmaSafeNote
    ].filter(Boolean),
    recommendedPlan: riskLevel === "high"
      ? "Prioritize immediate clinician follow-up, activate trusted contact, and execute a same-day safety check."
      : highCareerLoad
        ? "Use a 72-hour career stabilization plan: one priority task, one recovery block, and one support check-in daily."
        : "Continue daily check-ins and CBT micro-interventions.",
    escalation
  };
}

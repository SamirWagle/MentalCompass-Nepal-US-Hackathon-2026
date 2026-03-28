const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export function calculateRiskScore(input) {
  const {
    mood = 5,
    anxiety = 5,
    stress = 5,
    deadlinePressure = 5,
    roleUncertainty = 5,
    financialStress = 4,
    belongingSafety = 6,
    sleepHours = 7,
    typingSpeedDelta = 0,
    phoneUsageHours = 3,
    speechRateWpm = 130,
    pauseRatio = 0.15,
    jitter = 0.02,
    sentiment = 0,
    crisisSignals = []
  } = input;

  const moodRisk = (10 - mood) * 6;
  const anxietyRisk = anxiety * 5;
  const stressRisk = stress * 5;
  const sleepRisk = clamp((7 - sleepHours) * 6, 0, 30);
  const typingRisk = clamp(Math.abs(typingSpeedDelta) * 20, 0, 20);
  const phoneUsageRisk = clamp((phoneUsageHours - 4) * 4, 0, 24);
  const speechRisk = clamp(Math.abs(130 - speechRateWpm) * 0.25, 0, 20);
  const pauseRisk = clamp((pauseRatio - 0.2) * 120, 0, 18);
  const jitterRisk = clamp((jitter - 0.02) * 500, 0, 20);
  const sentimentRisk = clamp((-sentiment + 0.1) * 35, 0, 25);
  const crisisRisk = crisisSignals.length > 0 ? 25 : 0;
  const deadlineRisk = clamp(deadlinePressure * 3.5, 0, 35);
  const uncertaintyRisk = clamp(roleUncertainty * 3.5, 0, 35);
  const financialRisk = clamp(financialStress * 3, 0, 30);
  const belongingRisk = clamp((10 - belongingSafety) * 2.5, 0, 25);

  const total =
    moodRisk +
    anxietyRisk +
    stressRisk +
    deadlineRisk +
    uncertaintyRisk +
    financialRisk +
    belongingRisk +
    sleepRisk +
    typingRisk +
    phoneUsageRisk +
    speechRisk +
    pauseRisk +
    jitterRisk +
    sentimentRisk +
    crisisRisk;

  const score = clamp(Math.round(total / 3.2), 0, 100);

  let riskLevel = "low";
  if (score >= 70) riskLevel = "high";
  else if (score >= 40) riskLevel = "moderate";

  return {
    score,
    riskLevel,
    components: {
      emotional: clamp((moodRisk + anxietyRisk + stressRisk) / 3, 0, 100),
      careerPressure: clamp((deadlineRisk + financialRisk) * 1.2, 0, 100),
      uncertainty: clamp(uncertaintyRisk * 2.2, 0, 100),
      socialSafety: clamp(belongingRisk * 2.5, 0, 100),
      behavioral: clamp((sleepRisk + typingRisk + phoneUsageRisk) * 1.4, 0, 100),
      voice: clamp((speechRisk + pauseRisk + jitterRisk) * 1.8, 0, 100)
    }
  };
}

export function detectBurnoutTrend(recentScores) {
  if (recentScores.length < 3) {
    return { trend: "insufficient-data", delta: 0 };
  }

  const window = recentScores.slice(-3);
  const delta = window[2] - window[0];

  if (delta >= 15) {
    return { trend: "worsening", delta };
  }
  if (delta <= -15) {
    return { trend: "improving", delta };
  }
  return { trend: "stable", delta };
}

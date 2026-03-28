const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export function buildPredictiveInsights(records) {
  if (!records || records.length === 0) {
    return {
      burnoutRisk: "unknown",
      depressionRisk: "unknown",
      confidence: 0,
      narrative: "Not enough data for prediction yet.",
      next72hRiskScore: null
    };
  }

  const recent = records.slice(-7);
  const meanRisk = recent.reduce((sum, item) => sum + item.score, 0) / recent.length;
  const slopeBase = recent.length > 1 ? recent[0].score : recent[recent.length - 1].score;
  const slope = recent[recent.length - 1].score - slopeBase;

  const burnoutIndex = clamp(Math.round(meanRisk * 0.7 + Math.max(0, slope) * 1.1), 0, 100);
  const depressionIndex = clamp(
    Math.round(
      meanRisk * 0.65 +
        recent.filter((item) => item.input?.mood <= 4).length * 5 +
        recent.filter((item) => item.input?.sleepHours < 6).length * 3
    ),
    0,
    100
  );

  const forecast = clamp(Math.round(meanRisk + slope * 0.45), 0, 100);

  const burnoutRisk = burnoutIndex >= 70 ? "high" : burnoutIndex >= 45 ? "moderate" : "low";
  const depressionRisk = depressionIndex >= 70 ? "high" : depressionIndex >= 45 ? "moderate" : "low";

  const confidence = clamp(Math.round((recent.length / 7) * 100), 0, 100);

  return {
    burnoutRisk,
    depressionRisk,
    confidence,
    next72hRiskScore: forecast,
    narrative:
      forecast >= 70
        ? "Model predicts elevated risk in the next 72 hours. Increase intervention frequency and clinician monitoring."
        : "Model predicts manageable short-term risk with continued daily check-ins and CBT routines."
  };
}

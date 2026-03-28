import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SectionCard } from "../components";
import { TrendPoint, PredictiveInsights, clamp, riskColor } from "../constants";
import { theme } from "../theme";

type Props = {
  trends: TrendPoint[];
  insights: PredictiveInsights | null;
  avatarXp: number;
};

export default function InsightsScreen({ trends, insights, avatarXp }: Props) {
  const moodSeries = trends.slice(-10);
  const trendDir = trends.length < 3 ? "insufficient-data"
    : (trends[trends.length - 1].score - trends[trends.length - 3].score) >= 10 ? "worsening"
    : (trends[trends.length - 1].score - trends[trends.length - 3].score) <= -10 ? "improving" : "stable";

  const trendLabel = trendDir === "worsening" ? "Worsening" : trendDir === "improving" ? "Improving" : "Stable";
  const avatarStage = avatarXp > 80 ? "Guardian" : avatarXp > 50 ? "Mentor" : "Sprout";

  return (
    <>
      <SectionCard title="Predictive Insights" subtitle="Early burnout and depression trend warnings">
        <Text style={s.body}>Trend: <Text style={{ fontWeight: "700" }}>{trendLabel}</Text></Text>
        <Text style={s.body}>72h forecast: risk expected to {trendDir === "worsening" ? "increase" : "stabilize"}</Text>
        <Text style={s.body}>Recommended intervention cadence: every 6 hours</Text>

        <View style={s.riskGrid}>
          <RiskCard label="Burnout" risk={insights?.burnoutRisk ?? "unknown"} />
          <RiskCard label="Depression" risk={insights?.depressionRisk ?? "unknown"} />
          <RiskCard label="Confidence" risk={`${insights?.confidence ?? 0}%`} />
        </View>

        <Text style={s.muted}>{insights?.narrative ?? "Connect to backend for predictive model."}</Text>
      </SectionCard>

      <SectionCard title="Mood Timeline" subtitle="Pattern recognition from daily check-ins">
        {moodSeries.length === 0 ? (
          <Text style={s.empty}>Complete check-ins to unlock trend visualization.</Text>
        ) : (
          <View style={s.chartWrap}>
            {moodSeries.map((pt) => {
              const barH = clamp(pt.mood * 10, 8, 100);
              return (
                <View key={pt.timestamp} style={s.chartCol}>
                  <View style={[s.chartBar, { height: barH, backgroundColor: riskColor(pt.score) }]} />
                  <Text style={s.chartLabel}>{new Date(pt.timestamp).getDate()}</Text>
                </View>
              );
            })}
          </View>
        )}
      </SectionCard>

      <SectionCard title="Emotional Companion" subtitle="AI avatar that evolves with your resilience">
        <Text style={s.avatarStage}>{avatarStage}</Text>
        <View style={s.xpTrack}>
          <View style={[s.xpFill, { width: `${avatarXp}%` }]} />
        </View>
        <Text style={s.muted}>Earn XP by completing daily check-ins and micro-interventions.</Text>
      </SectionCard>
    </>
  );
}

function RiskCard({ label, risk }: { label: string; risk: string }) {
  const color = risk === "high" ? theme.danger : risk === "moderate" ? theme.warning : risk === "low" ? theme.success : theme.textDim;
  return (
    <View style={s.riskCard}>
      <Text style={s.riskLabel}>{label}</Text>
      <Text style={[s.riskValue, { color }]}>{risk}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  body: { color: theme.text, marginBottom: 6, lineHeight: 20, fontSize: 14 },
  muted: { color: theme.textDim, fontSize: 12, marginTop: 8 },
  empty: { color: theme.textDim, fontStyle: "italic", textAlign: "center", paddingVertical: 20 },
  riskGrid: { flexDirection: "row", gap: 10, marginTop: 14, marginBottom: 8 },
  riskCard: { flex: 1, backgroundColor: theme.bgElevated, borderRadius: 14, padding: 14, alignItems: "center", borderWidth: 1, borderColor: theme.cardBorder },
  riskLabel: { color: theme.textMuted, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 },
  riskValue: { fontSize: 16, fontWeight: "800", marginTop: 4 },
  chartWrap: { flexDirection: "row", alignItems: "flex-end", gap: 6, minHeight: 120, marginTop: 8 },
  chartCol: { flex: 1, alignItems: "center" },
  chartBar: { width: "100%", maxWidth: 24, borderRadius: 8 },
  chartLabel: { color: theme.textDim, fontSize: 10, marginTop: 4 },
  avatarStage: { fontSize: 28, fontWeight: "800", color: theme.accent, textAlign: "center", marginBottom: 8 },
  xpTrack: { height: 10, borderRadius: 999, backgroundColor: theme.bgSecondary, overflow: "hidden" },
  xpFill: { height: "100%", borderRadius: 999, backgroundColor: theme.warning },
});

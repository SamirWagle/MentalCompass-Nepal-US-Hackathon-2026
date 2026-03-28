import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { HabitBar, SectionCard, SignalRow } from "../components";
import { CheckinInput, Preferences, clamp, riskColor } from "../constants";
import { theme } from "../theme";

type Props = {
  input: CheckinInput;
  preferences: Preferences;
};

export default function SignalsScreen({ input, preferences }: Props) {
  const typingVolatility = Math.round(Math.abs(input.typingSpeedDelta) * 100);
  const interactionDrift = clamp(Math.round(input.phoneUsageHours * 6 - input.sleepHours * 2), 0, 100);
  const stressNow = clamp(Math.round((input.stress * 9 + typingVolatility * 0.25 + interactionDrift * 0.2) / 1.2), 0, 100);
  const intervention = stressNow > 70 ? "Run a 60-second grounding intervention now." : "Current trajectory is stable. Continue monitoring.";

  const tension = clamp(Math.round((Math.abs(130 - input.speechRateWpm) + input.pauseRatio * 80 + input.jitter * 700) / 3), 0, 100);
  const tone = tension > 65 ? "Tense" : tension > 40 ? "Guarded" : "Steady";

  return (
    <>
      <SectionCard title="Passive Mood Detection" subtitle="Typing, phone usage, and interaction patterns">
        <SignalRow label="Typing Volatility" value={`${typingVolatility}%`} color={theme.warning} />
        <SignalRow label="Interaction Drift" value={`${interactionDrift}%`} color={theme.accent} />
        <SignalRow label="Live Stress Index" value={`${stressNow}%`} color={riskColor(stressNow)} />
        <View style={s.interventionBox}>
          <Text style={s.interventionText}>{intervention}</Text>
        </View>
      </SectionCard>

      <SectionCard title="Voice Biomarker Analysis" subtitle="Acoustic emotion detection via edge processing">
        <Text style={s.body}>Tone: <Text style={{ fontWeight: "700", color: theme.accent }}>{tone}</Text></Text>
        <View style={s.tensionTrack}>
          <View style={[s.tensionFill, { width: `${tension}%`, backgroundColor: riskColor(tension) }]} />
        </View>
        <Text style={s.muted}>Vocal tension index: {tension}% — processed on-device, audio purged</Text>

        <View style={s.biomarkerGrid}>
          <View style={s.bioBox}>
            <Text style={s.bioValue}>{input.speechRateWpm}</Text>
            <Text style={s.bioLabel}>WPM</Text>
          </View>
          <View style={s.bioBox}>
            <Text style={s.bioValue}>{input.pauseRatio}</Text>
            <Text style={s.bioLabel}>Pause Ratio</Text>
          </View>
          <View style={s.bioBox}>
            <Text style={s.bioValue}>{input.jitter}</Text>
            <Text style={s.bioLabel}>Jitter</Text>
          </View>
        </View>
      </SectionCard>

      <SectionCard title="Habit & Behavior Tracking" subtitle="Sleep, workload, and digital balance markers">
        <HabitBar label="Sleep Hygiene" value={clamp(Math.round((input.sleepHours / 8) * 100), 0, 100)} />
        <HabitBar label="Workload Balance" value={preferences.calendarLoad === "heavy" ? 35 : preferences.calendarLoad === "moderate" ? 62 : 78} />
        <HabitBar label="Digital Overload" value={clamp(100 - Math.round(input.phoneUsageHours * 6), 0, 100)} />
      </SectionCard>
    </>
  );
}

const s = StyleSheet.create({
  body: { color: theme.text, marginBottom: 8, fontSize: 14 },
  muted: { color: theme.textDim, fontSize: 12, marginTop: 6 },
  interventionBox: { backgroundColor: theme.accentDim, borderRadius: 12, padding: 12, marginTop: 8, alignItems: "center", borderWidth: 1, borderColor: "rgba(10,132,255,0.2)" },
  interventionText: { color: theme.accent, fontWeight: "700", fontSize: 14 },
  tensionTrack: { height: 10, borderRadius: 999, backgroundColor: theme.bgSecondary, overflow: "hidden", marginVertical: 8 },
  tensionFill: { height: "100%", borderRadius: 999 },
  biomarkerGrid: { flexDirection: "row", gap: 10, marginTop: 14 },
  bioBox: { flex: 1, backgroundColor: theme.bgElevated, borderRadius: 14, padding: 14, alignItems: "center", borderWidth: 1, borderColor: theme.cardBorder },
  bioValue: { color: theme.accent, fontSize: 22, fontWeight: "800" },
  bioLabel: { color: theme.textMuted, fontSize: 11, marginTop: 4, textTransform: "uppercase" },
});

import React from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { ChoiceChip, MetricStepper, SectionCard, SmallInputRow } from "../components";
import { CheckinInput, CheckinResponse, clamp, getJournalEmotion, riskColor } from "../constants";
import { theme } from "../theme";

type Props = {
  input: CheckinInput;
  setInput: React.Dispatch<React.SetStateAction<CheckinInput>>;
  result: CheckinResponse | null;
  loadingCheckin: boolean;
  onRunCheckin: () => void;
  onTriggerEmergency: () => void;
};

export default function CheckinScreen({ input, setInput, result, loadingCheckin, onRunCheckin, onTriggerEmergency }: Props) {
  const journalEmotion = getJournalEmotion(input.journalText);
  const emotionLabel = journalEmotion === "distress" ? "High distress" : journalEmotion === "positive" ? "Positive" : "Neutral";

  function updateField(field: keyof CheckinInput, value: number) {
    setInput((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <>
      <SectionCard title="Daily Check-In" subtitle="Mood, behavior, and voice biomarker inputs">
        <MetricStepper label="Mood" value={input.mood} min={1} max={10} onChange={(v) => updateField("mood", v)} />
        <MetricStepper label="Anxiety" value={input.anxiety} min={1} max={10} onChange={(v) => updateField("anxiety", v)} />
        <MetricStepper label="Stress" value={input.stress} min={1} max={10} onChange={(v) => updateField("stress", v)} />
        <MetricStepper label="Sleep (Hours)" value={input.sleepHours} min={0} max={12} onChange={(v) => updateField("sleepHours", v)} />
        <MetricStepper label="Phone Usage (Hours)" value={input.phoneUsageHours} min={0} max={16} onChange={(v) => updateField("phoneUsageHours", v)} />

        <Text style={s.sectionLabel}>Voice Biomarkers</Text>
        <SmallInputRow label="Speech Rate (WPM)" value={String(input.speechRateWpm)} onChangeText={(t) => updateField("speechRateWpm", clamp(Number(t) || 0, 60, 220))} />
        <SmallInputRow label="Pause Ratio" value={String(input.pauseRatio)} onChangeText={(t) => updateField("pauseRatio", clamp(Number(t) || 0, 0, 1))} />
        <SmallInputRow label="Vocal Jitter" value={String(input.jitter)} onChangeText={(t) => updateField("jitter", clamp(Number(t) || 0, 0, 0.2))} />
        <SmallInputRow label="Sentiment (-1 to 1)" value={String(input.sentiment)} onChangeText={(t) => updateField("sentiment", clamp(Number(t) || 0, -1, 1))} />

        <Text style={s.sectionLabel}>Guided Journaling</Text>
        <TextInput style={s.journal} multiline value={input.journalText}
          onChangeText={(t) => setInput((p) => ({ ...p, journalText: t }))}
          placeholder="Write freely. Copilot will detect emotional patterns and suggest CBT actions."
          placeholderTextColor={theme.textDim}
        />

        <Pressable style={[s.primaryBtn, loadingCheckin && { opacity: 0.6 }]} onPress={onRunCheckin} disabled={loadingCheckin}>
          <Text style={s.primaryBtnText}>{loadingCheckin ? "Analyzing..." : "Run Predictive Analysis"}</Text>
        </Pressable>
      </SectionCard>

      <SectionCard title="Journal Emotion Analysis" subtitle="Automatic pattern recognition">
        <Text style={s.body}>Detected state: <Text style={{ fontWeight: "700", color: theme.accent }}>{emotionLabel}</Text></Text>
        <Text style={s.body}>CBT action: Challenge one automatic negative thought with concrete evidence.</Text>
      </SectionCard>

      <SectionCard title="Micro-Interventions" subtitle="30-60 second coping exercises">
        <View style={s.rowWrap}>
          <ChoiceChip label="4-4-4 Breathing" active onPress={() => Alert.alert("Breathing", "Inhale 4s, hold 4s, exhale 4s. Repeat for 3 cycles.")} />
          <ChoiceChip label="5-4-3-2-1 Grounding" active onPress={() => Alert.alert("Grounding", "Name 5 things you see, 4 touch, 3 hear, 2 smell, 1 taste.")} />
          <ChoiceChip label="Thought Reframe" active onPress={() => Alert.alert("Reframe", "Write the worry, evidence for it, evidence against it, then a balanced thought.")} />
        </View>
      </SectionCard>

      {result && (
        <SectionCard title="Real-Time Risk Assessment" subtitle="AI-powered risk scoring and intervention">
          <Text style={[s.bigMetric, { color: riskColor(result.risk.score) }]}>{result.risk.score}/100</Text>
          <Text style={s.body}>Risk Level: <Text style={{ fontWeight: "700" }}>{result.risk.riskLevel.toUpperCase()}</Text></Text>
          <Text style={s.body}>Trend: {result.trend.trend} (Δ {result.trend.delta})</Text>
          <Text style={s.body}>Escalation: {result.escalation ? "Yes" : "No"}</Text>
          {result.interventions.map((item, i) => <Text key={i} style={s.bullet}>• {item}</Text>)}
          <Text style={s.muted}>{result.clinicalSummary.impression}</Text>
        </SectionCard>
      )}

      <SectionCard title="Crisis Detection" subtitle="Emergency escalation system">
        <Text style={s.body}>If severe risk is detected, the app triggers immediate emergency contact escalation.</Text>
        <Pressable style={s.dangerBtn} onPress={onTriggerEmergency}>
          <Text style={s.dangerBtnText}>Trigger Emergency Escalation</Text>
        </Pressable>
      </SectionCard>
    </>
  );
}

const s = StyleSheet.create({
  sectionLabel: { marginTop: 14, marginBottom: 8, color: theme.accent, fontWeight: "700", fontSize: 15 },
  journal: { borderWidth: 1, borderColor: theme.cardBorder, borderRadius: 14, minHeight: 100, padding: 14, color: theme.text, backgroundColor: theme.bgElevated, textAlignVertical: "top", fontSize: 14 },
  primaryBtn: { marginTop: 16, backgroundColor: theme.accent, borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  primaryBtnText: { color: theme.white, fontWeight: "700", fontSize: 15 },
  dangerBtn: { backgroundColor: "#b91c1c", borderRadius: 14, paddingVertical: 13, alignItems: "center", marginTop: 8 },
  dangerBtnText: { color: "#fef2f2", fontWeight: "800", fontSize: 14 },
  body: { color: theme.text, marginBottom: 6, lineHeight: 20, fontSize: 14 },
  muted: { color: theme.textDim, fontSize: 12, marginTop: 6 },
  bullet: { color: theme.text, marginBottom: 5, lineHeight: 20, fontSize: 14 },
  bigMetric: { fontSize: 40, fontWeight: "800", marginBottom: 8, textAlign: "center" },
  rowWrap: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
});

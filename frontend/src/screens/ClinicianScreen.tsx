import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SectionCard } from "../components";
import { CheckinResponse, formatDate, riskColor } from "../constants";
import { theme } from "../theme";

type Props = {
  records: any[];
  result: CheckinResponse | null;
  onRefresh: () => void;
};

export default function ClinicianScreen({ records, result, onRefresh }: Props) {
  return (
    <>
      <SectionCard title="Clinician Dashboard" subtitle="Remote triage + AI-generated clinical summaries">
        {records.length === 0 ? (
          <Text style={s.empty}>No clinical records synced yet.</Text>
        ) : (
          records.map((rec) => (
            <View key={rec.id} style={s.record}>
              <View style={s.recordHeader}>
                <Text style={s.recordDate}>{formatDate(rec.timestamp)}</Text>
                <View style={[s.badge, { backgroundColor: riskColor(rec.score) + "22" }]}>
                  <Text style={[s.badgeText, { color: riskColor(rec.score) }]}>{rec.riskLevel?.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={s.recordScore}>Risk: {rec.score}/100</Text>
              <Text style={s.body}>{rec.summary?.impression}</Text>
              {rec.escalation && <Text style={s.escalationTag}>Escalation flagged</Text>}
            </View>
          ))
        )}
        <Pressable style={s.refreshBtn} onPress={onRefresh}>
          <Text style={s.refreshBtnText}>Refresh Feed</Text>
        </Pressable>
      </SectionCard>

      <SectionCard title="Latest Clinical Notes" subtitle="AI-generated structured summary (RAG-ready)">
        {result ? (
          <>
            <Text style={s.impression}>{result.clinicalSummary.impression}</Text>
            {result.clinicalSummary.highlights.map((line, i) => (
              <Text key={i} style={s.bullet}>• {line}</Text>
            ))}
            <View style={s.planBox}>
              <Text style={s.planLabel}>RECOMMENDED PLAN</Text>
              <Text style={s.planText}>{result.clinicalSummary.recommendedPlan}</Text>
            </View>
          </>
        ) : (
          <Text style={s.empty}>Run a patient check-in to generate clinical notes.</Text>
        )}
      </SectionCard>
    </>
  );
}

const s = StyleSheet.create({
  empty: { color: theme.textDim, fontStyle: "italic", textAlign: "center", paddingVertical: 20 },
  record: { borderWidth: 1, borderColor: theme.cardBorder, borderRadius: 14, padding: 14, marginBottom: 10, backgroundColor: theme.bgElevated },
  recordHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  recordDate: { color: theme.textMuted, fontSize: 12, fontWeight: "600" },
  badge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: "800", letterSpacing: 0.5 },
  recordScore: { color: theme.accent, fontWeight: "700", fontSize: 15, marginBottom: 4 },
  body: { color: theme.text, marginBottom: 4, lineHeight: 20, fontSize: 14 },
  escalationTag: { color: theme.danger, fontWeight: "700", fontSize: 13, marginTop: 6 },
  refreshBtn: { marginTop: 12, borderWidth: 1, borderColor: theme.accent, borderRadius: 12, paddingVertical: 11, alignItems: "center" },
  refreshBtnText: { color: theme.accent, fontWeight: "700" },
  impression: { color: theme.text, fontSize: 15, fontWeight: "600", lineHeight: 22, marginBottom: 10 },
  bullet: { color: theme.text, marginBottom: 5, lineHeight: 20, fontSize: 14 },
  planBox: { backgroundColor: theme.accentDim, borderRadius: 12, padding: 14, marginTop: 12 },
  planLabel: { color: theme.accent, fontSize: 10, fontWeight: "800", letterSpacing: 1, marginBottom: 6 },
  planText: { color: theme.text, fontSize: 14, lineHeight: 20 },
});

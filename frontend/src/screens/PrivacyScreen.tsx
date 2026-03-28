import React from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { SectionCard, ToggleRow } from "../components";
import {
  CheckinResponse, EscalationRecord, MemoryItem, Preferences, SmsPayloadResult,
  formatDate, getLanguageLabel
} from "../constants";
import { theme } from "../theme";

type Props = {
  preferences: Preferences;
  onPersistPrefs: (p: Preferences) => Promise<void>;
  result: CheckinResponse | null;
  smsPayload: SmsPayloadResult | null;
  onRunSmsFallback: () => void;
  memory: MemoryItem[];
  escalations: EscalationRecord[];
};

export default function PrivacyScreen({ preferences, onPersistPrefs, result, smsPayload, onRunSmsFallback, memory, escalations }: Props) {
  return (
    <>
      <SectionCard title="Privacy-First Architecture" subtitle="Zero-trust, on-device processing, encrypted payloads">
        <ToggleRow label="Offline Support Mode" value={preferences.offlineMode}
          onChange={(v) => void onPersistPrefs({ ...preferences, offlineMode: v })} />
        <ToggleRow label="Low-Bandwidth Mode" value={preferences.lowBandwidthMode}
          onChange={(v) => void onPersistPrefs({ ...preferences, lowBandwidthMode: v })} />

        <View style={s.specGrid}>
          <SpecItem icon="🎤" label="Raw Audio" value="Purged on-device" />
          <SpecItem icon="🧠" label="Inference" value="Edge-first" />
          <SpecItem icon="🔐" label="Encryption" value="AES-256-GCM" />
          <SpecItem icon="📋" label="Audit Trail" value="SHA-256 hash" />
        </View>

        <Pressable style={s.smsBtn} onPress={onRunSmsFallback}>
          <Text style={s.smsBtnText}>Generate SMS/USSD Fallback Payload</Text>
        </Pressable>

        {smsPayload && (
          <View style={s.payloadBox}>
            <Text style={s.payloadTitle}>Encrypted Transport Snapshot</Text>
            <Text style={s.body}>Channel: {smsPayload.channel}</Text>
            <Text style={s.body}>SMS truncated: {smsPayload.truncatedForSms ? "Yes" : "No"}</Text>
            <Text style={s.mono}>{smsPayload.payload}</Text>
          </View>
        )}
      </SectionCard>

      <SectionCard title="Multi-Language Support" subtitle="Localized for low-resource environments">
        <Text style={s.body}>Active: {getLanguageLabel(preferences.language)}</Text>
        <Text style={s.body}>Available: English, नेपाली, हिन्दी</Text>
        <Text style={s.muted}>Works offline. Syncs when network returns.</Text>
      </SectionCard>

      <SectionCard title="Security Audit Log" subtitle="Cryptographic compliance proof">
        {memory.length === 0 ? (
          <Text style={s.empty}>No audit entries yet.</Text>
        ) : (
          memory.slice(0, 5).map((item) => (
            <View key={item.id} style={s.auditItem}>
              <Text style={s.auditDate}>{formatDate(item.createdAt)}</Text>
              <Text style={s.body}>{item.copilotSummary}</Text>
              <Text style={s.muted}>Data locality: on-device snapshot</Text>
            </View>
          ))
        )}

        <Text style={s.sectionLabel}>Escalation Events</Text>
        {escalations.length === 0 ? (
          <Text style={s.empty}>No escalation events logged.</Text>
        ) : (
          escalations.map((ev) => (
            <View key={ev.id} style={s.auditItem}>
              <Text style={s.auditDate}>{formatDate(ev.timestamp)}</Text>
              <Text style={s.body}>Severity: <Text style={{ color: theme.danger, fontWeight: "700" }}>{ev.severity}</Text></Text>
              <Text style={s.body}>Reason: {ev.reason}</Text>
              <Text style={s.muted}>Contacts: {ev.contacts.join(", ")}</Text>
            </View>
          ))
        )}
      </SectionCard>
    </>
  );
}

function SpecItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={s.specItem}>
      <Text style={s.specIcon}>{icon}</Text>
      <Text style={s.specLabel}>{label}</Text>
      <Text style={s.specValue}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  body: { color: theme.text, marginBottom: 4, fontSize: 14, lineHeight: 20 },
  muted: { color: theme.textDim, fontSize: 12, marginTop: 2 },
  empty: { color: theme.textDim, fontStyle: "italic", textAlign: "center", paddingVertical: 16 },
  sectionLabel: { color: theme.accent, fontWeight: "700", fontSize: 14, marginTop: 16, marginBottom: 8 },
  specGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginVertical: 14 },
  specItem: { width: "47%", backgroundColor: theme.bgElevated, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: theme.cardBorder },
  specIcon: { fontSize: 20, marginBottom: 6 },
  specLabel: { color: theme.textMuted, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 },
  specValue: { color: theme.accent, fontSize: 14, fontWeight: "700", marginTop: 2 },
  smsBtn: { borderWidth: 1, borderColor: theme.accent, borderRadius: 12, paddingVertical: 12, alignItems: "center", marginTop: 4 },
  smsBtnText: { color: theme.accent, fontWeight: "700", fontSize: 14 },
  payloadBox: { backgroundColor: theme.bgElevated, borderRadius: 14, padding: 14, marginTop: 12, borderWidth: 1, borderColor: theme.cardBorder },
  payloadTitle: { color: theme.accent, fontWeight: "700", marginBottom: 8, fontSize: 13 },
  mono: { color: theme.textDim, fontSize: 10, fontFamily: "monospace", marginTop: 6 },
  auditItem: { borderWidth: 1, borderColor: theme.cardBorder, borderRadius: 12, padding: 12, marginBottom: 8, backgroundColor: theme.bgElevated },
  auditDate: { color: theme.accent, fontWeight: "600", fontSize: 12, marginBottom: 4 },
});

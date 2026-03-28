import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { SectionCard, SignalRow } from "../components";
import { theme } from "../theme";

// Inline SVG gauge since react-native-svg may not be available
function GaugeRing({ value, color, label }: { value: number; color: string; label: string }) {
  const circumference = 2 * Math.PI * 34;
  const offset = circumference - (circumference * value / 100);

  return (
    <View style={s.gaugeWrap}>
      <View style={s.gaugeRing}>
        <View style={s.gaugeCircleBg} />
        <View style={[s.gaugeFillMask]}>
          <View style={[s.gaugeCircleFill, { width: `${value}%`, backgroundColor: color }]} />
        </View>
        <View style={s.gaugeCenter}>
          <Text style={[s.gaugeValue, { color }]}>{value}%</Text>
        </View>
      </View>
      <Text style={s.gaugeLabel}>{label}</Text>
    </View>
  );
}

export default function ComplianceScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <SectionCard title="✅ Compliance Monitor" subtitle="HIPAA · GDPR · Zero-Trust Architecture">
        <View style={s.gaugesRow}>
          <GaugeRing value={100} color={theme.success} label="HIPAA" />
          <GaugeRing value={98} color={theme.accent} label="Encryption" />
          <GaugeRing value={100} color={theme.success} label="Retention" />
        </View>
      </SectionCard>

      <SectionCard title="Encryption Health" subtitle="Real-time cryptographic status">
        {[
          ['AES-256-GCM', 'Active', theme.success],
          ['TLS 1.3', 'Active', theme.success],
          ['Key Rotation', '6 hours ago', theme.success],
          ['Certificate', 'Valid (364d)', theme.success],
          ['Edge Encryption', 'On-device', theme.success],
        ].map(([name, status, color], i) => (
          <SignalRow key={i} label={`✅ ${name}`} value={status as string} color={color as string} />
        ))}
      </SectionCard>

      <SectionCard title="Retention Schedule" subtitle="Data lifecycle policy">
        {[
          ['Audio Recordings', 'Immediate purge'],
          ['Biomarker Features', '24 hours'],
          ['Check-in Data', '90 days'],
          ['Clinical Summaries', '365 days'],
          ['Anonymized Aggregates', 'Indefinite'],
          ['Audit Logs', '7 years (HIPAA)'],
        ].map(([t, p], i) => (
          <View key={i} style={s.retRow}>
            <Text style={s.retType}>{t}</Text>
            <Text style={s.retPeriod}>{p}</Text>
          </View>
        ))}
      </SectionCard>

      <SectionCard title="Compliance Audit Trail" subtitle="Recent compliance-critical events">
        {[
          { time: '10:15 AM', event: 'Audio file destroyed — SHA-256 receipt generated', type: 'PURGE' },
          { time: '09:30 AM', event: 'TLS certificate validation passed', type: 'CERT' },
          { time: '08:00 AM', event: 'Automated key rotation completed', type: 'ROTATE' },
          { time: 'Yesterday', event: 'HIPAA compliance audit — all checks passed', type: 'AUDIT' },
        ].map((e, i) => (
          <View key={i} style={s.auditRow}>
            <View style={s.auditTop}>
              <Text style={s.auditTime}>{e.time}</Text>
              <View style={s.auditBadge}><Text style={s.auditBadgeText}>{e.type}</Text></View>
            </View>
            <Text style={s.auditEvent}>{e.event}</Text>
          </View>
        ))}
      </SectionCard>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  gaugesRow: { flexDirection: "row", justifyContent: "space-around", paddingVertical: 8 },
  gaugeWrap: { alignItems: "center" },
  gaugeRing: { width: 76, height: 76, borderRadius: 38, backgroundColor: theme.bgSecondary, alignItems: "center", justifyContent: "center", marginBottom: 8, borderWidth: 4, borderColor: theme.divider },
  gaugeCircleBg: { position: "absolute", width: "100%", height: "100%", borderRadius: 999 },
  gaugeFillMask: { display: "none" },
  gaugeCircleFill: { display: "none" },
  gaugeCenter: { alignItems: "center" },
  gaugeValue: { fontSize: 18, fontWeight: "800" },
  gaugeLabel: { fontSize: 11, fontWeight: "700", color: theme.textDim, textTransform: "uppercase", letterSpacing: 0.5 },
  retRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.divider },
  retType: { fontSize: 13, color: theme.textMuted },
  retPeriod: { fontSize: 13, fontWeight: "700", color: theme.accent },
  auditRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.divider },
  auditTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  auditTime: { fontSize: 11, color: theme.textDim },
  auditBadge: { backgroundColor: "rgba(48,209,88,0.12)", borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  auditBadgeText: { fontSize: 9, fontWeight: "800", color: theme.success, letterSpacing: 0.5 },
  auditEvent: { fontSize: 13, color: theme.textMuted, lineHeight: 19 },
});

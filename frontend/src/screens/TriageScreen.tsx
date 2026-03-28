import React, { useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { SectionCard } from "../components";
import { MOCK_PATIENTS } from "../mockData";
import { theme } from "../theme";

export default function TriageScreen() {
  const [filter, setFilter] = useState<'all' | 'severe' | 'monitor' | 'stable'>('all');
  const filtered = filter === 'all' ? MOCK_PATIENTS : MOCK_PATIENTS.filter(p => p.risk === filter);
  const filters: { key: typeof filter; label: string }[] = [
    { key: 'all', label: 'All' }, { key: 'severe', label: '🔴 Severe' },
    { key: 'monitor', label: '🟡 Monitor' }, { key: 'stable', label: '🟢 Stable' },
  ];

  return (
    <>
      <View style={s.filterRow}>
        {filters.map(f => (
          <Pressable key={f.key} style={[s.filterChip, filter === f.key && s.filterActive]} onPress={() => setFilter(f.key)}>
            <Text style={[s.filterText, filter === f.key && s.filterTextActive]}>{f.label}</Text>
          </Pressable>
        ))}
      </View>
      {filtered.map((p, i) => <PatientCard key={p.id} patient={p} index={i} />)}
      {!filtered.length && <Text style={s.empty}>No patients in this category.</Text>}
    </>
  );
}

function PatientCard({ patient, index }: { patient: typeof MOCK_PATIENTS[0]; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;
  const expandAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(anim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 8, delay: index * 80 }).start();
  }, []);

  useEffect(() => {
    Animated.spring(expandAnim, { toValue: expanded ? 1 : 0, useNativeDriver: false, tension: 65, friction: 10 }).start();
  }, [expanded]);

  const borderColor = patient.risk === 'severe' ? 'rgba(255,69,58,0.25)' : patient.risk === 'monitor' ? 'rgba(255,159,10,0.25)' : 'rgba(48,209,88,0.2)';
  const accentColor = patient.risk === 'severe' ? theme.danger : patient.risk === 'monitor' ? theme.warning : theme.success;
  const badgeColor = patient.risk === 'severe' ? 'rgba(255,69,58,0.12)' : patient.risk === 'monitor' ? 'rgba(255,159,10,0.12)' : 'rgba(48,209,88,0.12)';

  const maxScore = Math.max(...patient.trend);

  return (
    <Animated.View style={{ opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] }}>
      <Pressable style={[s.card, { borderColor }]} onPress={() => setExpanded(!expanded)}>
        <View style={[s.riskStripe, { backgroundColor: accentColor }]} />
        <View style={s.cardInner}>
          <View style={s.cardTop}>
            <View style={{ flex: 1 }}>
              <View style={s.nameRow}>
                <Text style={s.name}>{patient.name}</Text>
                <View style={[s.badge, { backgroundColor: badgeColor }]}><Text style={[s.badgeText, { color: accentColor }]}>{patient.risk.toUpperCase()}</Text></View>
              </View>
              <Text style={s.sub}>{patient.id} · Age {patient.age} · Last: {patient.lastCheckin}</Text>
            </View>
            <Text style={[s.score, { color: accentColor }]}>{patient.score}</Text>
          </View>
          <View style={s.detailRow}>
            <Text style={s.detail}>Mood: <Text style={s.detailBold}>{patient.mood}/10</Text></Text>
            <Text style={s.detail}>Anxiety: <Text style={s.detailBold}>{patient.anxiety}/10</Text></Text>
            <Text style={s.detail}>Sleep: <Text style={s.detailBold}>{patient.sleep}h</Text></Text>
            <Text style={s.detail}>Adherence: <Text style={s.detailBold}>{patient.adherence}%</Text></Text>
          </View>

          {expanded && (
            <View style={s.expandSection}>
              <Text style={s.aiLabel}>AI Summary</Text>
              <Text style={s.aiText}>{patient.summary}</Text>
              <Text style={s.trendLabel}>7-Day Risk Trend</Text>
              <View style={s.trendBars}>
                {patient.trend.map((v, i) => {
                  const h = Math.max(4, (v / maxScore) * 60);
                  const c = v >= 70 ? theme.danger : v >= 40 ? theme.warning : theme.success;
                  return <View key={i} style={[s.trendBar, { height: h, backgroundColor: c }]} />;
                })}
              </View>
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  filterRow: { flexDirection: "row", gap: 6, marginBottom: 14 },
  filterChip: { borderRadius: 999, borderWidth: 1, borderColor: theme.cardBorder, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: theme.bgElevated },
  filterActive: { backgroundColor: theme.accentDim, borderColor: "rgba(10,132,255,0.35)" },
  filterText: { fontSize: 12, fontWeight: "600", color: theme.textMuted },
  filterTextActive: { color: theme.accent },
  card: { backgroundColor: theme.card, borderRadius: theme.radiusLg, marginBottom: 14, borderWidth: 1, overflow: "hidden", shadowColor: theme.shadowSoft, shadowOpacity: 1, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  riskStripe: { width: 4, position: "absolute", left: 0, top: 0, bottom: 0, borderTopLeftRadius: theme.radiusLg, borderBottomLeftRadius: theme.radiusLg },
  cardInner: { padding: 18, paddingLeft: 18 },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  name: { fontSize: 16, fontWeight: "700", color: theme.text },
  badge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { fontSize: 9, fontWeight: "800", letterSpacing: 0.5 },
  sub: { fontSize: 11, color: theme.textDim, marginTop: 2 },
  score: { fontSize: 28, fontWeight: "900" },
  detailRow: { flexDirection: "row", flexWrap: "wrap", gap: 14, marginTop: 12 },
  detail: { fontSize: 12, color: theme.textDim },
  detailBold: { fontWeight: "700", color: theme.textMuted },
  expandSection: { marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: theme.divider },
  aiLabel: { fontSize: 12, fontWeight: "700", color: theme.accent, marginBottom: 4 },
  aiText: { fontSize: 13, color: theme.textMuted, lineHeight: 20, marginBottom: 14 },
  trendLabel: { fontSize: 11, fontWeight: "700", color: theme.textDim, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 },
  trendBars: { flexDirection: "row", alignItems: "flex-end", gap: 4, height: 70, backgroundColor: theme.bgSecondary, borderRadius: theme.radiusSm, padding: 6 },
  trendBar: { flex: 1, borderRadius: 3 },
  empty: { color: theme.textDim, textAlign: "center", paddingVertical: 30, fontStyle: "italic" },
});

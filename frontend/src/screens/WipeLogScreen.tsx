import React, { useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { SectionCard } from "../components";
import { MOCK_WIPE_LOG } from "../mockData";
import { theme } from "../theme";

export default function WipeLogScreen() {
  const [shredding, setShredding] = useState(false);
  const [shredDone, setShredDone] = useState(false);
  const shredAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
    ])).start();
  }, []);

  function runShred() {
    setShredding(true); setShredDone(false);
    Animated.timing(shredAnim, { toValue: 1, duration: 2000, useNativeDriver: true }).start(() => {
      setShredding(false); setShredDone(true);
      shredAnim.setValue(0);
    });
  }

  return (
    <>
      <SectionCard title="🗑️ Data Wipe Log" subtitle="Cryptographic proof your data is destroyed">
        <View style={s.shredder}>
          <Animated.View style={[s.shredIcon, { transform: [{ scale: shredding ? shredAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.3, 0.8] }) : pulseAnim }] }]}>
            <Text style={s.shredEmoji}>{shredding ? '🔥' : '🔐'}</Text>
          </Animated.View>
          <Text style={[s.shredStatus, shredding && { color: theme.danger }]}>
            {shredding ? '🔴 SHREDDING...' : shredDone ? '✅ All data securely destroyed' : 'All raw data has been purged'}
          </Text>
          <Pressable style={s.shredBtn} onPress={runShred} disabled={shredding}>
            <Text style={s.shredBtnText}>▶ Run Shred Demo</Text>
          </Pressable>
        </View>
      </SectionCard>

      <SectionCard title="Destruction Certificates" subtitle="SHA-256 hash receipts">
        {MOCK_WIPE_LOG.map((w, i) => (
          <WipeEntry key={i} item={w} index={i} />
        ))}
      </SectionCard>

      <SectionCard title="Retention Policy" subtitle="What we keep & for how long">
        {[['Raw Audio', 'Purged Immediately', theme.success], ['Voice Biomarkers', '24 hours', theme.accent], ['Check-in Scores', '90 days', theme.warning], ['Clinical Summaries', '1 year', theme.warning], ['Anonymized Trends', 'Indefinite', theme.textDim]].map(([t, p, c], i) => (
          <View key={i} style={s.retRow}>
            <Text style={s.retType}>{t as string}</Text>
            <Text style={[s.retPeriod, { color: c as string }]}>{p as string}</Text>
          </View>
        ))}
      </SectionCard>

      <SectionCard title="Purge Statistics" subtitle="Lifetime destruction metrics">
        <View style={s.statsGrid}>
          {[['47', 'Files Destroyed'], ['128 MB', 'Data Purged'], ['100%', 'Destruction Rate'], ['0', 'Raw Retained']].map(([v, l], i) => (
            <View key={i} style={s.statBox}>
              <Text style={s.statVal}>{v}</Text>
              <Text style={s.statLabel}>{l}</Text>
            </View>
          ))}
        </View>
      </SectionCard>
    </>
  );
}

function WipeEntry({ item, index }: { item: typeof MOCK_WIPE_LOG[0]; index: number }) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(a, { toValue: 1, duration: 350, delay: index * 80, useNativeDriver: true }).start(); }, []);
  const icons: Record<string, string> = { audio: '🎤', voice: '🗣️', session: '📋', cache: '💾' };
  return (
    <Animated.View style={[s.wipeRow, { opacity: a, transform: [{ translateX: a.interpolate({ inputRange: [0, 1], outputRange: [-30, 0] }) }] }]}>
      <Text style={s.wipeIcon}>{icons[item.type] || '📁'}</Text>
      <View style={{ flex: 1 }}>
        <Text style={s.wipeHash} numberOfLines={1}>SHA-256: {item.hash}</Text>
        <Text style={s.wipeMeta}>{item.type.toUpperCase()} · {item.size} · {new Date(item.ts).toLocaleDateString()}</Text>
      </View>
      <View style={s.wipeBadge}><Text style={s.wipeBadgeText}>✅ DESTROYED</Text></View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  shredder: { alignItems: "center", paddingVertical: 24 },
  shredIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: theme.bgSecondary, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  shredEmoji: { fontSize: 36 },
  shredStatus: { fontSize: 14, fontWeight: "600", color: theme.success, textAlign: "center" },
  shredBtn: { marginTop: 14, borderWidth: 1, borderColor: theme.accent, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10 },
  shredBtnText: { color: theme.accent, fontWeight: "700", fontSize: 13 },
  wipeRow: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: theme.bgSecondary, borderRadius: theme.radiusSm, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: theme.cardBorder },
  wipeIcon: { fontSize: 18 },
  wipeHash: { fontSize: 10, color: theme.accent, fontFamily: "monospace" },
  wipeMeta: { fontSize: 10, color: theme.textDim, marginTop: 2 },
  wipeBadge: { backgroundColor: "rgba(48,209,88,0.12)", borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  wipeBadgeText: { fontSize: 9, fontWeight: "700", color: theme.success },
  retRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.divider },
  retType: { fontSize: 13, color: theme.textMuted },
  retPeriod: { fontSize: 13, fontWeight: "700" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statBox: { width: "47%", backgroundColor: theme.bgSecondary, borderRadius: theme.radiusMd, padding: 16, alignItems: "center", borderWidth: 1, borderColor: theme.cardBorder },
  statVal: { fontSize: 24, fontWeight: "800", color: theme.accent },
  statLabel: { fontSize: 10, color: theme.textDim, marginTop: 4, textTransform: "uppercase", fontWeight: "700", letterSpacing: 0.5 },
});

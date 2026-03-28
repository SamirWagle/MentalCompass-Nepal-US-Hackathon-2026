import React, { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { SectionCard } from "../components";
import { MOCK_ACHIEVEMENTS, MOCK_MILESTONES } from "../mockData";
import { theme } from "../theme";

export default function MilestonesScreen() {
  const streakAnim = useRef(new Animated.Value(0)).current;
  const dotAnims = useRef(Array.from({ length: 7 }, () => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.spring(streakAnim, { toValue: 1, useNativeDriver: true, tension: 40, friction: 7 }).start();
    dotAnims.forEach((a, i) => {
      Animated.timing(a, { toValue: 1, duration: 300, delay: i * 80, useNativeDriver: true }).start();
    });
  }, []);

  return (
    <>
      <SectionCard title="🏆 Milestones" subtitle="Your recovery journey — every step counts">
        {/* Streak */}
        <Animated.View style={[s.streakRow, { transform: [{ scale: streakAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }] }]}>
          <Text style={s.streakNum}>7</Text>
          <Text style={s.streakLabel}>Day Check-in Streak 🔥</Text>
          <View style={s.dotsRow}>
            {dotAnims.map((a, i) => (
              <Animated.View key={i} style={[s.dot, i < 6 ? s.dotDone : s.dotToday, { opacity: a, transform: [{ scale: a }] }]} />
            ))}
          </View>
        </Animated.View>
      </SectionCard>

      <SectionCard title="Journey Timeline" subtitle="Your path to wellness">
        {MOCK_MILESTONES.map((m, i) => (
          <TimelineItem key={i} item={m} index={i} />
        ))}
      </SectionCard>

      <SectionCard title="Achievements" subtitle="Badges earned through dedication">
        <View style={s.achGrid}>
          {MOCK_ACHIEVEMENTS.map((a, i) => (
            <View key={i} style={[s.achCard, !a.unlocked && s.achLocked]}>
              <Text style={s.achIcon}>{a.icon}</Text>
              <Text style={s.achName}>{a.name}</Text>
              <Text style={s.achDesc}>{a.desc}</Text>
            </View>
          ))}
        </View>
      </SectionCard>
    </>
  );
}

function TimelineItem({ item, index }: { item: typeof MOCK_MILESTONES[0]; index: number }) {
  const slideAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(slideAnim, { toValue: 1, duration: 400, delay: index * 100, useNativeDriver: true }).start();
  }, []);

  const dotColor = item.status === 'completed' ? theme.accent : item.status === 'active' ? theme.success : theme.textDim;

  return (
    <Animated.View style={[s.tlItem, { opacity: slideAnim, transform: [{ translateX: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }] }]}>
      <View style={s.tlLeft}>
        <View style={[s.tlDot, { backgroundColor: dotColor }]} />
        {index < MOCK_MILESTONES.length - 1 && <View style={s.tlLine} />}
      </View>
      <View style={s.tlContent}>
        <Text style={s.tlDate}>{item.date}</Text>
        <Text style={s.tlTitle}>{item.status === 'locked' ? '🔒 ' : ''}{item.title}</Text>
        <Text style={s.tlDesc}>{item.desc}</Text>
        <Text style={s.tlXp}>+{item.xp} XP {item.status === 'completed' ? '✅' : item.status === 'active' ? '🔄' : '🔒'}</Text>
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  streakRow: { alignItems: "center", paddingVertical: 16 },
  streakNum: { fontSize: 64, fontWeight: "900", color: theme.accent, lineHeight: 70 },
  streakLabel: { fontSize: 15, fontWeight: "700", color: theme.textMuted, marginTop: 4 },
  dotsRow: { flexDirection: "row", gap: 8, marginTop: 14 },
  dot: { width: 14, height: 14, borderRadius: 7 },
  dotDone: { backgroundColor: theme.accent },
  dotToday: { backgroundColor: theme.success },
  tlItem: { flexDirection: "row", marginBottom: 0 },
  tlLeft: { width: 28, alignItems: "center" },
  tlDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: theme.accent, zIndex: 1 },
  tlLine: { width: 2, flex: 1, backgroundColor: "rgba(10,132,255,0.15)", marginVertical: 2 },
  tlContent: { flex: 1, backgroundColor: theme.bgSecondary, borderRadius: theme.radiusSm, padding: 14, marginBottom: 10, marginLeft: 8, borderWidth: 1, borderColor: theme.cardBorder },
  tlDate: { fontSize: 10, fontWeight: "700", color: theme.textDim, textTransform: "uppercase", letterSpacing: 0.5 },
  tlTitle: { fontSize: 15, fontWeight: "700", color: theme.text, marginTop: 2 },
  tlDesc: { fontSize: 12, color: theme.textMuted, marginTop: 2 },
  tlXp: { fontSize: 11, fontWeight: "700", color: theme.accent, marginTop: 6 },
  achGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  achCard: { width: "30%", backgroundColor: theme.bgSecondary, borderRadius: theme.radiusMd, padding: 14, alignItems: "center", borderWidth: 1, borderColor: theme.cardBorder },
  achLocked: { opacity: 0.35 },
  achIcon: { fontSize: 28, marginBottom: 6 },
  achName: { fontSize: 11, fontWeight: "700", color: theme.text, textAlign: "center" },
  achDesc: { fontSize: 9, color: theme.textDim, textAlign: "center", marginTop: 2 },
});

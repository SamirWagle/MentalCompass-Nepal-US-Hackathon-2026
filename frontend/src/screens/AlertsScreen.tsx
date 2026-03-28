import React, { useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { SectionCard } from "../components";
import { MOCK_ALERTS } from "../mockData";
import { theme } from "../theme";

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState(MOCK_ALERTS);
  const urgent = alerts.filter(a => a.severity === 'high' && !a.acknowledged);

  function acknowledge(id: string) {
    setAlerts(as => as.map(a => a.id === id ? { ...a, acknowledged: true } : a));
  }

  return (
    <>
      {/* Urgent Banner */}
      {urgent.length > 0 ? urgent.map((a, i) => (
        <UrgentBanner key={a.id} alert={a} index={i} onAck={() => acknowledge(a.id)} />
      )) : (
        <View style={s.clearCard}>
          <Text style={s.clearIcon}>✅</Text>
          <Text style={s.clearText}>No unacknowledged urgent alerts</Text>
        </View>
      )}

      {/* History */}
      <SectionCard title="Alert History" subtitle="All recent clinical events">
        {alerts.map((a, i) => (
          <AlertRow key={a.id} alert={a} index={i} />
        ))}
      </SectionCard>
    </>
  );
}

function UrgentBanner({ alert, index, onAck }: { alert: typeof MOCK_ALERTS[0]; index: number; onAck: () => void }) {
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -1, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
      Animated.delay(2000),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 0.8, duration: 1000, useNativeDriver: true }),
    ])).start();
  }, []);

  return (
    <Animated.View style={[s.banner, { opacity: pulseAnim }]}>
      <Animated.Text style={[s.bannerIcon, { transform: [{ rotate: shakeAnim.interpolate({ inputRange: [-1, 0, 1], outputRange: ['-5deg', '0deg', '5deg'] }) }] }]}>🚨</Animated.Text>
      <View style={{ flex: 1 }}>
        <Text style={s.bannerTitle}>{alert.patient}: {alert.event}</Text>
        <Text style={s.bannerTime}>{alert.time}</Text>
      </View>
      <Pressable style={s.ackBtn} onPress={onAck}><Text style={s.ackText}>⚡ ACK</Text></Pressable>
    </Animated.View>
  );
}

function AlertRow({ alert, index }: { alert: typeof MOCK_ALERTS[0]; index: number }) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(a, { toValue: 1, duration: 300, delay: index * 60, useNativeDriver: true }).start(); }, []);
  const dotColor = alert.severity === 'high' ? theme.danger : theme.warning;

  return (
    <Animated.View style={[s.row, { opacity: a, transform: [{ translateX: a.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] }]}>
      <View style={[s.dot, { backgroundColor: dotColor }]} />
      <View style={{ flex: 1 }}>
        <Text style={s.rowPatient}>{alert.patient}</Text>
        <Text style={s.rowEvent}>{alert.event}</Text>
        <Text style={s.rowTime}>{alert.time}</Text>
      </View>
      <View style={[s.statusBadge, { backgroundColor: alert.acknowledged ? 'rgba(48,209,88,0.12)' : 'rgba(255,69,58,0.12)' }]}>
        <Text style={[s.statusText, { color: alert.acknowledged ? theme.success : theme.danger }]}>{alert.acknowledged ? 'ACK' : 'PENDING'}</Text>
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  banner: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "rgba(255,69,58,0.08)", borderWidth: 1, borderColor: "rgba(255,69,58,0.25)", borderRadius: theme.radiusLg, padding: 16, marginBottom: 12 },
  bannerIcon: { fontSize: 28 },
  bannerTitle: { fontSize: 14, fontWeight: "700", color: theme.danger },
  bannerTime: { fontSize: 10, color: theme.textDim, marginTop: 2 },
  ackBtn: { borderWidth: 1, borderColor: theme.danger, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  ackText: { color: theme.danger, fontWeight: "700", fontSize: 12 },
  clearCard: { backgroundColor: "rgba(48,209,88,0.06)", borderWidth: 1, borderColor: "rgba(48,209,88,0.15)", borderRadius: theme.radiusLg, alignItems: "center", padding: 24, marginBottom: 14 },
  clearIcon: { fontSize: 28, marginBottom: 6 },
  clearText: { fontSize: 14, fontWeight: "700", color: theme.success },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.divider },
  dot: { width: 10, height: 10, borderRadius: 5 },
  rowPatient: { fontSize: 14, fontWeight: "700", color: theme.text },
  rowEvent: { fontSize: 12, color: theme.textMuted, marginTop: 1 },
  rowTime: { fontSize: 10, color: theme.textDim, marginTop: 2 },
  statusBadge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontSize: 9, fontWeight: "800", letterSpacing: 0.5 },
});

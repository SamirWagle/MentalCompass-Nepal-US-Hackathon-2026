import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { disconnectWearable, fetchMySettings, syncWearable, updateCheckinSchedule } from "../api";
import { MetricStepper, SectionCard, ToggleRow } from "../components";
import { theme } from "../theme";

const TOKEN_KEY = "aegisspeak_token_v1";

export default function SettingsScreen() {
  const [token, setToken] = useState<string | null>(null);
  const [wearableConnected, setWearableConnected] = useState(false);
  const [syncingWearable, setSyncingWearable] = useState(false);
  const [checkinHour, setCheckinHour] = useState(20);
  const [checkinMinute, setCheckinMinute] = useState(0);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(TOKEN_KEY).then(async t => {
      setToken(t);
      if (t) {
        try {
          const settings = await fetchMySettings(t);
          setWearableConnected(settings.wearableConnected || false);
          if (settings.checkinSchedule) {
            setCheckinHour(settings.checkinSchedule.hour ?? 20);
            setCheckinMinute(settings.checkinSchedule.minute ?? 0);
          }
        } catch {}
        setLoading(false);
      } else {
        setLoading(false);
      }
    });
  }, []);

  async function handleWearableToggle(value: boolean) {
    if (!token) return;
    setSyncingWearable(true);
    try {
      if (value) {
        // Mock biometric data — in production this comes from the device SDK
        const mockData = {
          heartRate: Math.round(65 + Math.random() * 20),
          sleepHours: parseFloat((6.5 + Math.random() * 2).toFixed(1)),
          steps: Math.round(4000 + Math.random() * 6000),
          stressLevel: parseFloat((3 + Math.random() * 4).toFixed(1)),
        };
        await syncWearable(mockData, token);
        setWearableConnected(true);
        Alert.alert(
          "🔒 Wearable Connected",
          `Synced: ${mockData.steps} steps · ${mockData.sleepHours}h sleep · HR ${mockData.heartRate} bpm\n\nAll biometric data is encrypted (PHI).`
        );
      } else {
        await disconnectWearable(token);
        setWearableConnected(false);
        Alert.alert("Disconnected", "Your wearable data will no longer sync.");
      }
    } catch {
      Alert.alert("Sync Failed", "Could not sync wearable. Try again.");
    } finally {
      setSyncingWearable(false);
    }
  }

  async function saveSchedule() {
    if (!token) return;
    setSavingSchedule(true);
    try {
      await updateCheckinSchedule({ hour: checkinHour, minute: checkinMinute, timezone: "Asia/Kathmandu" }, token);
      Alert.alert("✅ Schedule Saved", `You'll receive check-in notifications at ${String(checkinHour).padStart(2, "0")}:${String(checkinMinute).padStart(2, "0")}.`);
    } catch {
      Alert.alert("Save Failed", "Could not save schedule. Try again.");
    } finally {
      setSavingSchedule(false);
    }
  }

  if (!token) {
    return (
      <View style={s.empty}>
        <Text style={s.emptyTitle}>🔒 Sign in required</Text>
        <Text style={s.emptyDesc}>Login to access your settings.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      {/* Wearable Sync */}
      <SectionCard title="⌚ Smart Device" subtitle="Connect your wearable to sync heart rate, sleep, and activity — encrypted as PHI.">
        {loading ? (
          <ActivityIndicator color={theme.accent} />
        ) : (
          <>
            <ToggleRow
              label={wearableConnected ? "🔵 Smart Device Connected" : "Connect Smart Device"}
              value={wearableConnected}
              onChange={handleWearableToggle}
            />
            {syncingWearable && (
              <View style={s.syncRow}>
                <ActivityIndicator color={theme.accent} size="small" />
                <Text style={s.syncText}>Syncing biometric data...</Text>
              </View>
            )}
            {wearableConnected && (
              <View style={s.phiBadge}>
                <Text style={s.phiText}>🔒 PHI Protected — Data is AES-encrypted before storage</Text>
              </View>
            )}
          </>
        )}
      </SectionCard>

      {/* Check-In Schedule */}
      <SectionCard title="🔔 Check-In Schedule" subtitle="Set your preferred time for daily wellness check-ins. You can always decline.">
        <View style={s.timeDisplay}>
          <Text style={s.timeLabel}>Check-in time</Text>
          <View style={s.timePills}>
            <View style={s.timePill}>
              <Text style={s.timePillValue}>{String(checkinHour).padStart(2, "0")}</Text>
              <Text style={s.timePillLabel}>Hour</Text>
            </View>
            <Text style={s.timeSep}>:</Text>
            <View style={s.timePill}>
              <Text style={s.timePillValue}>{String(checkinMinute).padStart(2, "0")}</Text>
              <Text style={s.timePillLabel}>Min</Text>
            </View>
          </View>
        </View>
        <MetricStepper label="Hour (0-23)" value={checkinHour} min={0} max={23} onChange={setCheckinHour} />
        <MetricStepper label="Minute (0-59)" value={checkinMinute} min={0} max={59} onChange={setCheckinMinute} />
        <Pressable
          style={[s.saveBtn, savingSchedule && s.saveBtnDisabled]}
          onPress={saveSchedule}
          disabled={savingSchedule}
          accessibilityRole="button"
          accessibilityLabel="Save check-in schedule"
        >
          {savingSchedule ? (
            <ActivityIndicator color={theme.white} size="small" />
          ) : (
            <Text style={s.saveBtnText}>Save Schedule</Text>
          )}
        </Pressable>
        <Text style={s.hint}>💡 You always have the right to skip a check-in. Your streak is never broken by a single decline.</Text>
      </SectionCard>

      {/* Privacy Info */}
      <SectionCard title="🔐 Your Privacy" subtitle="What we collect and how we protect it.">
        {[
          { icon: "🔒", label: "Journal entries stored locally & anonymously" },
          { icon: "🎙️", label: "Voice audio deleted after processing (no raw storage)" },
          { icon: "⌚", label: "Biometric data encrypted (AES-256) before storage" },
          { icon: "🩺", label: "Doctors only see your anonymous ID, never your name" },
        ].map((item, i) => (
          <View key={i} style={s.privacyRow}>
            <Text style={s.privacyIcon}>{item.icon}</Text>
            <Text style={s.privacyLabel}>{item.label}</Text>
          </View>
        ))}
      </SectionCard>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  content: { padding: 12, paddingBottom: 60 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  emptyTitle: { fontSize: 22, fontWeight: "800", color: theme.text, marginBottom: 8 },
  emptyDesc: { color: theme.textDim, fontSize: 14, textAlign: "center" },
  syncRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },
  syncText: { color: theme.textDim, fontSize: 13 },
  phiBadge: {
    marginTop: 10, backgroundColor: "rgba(48,209,88,0.08)",
    borderRadius: 10, padding: 10, borderWidth: 1, borderColor: "rgba(48,209,88,0.2)",
  },
  phiText: { color: theme.success, fontSize: 12, fontWeight: "600" },
  timeDisplay: {
    backgroundColor: theme.bgSecondary,
    borderRadius: theme.radiusMd, padding: 16, marginBottom: 14,
    alignItems: "center",
  },
  timeLabel: { color: theme.textDim, fontSize: 11, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 },
  timePills: { flexDirection: "row", alignItems: "center", gap: 6 },
  timePill: { alignItems: "center", backgroundColor: theme.bgElevated, borderRadius: 12, paddingHorizontal: 18, paddingVertical: 10, borderWidth: 1, borderColor: theme.cardBorder },
  timePillValue: { fontSize: 28, fontWeight: "800", color: theme.text },
  timePillLabel: { fontSize: 10, color: theme.textDim, fontWeight: "600", marginTop: 2 },
  timeSep: { fontSize: 28, fontWeight: "800", color: theme.textDim },
  saveBtn: {
    backgroundColor: theme.accent, borderRadius: 14,
    paddingVertical: 13, alignItems: "center", marginTop: 12, minHeight: 44,
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  hint: { color: theme.textDim, fontSize: 12, lineHeight: 18, marginTop: 10, textAlign: "center" },
  privacyRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10, minHeight: 44 },
  privacyIcon: { fontSize: 18 },
  privacyLabel: { flex: 1, fontSize: 14, color: theme.text, lineHeight: 20 },
});

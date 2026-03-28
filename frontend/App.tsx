import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Animated, Dimensions, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import {
  createEscalation, fetchEscalations, fetchPredictiveInsights,
  fetchRecords, fetchTrends, sendSmsFallback, submitCheckin
} from "./src/api";
import { NavChip, StatPill } from "./src/components";
import {
  CHAT_KEY, ChatMessage, CheckinInput, MEMORY_KEY, MemoryItem, PREFS_KEY,
  Preferences, ScreenKey, USER_ID, clamp, defaultPreferences
} from "./src/constants";
import { theme } from "./src/theme";
import { CheckinResponse, EscalationRecord, PredictiveInsights, SmsPayloadResult, TrendPoint } from "./src/types";

import CheckinScreen from "./src/screens/CheckinScreen";
import ClinicianScreen from "./src/screens/ClinicianScreen";
import CopilotScreen from "./src/screens/CopilotScreen";
import InsightsScreen from "./src/screens/InsightsScreen";
import LoginScreen from "./src/screens/LoginScreen";
import PrivacyScreen from "./src/screens/PrivacyScreen";
import SignalsScreen from "./src/screens/SignalsScreen";

// New screens
import AlertsScreen from "./src/screens/AlertsScreen";
import BookingScreen from "./src/screens/BookingScreen";
import CheckinCallScreen from "./src/screens/CheckinCallScreen";
import CommunityScreen from "./src/screens/CommunityScreen";
import ComplianceScreen from "./src/screens/ComplianceScreen";
import JournalScreen from "./src/screens/JournalScreen";
import MilestonesScreen from "./src/screens/MilestonesScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import { MOCK_ALERTS, MOCK_PATIENTS } from "./src/mockData";
import TriageScreen from "./src/screens/TriageScreen";
import VaultScreen from "./src/screens/VaultScreen";
import WipeLogScreen from "./src/screens/WipeLogScreen";
import { declineCheckin } from "./src/api";

const { width: SCREEN_W } = Dimensions.get("window");

const initialInput: CheckinInput = {
  userId: USER_ID, mood: 5, anxiety: 4, stress: 4, sleepHours: 7,
  phoneUsageHours: 4, typingSpeedDelta: 0.1, speechRateWpm: 125,
  pauseRatio: 0.2, jitter: 0.02, sentiment: 0, crisisSignals: [], journalText: ""
};

const EXPO_DUMMY_RECORDS = MOCK_PATIENTS.map((p, i) => ({
  id: `dummy-${p.id}`,
  timestamp: new Date(Date.now() - i * 1000 * 60 * 60 * 8).toISOString(),
  score: p.score,
  riskLevel: p.risk === "severe" ? "high" : p.risk === "monitor" ? "moderate" : "low",
  summary: { impression: p.summary },
  escalation: p.risk === "severe"
}));

const EXPO_DUMMY_TRENDS: TrendPoint[] = [
  6.1, 5.8, 5.4, 5.7, 6.0, 5.3, 5.0, 4.8, 5.2, 5.5, 5.9, 6.2, 6.0, 5.7
].map((mood, idx) => {
  const score = Math.max(5, Math.min(95, Math.round((10 - mood) * 10 + (idx % 4) * 4)));
  return {
    timestamp: new Date(Date.now() - (13 - idx) * 1000 * 60 * 60 * 24).toISOString(),
    mood,
    score,
  };
});

const EXPO_DUMMY_INSIGHTS: PredictiveInsights = {
  burnoutRisk: "moderate",
  depressionRisk: "low",
  confidence: 81,
  narrative: "Dummy forecast: mild instability during workload spikes, improving with consistent check-ins and breathing routines.",
  next72hRiskScore: 47
};

const EXPO_DUMMY_ESCALATIONS: EscalationRecord[] = MOCK_ALERTS
  .filter((a) => a.severity === "high")
  .map((a, i) => ({
    id: `esc-dummy-${a.id}`,
    timestamp: new Date(Date.now() - i * 1000 * 60 * 60 * 5).toISOString(),
    userId: USER_ID,
    severity: "high",
    reason: a.event,
    contacts: ["trusted-contact-1", "local-health-post"],
    acknowledged: a.acknowledged,
    auditHash: `dummy-hash-${a.id}`
  }));

// Smooth animated screen wrapper
function AnimatedScreen({ children, screenKey, currentScreen }: { children: React.ReactNode; screenKey: ScreenKey; currentScreen: ScreenKey }) {
  const isActive = screenKey === currentScreen;
  const fadeAnim = useRef(new Animated.Value(isActive ? 1 : 0)).current;
  const slideAnim = useRef(new Animated.Value(isActive ? 0 : 20)).current;

  useEffect(() => {
    if (isActive) {
      Animated.parallel([
        Animated.spring(fadeAnim, { toValue: 1, useNativeDriver: true, tension: 65, friction: 10 }),
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 65, friction: 10 }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(20);
    }
  }, [isActive]);

  if (!isActive) return null;

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      {children}
    </Animated.View>
  );
}

export default function App() {
  const [screen, setScreen] = useState<ScreenKey>("copilot");
  const [input, setInput] = useState<CheckinInput>(initialInput);
  const [loadingCheckin, setLoadingCheckin] = useState(false);
  const [result, setResult] = useState<CheckinResponse | null>(null);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [memory, setMemory] = useState<MemoryItem[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);
  const [avatarXp, setAvatarXp] = useState(18);
  const [insights, setInsights] = useState<PredictiveInsights | null>(null);
  const [smsPayload, setSmsPayload] = useState<SmsPayloadResult | null>(null);
  const [escalations, setEscalations] = useState<EscalationRecord[]>([]);
  // Auth state (scoped token shared with child screens via AsyncStorage)
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [authUser, setAuthUser] = useState<any>(null);
  const [authLoaded, setAuthLoaded] = useState(false);
  // Check-in call modal
  const [showCheckinCall, setShowCheckinCall] = useState(false);

  // Load auth token from storage
  useEffect(() => {
    (async () => {
      const t = await AsyncStorage.getItem("aegisspeak_token_v1");
      const u = await AsyncStorage.getItem("aegisspeak_user_v1");
      if (t && u) {
        setAuthToken(t);
        try { setAuthUser(JSON.parse(u)); } catch {}
      }
      setAuthLoaded(true);
    })();
  }, []);

  const handleLoginSuccess = async (token: string, user: any) => {
    setAuthToken(token);
    setAuthUser(user);
    await AsyncStorage.setItem("aegisspeak_token_v1", token);
    await AsyncStorage.setItem("aegisspeak_user_v1", JSON.stringify(user));
  };

  const handleLogout = async () => {
    setAuthToken(null);
    setAuthUser(null);
    await AsyncStorage.removeItem("aegisspeak_token_v1");
    await AsyncStorage.removeItem("aegisspeak_user_v1");
  };

  // Hero parallax
  const heroScale = useRef(new Animated.Value(0.95)).current;
  useEffect(() => {
    Animated.spring(heroScale, { toValue: 1, useNativeDriver: true, tension: 40, friction: 7 }).start();
  }, []);

  const stabilityScore = useMemo(() => (result ? 100 - result.risk.score : 68), [result]);
  const stressNow = useMemo(() => {
    const tv = Math.abs(input.typingSpeedDelta) * 100;
    const id = clamp(input.phoneUsageHours * 6 - input.sleepHours * 2, 0, 100);
    return clamp(Math.round((input.stress * 9 + tv * 0.25 + id * 0.2) / 1.2), 0, 100);
  }, [input]);

  useEffect(() => { hydrateLocalState(); refreshRemoteData(); }, []);

  async function hydrateLocalState() {
    const [mRaw, cRaw, pRaw] = await Promise.all([
      AsyncStorage.getItem(MEMORY_KEY), AsyncStorage.getItem(CHAT_KEY), AsyncStorage.getItem(PREFS_KEY)
    ]);
    if (mRaw) try { setMemory(JSON.parse(mRaw)); } catch {}
    if (cRaw) try { setChatHistory(JSON.parse(cRaw)); } catch {}
    if (pRaw) try { setPreferences(JSON.parse(pRaw)); } catch {}
  }

  async function refreshRemoteData() {
    try {
      const [td, rd, id, ed] = await Promise.all([
        fetchTrends(USER_ID), fetchRecords(USER_ID),
        fetchPredictiveInsights(USER_ID), fetchEscalations(USER_ID)
      ]);
      setTrends(td.length ? td : EXPO_DUMMY_TRENDS);
      setRecords((rd.length ? rd : EXPO_DUMMY_RECORDS).slice(-8).reverse());
      setInsights(id || EXPO_DUMMY_INSIGHTS);
      setEscalations((ed.length ? ed : EXPO_DUMMY_ESCALATIONS).slice(-8).reverse());
    } catch {
      setTrends(EXPO_DUMMY_TRENDS);
      setRecords(EXPO_DUMMY_RECORDS.slice(-8).reverse());
      setInsights(EXPO_DUMMY_INSIGHTS);
      setEscalations(EXPO_DUMMY_ESCALATIONS.slice(-8).reverse());
    }
  }

  async function persistMemory(next: MemoryItem[]) {
    setMemory(next); await AsyncStorage.setItem(MEMORY_KEY, JSON.stringify(next));
  }
  async function persistChat(next: ChatMessage[]) {
    setChatHistory(next); await AsyncStorage.setItem(CHAT_KEY, JSON.stringify(next));
  }
  async function persistPreferences(next: Preferences) {
    setPreferences(next); await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(next));
  }

  async function runCheckin() {
    setLoadingCheckin(true);
    try {
      const response = await submitCheckin({ ...input, userId: USER_ID });
      setResult(response);
      setAvatarXp((p) => clamp(p + 6, 0, 100));
      const nextMem: MemoryItem[] = [{
        id: response.checkinId, createdAt: new Date().toISOString(),
        userMessage: input.journalText || "No journal text",
        copilotSummary: response.clinicalSummary.impression
      }, ...memory].slice(0, 30);
      await persistMemory(nextMem);
      await refreshRemoteData();
      if (response.escalation) Alert.alert("🚨 Crisis Signal", "High-risk signal detected. Emergency escalation triggered.");
    } catch { Alert.alert("Offline Mode", "Could not submit check-in. Offline-first mode active."); }
    finally { setLoadingCheckin(false); }
  }

  async function triggerEmergency() {
    try {
      const esc = await createEscalation({
        userId: USER_ID, severity: "high",
        reason: "manual-emergency-trigger", contacts: ["trusted-contact-1", "local-health-post"]
      });
      setEscalations((p) => [esc.record, ...p].slice(0, 8));
      Alert.alert("🚨 Emergency", "Escalation sent to clinician and emergency contacts.");
    } catch { Alert.alert("Failed", "Could not send escalation packet."); }
  }

  async function runSmsFallback() {
    if (!result) { Alert.alert("No Data", "Run a check-in first."); return; }
    try {
      const p = await sendSmsFallback({
        userId: USER_ID, riskScore: result.risk.score,
        riskLevel: result.risk.riskLevel, escalation: result.escalation
      });
      setSmsPayload(p);
      Alert.alert("SMS Ready", "Encrypted low-bandwidth payload generated.");
    } catch { Alert.alert("Failed", "Could not generate fallback payload."); }
  }

  const tabs: { label: string; icon: string; key: ScreenKey; section?: string }[] = [
    { label: "Copilot", icon: "🤖", key: "copilot" },
    { label: "Check-In", icon: "📊", key: "checkin" },
    { label: "Journal", icon: "📝", key: "journal" },
    { label: "Signals", icon: "📡", key: "signals" },
    { label: "Insights", icon: "🔮", key: "insights" },
    { label: "Book Doctor", icon: "🩺", key: "booking" },
    { label: "Milestones", icon: "🏆", key: "milestones" },
    { label: "Vault", icon: "📚", key: "vault" },
    { label: "Settings", icon: "⚙️", key: "settings" },
    { label: "Community", icon: "💬", key: "community" },
    { label: "Clinician", icon: "🏥", key: "clinician", section: "Provider" },
    { label: "Triage", icon: "🚦", key: "triage" },
    { label: "Alerts", icon: "🚨", key: "alerts" },
    { label: "Compliance", icon: "✅", key: "compliance" },
    { label: "Privacy", icon: "🔒", key: "privacy", section: "System" },
    { label: "Wipe Log", icon: "🗑️", key: "wipelog" },
  ];

  // Auth gate: show login screen while not authenticated
  if (authLoaded && !authToken) {
    return (
      <SafeAreaView style={s.safe}>
        <StatusBar style="dark" />
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      </SafeAreaView>
    );
  }

  // Loading state while checking auth
  if (!authLoaded) {
    return (
      <SafeAreaView style={[s.safe, { alignItems: "center", justifyContent: "center" }]}>
        <StatusBar style="dark" />
        <Text style={{ color: theme.textDim, fontSize: 16 }}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar style="dark" />

      {/* Hero Banner with spring entrance */}
      <Animated.View style={{ transform: [{ scale: heroScale }] }}>
        <LinearGradient colors={theme.heroGradient as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.hero}>
          <View style={s.logoRow}>
            <LinearGradient colors={theme.accentGradient as any} style={s.logoDot}>
              <Text style={s.logoText}>A</Text>
            </LinearGradient>
            <View>
              <Text style={s.heroTitle}>AegisSpeak</Text>
              <Text style={s.heroSub}>Predictive · Personalized · Privacy-First</Text>
            </View>
            <View style={s.liveBadge}><View style={s.liveDot} /><Text style={s.liveText}>EDGE</Text></View>
          </View>
          <View style={s.heroStats}>
            <StatPill label="STABILITY" value={`${stabilityScore}`} />
            <StatPill label="STRESS" value={`${stressNow}%`} />
            <StatPill label="AVATAR XP" value={`${avatarXp}`} />
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Navigation Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.navRow}>
        {tabs.map((t) => (
          <NavChip key={t.key} label={`${t.icon} ${t.label}`} active={screen === t.key} onPress={() => setScreen(t.key)} />
        ))}
        <NavChip label="🚪 Logout" active={false} onPress={handleLogout} />
      </ScrollView>

      {/* Content with animated transitions */}
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <AnimatedScreen screenKey="copilot" currentScreen={screen}>
          <CopilotScreen input={input} result={result} preferences={preferences} memory={memory} chatHistory={chatHistory} onPersistChat={persistChat} onPersistPrefs={persistPreferences} />
        </AnimatedScreen>
        <AnimatedScreen screenKey="checkin" currentScreen={screen}>
          <CheckinScreen input={input} setInput={setInput} result={result} loadingCheckin={loadingCheckin} onRunCheckin={runCheckin} onTriggerEmergency={triggerEmergency} />
        </AnimatedScreen>
        <AnimatedScreen screenKey="signals" currentScreen={screen}>
          <SignalsScreen input={input} preferences={preferences} />
        </AnimatedScreen>
        <AnimatedScreen screenKey="insights" currentScreen={screen}>
          <InsightsScreen trends={trends} insights={insights} avatarXp={avatarXp} />
        </AnimatedScreen>
        <AnimatedScreen screenKey="milestones" currentScreen={screen}>
          <MilestonesScreen />
        </AnimatedScreen>
        <AnimatedScreen screenKey="vault" currentScreen={screen}>
          <VaultScreen />
        </AnimatedScreen>
        <AnimatedScreen screenKey="community" currentScreen={screen}>
          <CommunityScreen />
        </AnimatedScreen>
        <AnimatedScreen screenKey="journal" currentScreen={screen}>
          <JournalScreen onNavigateBooking={() => setScreen("booking")} />
        </AnimatedScreen>
        <AnimatedScreen screenKey="settings" currentScreen={screen}>
          <SettingsScreen />
        </AnimatedScreen>
        <AnimatedScreen screenKey="booking" currentScreen={screen}>
          <BookingScreen />
        </AnimatedScreen>
        <AnimatedScreen screenKey="clinician" currentScreen={screen}>
          <ClinicianScreen records={records} result={result} onRefresh={refreshRemoteData} />
        </AnimatedScreen>
        <AnimatedScreen screenKey="triage" currentScreen={screen}>
          <TriageScreen />
        </AnimatedScreen>
        <AnimatedScreen screenKey="alerts" currentScreen={screen}>
          <AlertsScreen />
        </AnimatedScreen>
        <AnimatedScreen screenKey="compliance" currentScreen={screen}>
          <ComplianceScreen />
        </AnimatedScreen>
        <AnimatedScreen screenKey="privacy" currentScreen={screen}>
          <PrivacyScreen preferences={preferences} onPersistPrefs={persistPreferences} result={result} smsPayload={smsPayload} onRunSmsFallback={runSmsFallback} memory={memory} escalations={escalations} />
        </AnimatedScreen>
        <AnimatedScreen screenKey="wipelog" currentScreen={screen}>
          <WipeLogScreen />
        </AnimatedScreen>
      </ScrollView>

      {/* Scheduled Check-In Call Modal — full screen takeover */}
      <CheckinCallScreen
        visible={showCheckinCall}
        onAnswer={() => { setShowCheckinCall(false); setScreen("journal"); }}
        onDecline={async (reason) => {
          setShowCheckinCall(false);
          if (authToken) {
            try { await declineCheckin(reason, authToken); } catch {}
          }
        }}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  hero: {
    margin: 12,
    borderRadius: theme.radiusXl,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    shadowColor: theme.shadowSoft,
    shadowOpacity: 1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4
  },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
  logoDot: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "rgba(10,132,255,0.28)",
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 5
  },
  logoText: { color: "#fff", fontSize: 22, fontWeight: "900" },
  heroTitle: { color: theme.text, fontSize: 28, fontWeight: "800", letterSpacing: -0.5 },
  heroSub: { color: theme.textDim, fontSize: 13, marginTop: 2 },
  liveBadge: { marginLeft: "auto", flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(48,209,88,0.1)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: theme.success },
  liveText: { fontSize: 9, fontWeight: "800", color: theme.success, letterSpacing: 1 },
  heroStats: { flexDirection: "row", gap: 8 },
  navRow: { paddingHorizontal: 12, paddingBottom: 10, gap: 8 },
  content: { padding: 12, paddingBottom: 60 },
});

import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Modal,
} from "react-native";
import { chvCreatePatient, fetchChvMyPatients, createJournalEntry } from "../api";
import { SectionCard } from "../components";
import { theme } from "../theme";

const TOKEN_KEY = "aegisspeak_token_v1";

function ScreeningModal({
  visible,
  token,
  onClose,
  onCreated,
}: {
  visible: boolean;
  token: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [step, setStep] = useState<"register" | "journal" | "done">("register");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password] = useState(() => "Patient@" + Math.random().toString(36).slice(2, 8).toUpperCase());
  const [journalText, setJournalText] = useState("");
  const [createdPatientToken, setCreatedPatientToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [patientId, setPatientId] = useState("");

  async function handleRegister() {
    if (!fullName.trim() || !email.trim()) {
      Alert.alert("Missing Info", "Name and email are required.");
      return;
    }
    setLoading(true);
    try {
      const result = await chvCreatePatient({ fullName: fullName.trim(), email: email.trim(), phone: phone.trim(), password }, token);
      setPatientId(result?.anonymousId || "JRN-????");
      setStep("journal");
    } catch (e: any) {
      Alert.alert("Registration Failed", e?.message || "Could not register patient.");
    } finally {
      setLoading(false);
    }
  }

  async function handleJournalSubmit() {
    if (!journalText.trim()) {
      setStep("done");
      return;
    }
    setLoading(true);
    try {
      // Log in as the new patient to get a token and submit their first journal
      const loginRes = await fetch((globalThis as any).process?.env?.EXPO_PUBLIC_API_BASE || "http://localhost:4000" + "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const loginData = await loginRes.json();
      if (loginData.token) {
        await createJournalEntry({ type: "voice", content: journalText.trim() }, loginData.token);
      }
    } catch {}
    setLoading(false);
    setStep("done");
    onCreated();
  }

  function handleClose() {
    setStep("register");
    setFullName(""); setEmail(""); setPhone(""); setJournalText("");
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <ScrollView contentContainerStyle={ms.content}>
        <View style={ms.header}>
          <Text style={ms.title}>🧑‍⚕️ New Patient Screening</Text>
          <Pressable style={ms.closeBtn} onPress={handleClose} accessibilityRole="button" accessibilityLabel="Close screening">
            <Text style={ms.closeBtnText}>✕</Text>
          </Pressable>
        </View>

        {/* Step indicator */}
        <View style={ms.stepRow}>
          {["Register", "First Journal", "Done"].map((label, i) => {
            const stepIdx = step === "register" ? 0 : step === "journal" ? 1 : 2;
            const active = i <= stepIdx;
            return (
              <React.Fragment key={label}>
                <View style={[ms.stepDot, active && ms.stepDotActive]}>
                  <Text style={[ms.stepNum, active && ms.stepNumActive]}>{i + 1}</Text>
                </View>
                {i < 2 && <View style={[ms.stepLine, active && i < stepIdx && ms.stepLineActive]} />}
              </React.Fragment>
            );
          })}
        </View>

        {step === "register" && (
          <View style={ms.section}>
            <Text style={ms.sectionTitle}>Patient Information</Text>
            <Text style={ms.sectionSub}>Collect basic information to create a confidential account.</Text>
            {[
              { label: "Full Name *", value: fullName, setter: setFullName, placeholder: "Patient's full name", key: "name" },
              { label: "Email *", value: email, setter: setEmail, placeholder: "patient@example.com", key: "email" },
              { label: "Phone", value: phone, setter: setPhone, placeholder: "98XXXXXXXX", key: "phone" },
            ].map(field => (
              <View key={field.key} style={ms.inputGroup}>
                <Text style={ms.inputLabel}>{field.label}</Text>
                <TextInput
                  value={field.value}
                  onChangeText={field.setter}
                  placeholder={field.placeholder}
                  placeholderTextColor={theme.textDim}
                  style={ms.input}
                  autoCapitalize={field.key === "name" ? "words" : "none"}
                  keyboardType={field.key === "phone" ? "phone-pad" : field.key === "email" ? "email-address" : "default"}
                  accessibilityLabel={field.label}
                />
              </View>
            ))}
            <Pressable
              style={[ms.btn, loading && ms.btnDisabled]}
              onPress={handleRegister}
              disabled={loading}
              accessibilityRole="button"
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={ms.btnText}>Register Patient →</Text>}
            </Pressable>
          </View>
        )}

        {step === "journal" && (
          <View style={ms.section}>
            <Text style={ms.sectionTitle}>🎙️ First Journal Entry</Text>
            <Text style={ms.sectionSub}>Use the device microphone to capture the patient's first wellness entry. You can also type their response.</Text>
            <View style={ms.micCard}>
              <Text style={ms.micEmoji}>🎙️</Text>
              <Text style={ms.micNote}>Recording voice input — transcribe or type below.</Text>
            </View>
            <TextInput
              value={journalText}
              onChangeText={setJournalText}
              placeholder="Transcribe patient's voice input or type their response..."
              placeholderTextColor={theme.textDim}
              multiline
              style={ms.journalInput}
              textAlignVertical="top"
              accessibilityLabel="Patient journal entry"
            />
            <Text style={ms.patientIdNote}>Patient ID: {patientId} — all data stored anonymously.</Text>
            <Pressable style={[ms.btn, loading && ms.btnDisabled]} onPress={handleJournalSubmit} disabled={loading} accessibilityRole="button">
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={ms.btnText}>{journalText.trim() ? "Save & Complete" : "Skip for now"}</Text>}
            </Pressable>
          </View>
        )}

        {step === "done" && (
          <View style={[ms.section, { alignItems: "center" }]}>
            <Text style={ms.doneEmoji}>✅</Text>
            <Text style={ms.doneTitle}>Screening Complete!</Text>
            <Text style={ms.doneSub}>Patient registered as {patientId}. They can now log in and continue their wellness journey independently.</Text>
            <Pressable style={ms.btn} onPress={handleClose} accessibilityRole="button">
              <Text style={ms.btnText}>Done</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </Modal>
  );
}

const ms = StyleSheet.create({
  content: { padding: 24, paddingBottom: 40 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  title: { fontSize: 20, fontWeight: "800", color: theme.text },
  closeBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: theme.bgSecondary, alignItems: "center", justifyContent: "center" },
  closeBtnText: { color: theme.textMuted, fontWeight: "700", fontSize: 16 },
  stepRow: { flexDirection: "row", alignItems: "center", marginBottom: 28 },
  stepDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: theme.bgSecondary, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: theme.cardBorder },
  stepDotActive: { backgroundColor: theme.accentDim, borderColor: theme.accent },
  stepNum: { fontSize: 13, fontWeight: "700", color: theme.textDim },
  stepNumActive: { color: theme.accent },
  stepLine: { flex: 1, height: 2, backgroundColor: theme.bgSecondary, marginHorizontal: 4 },
  stepLineActive: { backgroundColor: theme.accent },
  section: { gap: 14 },
  sectionTitle: { fontSize: 19, fontWeight: "700", color: theme.text },
  sectionSub: { fontSize: 13, color: theme.textDim, lineHeight: 19 },
  inputGroup: {},
  inputLabel: { fontSize: 12, fontWeight: "600", color: theme.textMuted, textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: theme.cardBorder, borderRadius: 12, padding: 14, color: theme.text, fontSize: 15, backgroundColor: theme.bgElevated, minHeight: 44 },
  btn: { backgroundColor: theme.accent, borderRadius: 14, paddingVertical: 14, alignItems: "center", minHeight: 44 },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  micCard: { backgroundColor: "rgba(48,209,88,0.08)", borderRadius: 14, padding: 18, alignItems: "center", gap: 8, borderWidth: 1, borderColor: "rgba(48,209,88,0.2)" },
  micEmoji: { fontSize: 36 },
  micNote: { color: theme.success, fontSize: 13, fontWeight: "600", textAlign: "center" },
  journalInput: { borderWidth: 1, borderColor: theme.cardBorder, borderRadius: 12, padding: 14, color: theme.text, fontSize: 15, backgroundColor: theme.bgElevated, minHeight: 120 },
  patientIdNote: { color: theme.textDim, fontSize: 11, textAlign: "center" },
  doneEmoji: { fontSize: 60, marginBottom: 8 },
  doneTitle: { fontSize: 24, fontWeight: "800", color: theme.text },
  doneSub: { fontSize: 14, color: theme.textDim, textAlign: "center", lineHeight: 21 },
});

// ─── Main CommunityScreen ───────────────────────────────────────────────────

export default function CommunityScreen() {
  const [token, setToken] = useState<string | null>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(TOKEN_KEY).then(t => { setToken(t); });
  }, []);

  useEffect(() => {
    if (token) loadPatients();
  }, [token]);

  async function loadPatients() {
    if (!token) return;
    try {
      const data = await fetchChvMyPatients(token);
      setPatients(data.patients || []);
    } catch {
      setPatients([]);
    } finally {
      setLoading(false);
    }
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPatients();
    setRefreshing(false);
  }, [token]);

  return (
    <>
      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} />}
      >
        {/* CHV Header */}
        <View style={s.heroCard}>
          <Text style={s.heroEmoji}>👩‍⚕️</Text>
          <View style={s.heroText}>
            <Text style={s.heroTitle}>FCHV Dashboard</Text>
            <Text style={s.heroSub}>Swastha Swoyam Sebikas — Door-to-Door Screening</Text>
          </View>
          <View style={s.countBadge}>
            <Text style={s.countNum}>{patients.length}</Text>
            <Text style={s.countLabel}>Patients</Text>
          </View>
        </View>

        {/* New Screening CTA */}
        <Pressable
          style={({ pressed }) => [s.screeningBtn, pressed && s.screeningBtnPressed]}
          onPress={() => setShowModal(true)}
          accessibilityRole="button"
          accessibilityLabel="Start new patient screening"
        >
          <Text style={s.screeningBtnIcon}>➕</Text>
          <View>
            <Text style={s.screeningBtnTitle}>New Screening</Text>
            <Text style={s.screeningBtnSub}>Register a patient and record first entry</Text>
          </View>
          <Text style={s.screeningBtnArrow}>→</Text>
        </Pressable>

        {/* Patient list */}
        <SectionCard title="📋 My Patients" subtitle={`${patients.length} patients registered by you`}>
          {loading ? (
            <ActivityIndicator color={theme.accent} />
          ) : patients.length === 0 ? (
            <View style={s.empty}>
              <Text style={s.emptyEmoji}>🌱</Text>
              <Text style={s.emptyTitle}>No patients yet</Text>
              <Text style={s.emptyDesc}>Use "New Screening" to register your first patient.</Text>
            </View>
          ) : (
            patients.map(p => (
              <View key={p.id} style={s.patientRow}>
                <View style={s.patientAvatar}>
                  <Text style={s.patientAvatarText}>🧑</Text>
                </View>
                <View style={s.patientInfo}>
                  <Text style={s.patientName}>{p.fullName}</Text>
                  <Text style={s.patientMeta}>{p.anonymousId || "Pending ID"} · Added {new Date(p.createdAt).toLocaleDateString()}</Text>
                  {p.phone && <Text style={s.patientPhone}>{p.phone}</Text>}
                </View>
                <View style={[s.statusDot, { backgroundColor: p.isActive ? theme.success : theme.textDim }]} />
              </View>
            ))
          )}
        </SectionCard>

        {/* Info card */}
        <View style={s.infoCard}>
          <Text style={s.infoTitle}>🔒 Privacy Protocol</Text>
          <Text style={s.infoText}>
            Patients are registered with anonymous IDs. Doctors only see their journal IDs — never names or contact info. Your screening records are stored securely.
          </Text>
        </View>
      </ScrollView>

      {token && (
        <ScreeningModal
          visible={showModal}
          token={token}
          onClose={() => setShowModal(false)}
          onCreated={() => { setShowModal(false); loadPatients(); }}
        />
      )}
    </>
  );
}

const s = StyleSheet.create({
  content: { padding: 12, paddingBottom: 60 },
  heroCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: theme.card, borderRadius: theme.radiusLg,
    borderWidth: 1, borderColor: theme.cardBorder,
    padding: 18, marginBottom: 14,
    shadowColor: theme.shadowSoft, shadowOpacity: 1, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 3,
  },
  heroEmoji: { fontSize: 32 },
  heroText: { flex: 1 },
  heroTitle: { fontSize: 17, fontWeight: "800", color: theme.text },
  heroSub: { fontSize: 12, color: theme.textDim, marginTop: 2 },
  countBadge: { backgroundColor: theme.accentDim, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, alignItems: "center" },
  countNum: { fontSize: 22, fontWeight: "800", color: theme.accent },
  countLabel: { fontSize: 10, color: theme.accent, fontWeight: "600", textTransform: "uppercase" },
  screeningBtn: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: theme.accent, borderRadius: theme.radiusLg,
    padding: 18, marginBottom: 14, minHeight: 44,
    shadowColor: "rgba(10,132,255,0.3)", shadowOpacity: 1, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 4,
  },
  screeningBtnPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  screeningBtnIcon: { fontSize: 26, color: "#fff" },
  screeningBtnTitle: { color: "#fff", fontSize: 16, fontWeight: "800" },
  screeningBtnSub: { color: "rgba(255,255,255,0.75)", fontSize: 12, marginTop: 2 },
  screeningBtnArrow: { marginLeft: "auto", color: "#fff", fontSize: 20, fontWeight: "700" },
  empty: { alignItems: "center", paddingVertical: 20, gap: 8 },
  emptyEmoji: { fontSize: 40 },
  emptyTitle: { fontSize: 17, fontWeight: "700", color: theme.text },
  emptyDesc: { fontSize: 13, color: theme.textDim, textAlign: "center" },
  patientRow: {
    flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: theme.divider,
  },
  patientAvatar: { width: 40, height: 40, borderRadius: 12, backgroundColor: theme.accentDim, alignItems: "center", justifyContent: "center" },
  patientAvatarText: { fontSize: 18 },
  patientInfo: { flex: 1 },
  patientName: { fontSize: 15, fontWeight: "700", color: theme.text },
  patientMeta: { fontSize: 12, color: theme.textDim, marginTop: 2 },
  patientPhone: { fontSize: 11, color: theme.textDim, marginTop: 2 },
  statusDot: { width: 10, height: 10, borderRadius: 999 },
  infoCard: {
    backgroundColor: "rgba(10,132,255,0.06)", borderRadius: theme.radiusMd,
    borderWidth: 1, borderColor: theme.cardBorder, padding: 16, marginTop: 4,
  },
  infoTitle: { fontSize: 14, fontWeight: "700", color: theme.accent, marginBottom: 6 },
  infoText: { fontSize: 13, color: theme.textDim, lineHeight: 20 },
});

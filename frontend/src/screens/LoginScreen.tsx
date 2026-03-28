import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { theme } from "../theme";

// @ts-ignore — Expo replaces this at build time via babel
const API_BASE = (typeof process !== 'undefined' && process?.env?.EXPO_PUBLIC_API_BASE) || "http://localhost:4000";

const ROLES = [
  { key: "patient", icon: "🧑", label: "Patient" },
  { key: "doctor", icon: "🩺", label: "Doctor" },
  { key: "guardian", icon: "👨‍👩‍👧", label: "Guardian" },
  { key: "super_admin", icon: "🛡️", label: "Admin" },
  { key: "chv", icon: "🏥", label: "FCHV" },
];

const DEMO_CREDENTIALS = [
  { label: "🛡️ Super Admin", email: "admin@aegisspeak.com", password: "AegisAdmin@2026", role: "super_admin" },
];

interface LoginScreenProps {
  onLoginSuccess: (token: string, user: any) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("patient");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!data.ok || !data.data?.token) {
        throw new Error(data.error?.message || "Invalid credentials");
      }
      onLoginSuccess(data.data.token, data.data.user);
    } catch (e: any) {
      setError(e.message || "Login failed. Check your credentials.");
    }
    setLoading(false);
  };

  const fillDemo = (cred: typeof DEMO_CREDENTIALS[0]) => {
    setEmail(cred.email);
    setPassword(cred.password);
    setSelectedRole(cred.role);
  };

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        {/* Brand */}
        <View style={s.brandRow}>
          <Text style={s.logo}>🛡️</Text>
          <View>
            <Text style={s.brandText}>AegisSpeak</Text>
            <Text style={s.brandSub}>AI Mental Health Copilot</Text>
          </View>
        </View>

        <Text style={s.heroTitle}>Predictive, Personalized,{"\n"}Privacy-First Care</Text>
        <Text style={s.heroParagraph}>
          Secure mental health support for patients, doctors, guardians, and administrators.
        </Text>

        {/* Role Selector */}
        <View style={s.roleRow}>
          {ROLES.map((r) => (
            <Pressable
              key={r.key}
              onPress={() => setSelectedRole(r.key)}
              style={[s.roleBtn, selectedRole === r.key && s.roleBtnActive]}
            >
              <Text style={s.roleIcon}>{r.icon}</Text>
              <Text style={[s.roleLabel, selectedRole === r.key && s.roleLabelActive]}>{r.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Form */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Sign In</Text>

          <Text style={s.inputLabel}>Email Address</Text>
          <TextInput
            style={s.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@aegisspeak.com"
            placeholderTextColor={theme.textDim}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={s.inputLabel}>Password</Text>
          <TextInput
            style={s.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            placeholderTextColor={theme.textDim}
            secureTextEntry
          />

          {!!error && <Text style={s.error}>{error}</Text>}

          <Pressable style={({ pressed }) => [s.submitBtn, pressed && s.pressed]} onPress={handleLogin} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={s.submitText}>Sign In</Text>
            )}
          </Pressable>
        </View>

        {/* Demo Credentials */}
        <View style={s.demoBox}>
          <Text style={s.demoTitle}>Demo Credentials</Text>
          {DEMO_CREDENTIALS.map((cred, i) => (
            <Pressable key={i} style={s.demoBtn} onPress={() => fillDemo(cred)}>
              <Text style={s.demoLabel}>{cred.label} — {cred.email}</Text>
            </Pressable>
          ))}
          <Text style={s.demoHint}>Password: AegisAdmin@2026</Text>
        </View>

        {/* Footer */}
        <Text style={s.footer}>HIPAA · GDPR Compliant · Nepal-US Hackathon 2026</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  scroll: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40, alignItems: "center" },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 24 },
  logo: { fontSize: 36 },
  brandText: { fontSize: 24, fontWeight: "800", color: theme.text },
  brandSub: { fontSize: 13, color: theme.textDim },
  heroTitle: { fontSize: 26, fontWeight: "800", color: theme.text, textAlign: "center", marginBottom: 8, lineHeight: 32 },
  heroParagraph: { fontSize: 14, color: theme.textMuted, textAlign: "center", marginBottom: 28, lineHeight: 20, maxWidth: 340 },
  roleRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 24 },
  roleBtn: {
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1,
    borderColor: theme.cardBorder, backgroundColor: theme.bgElevated, alignItems: "center", minWidth: 60,
  },
  roleBtnActive: { borderColor: "rgba(10,132,255,0.5)", backgroundColor: theme.accentDim },
  roleIcon: { fontSize: 20, marginBottom: 2 },
  roleLabel: { fontSize: 11, fontWeight: "600", color: theme.textMuted },
  roleLabelActive: { color: theme.accent },
  card: {
    backgroundColor: theme.card, borderRadius: theme.radiusLg, padding: 20, borderWidth: 1,
    borderColor: theme.cardBorder, width: "100%", maxWidth: 400, marginBottom: 20,
  },
  cardTitle: { fontSize: 20, fontWeight: "700", color: theme.text, marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: "600", color: theme.textDim, marginBottom: 6, marginTop: 8 },
  input: {
    backgroundColor: theme.bgElevated, borderRadius: 12, borderWidth: 1, borderColor: theme.cardBorder,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: theme.text, marginBottom: 4,
  },
  error: { color: theme.danger, fontSize: 13, marginTop: 8, textAlign: "center" },
  submitBtn: {
    backgroundColor: theme.accent, borderRadius: 12, paddingVertical: 14, alignItems: "center",
    marginTop: 16, minHeight: 48,
  },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  pressed: { opacity: 0.8 },
  demoBox: {
    backgroundColor: theme.bgElevated, borderRadius: 14, padding: 16, borderWidth: 1,
    borderColor: theme.cardBorder, width: "100%", maxWidth: 400, marginBottom: 20,
  },
  demoTitle: { fontSize: 13, fontWeight: "700", color: theme.textDim, marginBottom: 8 },
  demoBtn: {
    backgroundColor: theme.accentDim, borderRadius: 10, padding: 12, marginBottom: 6,
  },
  demoLabel: { fontSize: 13, color: theme.accent, fontWeight: "600" },
  demoHint: { fontSize: 12, color: theme.textDim, marginTop: 4 },
  footer: { fontSize: 11, color: theme.textDim, textAlign: "center", marginTop: 8 },
});

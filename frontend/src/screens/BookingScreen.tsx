import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { fetchAvailableDoctors, payForAppointment, requestAppointment } from "../api";
import { SectionCard } from "../components";
import { theme } from "../theme";
import { AvailableDoctor } from "../types";

const TOKEN_KEY = "aegisspeak_token_v1";

const DOCTOR_TYPE_LABELS: Record<string, string> = {
  psychiatrist: "Psychiatrist",
  psychologist: "Psychologist",
  general: "General Counselor",
};

const DOCTOR_TYPE_ICONS: Record<string, string> = {
  psychiatrist: "🧠",
  psychologist: "💡",
  general: "🩺",
};

type Step = "select" | "pay" | "done";

export default function BookingScreen() {
  const [token, setToken] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<AvailableDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState<AvailableDoctor | null>(null);
  const [step, setStep] = useState<Step>("select");
  const [appointmentId, setAppointmentId] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [booking, setBooking] = useState(false);
  const [receipt, setReceipt] = useState<any>(null);

  useEffect(() => {
    AsyncStorage.getItem(TOKEN_KEY).then(async t => {
      setToken(t);
      if (t) {
        try {
          const data = await fetchAvailableDoctors(t);
          setDoctors(data.doctors || []);
        } catch {
          // offline fallback - show placeholder doctors
          setDoctors([
            { doctorCode: "DR-A1B2", doctorType: "psychiatrist", isActive: true, consultationFee: 800 },
            { doctorCode: "DR-C3D4", doctorType: "psychologist", isActive: true, consultationFee: 600 },
            { doctorCode: "DR-E5F6", doctorType: "general", isActive: true, consultationFee: 400 },
          ]);
        }
        setLoading(false);
      } else {
        setLoading(false);
      }
    });
  }, []);

  async function handleSelectDoctor(doctor: AvailableDoctor) {
    if (!token) return;
    setSelectedDoctor(doctor);
    setBooking(true);
    try {
      const result = await requestAppointment({ doctorCode: doctor.doctorCode }, token);
      setAppointmentId(result.appointmentId);
      setStep("pay");
    } catch (e) {
      Alert.alert("Booking Failed", "Could not request appointment. Try again.");
    } finally {
      setBooking(false);
    }
  }

  async function handlePayment() {
    if (!token || !appointmentId) return;
    if (cardNumber.replace(/\s/g, "").length < 16) {
      Alert.alert("Card Error", "Please enter a valid 16-digit card number.");
      return;
    }
    setPaying(true);
    try {
      const result = await payForAppointment(appointmentId, token);
      setReceipt(result.receipt);
      setStep("done");
    } catch (e) {
      Alert.alert("Payment Failed", "Payment could not be processed. Try again.");
    } finally {
      setPaying(false);
    }
  }

  function formatCard(text: string) {
    const digits = text.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  }

  if (!token) {
    return (
      <View style={s.empty}>
        <Text style={s.emptyTitle}>🔒 Sign in required</Text>
        <Text style={s.emptyDesc}>You need to be logged in to book a consultation.</Text>
      </View>
    );
  }

  if (step === "done" && receipt) {
    return (
      <ScrollView contentContainerStyle={s.content}>
        <View style={s.successCard}>
          <Text style={s.successEmoji}>✅</Text>
          <Text style={s.successTitle}>Consultation Booked!</Text>
          <Text style={s.successSub}>A counselor will be in touch with you soon.</Text>
          <View style={s.receiptBox}>
            <Text style={s.receiptLabel}>Receipt</Text>
            <View style={s.receiptRow}>
              <Text style={s.receiptKey}>Service</Text>
              <Text style={s.receiptVal}>{receipt.service}</Text>
            </View>
            <View style={s.receiptRow}>
              <Text style={s.receiptKey}>Amount</Text>
              <Text style={s.receiptVal}>NPR {receipt.amount}</Text>
            </View>
            <View style={s.receiptRow}>
              <Text style={s.receiptKey}>Date</Text>
              <Text style={s.receiptVal}>{new Date(receipt.paidAt).toLocaleDateString()}</Text>
            </View>
          </View>
          <Text style={s.privacyNote}>
            🔒 Your identity remains anonymous to the doctor. They only see your journal ID.
          </Text>
          <Pressable style={s.doneBtn} onPress={() => setStep("select")} accessibilityRole="button">
            <Text style={s.doneBtnText}>Done</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  if (step === "pay" && selectedDoctor) {
    return (
      <ScrollView contentContainerStyle={s.content}>
        <SectionCard
          title="💳 Consultation Payment"
          subtitle="Your identity remains anonymous to the doctor. Pay to confirm your booking."
        >
          <View style={s.selectedDocCard}>
            <Text style={s.docIcon}>{DOCTOR_TYPE_ICONS[selectedDoctor.doctorType] || "🩺"}</Text>
            <View>
              <Text style={s.docCode}>{selectedDoctor.doctorCode}</Text>
              <Text style={s.docType}>{DOCTOR_TYPE_LABELS[selectedDoctor.doctorType] || "Counselor"}</Text>
            </View>
            <View style={s.feeTag}>
              <Text style={s.feeText}>NPR {selectedDoctor.consultationFee}</Text>
            </View>
          </View>

          <View style={s.inputGroup}>
            <Text style={s.inputLabel}>Card Number</Text>
            <TextInput
              value={cardNumber}
              onChangeText={t => setCardNumber(formatCard(t))}
              placeholder="1234 5678 9012 3456"
              placeholderTextColor={theme.textDim}
              keyboardType="number-pad"
              style={s.cardInput}
              maxLength={19}
              accessibilityLabel="Card number input"
            />
          </View>

          <View style={s.cardRow}>
            <View style={[s.inputGroup, { flex: 1 }]}>
              <Text style={s.inputLabel}>Expiry</Text>
              <TextInput
                value={expiry}
                onChangeText={setExpiry}
                placeholder="MM/YY"
                placeholderTextColor={theme.textDim}
                keyboardType="number-pad"
                style={s.cardInput}
                maxLength={5}
                accessibilityLabel="Card expiry date"
              />
            </View>
            <View style={[s.inputGroup, { flex: 1 }]}>
              <Text style={s.inputLabel}>CVV</Text>
              <TextInput
                value={cvv}
                onChangeText={setCvv}
                placeholder="123"
                placeholderTextColor={theme.textDim}
                keyboardType="number-pad"
                style={s.cardInput}
                maxLength={3}
                secureTextEntry
                accessibilityLabel="Card CVV"
              />
            </View>
          </View>

          <View style={s.testNote}>
            <Text style={s.testNoteText}>🧪 Demo: Use any 16-digit number to simulate payment</Text>
          </View>

          <Pressable
            style={[s.payBtn, paying && s.payBtnDisabled]}
            onPress={handlePayment}
            disabled={paying}
            accessibilityRole="button"
            accessibilityLabel="Confirm payment"
          >
            {paying ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={s.payBtnText}>Pay NPR {selectedDoctor.consultationFee} & Confirm</Text>
            )}
          </Pressable>
          <Pressable style={s.backBtn} onPress={() => setStep("select")} accessibilityRole="button">
            <Text style={s.backBtnText}>← Choose Different Doctor</Text>
          </Pressable>
        </SectionCard>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <SectionCard
        title="🩺 Choose a Doctor"
        subtitle="All doctors are verified professionals shown anonymously. Your identity is protected."
      >
        {loading ? (
          <ActivityIndicator color={theme.accent} />
        ) : doctors.length === 0 ? (
          <Text style={s.emptyDesc}>No doctors available right now. Check back soon.</Text>
        ) : (
          doctors.map((doc) => (
            <Pressable
              key={doc.doctorCode}
              style={({ pressed }) => [s.docCard, pressed && s.docCardPressed]}
              onPress={() => handleSelectDoctor(doc)}
              disabled={booking}
              accessibilityRole="button"
              accessibilityLabel={`Select ${DOCTOR_TYPE_LABELS[doc.doctorType] || "doctor"}`}
            >
              <View style={s.docIconWrap}>
                <Text style={s.docIcon}>{DOCTOR_TYPE_ICONS[doc.doctorType] || "🩺"}</Text>
              </View>
              <View style={s.docInfo}>
                <Text style={s.docCode}>{doc.doctorCode}</Text>
                <Text style={s.docType}>{DOCTOR_TYPE_LABELS[doc.doctorType] || "Counselor"}</Text>
                <Text style={s.docAvail}>🟢 Available</Text>
              </View>
              <View style={s.docFeeWrap}>
                <Text style={s.feeAmount}>NPR</Text>
                <Text style={s.feeAmountBig}>{doc.consultationFee}</Text>
                <Text style={s.feeSession}>/ session</Text>
              </View>
            </Pressable>
          ))
        )}
      </SectionCard>

      <View style={s.privacyCard}>
        <Text style={s.privacyTitle}>🔒 Your Privacy is Protected</Text>
        <Text style={s.privacyText}>
          Doctors only see your anonymous journal ID (e.g., JRN-A7X3). They never see your name, email, or phone number.
        </Text>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  content: { padding: 12, paddingBottom: 60 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  emptyTitle: { fontSize: 22, fontWeight: "800", color: theme.text, marginBottom: 8 },
  emptyDesc: { color: theme.textDim, fontSize: 14, textAlign: "center" },
  // Doctor cards
  docCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.bgElevated,
    borderRadius: theme.radiusMd,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    padding: 16,
    marginBottom: 10,
    gap: 14,
    minHeight: 44,
    shadowColor: theme.shadowSoft,
    shadowOpacity: 1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  docCardPressed: { opacity: 0.8, transform: [{ scale: 0.99 }] },
  docIconWrap: { width: 48, height: 48, borderRadius: 14, backgroundColor: theme.accentDim, alignItems: "center", justifyContent: "center" },
  docIcon: { fontSize: 24 },
  docInfo: { flex: 1 },
  docCode: { fontSize: 15, fontWeight: "800", color: theme.text },
  docType: { fontSize: 13, color: theme.textDim, marginTop: 2 },
  docAvail: { fontSize: 11, color: theme.success, marginTop: 4, fontWeight: "600" },
  docFeeWrap: { alignItems: "flex-end" },
  feeAmount: { fontSize: 10, color: theme.textDim, fontWeight: "600" },
  feeAmountBig: { fontSize: 22, fontWeight: "800", color: theme.text },
  feeSession: { fontSize: 10, color: theme.textDim },
  // Selected doctor card
  selectedDocCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: theme.accentDim, borderRadius: theme.radiusMd,
    padding: 14, marginBottom: 20,
  },
  feeTag: { marginLeft: "auto", backgroundColor: theme.accent, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  feeText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  // Payment form
  inputGroup: { marginBottom: 12 },
  inputLabel: { color: theme.textMuted, fontSize: 12, fontWeight: "600", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.3 },
  cardInput: {
    borderWidth: 1, borderColor: theme.cardBorder, borderRadius: 12,
    padding: 14, color: theme.text, fontSize: 15, backgroundColor: theme.bgElevated,
    minHeight: 44,
  },
  cardRow: { flexDirection: "row", gap: 12 },
  testNote: { backgroundColor: "rgba(255,159,10,0.1)", borderRadius: 10, padding: 10, marginBottom: 14 },
  testNoteText: { color: theme.warning, fontSize: 12, fontWeight: "600" },
  payBtn: {
    backgroundColor: theme.accent, borderRadius: 14,
    paddingVertical: 15, alignItems: "center", marginBottom: 10, minHeight: 44,
  },
  payBtnDisabled: { opacity: 0.5 },
  payBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  backBtn: { alignItems: "center", paddingVertical: 12, minHeight: 44 },
  backBtnText: { color: theme.textDim, fontSize: 14 },
  // Privacy card
  privacyCard: {
    backgroundColor: "rgba(10,132,255,0.06)", borderRadius: theme.radiusMd,
    borderWidth: 1, borderColor: theme.cardBorder, padding: 16, marginTop: 4,
  },
  privacyTitle: { fontSize: 14, fontWeight: "700", color: theme.accent, marginBottom: 6 },
  privacyText: { fontSize: 13, color: theme.textDim, lineHeight: 20 },
  // Success
  successCard: { padding: 24, alignItems: "center", gap: 14 },
  successEmoji: { fontSize: 60, marginBottom: 8 },
  successTitle: { fontSize: 26, fontWeight: "800", color: theme.text },
  successSub: { fontSize: 15, color: theme.textDim, textAlign: "center", lineHeight: 22 },
  receiptBox: {
    width: "100%", backgroundColor: theme.bgElevated, borderRadius: theme.radiusMd,
    borderWidth: 1, borderColor: theme.cardBorder, padding: 18, gap: 10,
  },
  receiptLabel: { fontSize: 12, fontWeight: "700", color: theme.textDim, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  receiptRow: { flexDirection: "row", justifyContent: "space-between" },
  receiptKey: { color: theme.textDim, fontSize: 14 },
  receiptVal: { color: theme.text, fontWeight: "700", fontSize: 14 },
  privacyNote: { color: theme.textDim, fontSize: 12, textAlign: "center", lineHeight: 18 },
  doneBtn: {
    backgroundColor: theme.accent, borderRadius: 14, paddingHorizontal: 40,
    paddingVertical: 14, minHeight: 44,
  },
  doneBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});

import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  createJournalEntry,
  declineConsultation,
  fetchMyJournals,
  requestMyAiAnalysis,
} from "../api";
import { SectionCard, ToggleRow } from "../components";
import { theme } from "../theme";
import { AiAnalysis, AiSuggestion, JournalEntry } from "../types";

const TOKEN_KEY = "aegisspeak_token_v1";

type Props = {
  onNavigateBooking?: () => void;
};

const SUGGESTION_ICONS: Record<string, string> = {
  music: "🎵",
  article: "📖",
  exercise: "🚶",
  breathing: "🫁",
  social: "💬",
  selfcare: "💧",
};

function AiSuggestionCard({ suggestion }: { suggestion: AiSuggestion }) {
  const icon = suggestion.icon || SUGGESTION_ICONS[suggestion.category] || "✨";
  return (
    <View style={s.suggestionCard}>
      <View style={s.suggestionLeft}>
        <Text style={s.suggestionIcon}>{icon}</Text>
      </View>
      <View style={s.suggestionBody}>
        <Text style={s.suggestionTitle}>{suggestion.title}</Text>
        <Text style={s.suggestionDesc}>{suggestion.desc}</Text>
        <View style={s.suggestionBadge}>
          <Text style={s.suggestionBadgeText}>{suggestion.category}</Text>
        </View>
      </View>
    </View>
  );
}

function ConsultationCard({ message, onYes, onNo }: { message: string; onYes: () => void; onNo: () => void }) {
  return (
    <View style={s.consultCard}>
      <View style={s.consultHeader}>
        <Text style={s.consultEmoji}>💚</Text>
        <Text style={s.consultTitle}>A note for you</Text>
      </View>
      <Text style={s.consultMessage}>{message}</Text>
      <View style={s.consultActions}>
        <Pressable style={s.consultYes} onPress={onYes} accessibilityRole="button" accessibilityLabel="Yes, connect with a doctor">
          <Text style={s.consultYesText}>Yes, I'd like that</Text>
        </Pressable>
        <Pressable style={s.consultNo} onPress={onNo} accessibilityRole="button" accessibilityLabel="No, not right now">
          <Text style={s.consultNoText}>Not right now</Text>
        </Pressable>
      </View>
    </View>
  );
}

function JournalEntryRow({ entry }: { entry: JournalEntry }) {
  const typeEmoji: Record<string, string> = { text: "📝", voice: "🎙️", wearable: "⌚", call: "📞" };
  const sentimentColor = entry.sentiment
    ? entry.sentiment.level === "positive" ? theme.success : entry.sentiment.level === "neutral" ? theme.warning : theme.danger
    : theme.textDim;

  return (
    <View style={s.entryRow}>
      <Text style={s.entryType}>{typeEmoji[entry.type] || "📝"}</Text>
      <View style={s.entryBody}>
        <Text style={s.entryContent} numberOfLines={2}>
          {entry.checkinDecline
            ? `⏭ Skipped check-in: ${entry.checkinDecline.reason}`
            : entry.content || `[${entry.type} entry]`}
        </Text>
        <View style={s.entryMeta}>
          <Text style={s.entryDate}>{new Date(entry.createdAt).toLocaleDateString()}</Text>
          {entry.sentiment && (
            <View style={[s.sentimentDot, { backgroundColor: sentimentColor }]} />
          )}
          {entry.wearableData && <Text style={s.entryBadge}>⌚ Wearable</Text>}
        </View>
      </View>
    </View>
  );
}

export default function JournalScreen({ onNavigateBooking }: Props) {
  const [token, setToken] = useState<string | null>(null);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [analysis, setAnalysis] = useState<AiAnalysis | null>(null);
  const [consultation, setConsultation] = useState<{ suggest: boolean; message: string | null }>({ suggest: false, message: null });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newText, setNewText] = useState("");
  const [posting, setPosting] = useState(false);
  const [showConsult, setShowConsult] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    AsyncStorage.getItem(TOKEN_KEY).then(t => { setToken(t); });
  }, []);

  useEffect(() => {
    if (token) { loadData(); }
  }, [token]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.03, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  async function loadData() {
    if (!token) return;
    try {
      const data = await fetchMyJournals(token);
      setJournals((data.journals || []).slice(0, 20));
      if (data.consultation?.suggest) {
        setConsultation(data.consultation);
        setShowConsult(true);
      }
    } catch (e) {
      /* offline — show cached */
    } finally {
      setLoading(false);
    }
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [token]);

  async function runAiAnalysis() {
    if (!token) return;
    setAnalysisLoading(true);
    try {
      const result = await requestMyAiAnalysis(token);
      setAnalysis(result.analysis);
      if (result.consultation?.suggest) {
        setConsultation(result.consultation);
        setShowConsult(true);
      }
    } catch (e) {
      Alert.alert("Not available", "Connect to the internet for AI analysis.");
    } finally {
      setAnalysisLoading(false);
    }
  }

  async function submitEntry() {
    if (!token || !newText.trim()) return;
    setPosting(true);
    try {
      const result = await createJournalEntry({ type: "text", content: newText.trim() }, token);
      setNewText("");
      await loadData();
      if (result.consultation?.suggest) {
        setConsultation(result.consultation);
        setShowConsult(true);
      }
    } catch (e) {
      Alert.alert("Could not save", "Journal could not be saved. Try again.");
    } finally {
      setPosting(false);
    }
  }

  async function handleDeclineConsultation() {
    setShowConsult(false);
    if (!token) return;
    try {
      await declineConsultation("User declined from journal screen", token);
    } catch {}
  }

  if (!token) {
    return (
      <View style={s.empty}>
        <Text style={s.emptyTitle}>🔒 Sign in to journal</Text>
        <Text style={s.emptyDesc}>Your journal requires authentication.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} />}
    >
      {/* Consultation prompt */}
      {showConsult && consultation.message && (
        <ConsultationCard
          message={consultation.message}
          onYes={() => { setShowConsult(false); onNavigateBooking?.(); }}
          onNo={handleDeclineConsultation}
        />
      )}

      {/* New journal entry */}
      <SectionCard title="📝 Today's Journal" subtitle="Write what's on your mind — your words are private.">
        <TextInput
          value={newText}
          onChangeText={setNewText}
          placeholder="How are you feeling today? Share a thought, a memory, or just what happened..."
          placeholderTextColor={theme.textDim}
          multiline
          style={s.journalInput}
          accessibilityLabel="Journal entry text input"
          accessibilityHint="Write your thoughts for today"
          textAlignVertical="top"
        />
        <View style={s.charRow}>
          <Text style={s.charCount}>{newText.length} / 500</Text>
          <Pressable
            style={[s.submitBtn, (!newText.trim() || posting) && s.submitBtnDisabled]}
            onPress={submitEntry}
            disabled={!newText.trim() || posting}
            accessibilityRole="button"
            accessibilityLabel="Save journal entry"
          >
            {posting ? (
              <ActivityIndicator color={theme.white} size="small" />
            ) : (
              <Text style={s.submitBtnText}>Save Entry ✓</Text>
            )}
          </Pressable>
        </View>
      </SectionCard>

      {/* AI Suggestions */}
      <SectionCard title="✨ Wellness Suggestions" subtitle="Gentle habits that might help you feel better today.">
        {analysis ? (
          <>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <View style={s.encourageBox}>
                <Text style={s.encourageText}>{analysis.encouragement}</Text>
              </View>
            </Animated.View>
            <Text style={s.trendSummary}>{analysis.trendSummary}</Text>
            {analysis.suggestions.map((s_, i) => (
              <AiSuggestionCard key={i} suggestion={s_} />
            ))}
          </>
        ) : (
          <View style={s.analysisCta}>
            <Text style={s.analysisCtaText}>Get personalized wellness suggestions based on your last 30 days.</Text>
            <Pressable
              style={s.analysisBtn}
              onPress={runAiAnalysis}
              disabled={analysisLoading}
              accessibilityRole="button"
            >
              {analysisLoading ? (
                <ActivityIndicator color={theme.white} size="small" />
              ) : (
                <Text style={s.analysisBtnText}>✨ Generate My Suggestions</Text>
              )}
            </Pressable>
          </View>
        )}
      </SectionCard>

      {/* Recent entries */}
      <SectionCard title="📚 Recent Entries" subtitle={`${journals.length} journal entries`}>
        {loading ? (
          <ActivityIndicator color={theme.accent} />
        ) : journals.length === 0 ? (
          <Text style={s.emptyDesc}>No entries yet. Write your first one above! 🌱</Text>
        ) : (
          journals.map(entry => <JournalEntryRow key={entry.id} entry={entry} />)
        )}
      </SectionCard>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  content: { padding: 12, paddingBottom: 60 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  emptyTitle: { fontSize: 22, fontWeight: "800", color: theme.text, marginBottom: 8 },
  emptyDesc: { color: theme.textDim, fontSize: 14, textAlign: "center" },
  // Consultation card
  consultCard: {
    backgroundColor: "#ecfdf5",
    borderRadius: theme.radiusLg,
    borderWidth: 1.5,
    borderColor: "#a7f3d0",
    padding: 20,
    marginBottom: 14,
    shadowColor: theme.shadowSoft,
    shadowOpacity: 1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  consultHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  consultEmoji: { fontSize: 24 },
  consultTitle: { fontSize: 17, fontWeight: "700", color: "#065f46" },
  consultMessage: { color: "#047857", fontSize: 14, lineHeight: 22, marginBottom: 16 },
  consultActions: { flexDirection: "row", gap: 10 },
  consultYes: {
    flex: 1, backgroundColor: "#059669", borderRadius: 12,
    paddingVertical: 13, alignItems: "center", minHeight: 44,
  },
  consultYesText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  consultNo: {
    flex: 1, backgroundColor: "transparent", borderRadius: 12, borderWidth: 1,
    borderColor: "#a7f3d0", paddingVertical: 13, alignItems: "center", minHeight: 44,
  },
  consultNoText: { color: "#047857", fontWeight: "600", fontSize: 14 },
  // Journal input
  journalInput: {
    borderWidth: 1,
    borderColor: theme.cardBorder,
    borderRadius: theme.radiusMd,
    padding: 14,
    color: theme.text,
    fontSize: 15,
    lineHeight: 22,
    backgroundColor: theme.bgElevated,
    minHeight: 120,
    marginBottom: 10,
  },
  charRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  charCount: { color: theme.textDim, fontSize: 12 },
  submitBtn: {
    backgroundColor: theme.accent, borderRadius: 12,
    paddingHorizontal: 20, paddingVertical: 11, minHeight: 44, minWidth: 44,
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  // AI Suggestions
  encourageBox: {
    backgroundColor: theme.accentDim, borderRadius: theme.radiusMd,
    padding: 14, marginBottom: 12,
  },
  encourageText: { color: theme.accent, fontSize: 14, fontWeight: "600", lineHeight: 21 },
  trendSummary: { color: theme.textDim, fontSize: 12, marginBottom: 10, lineHeight: 18 },
  suggestionCard: {
    flexDirection: "row",
    backgroundColor: theme.bgElevated,
    borderRadius: theme.radiusMd,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    borderLeftWidth: 4,
    borderLeftColor: theme.accent,
    padding: 14,
    marginBottom: 10,
    gap: 12,
    minHeight: 44,
  },
  suggestionLeft: { justifyContent: "center" },
  suggestionIcon: { fontSize: 24 },
  suggestionBody: { flex: 1 },
  suggestionTitle: { fontSize: 15, fontWeight: "700", color: theme.text, marginBottom: 3 },
  suggestionDesc: { fontSize: 13, color: theme.textDim, lineHeight: 19 },
  suggestionBadge: {
    marginTop: 6, alignSelf: "flex-start",
    backgroundColor: theme.accentDim, borderRadius: 999,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  suggestionBadgeText: { color: theme.accent, fontSize: 10, fontWeight: "700", textTransform: "uppercase" },
  // Analysis CTA
  analysisCta: { alignItems: "center", gap: 12, paddingVertical: 8 },
  analysisCtaText: { color: theme.textDim, fontSize: 14, textAlign: "center", lineHeight: 21 },
  analysisBtn: {
    backgroundColor: theme.accent, borderRadius: 14,
    paddingHorizontal: 20, paddingVertical: 13, minHeight: 44,
  },
  analysisBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  // Entry list
  entryRow: {
    flexDirection: "row", gap: 12, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: theme.divider,
  },
  entryType: { fontSize: 20, marginTop: 2 },
  entryBody: { flex: 1 },
  entryContent: { fontSize: 14, color: theme.text, lineHeight: 20 },
  entryMeta: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  entryDate: { fontSize: 11, color: theme.textDim },
  sentimentDot: { width: 8, height: 8, borderRadius: 999 },
  entryBadge: { fontSize: 10, color: theme.textDim, backgroundColor: theme.bgSecondary, borderRadius: 999, paddingHorizontal: 6, paddingVertical: 2 },
});

import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { sendChatMessage } from "../api";
import { ChoiceChip, SectionCard } from "../components";
import {
  ChatMessage, CheckinInput, CheckinResponse, LanguageCode, MemoryItem,
  Personality, Preferences, clamp, getLanguageLabel, getPersonalityLabel
} from "../constants";
import { theme } from "../theme";

type Props = {
  input: CheckinInput;
  result: CheckinResponse | null;
  preferences: Preferences;
  memory: MemoryItem[];
  chatHistory: ChatMessage[];
  onPersistChat: (msgs: ChatMessage[]) => Promise<void>;
  onPersistPrefs: (p: Preferences) => Promise<void>;
};

function getContextRecommendations(prefs: Preferences, input: CheckinInput): string[] {
  const recs: string[] = [];
  if (prefs.calendarLoad === "heavy") recs.push("Schedule a 7-minute decompression block after your next meeting cluster.");
  if (input.sleepHours < 6) recs.push("Avoid caffeine for 3 hours and begin your wind-down routine earlier tonight.");
  if (prefs.locationTag.toLowerCase().includes("kathmandu")) recs.push("Take a short walk before evening congestion to lower physiological stress.");
  if (recs.length === 0) recs.push("Your routine is balanced. Repeat one brief breathing intervention every 4 hours.");
  return recs;
}

export default function CopilotScreen({ input, result, preferences, memory, chatHistory, onPersistChat, onPersistPrefs }: Props) {
  const [chatDraft, setChatDraft] = useState("");
  const [sending, setSending] = useState(false);
  const contextRecs = getContextRecommendations(preferences, input);

  async function handleSend() {
    const trimmed = chatDraft.trim();
    if (!trimmed || sending) return;
    setSending(true);

    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: "user", text: trimmed, timestamp: new Date().toISOString() };

    let replyText: string;
    try {
      const resp = await sendChatMessage({
        message: trimmed,
        mood: input.mood, anxiety: input.anxiety, stress: input.stress, sleepHours: input.sleepHours,
        riskScore: result?.risk.score, riskLevel: result?.risk.riskLevel,
        personality: preferences.personality, language: preferences.language,
        memoryContext: memory.slice(0, 5).map(m => ({ userMessage: m.userMessage, copilotSummary: m.copilotSummary })),
        journalEmotion: "neutral"
      });
      replyText = resp.reply;
    } catch {
      replyText = `I hear you. Your current stress is ${input.stress}/10. Try a 4-4-4 breathing cycle right now, then note one thing you can control.`;
    }

    const botMsg: ChatMessage = { id: `a-${Date.now() + 1}`, role: "assistant", text: replyText, timestamp: new Date().toISOString() };
    const next = [botMsg, userMsg, ...chatHistory].slice(0, 40);
    setChatDraft("");
    setSending(false);
    await onPersistChat(next);
  }

  return (
    <>
      <SectionCard title="AI Copilot" subtitle="Memory-aware CBT companion powered by Gemini">
        <View style={s.rowWrap}>
          <ChoiceChip
            label={`Language: ${getLanguageLabel(preferences.language)}`} active
            onPress={() => {
              const next: LanguageCode = preferences.language === "en" ? "ne" : preferences.language === "ne" ? "hi" : "en";
              void onPersistPrefs({ ...preferences, language: next });
            }}
          />
          <ChoiceChip
            label={getPersonalityLabel(preferences.personality)} active
            onPress={() => {
              const next: Personality = preferences.personality === "calm" ? "analytical" : preferences.personality === "analytical" ? "motivational" : "calm";
              void onPersistPrefs({ ...preferences, personality: next });
            }}
          />
        </View>

        <View style={s.composer}>
          <TextInput style={s.chatInput} value={chatDraft} onChangeText={setChatDraft}
            placeholder="Tell Copilot how you feel..." placeholderTextColor={theme.textDim}
            multiline
          />
          <Pressable style={[s.sendBtn, sending && { opacity: 0.5 }]} onPress={handleSend} disabled={sending}>
            <Text style={s.sendBtnText}>{sending ? "..." : "Send"}</Text>
          </Pressable>
        </View>

        {chatHistory.length === 0 ? (
          <Text style={s.empty}>Start a conversation. Copilot adapts to your emotional history over time.</Text>
        ) : (
          chatHistory.slice(0, 8).map((msg) => (
            <View key={msg.id} style={[s.bubble, msg.role === "assistant" ? s.botBubble : s.userBubble]}>
              <Text style={s.role}>{msg.role === "assistant" ? "🤖 Copilot" : "You"}</Text>
              <Text style={s.body}>{msg.text}</Text>
              <Text style={s.time}>{new Date(msg.timestamp).toLocaleTimeString()}</Text>
            </View>
          ))
        )}
      </SectionCard>

      <SectionCard title="Context-Aware Recommendations" subtitle="Based on time, location, and calendar triggers">
        <Text style={s.body}>{preferences.locationTag}  ·  {preferences.calendarLoad} load</Text>
        {contextRecs.map((r, i) => <Text key={i} style={s.bullet}>{r}</Text>)}
      </SectionCard>

      <SectionCard title="Smart Notifications" subtitle="Sent at emotionally relevant moments">
        <Text style={s.muted}>Next recommended check-in: 7:30 PM based on current stress and sleep trends.</Text>
      </SectionCard>
    </>
  );
}

const s = StyleSheet.create({
  rowWrap: { flexDirection: "row", gap: 8, flexWrap: "wrap", marginBottom: 12 },
  composer: { flexDirection: "row", gap: 8, marginBottom: 14 },
  chatInput: { flex: 1, borderWidth: 1, borderColor: theme.cardBorder, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, color: theme.text, backgroundColor: theme.bgElevated, fontSize: 14, maxHeight: 100 },
  sendBtn: { minWidth: 64, borderRadius: 14, backgroundColor: theme.accent, alignItems: "center", justifyContent: "center", paddingHorizontal: 14 },
  sendBtnText: { color: theme.white, fontWeight: "700", fontSize: 14 },
  empty: { color: theme.textDim, fontStyle: "italic", textAlign: "center", paddingVertical: 20 },
  bubble: { borderRadius: 14, padding: 12, marginBottom: 8, borderWidth: 1 },
  botBubble: { backgroundColor: "rgba(10,132,255,0.08)", borderColor: "rgba(10,132,255,0.18)" },
  userBubble: { backgroundColor: "rgba(48,209,88,0.08)", borderColor: "rgba(48,209,88,0.2)" },
  role: { fontWeight: "700", color: theme.accent, marginBottom: 4, fontSize: 12 },
  body: { color: theme.text, lineHeight: 20, fontSize: 14, marginBottom: 4 },
  time: { color: theme.textDim, fontSize: 10, textAlign: "right" },
  bullet: { color: theme.text, marginBottom: 6, lineHeight: 20, fontSize: 14 },
  muted: { color: theme.textDim, fontSize: 13 },
});

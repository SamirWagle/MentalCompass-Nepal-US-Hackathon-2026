import React, { useEffect, useRef, useState } from "react";
import {
  ActionSheetIOS,
  Alert,
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { theme } from "../theme";

type Props = {
  visible: boolean;
  onAnswer: () => void;
  onDecline: (reason: string) => void;
};

const DECLINE_REASONS = [
  "Not in the mood",
  "Busy right now",
  "Feeling okay, skipping",
  "Need more time",
];

export default function CheckinCallScreen({ visible, onAnswer, onDecline }: Props) {
  const pulseScale = useRef(new Animated.Value(1)).current;
  const bgOpacity = useRef(new Animated.Value(0)).current;
  const [declining, setDeclining] = useState(false);

  useEffect(() => {
    if (visible) {
      // Fade in background
      Animated.timing(bgOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      // Pulse the ring
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseScale, { toValue: 1.15, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseScale, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      bgOpacity.setValue(0);
      pulseScale.setValue(1);
    }
  }, [visible]);

  function showDeclineSheet() {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [...DECLINE_REASONS, "Cancel"],
          cancelButtonIndex: DECLINE_REASONS.length,
          title: "Why are you skipping today?",
          message: "Your reason helps us understand. Your streak stays safe.",
        },
        (idx) => {
          if (idx < DECLINE_REASONS.length) {
            onDecline(DECLINE_REASONS[idx]);
          }
        }
      );
    } else {
      // Android / Web fallback — simple Alert
      Alert.alert(
        "Skip Check-In",
        "Your streak stays safe. Why are you skipping?",
        [
          ...DECLINE_REASONS.map(r => ({ text: r, onPress: () => onDecline(r) })),
          { text: "Cancel", style: "cancel" },
        ]
      );
    }
  }

  if (!visible) return null;

  return (
    <Animated.View style={[s.overlay, { opacity: bgOpacity }]}>
      <View style={s.container}>
        {/* Status header */}
        <View style={s.header}>
          <View style={s.statusDot} />
          <Text style={s.statusText}>DAILY CHECK-IN</Text>
        </View>

        {/* App identity */}
        <Text style={s.appName}>AegisSpeak</Text>
        <Text style={s.subtitle}>Your wellness check-in is ready</Text>

        {/* Pulsing ring avatar */}
        <View style={s.avatarWrapper}>
          <Animated.View style={[s.ring, { transform: [{ scale: pulseScale }] }]} />
          <View style={s.avatar}>
            <Text style={s.avatarEmoji}>🌱</Text>
          </View>
        </View>

        <Text style={s.callLabel}>Take a few minutes for yourself?</Text>

        {/* Call buttons — iOS-style */}
        <View style={s.buttonsRow}>
          {/* Decline */}
          <View style={s.btnWrapper}>
            <Pressable
              style={[s.callBtn, s.declineBtn]}
              onPress={showDeclineSheet}
              accessibilityRole="button"
              accessibilityLabel="Decline check-in"
              accessibilityHint="Opens options for why you're skipping"
            >
              <Text style={s.declineIcon}>✕</Text>
            </Pressable>
            <Text style={s.btnLabel}>Skip</Text>
          </View>

          {/* Answer */}
          <View style={s.btnWrapper}>
            <Pressable
              style={[s.callBtn, s.answerBtn]}
              onPress={onAnswer}
              accessibilityRole="button"
              accessibilityLabel="Start check-in"
              accessibilityHint="Opens your wellness journal"
            >
              <Text style={s.answerIcon}>✓</Text>
            </Pressable>
            <Text style={s.btnLabel}>Check In</Text>
          </View>
        </View>

        {/* Right to reject note */}
        <Text style={s.rightNote}>
          You always have the right to skip.{"\n"}Your streak is never broken by self-care. 💚
        </Text>
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.92)",
    zIndex: 9999,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "100%",
    paddingHorizontal: 32,
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: theme.success,
  },
  statusText: {
    color: theme.success,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
  },
  appName: {
    color: "#ffffff",
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 15,
    marginBottom: 44,
  },
  avatarWrapper: {
    width: 140,
    height: 140,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 36,
  },
  ring: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2.5,
    borderColor: "rgba(10,132,255,0.40)",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(10,132,255,0.15)",
    borderWidth: 2,
    borderColor: "rgba(10,132,255,0.50)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarEmoji: { fontSize: 44 },
  callLabel: {
    color: "rgba(255,255,255,0.80)",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 48,
    lineHeight: 26,
  },
  buttonsRow: {
    flexDirection: "row",
    gap: 60,
    marginBottom: 40,
  },
  btnWrapper: { alignItems: "center", gap: 10 },
  callBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    minWidth: 44,
  },
  declineBtn: { backgroundColor: "#ff453a" },
  answerBtn: { backgroundColor: "#30d158" },
  declineIcon: { color: "#fff", fontSize: 28, fontWeight: "600" },
  answerIcon: { color: "#fff", fontSize: 32, fontWeight: "700" },
  btnLabel: { color: "rgba(255,255,255,0.60)", fontSize: 13, fontWeight: "600" },
  rightNote: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 19,
  },
});

import React, { ReactNode } from "react";
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { theme } from "./theme";

export function SectionCard({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <View style={s.card}>
      <Text style={s.cardTitle}>{title}</Text>
      <Text style={s.cardSub}>{subtitle}</Text>
      {children}
    </View>
  );
}

export function NavChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.chip, active && s.chipActive, pressed && s.pressed]}>
      <Text style={[s.chipText, active && s.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

export function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.pill}>
      <Text style={s.pillLabel}>{label}</Text>
      <Text style={s.pillValue}>{value}</Text>
    </View>
  );
}

export function MetricStepper({ label, value, min, max, onChange }: {
  label: string; value: number; min: number; max: number; onChange: (v: number) => void;
}) {
  const clamp = (v: number) => Math.min(Math.max(v, min), max);
  return (
    <View style={s.stepRow}>
      <Text style={s.body}>{label}</Text>
      <View style={s.stepCtrl}>
        <Pressable style={s.stepBtn} onPress={() => onChange(clamp(value - 1))}><Text style={s.stepBtnText}>−</Text></Pressable>
        <Text style={s.stepVal}>{value}</Text>
        <Pressable style={s.stepBtn} onPress={() => onChange(clamp(value + 1))}><Text style={s.stepBtnText}>+</Text></Pressable>
      </View>
    </View>
  );
}

export function SmallInputRow({ label, value, onChangeText }: {
  label: string; value: string; onChangeText: (v: string) => void;
}) {
  return (
    <View style={s.smallRow}>
      <Text style={s.body}>{label}</Text>
      <TextInput value={value} onChangeText={onChangeText} style={s.smallInput} keyboardType="decimal-pad" placeholderTextColor={theme.textDim} />
    </View>
  );
}

export function ToggleRow({ label, value, onChange }: {
  label: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <View style={s.toggleRow}>
      <Text style={s.body}>{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ false: theme.textDim, true: theme.accent }} thumbColor={theme.white} />
    </View>
  );
}

export function HabitBar({ label, value }: { label: string; value: number }) {
  const color = value > 70 ? theme.success : value > 40 ? theme.warning : theme.danger;
  return (
    <View style={s.habitRow}>
      <Text style={s.body}>{label}</Text>
      <View style={s.track}>
        <View style={[s.fill, { width: `${value}%`, backgroundColor: color }]} />
      </View>
      <Text style={s.muted}>{value}%</Text>
    </View>
  );
}

export function SignalRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={s.sigRow}>
      <View style={[s.sigDot, { backgroundColor: color }]} />
      <Text style={s.body}>{label}</Text>
      <Text style={s.sigVal}>{value}</Text>
    </View>
  );
}

export function ChoiceChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.choice, active && s.choiceActive, pressed && s.pressed]}>
      <Text style={[s.choiceText, active && s.choiceTextActive]}>{label}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: theme.card,
    borderRadius: theme.radiusLg,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    marginBottom: 14,
    shadowColor: theme.shadowSoft,
    shadowOpacity: 1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3
  },
  cardTitle: { fontSize: 19, fontWeight: "700", color: theme.text, marginBottom: 2 },
  cardSub: { color: theme.textDim, marginBottom: 13, fontSize: 13 },
  chip: {
    paddingHorizontal: 15,
    paddingVertical: 9,
    backgroundColor: theme.bgElevated,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.cardBorder
  },
  chipActive: { backgroundColor: theme.accentDim, borderColor: "rgba(10,132,255,0.35)" },
  chipText: { color: theme.textMuted, fontWeight: "600", fontSize: 13 },
  chipTextActive: { color: theme.accent },
  pill: { backgroundColor: theme.accentDim, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, flex: 1 },
  pillLabel: { color: theme.textDim, fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 },
  pillValue: { color: theme.text, fontSize: 18, fontWeight: "700", marginTop: 2 },
  body: { color: theme.text, marginBottom: 6, lineHeight: 20, fontSize: 14 },
  muted: { color: theme.textDim, fontSize: 12, marginTop: 2 },
  stepRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  stepCtrl: { flexDirection: "row", alignItems: "center", gap: 10 },
  stepBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: theme.accentDim, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(10,132,255,0.24)" },
  stepBtnText: { color: theme.accent, fontWeight: "800", fontSize: 18 },
  stepVal: { width: 36, textAlign: "center", color: theme.text, fontWeight: "700", fontSize: 16 },
  smallRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  smallInput: { width: 110, borderWidth: 1, borderColor: theme.cardBorder, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, color: theme.text, backgroundColor: theme.bgElevated },
  toggleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  habitRow: { marginBottom: 12 },
  track: { height: 8, borderRadius: 999, backgroundColor: theme.bgSecondary, overflow: "hidden", marginVertical: 6 },
  fill: { height: "100%", borderRadius: 999 },
  sigRow: { flexDirection: "row", alignItems: "center", marginBottom: 10, gap: 10 },
  sigDot: { width: 10, height: 10, borderRadius: 999 },
  sigVal: { marginLeft: "auto", color: theme.accent, fontWeight: "700", fontSize: 15 },
  choice: { borderRadius: 999, borderWidth: 1, borderColor: theme.cardBorder, backgroundColor: theme.bgElevated, paddingHorizontal: 14, paddingVertical: 8 },
  choiceActive: { borderColor: "rgba(10,132,255,0.35)", backgroundColor: theme.accentDim },
  choiceText: { color: theme.textMuted, fontWeight: "600", fontSize: 13 },
  choiceTextActive: { color: theme.accent },
  pressed: { opacity: 0.8 },
});

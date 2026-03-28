import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SectionCard } from "../components";
import { MOCK_VAULT, VAULT_CATEGORIES } from "../mockData";
import { theme } from "../theme";

export default function VaultScreen() {
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("All");

  const filtered = MOCK_VAULT.filter(r =>
    (activeCat === "All" || r.category === activeCat) &&
    (!search || r.title.toLowerCase().includes(search.toLowerCase()) || r.desc.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <>
      <View style={s.searchBar}>
        <TextInput style={s.searchInput} value={search} onChangeText={setSearch} placeholder="🔍 Search resources..." placeholderTextColor={theme.textDim} />
      </View>

      <View style={s.catRow}>
        {VAULT_CATEGORIES.map(c => (
          <Pressable key={c} style={[s.catChip, activeCat === c && s.catActive]} onPress={() => setActiveCat(c)}>
            <Text style={[s.catText, activeCat === c && s.catTextActive]}>{c}</Text>
          </Pressable>
        ))}
      </View>

      {filtered.map((r, i) => (
        <VaultCard key={i} item={r} index={i} />
      ))}

      {!filtered.length && <Text style={s.empty}>No resources found.</Text>}
    </>
  );
}

function VaultCard({ item, index }: { item: typeof MOCK_VAULT[0]; index: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(anim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 8, delay: index * 60 }).start();
  }, []);

  const typeLabel = item.type === 'article' ? '📄 Article' : item.type === 'audio' ? '🎧 Audio' : '🎬 Video';
  const typeBg = item.type === 'article' ? theme.accentDim : item.type === 'audio' ? 'rgba(48,209,88,0.12)' : 'rgba(124,58,237,0.12)';
  const typeColor = item.type === 'article' ? theme.accent : item.type === 'audio' ? theme.success : '#a78bfa';

  return (
    <Animated.View style={[s.card, { opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] }]}>
      <LinearGradient colors={item.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.cardBanner}>
        <Text style={s.cardBannerIcon}>{item.icon}</Text>
      </LinearGradient>
      <View style={s.cardBody}>
        <View style={[s.typeBadge, { backgroundColor: typeBg }]}>
          <Text style={[s.typeText, { color: typeColor }]}>{typeLabel}</Text>
        </View>
        <Text style={s.cardTitle}>{item.title}</Text>
        <Text style={s.cardDesc}>{item.desc}</Text>
        <View style={s.cardMeta}>
          <Text style={s.metaText}>{item.category}</Text>
          <Text style={s.metaText}>{item.duration}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  searchBar: { marginBottom: 10 },
  searchInput: { backgroundColor: theme.card, borderRadius: theme.radiusLg, paddingHorizontal: 18, paddingVertical: 14, fontSize: 15, color: theme.text, borderWidth: 1, borderColor: theme.cardBorder },
  catRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 14 },
  catChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: theme.cardBorder, backgroundColor: theme.bgElevated },
  catActive: { backgroundColor: theme.accentDim, borderColor: "rgba(10,132,255,0.35)" },
  catText: { fontSize: 12, fontWeight: "600", color: theme.textMuted },
  catTextActive: { color: theme.accent },
  card: { backgroundColor: theme.card, borderRadius: theme.radiusLg, overflow: "hidden", marginBottom: 14, borderWidth: 1, borderColor: theme.cardBorder, shadowColor: theme.shadowSoft, shadowOpacity: 1, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  cardBanner: { height: 100, alignItems: "center", justifyContent: "center" },
  cardBannerIcon: { fontSize: 36 },
  cardBody: { padding: 16 },
  typeBadge: { alignSelf: "flex-start", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, marginBottom: 8 },
  typeText: { fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: theme.text, marginBottom: 4 },
  cardDesc: { fontSize: 12, color: theme.textDim, lineHeight: 18 },
  cardMeta: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  metaText: { fontSize: 11, color: theme.textDim },
  empty: { color: theme.textDim, textAlign: "center", paddingVertical: 30, fontStyle: "italic" },
});

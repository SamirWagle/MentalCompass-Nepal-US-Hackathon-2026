import React, { useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SectionCard } from "../components";
import { MOCK_COMMUNITY } from "../mockData";
import { theme } from "../theme";

export default function CommunityScreen() {
  const [posts, setPosts] = useState(MOCK_COMMUNITY.map(p => ({ ...p, liked: false, related: false })));
  const [draft, setDraft] = useState("");

  function toggleSupport(id: string) {
    setPosts(ps => ps.map(p => p.id === id ? { ...p, liked: !p.liked, supports: p.liked ? p.supports - 1 : p.supports + 1 } : p));
  }
  function toggleRelate(id: string) {
    setPosts(ps => ps.map(p => p.id === id ? { ...p, related: !p.related, relates: p.related ? p.relates - 1 : p.relates + 1 } : p));
  }
  function postNew() {
    if (!draft.trim()) return;
    setPosts(ps => [{ id: `new-${Date.now()}`, avatar: '🌟', author: 'You (Anonymous)', time: 'Just now', text: draft.trim(), supports: 0, relates: 0, liked: false, related: false }, ...ps]);
    setDraft("");
  }

  return (
    <>
      {/* Safe Space Banner */}
      <View style={s.safeBanner}>
        <Text style={s.safeIcon}>🛡️</Text>
        <View style={{ flex: 1 }}>
          <Text style={s.safeTitle}>Safe Space Guarantee</Text>
          <Text style={s.safeDesc}>All posts are anonymous. AI moderators filter harmful content.</Text>
        </View>
      </View>

      {/* Feed */}
      {posts.map((p, i) => (
        <PostCard key={p.id} post={p} index={i} onSupport={() => toggleSupport(p.id)} onRelate={() => toggleRelate(p.id)} />
      ))}

      {/* Compose */}
      <SectionCard title="Share Your Thoughts" subtitle="Anonymous · Moderated">
        <TextInput style={s.input} value={draft} onChangeText={setDraft} placeholder="Share something supportive..." placeholderTextColor={theme.textDim} multiline />
        <Pressable style={s.postBtn} onPress={postNew}><Text style={s.postBtnText}>🕊️ Post Anonymously</Text></Pressable>
      </SectionCard>
    </>
  );
}

function PostCard({ post, index, onSupport, onRelate }: { post: any; index: number; onSupport: () => void; onRelate: () => void }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(anim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 9, delay: index * 70 }).start();
  }, []);

  return (
    <Animated.View style={[s.card, { opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
      <View style={s.header}>
        <View style={s.avatar}><Text style={s.avatarText}>{post.avatar}</Text></View>
        <View>
          <Text style={s.author}>{post.author}</Text>
          <Text style={s.time}>{post.time}</Text>
        </View>
      </View>
      <Text style={s.text}>{post.text}</Text>
      <View style={s.actions}>
        <Pressable style={[s.actionBtn, post.liked && s.actionActive]} onPress={onSupport}>
          <Text style={[s.actionText, post.liked && s.actionTextActive]}>💚 {post.supports} Support</Text>
        </Pressable>
        <Pressable style={[s.actionBtn, post.related && s.actionActive]} onPress={onRelate}>
          <Text style={[s.actionText, post.related && s.actionTextActive]}>🤝 {post.relates} Relate</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  safeBanner: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "rgba(48,209,88,0.08)", borderWidth: 1, borderColor: "rgba(48,209,88,0.18)", borderRadius: theme.radiusMd, padding: 14, marginBottom: 14 },
  safeIcon: { fontSize: 22 },
  safeTitle: { fontSize: 14, fontWeight: "700", color: theme.success },
  safeDesc: { fontSize: 11, color: theme.textDim, marginTop: 2 },
  card: { backgroundColor: theme.card, borderRadius: theme.radiusLg, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: theme.cardBorder },
  header: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  avatar: { width: 36, height: 36, borderRadius: 12, backgroundColor: theme.accentDim, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 18 },
  author: { fontSize: 13, fontWeight: "700", color: theme.text },
  time: { fontSize: 10, color: theme.textDim },
  text: { fontSize: 14, color: theme.textMuted, lineHeight: 21, marginBottom: 12 },
  actions: { flexDirection: "row", gap: 8 },
  actionBtn: { borderRadius: 999, borderWidth: 1, borderColor: theme.cardBorder, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: theme.bgElevated },
  actionActive: { borderColor: "rgba(10,132,255,0.35)", backgroundColor: theme.accentDim },
  actionText: { fontSize: 12, fontWeight: "600", color: theme.textMuted },
  actionTextActive: { color: theme.accent },
  input: { borderWidth: 1, borderColor: theme.cardBorder, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, color: theme.text, backgroundColor: theme.bgElevated, fontSize: 14, minHeight: 80, textAlignVertical: "top", marginBottom: 10 },
  postBtn: { backgroundColor: theme.accent, borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  postBtnText: { color: theme.white, fontWeight: "700", fontSize: 15 },
});

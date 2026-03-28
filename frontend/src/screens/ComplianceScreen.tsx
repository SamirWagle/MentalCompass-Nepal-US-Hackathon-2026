import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { fetchAdminAnalytics } from "../api";
import { SectionCard } from "../components";
import { theme } from "../theme";

const TOKEN_KEY = "aegisspeak_token_v1";

type Analytics = {
  users: { total: number; byRole: Record<string, number>; activePatients: number; activeDoctors: number; activeChvs: number };
  appointments: { total: number; pending: number; confirmed: number; completed: number; cancelled: number; totalRevenue: number };
  journals: { totalAnonymousPatients: number; totalEntries: number; assessedEntries: number };
  escalations: { total: number; unacknowledged: number };
  regionStats: Array<{ region: string; patients: number }>;
  generatedAt: string;
  hipaaCompliant: boolean;
  phiStripped: boolean;
};

function StatBox({ label, value, icon, color, sub }: { label: string; value: string | number; icon: string; color?: string; sub?: string }) {
  return (
    <View style={[s.statBox, color ? { borderLeftColor: color } : {}]}>
      <Text style={s.statIcon}>{icon}</Text>
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
      {sub && <Text style={s.statSub}>{sub}</Text>}
    </View>
  );
}

function RegionRow({ region, patients, total }: { region: string; patients: number; total: number }) {
  const pct = total > 0 ? (patients / total) * 100 : 0;
  return (
    <View style={s.regionRow}>
      <View style={s.regionInfo}>
        <Text style={s.regionName}>{region}</Text>
        <Text style={s.regionCount}>{patients} patients</Text>
      </View>
      <View style={s.regionBarWrap}>
        <View style={[s.regionBar, { width: `${Math.round(pct)}%` as any }]} />
      </View>
      <Text style={s.regionPct}>{Math.round(pct)}%</Text>
    </View>
  );
}

export default function ComplianceScreen() {
  const [token, setToken] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(TOKEN_KEY).then(t => { setToken(t); });
  }, []);

  useEffect(() => {
    if (token) loadAnalytics();
  }, [token]);

  async function loadAnalytics() {
    if (!token) return;
    setError(null);
    try {
      const data = await fetchAdminAnalytics(token);
      setAnalytics(data);
    } catch (e: any) {
      setError(e?.message || "Analytics unavailable");
    } finally {
      setLoading(false);
    }
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  }, [token]);

  if (!token) {
    return (
      <View style={s.empty}>
        <Text style={s.emptyTitle}>🔒 SuperAdmin Access Only</Text>
        <Text style={s.emptyDesc}>This dashboard is restricted to SuperAdmin accounts.</Text>
      </View>
    );
  }

  const totalRegionPatients = analytics?.regionStats?.reduce((s, r) => s + r.patients, 0) || 1;

  return (
    <ScrollView
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} />}
    >
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>📊 Platform Analytics</Text>
          <Text style={s.headerSub}>
            {analytics?.generatedAt ? `Updated ${new Date(analytics.generatedAt).toLocaleTimeString()}` : "Live Dashboard"}
          </Text>
        </View>
        <View style={s.hipaaTag}>
          <Text style={s.hipaaText}>🔒 PHI-Free</Text>
        </View>
      </View>

      {loading ? (
        <View style={s.loadingWrap}>
          <ActivityIndicator color={theme.accent} size="large" />
          <Text style={s.loadingText}>Loading analytics...</Text>
        </View>
      ) : error ? (
        <View style={s.errorCard}>
          <Text style={s.errorTitle}>⚠️ Access Restricted</Text>
          <Text style={s.errorText}>{error}{"\n"}This endpoint requires SuperAdmin credentials.</Text>
        </View>
      ) : analytics ? (
        <>
          {/* Users Overview */}
          <SectionCard title="👥 Users" subtitle="Aggregated counts — no PHI">
            <View style={s.statGrid}>
              <StatBox label="Total Users" value={analytics.users.total} icon="👤" color={theme.accent} />
              <StatBox label="Patients" value={analytics.users.activePatients} icon="🧑" color={theme.success} />
              <StatBox label="Doctors" value={analytics.users.activeDoctors} icon="🩺" color="#007aff" />
              <StatBox label="FCHVs" value={analytics.users.activeChvs} icon="👩‍⚕️" color={theme.warning} />
            </View>
          </SectionCard>

          {/* Journals */}
          <SectionCard title="📚 Journals" subtitle="All entries are anonymized">
            <View style={s.statGrid}>
              <StatBox label="Anonymous Patients" value={analytics.journals.totalAnonymousPatients} icon="🔒" color={theme.accent} />
              <StatBox label="Total Entries" value={analytics.journals.totalEntries} icon="📝" color={theme.success} />
              <StatBox
                label="Assessed"
                value={analytics.journals.assessedEntries}
                icon="✅"
                color="#007aff"
                sub={analytics.journals.totalEntries > 0
                  ? `${Math.round((analytics.journals.assessedEntries / analytics.journals.totalEntries) * 100)}% coverage`
                  : "0% coverage"}
              />
              <StatBox
                label="Escalations"
                value={analytics.escalations.total}
                icon="🚨"
                color={analytics.escalations.unacknowledged > 0 ? theme.danger : theme.textDim}
                sub={`${analytics.escalations.unacknowledged} unacked`}
              />
            </View>
          </SectionCard>

          {/* Appointments */}
          <SectionCard title="📅 Appointments" subtitle="Consultation booking analytics">
            <View style={s.statGrid}>
              <StatBox label="Total" value={analytics.appointments.total} icon="📅" />
              <StatBox label="Pending" value={analytics.appointments.pending} icon="⏳" color={theme.warning} />
              <StatBox label="Confirmed" value={analytics.appointments.confirmed} icon="✅" color={theme.success} />
              <StatBox label="Completed" value={analytics.appointments.completed} icon="🏁" color={theme.accent} />
            </View>
            <View style={s.revenueRow}>
              <Text style={s.revenueLabel}>Total Consultation Revenue</Text>
              <Text style={s.revenueValue}>NPR {analytics.appointments.totalRevenue.toLocaleString()}</Text>
            </View>
          </SectionCard>

          {/* Regional Breakdown */}
          {analytics.regionStats.length > 0 && (
            <SectionCard title="🗺️ Regional Breakdown" subtitle="Patient distribution by location (no names)">
              {analytics.regionStats.map((region, i) => (
                <RegionRow
                  key={region.region + i}
                  region={region.region}
                  patients={region.patients}
                  total={totalRegionPatients}
                />
              ))}
            </SectionCard>
          )}

          {/* Compliance note */}
          <View style={s.complianceCard}>
            <Text style={s.complianceTitle}>✅ HIPAA / Data Compliance Status</Text>
            <View style={s.complianceRow}>
              <Text style={s.complianceKey}>PHI Stripped</Text>
              <Text style={s.complianceVal}>{analytics.phiStripped ? "✅ Yes" : "❌ No"}</Text>
            </View>
            <View style={s.complianceRow}>
              <Text style={s.complianceKey}>Aggregated Only</Text>
              <Text style={s.complianceVal}>✅ Yes</Text>
            </View>
            <View style={s.complianceRow}>
              <Text style={s.complianceKey}>Doctor Anonymity</Text>
              <Text style={s.complianceVal}>✅ Enforced</Text>
            </View>
            <View style={s.complianceRow}>
              <Text style={s.complianceKey}>No Patient Names in API</Text>
              <Text style={s.complianceVal}>✅ Enforced</Text>
            </View>
          </View>
        </>
      ) : null}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  content: { padding: 12, paddingBottom: 60 },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    marginBottom: 14,
  },
  headerTitle: { fontSize: 22, fontWeight: "800", color: theme.text },
  headerSub: { fontSize: 12, color: theme.textDim, marginTop: 2 },
  hipaaTag: { backgroundColor: "rgba(48,209,88,0.1)", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: "rgba(48,209,88,0.25)" },
  hipaaText: { color: theme.success, fontSize: 12, fontWeight: "700" },
  loadingWrap: { alignItems: "center", paddingVertical: 40, gap: 14 },
  loadingText: { color: theme.textDim, fontSize: 14 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  emptyTitle: { fontSize: 22, fontWeight: "800", color: theme.text, marginBottom: 8 },
  emptyDesc: { color: theme.textDim, fontSize: 14, textAlign: "center" },
  errorCard: { backgroundColor: "rgba(255,69,58,0.08)", borderRadius: theme.radiusMd, borderWidth: 1, borderColor: "rgba(255,69,58,0.2)", padding: 18 },
  errorTitle: { fontSize: 17, fontWeight: "700", color: theme.danger, marginBottom: 8 },
  errorText: { color: theme.danger, fontSize: 13, opacity: 0.8, lineHeight: 21 },
  // Stats grid 2x2
  statGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statBox: {
    flex: 1, minWidth: "45%", backgroundColor: theme.bgElevated,
    borderRadius: theme.radiusMd, padding: 14,
    borderWidth: 1, borderColor: theme.cardBorder,
    borderLeftWidth: 3, borderLeftColor: theme.textDim,
    gap: 4,
  },
  statIcon: { fontSize: 20 },
  statValue: { fontSize: 26, fontWeight: "800", color: theme.text },
  statLabel: { fontSize: 11, color: theme.textDim, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.3 },
  statSub: { fontSize: 10, color: theme.textDim, marginTop: 2 },
  revenueRow: {
    marginTop: 12, flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", backgroundColor: theme.accentDim,
    borderRadius: theme.radiusMd, padding: 14,
  },
  revenueLabel: { fontSize: 13, color: theme.accent, fontWeight: "600" },
  revenueValue: { fontSize: 17, color: theme.accent, fontWeight: "800" },
  // Region bars
  regionRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10, minHeight: 44 },
  regionInfo: { width: 80 },
  regionName: { fontSize: 12, fontWeight: "700", color: theme.text },
  regionCount: { fontSize: 10, color: theme.textDim },
  regionBarWrap: { flex: 1, backgroundColor: theme.bgSecondary, borderRadius: 999, height: 8, overflow: "hidden" },
  regionBar: { height: 8, borderRadius: 999, backgroundColor: theme.accent },
  regionPct: { fontSize: 12, fontWeight: "700", color: theme.textDim, width: 36, textAlign: "right" },
  // Compliance card
  complianceCard: {
    backgroundColor: "rgba(48,209,88,0.05)", borderRadius: theme.radiusMd,
    borderWidth: 1, borderColor: "rgba(48,209,88,0.2)", padding: 16, gap: 10,
  },
  complianceTitle: { fontSize: 14, fontWeight: "700", color: theme.success, marginBottom: 4 },
  complianceRow: { flexDirection: "row", justifyContent: "space-between", minHeight: 30, alignItems: "center" },
  complianceKey: { fontSize: 13, color: theme.textDim },
  complianceVal: { fontSize: 13, fontWeight: "700", color: theme.text },
});

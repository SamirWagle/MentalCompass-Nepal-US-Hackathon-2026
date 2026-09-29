import React, { useMemo, useState } from "react";
import { Dimensions, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { CheckinResponse, formatDate } from "../constants";

const Lucide: any = Platform.OS === "web" ? require("lucide-react") : null;
const Recharts: any = Platform.OS === "web" ? require("recharts") : null;
const Motion: any = Platform.OS === "web" ? require("framer-motion") : null;

type Props = {
  records: any[];
  result: CheckinResponse | null;
  onRefresh: () => void;
};

type RiskLevel = "severe" | "monitor" | "stable";

type MoodPoint = { day: string; score: number };
type VitalsPoint = { day: string; anxiety: number; sleep: number };
type RecoverySignal = { label: string; value: number; color: string };

type Patient = {
  id: string;
  code?: string;
  name: string;
  age: number;
  gender: string;
  location: string;
  assignedDate: string;
  riskLevel: RiskLevel;
  streak: number;
  adherence: number;
  treatmentDays?: number;
  checkinFrequency?: string;
  summaryGeneratedAt?: string;
  liveAlertCopy?: string;
  fullVoiceSummary?: string;
  medications?: Array<{ name: string; dose: string }>;
  vitalsHistory?: VitalsPoint[];
  recoverySignals?: RecoverySignal[];
  moodHistory: MoodPoint[];
  aiSummaries: string[];
};

type EmergencyAlert = {
  id: string;
  patientId: string;
  patientName: string;
  timestamp: string;
  event: string;
  acknowledged: boolean;
};

const COLOR = {
  page: "#f8faf9",
  sidebar: "#f0f7f5",
  panel: "#ffffff",
  panelSoft: "#f8fbfa",
  border: "#d8e5df",
  text: "#0f172a",
  muted: "#64748b",
  emerald600: "#059669",
  emerald100: "#d1fae5",
  sky600: "#0284c7",
  sky50: "#f0f9ff",
  slate100: "#f1f5f9",
  severe: "#dc2626",
  severeSoft: "#fee2e2",
  monitor: "#ca8a04",
  monitorSoft: "#fef9c3",
  stable: "#15803d",
  stableSoft: "#dcfce7",
};

const MILESTONE_OPTIONS = [
  "Complete 3 days of journaling",
  "Daily 4-minute breathing for 1 week",
  "2 check-ins per day for 5 days",
  "One support outreach this week",
];

const RESOURCE_OPTIONS = [
  "Audio: Grounding Techniques",
  "Article: Managing Work Anxiety",
  "Video: 5-Minute Box Breathing",
  "Guide: Sleep Reset Protocol",
];

function makeMoodHistory(seed: number): MoodPoint[] {
  const points: MoodPoint[] = [];
  for (let i = 29; i >= 0; i -= 1) {
    const base = seed + Math.sin(i / 4) * 1.1 + (i % 5 === 0 ? -0.6 : 0.4);
    const score = Math.max(1, Math.min(10, Number(base.toFixed(1))));
    points.push({ day: `D${30 - i}`, score });
  }
  return points;
}

function makeVitalsHistory(anxietySeed: number, sleepSeed: number): VitalsPoint[] {
  const labels = ["3/18", "3/19", "3/20", "3/21", "3/22", "3/23", "3/24"];
  return labels.map((day, idx) => {
    const anxiety = Math.max(1, Math.min(10, Number((anxietySeed + Math.sin(idx / 2) * 0.8 + (idx % 3 === 0 ? 0.5 : -0.2)).toFixed(1))));
    const sleep = Math.max(3, Math.min(9, Number((sleepSeed + Math.cos(idx / 2.2) * 0.7 + (idx % 4 === 0 ? -0.3 : 0.2)).toFixed(1))));
    return { day, anxiety, sleep };
  });
}

const MOCK_PATIENTS: Patient[] = [
  {
    id: "p-a-2847",
    code: "Patient A-2847",
    name: "Patient A-2847",
    age: 31,
    gender: "Female",
    location: "Rural Area",
    assignedDate: "2026-03-24",
    riskLevel: "severe",
    streak: 6,
    adherence: 78,
    treatmentDays: 45,
    checkinFrequency: "6/week",
    moodHistory: [
      { day: "3/18", score: 6.5 },
      { day: "3/19", score: 6.2 },
      { day: "3/20", score: 5.8 },
      { day: "3/21", score: 5.1 },
      { day: "3/22", score: 4.8 },
      { day: "3/23", score: 4.3 },
      { day: "3/24", score: 4.6 },
    ],
    summaryGeneratedAt: "March 24, 2026 at 2:23 PM",
    liveAlertCopy:
      "Patient A-2847 indicated high distress levels in latest voice check-in. AI summary flagged concerning language patterns.",
    fullVoiceSummary:
      "Patient reported increased anxiety related to work stress and social isolation. Mentioned difficulty sleeping (4-5 hours per night) and reduced appetite. Positive indicators: Patient is maintaining exercise routine and reached out to a friend this week. No suicidal ideation mentioned. Tone analysis suggests mild depression with anxiety features. Patient expressed willingness to continue treatment and found breathing exercises helpful.",
    medications: [
      { name: "Sertraline 50mg", dose: "Daily - Morning" },
      { name: "Lorazepam 0.5mg", dose: "As needed" },
    ],
    vitalsHistory: makeVitalsHistory(8.1, 4.9),
    recoverySignals: [
      { label: "Goal Completion", value: 78, color: "#0891b2" },
      { label: "Support Reach-outs", value: 66, color: "#16a34a" },
      { label: "Therapy Engagement", value: 82, color: "#2563eb" },
    ],
    aiSummaries: [
      "Discussed work anxiety and social isolation as top stressors.",
      "Breathing exercises are helping and patient remains treatment-engaged.",
      "No suicidal ideation mentioned in this latest voice check-in.",
    ],
  },
  {
    id: "p-002",
    code: "Patient B-4172",
    name: "Maya Gurung",
    age: 29,
    gender: "Female",
    location: "Pokhara",
    assignedDate: "2026-03-24",
    riskLevel: "monitor",
    streak: 7,
    adherence: 72,
    treatmentDays: 31,
    checkinFrequency: "5/week",
    summaryGeneratedAt: "March 27, 2026 at 11:10 AM",
    liveAlertCopy:
      "Patient B-4172 reported escalating workplace uncertainty and evening panic spikes in latest check-in.",
    fullVoiceSummary:
      "Patient described increased rumination about role changes and reduced confidence in team communication. Sleep was inconsistent at 5-6 hours, with improved mornings after guided breathing. Appetite is stable and patient remains engaged in scheduled sessions. No self-harm language detected, but anxiety intensity increased over three days.",
    medications: [
      { name: "Escitalopram 10mg", dose: "Daily - Morning" },
      { name: "Propranolol 10mg", dose: "Before high-stress events" },
    ],
    moodHistory: makeMoodHistory(5.4),
    vitalsHistory: makeVitalsHistory(7.2, 5.8),
    recoverySignals: [
      { label: "Goal Completion", value: 72, color: "#0891b2" },
      { label: "Support Reach-outs", value: 58, color: "#16a34a" },
      { label: "Therapy Engagement", value: 81, color: "#2563eb" },
    ],
    aiSummaries: [
      "Discussed work anxiety and uncertainty around role changes.",
      "Responded well to breathing intervention with reduced stress markers.",
      "Needs reinforcement for evening phone-use boundaries.",
    ],
  },
  {
    id: "p-003",
    code: "Patient C-1028",
    name: "Rohan Karki",
    age: 34,
    gender: "Male",
    location: "Lalitpur",
    assignedDate: "2026-03-20",
    riskLevel: "stable",
    streak: 15,
    adherence: 91,
    treatmentDays: 63,
    checkinFrequency: "7/week",
    summaryGeneratedAt: "March 28, 2026 at 8:02 AM",
    liveAlertCopy:
      "Patient C-1028 shows stable baseline with no emergency escalation currently required.",
    fullVoiceSummary:
      "Patient reported improved work-life boundaries and consistent recovery habits. Sleep quality is 7-8 hours nightly, and mood remains steady through high-demand periods. Continues journaling and physical activity with strong adherence. No acute warning phrases detected; maintenance plan is working effectively.",
    medications: [
      { name: "Sertraline 25mg", dose: "Daily - Morning" },
      { name: "Melatonin 3mg", dose: "Nightly as needed" },
    ],
    moodHistory: makeMoodHistory(7.3),
    vitalsHistory: makeVitalsHistory(3.8, 7.4),
    recoverySignals: [
      { label: "Goal Completion", value: 91, color: "#16a34a" },
      { label: "Support Reach-outs", value: 84, color: "#0891b2" },
      { label: "Therapy Engagement", value: 93, color: "#2563eb" },
    ],
    aiSummaries: [
      "Maintains healthy routine and reports stable mood.",
      "Practices journaling regularly and requests advanced growth goals.",
      "No acute crisis language detected in recent chats.",
    ],
  },
  {
    id: "p-004",
    code: "Patient D-6391",
    name: "Nisha Tamang",
    age: 20,
    gender: "Female",
    location: "Bhaktapur",
    assignedDate: "2026-03-28",
    riskLevel: "monitor",
    streak: 4,
    adherence: 64,
    treatmentDays: 18,
    checkinFrequency: "4/week",
    summaryGeneratedAt: "March 28, 2026 at 9:40 AM",
    liveAlertCopy:
      "Patient D-6391 showed a sharp anxiety spike around assignment deadlines and family pressure triggers.",
    fullVoiceSummary:
      "Patient identified social pressure and academic uncertainty as current stress amplifiers. Sleep averaged 5 hours in the last two nights, with better mood after support chat scripts. Appetite remains mildly reduced, but patient is still attending sessions and practicing guided grounding. No suicidal ideation mentioned; monitor closely for exam-week escalation.",
    medications: [
      { name: "Fluoxetine 20mg", dose: "Daily - Morning" },
      { name: "Hydroxyzine 10mg", dose: "As needed - Evening" },
    ],
    moodHistory: makeMoodHistory(4.9),
    vitalsHistory: makeVitalsHistory(7.8, 5.1),
    recoverySignals: [
      { label: "Goal Completion", value: 64, color: "#0891b2" },
      { label: "Support Reach-outs", value: 47, color: "#16a34a" },
      { label: "Therapy Engagement", value: 69, color: "#2563eb" },
    ],
    aiSummaries: [
      "Family pressure themes present; stigma-safe language recommended.",
      "Requested support script for speaking with a trusted sibling.",
      "Moderate anxiety spikes around assignment deadlines.",
    ],
  },
  {
    id: "p-005",
    code: "Patient E-5510",
    name: "Sujan Rai",
    age: 26,
    gender: "Male",
    location: "Dharan",
    assignedDate: "2026-03-22",
    riskLevel: "severe",
    streak: 1,
    adherence: 42,
    treatmentDays: 12,
    checkinFrequency: "3/week",
    summaryGeneratedAt: "March 28, 2026 at 10:04 AM",
    liveAlertCopy:
      "Patient E-5510 used repeated crisis language and reported severe sleep collapse in latest check-in.",
    fullVoiceSummary:
      "Patient described fear about financial instability and loss of role identity. Sleep dropped below 4 hours on consecutive nights, and hopeless statements increased in intensity. Positive marker: patient accepted immediate follow-up and agreed to contact a trusted support person. Escalation routing is recommended with same-day clinician outreach.",
    medications: [
      { name: "Venlafaxine 37.5mg", dose: "Daily - Morning" },
      { name: "Clonazepam 0.25mg", dose: "Short-term as prescribed" },
    ],
    moodHistory: makeMoodHistory(3.2),
    vitalsHistory: makeVitalsHistory(8.8, 4.2),
    recoverySignals: [
      { label: "Goal Completion", value: 42, color: "#0891b2" },
      { label: "Support Reach-outs", value: 31, color: "#16a34a" },
      { label: "Therapy Engagement", value: 48, color: "#2563eb" },
    ],
    aiSummaries: [
      "High uncertainty around job loss and financial stress.",
      "Used crisis language in two sessions this week.",
      "Needs immediate review and coordinated support outreach.",
    ],
  },
];

const MOCK_ALERTS: EmergencyAlert[] = [
  {
    id: "a-001",
    patientId: "p-a-2847",
    patientName: "Patient A-2847",
    timestamp: "2026-03-28T09:12:00Z",
    event: "High distress in latest voice check-in",
    acknowledged: false,
  },
  {
    id: "a-002",
    patientId: "p-005",
    patientName: "Sujan Rai",
    timestamp: "2026-03-28T10:04:00Z",
    event: "Crisis keyword + severe sleep drop",
    acknowledged: false,
  },
  {
    id: "a-003",
    patientId: "p-004",
    patientName: "Nisha Tamang",
    timestamp: "2026-03-28T07:48:00Z",
    event: "Rapid anxiety escalation in morning check-in",
    acknowledged: false,
  },
  {
    id: "a-004",
    patientId: "p-002",
    patientName: "Maya Gurung",
    timestamp: "2026-03-27T18:20:00Z",
    event: "Negative mood trend for 3 days",
    acknowledged: true,
  },
];

function riskPresentation(level: RiskLevel) {
  if (level === "severe") return { label: "Severe", tint: COLOR.severeSoft, color: COLOR.severe };
  if (level === "monitor") return { label: "Monitor", tint: COLOR.monitorSoft, color: COLOR.monitor };
  return { label: "Stable", tint: COLOR.stableSoft, color: COLOR.stable };
}

function Icon({ name, fallback, color = COLOR.slate100, size = 16 }: { name: string; fallback: string; color?: string; size?: number }) {
  if (Lucide && Lucide[name]) {
    const Comp = Lucide[name];
    return <Comp size={size} color={color} strokeWidth={2} />;
  }
  return <Text style={{ color, fontSize: size }}>{fallback}</Text>;
}

function AppSidebar() {
  return (
    <View style={s.sidebar}>
      <View style={s.sidebarBrand}>
        <View style={s.sidebarIconWrap}><Icon name="ShieldCheck" fallback="🛡️" color={COLOR.emerald600} size={18} /></View>
        <View>
          <Text style={s.sidebarTitle}>Clinician Center</Text>
          <Text style={s.sidebarSub}>Nature-inspired calm workflow</Text>
        </View>
      </View>
      <View style={s.sidebarNavWrap}>
        {[["Triage", "Users", "👥"], ["Emergency", "BellRing", "🚨"], ["Patient Detail", "Stethoscope", "🩺"], ["Interventions", "ClipboardCheck", "📋"], ["Compliance", "Lock", "🔒"]].map(([label, icon, fallback], idx) => (
          <View key={String(label)} style={[s.sidebarNavItem, idx === 0 && s.sidebarNavItemActive]}>
            <Icon name={String(icon)} fallback={String(fallback)} color={idx === 0 ? COLOR.emerald600 : COLOR.muted} size={16} />
            <Text style={[s.sidebarNavLabel, idx === 0 && { color: COLOR.emerald600 }]}>{label}</Text>
          </View>
        ))}
      </View>
      <View style={s.sidebarFooter}><Text style={s.sidebarFooterText}>Prototype clinician workspace</Text></View>
    </View>
  );
}

function EmergencyAlertsPanel({ alerts, onAcknowledge }: { alerts: EmergencyAlert[]; onAcknowledge: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const activeCount = alerts.filter((a) => !a.acknowledged).length;

  return (
    <View style={s.alertWrapper}>
      <View style={s.topBar}>
        <View>
          <Text style={s.pageTitle}>Clinician Dashboard</Text>
          <Text style={s.pageSubtitle}>Master-detail triage with AI-assisted interventions</Text>
        </View>
        <Pressable style={s.alertButton} onPress={() => setOpen((p) => !p)}>
          <Icon name="BellRing" fallback="🚨" color={COLOR.severe} size={16} />
          <Text style={s.alertButtonText}>{activeCount} Critical Alerts</Text>
        </Pressable>
      </View>

      {open && (
        <View style={s.alertDrawer}>
          <Text style={s.drawerTitle}>Emergency Notification Center</Text>
          <ScrollView style={{ maxHeight: 220 }}>
            {alerts.map((alert) => {
              const row = (
                <View key={alert.id} style={[s.alertRow, alert.acknowledged && s.alertRowAck]}>
                  <View style={s.alertMeta}>
                    <Text style={s.alertPatient}>{alert.patientName}</Text>
                    <Text style={s.alertTime}>{formatDate(alert.timestamp)}</Text>
                    <Text style={s.alertEvent}>{alert.event}</Text>
                  </View>
                  <Pressable style={[s.ackButton, alert.acknowledged && s.ackButtonDone]} onPress={() => onAcknowledge(alert.id)}>
                    <Icon name={alert.acknowledged ? "CheckCircle2" : "Check"} fallback={alert.acknowledged ? "✅" : "✔️"} color={alert.acknowledged ? COLOR.stable : COLOR.sky600} size={15} />
                    <Text style={[s.ackButtonText, alert.acknowledged && { color: COLOR.stable }]}>{alert.acknowledged ? "Acknowledged" : "Acknowledge"}</Text>
                  </Pressable>
                </View>
              );
              if (Motion && Motion.motion?.div) {
                const MDiv = Motion.motion.div;
                return <MDiv key={alert.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>{row}</MDiv>;
              }
              return row;
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

function FilterPill({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={[s.filterPill, active && s.filterPillActive]} onPress={onPress}>
      <Text style={[s.filterPillText, active && s.filterPillTextActive]}>{label}</Text>
    </Pressable>
  );
}

function PatientTriageList({ patients, activePatientId, onSelect }: { patients: Patient[]; activePatientId: string; onSelect: (id: string) => void }) {
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState<"all" | RiskLevel>("all");
  const [dateFilter, setDateFilter] = useState<"all" | "7d" | "30d">("all");

  const filtered = useMemo(() => {
    return patients.filter((p) => {
      const term = search.trim().toLowerCase();
      const textOk = !term || p.name.toLowerCase().includes(term) || p.location.toLowerCase().includes(term);
      const riskOk = riskFilter === "all" || p.riskLevel === riskFilter;
      const ageDays = (Date.now() - new Date(p.assignedDate).getTime()) / (1000 * 60 * 60 * 24);
      const dateOk = dateFilter === "all" || (dateFilter === "7d" ? ageDays <= 7 : ageDays <= 30);
      return textOk && riskOk && dateOk;
    });
  }, [patients, search, riskFilter, dateFilter]);

  return (
    <View style={s.triagePane}>
      <Text style={s.panelTitle}>Patient Triage List</Text>
      <Text style={s.panelSub}>Search and filter by live risk and assigned date</Text>
      <TextInput value={search} onChangeText={setSearch} placeholder="Search patient by name or location" placeholderTextColor={COLOR.muted} style={s.searchInput} />
      <View style={s.filterRow}>
        <FilterPill label="All" active={riskFilter === "all"} onPress={() => setRiskFilter("all")} />
        <FilterPill label="Severe" active={riskFilter === "severe"} onPress={() => setRiskFilter("severe")} />
        <FilterPill label="Monitor" active={riskFilter === "monitor"} onPress={() => setRiskFilter("monitor")} />
        <FilterPill label="Stable" active={riskFilter === "stable"} onPress={() => setRiskFilter("stable")} />
      </View>
      <View style={[s.filterRow, { marginTop: 8 }]}> 
        <FilterPill label="Any date" active={dateFilter === "all"} onPress={() => setDateFilter("all")} />
        <FilterPill label="Assigned 7d" active={dateFilter === "7d"} onPress={() => setDateFilter("7d")} />
        <FilterPill label="Assigned 30d" active={dateFilter === "30d"} onPress={() => setDateFilter("30d")} />
      </View>

      <ScrollView style={s.patientListWrap}>
        {filtered.map((patient) => {
          const risk = riskPresentation(patient.riskLevel);
          const isActive = patient.id === activePatientId;
          return (
            <Pressable key={patient.id} onPress={() => onSelect(patient.id)} style={[s.patientCard, { backgroundColor: risk.tint, borderColor: risk.color + "55", borderLeftColor: risk.color }, isActive && s.patientCardActive]}>
              <View style={s.patientCardTop}>
                <Text style={s.patientName}>{patient.name}</Text>
                <View style={[s.badge, { backgroundColor: "#ffffff" }]}><Text style={[s.badgeText, { color: risk.color }]}>{risk.label}</Text></View>
              </View>
              <Text style={s.patientMeta}>{patient.location} · Assigned {patient.assignedDate}</Text>
              <Text style={s.patientMeta}>Streak {patient.streak} days · Adherence {patient.adherence}%</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

function MoodTrendChart({ data }: { data: MoodPoint[] }) {
  if (Platform.OS === "web" && Recharts) {
    const { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } = Recharts;
    return (
      <View style={s.chartHostWeb as any}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 6 }}>
            <defs>
              <linearGradient id="moodFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#0284c7" stopOpacity={0.08} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#dbe5e1" />
            <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 11 }} />
            <YAxis domain={[0, 10]} tick={{ fill: "#64748b", fontSize: 11 }} />
            <Tooltip />
            <Area type="monotone" dataKey="score" stroke="#059669" strokeWidth={2} fill="url(#moodFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </View>
    );
  }

  return (
    <View style={s.chartFallback}>
      <Text style={s.chartFallbackTitle}>Mood trend (7 days)</Text>
      <View style={s.sparkRow}>{data.slice(-7).map((d) => <View key={d.day} style={[s.sparkBar, { height: Math.max(6, d.score * 8) }]} />)}</View>
      <Text style={s.chartFallbackNote}>Interactive chart is available on web build.</Text>
    </View>
  );
}

function VitalsDualChart({ data }: { data: VitalsPoint[] }) {
  return (
    <View style={s.card}>
      <Text style={s.cardTitle}>Anxiety vs Sleep (7-Day Pattern)</Text>
      <Text style={s.cardSub}>Dual trend bars for stress physiology monitoring</Text>
      <View style={s.vitalsGrid}>
        {data.map((point) => (
          <View key={point.day} style={s.vitalsCol}>
            <View style={s.vitalsBars}>
              <View style={[s.vitalsBar, s.vitalsBarAnxiety, { height: Math.max(10, point.anxiety * 9) }]} />
              <View style={[s.vitalsBar, s.vitalsBarSleep, { height: Math.max(10, point.sleep * 9) }]} />
            </View>
            <Text style={s.vitalsLabel}>{point.day}</Text>
          </View>
        ))}
      </View>
      <View style={s.vitalsLegend}>
        <Text style={s.vitalsLegendText}>Anxiety</Text>
        <Text style={s.vitalsLegendText}>Sleep</Text>
      </View>
    </View>
  );
}

function RecoverySignalsChart({ signals }: { signals: RecoverySignal[] }) {
  return (
    <View style={s.card}>
      <Text style={s.cardTitle}>Recovery Signals</Text>
      <Text style={s.cardSub}>Goal progress, support reach-outs, and engagement</Text>
      {signals.map((signal) => (
        <View key={signal.label} style={s.recoveryRow}>
          <View style={s.recoveryMeta}>
            <Text style={s.recoveryName}>{signal.label}</Text>
            <Text style={s.recoveryValue}>{signal.value}%</Text>
          </View>
          <View style={s.recoveryTrack}>
            <View style={[s.recoveryFill, { width: `${Math.max(0, Math.min(100, signal.value))}%`, backgroundColor: signal.color }]} />
          </View>
        </View>
      ))}
    </View>
  );
}

function AISessionSummaries({ lines }: { lines: string[] }) {
  return (
    <View style={s.card}>
      <Text style={s.cardTitle}>AI Session Summaries</Text>
      {lines.map((line, i) => (
        <View key={String(i)} style={s.bulletRow}>
          <Icon name="Dot" fallback="•" color={COLOR.emerald600} size={18} />
          <Text style={s.bulletText}>{line}</Text>
        </View>
      ))}
    </View>
  );
}

function OptionSelector({ title, options, value, onSelect }: { title: string; options: string[]; value: string; onSelect: (v: string) => void }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={s.selectorTitle}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {options.map((opt) => (
          <Pressable key={opt} onPress={() => onSelect(opt)} style={[s.optionChip, opt === value && s.optionChipActive]}>
            <Text style={[s.optionChipText, opt === value && s.optionChipTextActive]}>{opt}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

function ClinicalActionBox() {
  const [milestone, setMilestone] = useState(MILESTONE_OPTIONS[0]);
  const [resource, setResource] = useState(RESOURCE_OPTIONS[0]);
  const [journalPrompt, setJournalPrompt] = useState("Enter a new milestone or task for the patient (e.g., Practice deep breathing for 10 minutes daily)");
  const [pushed, setPushed] = useState(false);

  function handlePushToPatient() {
    setPushed(true);
    setTimeout(() => setPushed(false), 1800);
  }

  return (
    <View style={s.actionBox}>
      <Text style={s.cardTitle}>Assign New Milestone</Text>
      <Text style={s.cardSub}>Intervene & Assign</Text>
      <OptionSelector title="New Milestone" options={MILESTONE_OPTIONS} value={milestone} onSelect={setMilestone} />
      <OptionSelector title="Learning Vault Resource" options={RESOURCE_OPTIONS} value={resource} onSelect={setResource} />
      <Text style={s.selectorTitle}>Journal Prompt</Text>
      <TextInput value={journalPrompt} onChangeText={setJournalPrompt} multiline style={s.promptInput} placeholder="Type custom prompt for patient" placeholderTextColor={COLOR.muted} />
      <View style={s.emergencyActions}>
        <Pressable style={[s.pushButton, pushed && s.pushButtonSuccess]} onPress={handlePushToPatient}>
          <Icon name={pushed ? "CheckCheck" : "Send"} fallback={pushed ? "✅" : "📤"} color="#ffffff" size={16} />
          <Text style={s.pushButtonText}>{pushed ? "Push to Patient's Mobile App" : "Push to Patient's Mobile App"}</Text>
        </Pressable>
        <Pressable style={s.emergencyGhostBtn}><Text style={s.emergencyGhostText}>Save as Draft</Text></Pressable>
      </View>
      <Text style={s.complianceValue}>This milestone will instantly appear in the patient's "Milestones & Rewards" section.</Text>
    </View>
  );
}

function ComplianceSecurityMonitor() {
  const rows = [
    ["Encryption Status", "Active", "ShieldCheck", "🔐"],
    ["Voice Files Stored", "0 (None)", "MicOff", "🎤"],
    ["Compliance Review", "Not audited", "CircleAlert", "⚠️"],
  ];

  return (
    <View style={s.complianceCard}>
      <Text style={s.cardTitle}>Data Compliance & Security Monitor</Text>
      {rows.map(([title, value, icon, fallback]) => (
        <View key={String(title)} style={s.complianceRow}>
          <Icon name={String(icon)} fallback={String(fallback)} color={COLOR.stable} size={16} />
          <View style={{ flex: 1 }}>
            <Text style={s.complianceTitle}>{title}</Text>
            <Text style={s.complianceValue}>{value}</Text>
          </View>
        </View>
      ))}
      <Text style={s.complianceNarrative}>Security Confirmation: All incoming patient data is end-to-end encrypted. Biometric voice files are automatically deleted after text summary generation. Only clinical summaries are stored on secure servers. Last security audit: March 20, 2026.</Text>
    </View>
  );
}

function DetailedPatientPanel({ patient, latestSummary }: { patient: Patient; latestSummary?: string }) {
  const risk = riskPresentation(patient.riskLevel);
  const riskPriority = patient.riskLevel === "severe" ? "HIGH PRIORITY" : patient.riskLevel === "monitor" ? "MODERATE WATCH" : "STABLE WATCH";
  const vitals = patient.vitalsHistory || makeVitalsHistory(6.4, 5.6);
  const recoverySignals = patient.recoverySignals || [
    { label: "Goal Completion", value: patient.adherence, color: "#0891b2" },
    { label: "Support Reach-outs", value: 62, color: "#16a34a" },
    { label: "Therapy Engagement", value: 74, color: "#2563eb" },
  ];

  return (
    <View style={s.detailPane}>
      <View style={s.profileHeader}>
        <View>
          <Text style={s.profileName}>{patient.name}</Text>
          <Text style={s.profileMeta}>{patient.age} · {patient.gender} · {patient.location}</Text>
        </View>
        <View style={s.profileStatsRow}>
          <View style={s.statPill}><Text style={s.statPillLabel}>Check-In Frequency</Text><Text style={s.statPillValue}>{patient.checkinFrequency || "6/week"}</Text></View>
          <View style={s.statPill}><Text style={s.statPillLabel}>Goal Completion</Text><Text style={s.statPillValue}>{patient.adherence}%</Text></View>
          <View style={s.statPill}><Text style={s.statPillLabel}>Treatment Days</Text><Text style={s.statPillValue}>{patient.treatmentDays || 45}</Text></View>
          <View style={s.statPill}><Text style={[s.statPillLabel, { color: risk.color }]}>Risk Level</Text><Text style={[s.statPillValue, { color: risk.color }]}>{riskPriority}</Text></View>
        </View>
      </View>

      <View style={s.emergencyCard}>
        <Text style={s.emergencyTitle}>Live Emergency Alert - {patient.location} Patient</Text>
        <Text style={s.emergencyBody}>{patient.liveAlertCopy || "No active high-priority alert."}</Text>
        <View style={s.emergencyActions}>
          <Pressable style={s.emergencyPrimaryBtn}><Text style={s.emergencyPrimaryText}>Contact Patient Immediately</Text></Pressable>
          <Pressable style={s.emergencyGhostBtn}><Text style={s.emergencyGhostText}>Review Full Summary</Text></Pressable>
        </View>
      </View>

      <View style={s.card}>
        <Text style={s.cardTitle}>Clinical Summary - {patient.code || patient.name}</Text>
        <Text style={s.cardSub}>Latest Voice Check-In Summary</Text>
        <Text style={s.bulletText}>{patient.fullVoiceSummary || "No summary available."}</Text>
        <Text style={s.complianceValue}>Generated: {patient.summaryGeneratedAt || "—"}</Text>
      </View>

      <View style={s.card}>
        <Text style={s.cardTitle}>Mood History (Past 7 Days)</Text>
        <MoodTrendChart data={patient.moodHistory} />
      </View>

      <View style={s.gridTwoLike}>
        <View style={{ flex: 1, minWidth: 280 }}>
          <VitalsDualChart data={vitals} />
        </View>
        <View style={{ flex: 1, minWidth: 280 }}>
          <RecoverySignalsChart signals={recoverySignals} />
        </View>
      </View>

      <View style={s.gridTwoLike}>
        <View style={[s.card, { flex: 1 }]}> 
          <Text style={s.cardTitle}>Current Medications</Text>
          {(patient.medications || []).map((m) => (
            <View key={m.name} style={s.metricRow}><Text style={s.complianceTitle}>{m.name}</Text><Text style={s.complianceValue}>{m.dose}</Text></View>
          ))}
        </View>
        <AISessionSummaries lines={latestSummary ? [latestSummary, ...patient.aiSummaries].slice(0, 4) : patient.aiSummaries} />
      </View>

      <ClinicalActionBox />
      <ComplianceSecurityMonitor />
    </View>
  );
}

function ClinicianDashboard({ records, result, onRefresh }: Props) {
  const [patients] = useState<Patient[]>(MOCK_PATIENTS);
  const [alerts, setAlerts] = useState<EmergencyAlert[]>(MOCK_ALERTS);
  const [activePatientId, setActivePatientId] = useState<string>(MOCK_PATIENTS[0].id);

  const width = Dimensions.get("window").width;
  const isDesktop = width >= 1100;

  const activePatient = useMemo(
    () => patients.find((p) => p.id === activePatientId) || patients[0],
    [patients, activePatientId]
  );

  function handleAcknowledge(alertId: string) {
    setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a)));
  }

  return (
    <View style={s.pageWrap}>
      <View style={[s.layout, !isDesktop && s.layoutStack]}>
        {isDesktop && <AppSidebar />}
        <View style={s.mainWrap}>
          <EmergencyAlertsPanel alerts={alerts} onAcknowledge={handleAcknowledge} />
          <View style={[s.masterDetail, !isDesktop && s.masterDetailStack]}>
            <PatientTriageList patients={patients} activePatientId={activePatientId} onSelect={setActivePatientId} />
            <DetailedPatientPanel patient={activePatient} latestSummary={result?.clinicalSummary?.impression} />
          </View>
          <Pressable style={s.refreshButton} onPress={onRefresh}>
            <Icon name="RefreshCw" fallback="🔄" color={COLOR.sky600} size={16} />
            <Text style={s.refreshText}>Refresh Remote Data ({records.length} records)</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export default ClinicianDashboard;

const s = StyleSheet.create({
  pageWrap: { backgroundColor: "#f4f7fb", borderRadius: 24, borderWidth: 1, borderColor: "#d7e1ed", overflow: "hidden" },
  layout: { flexDirection: "row", minHeight: 760 },
  layoutStack: { flexDirection: "column" },
  sidebar: { width: 250, backgroundColor: "#eff6f4", borderRightWidth: 1, borderRightColor: "#d7e1ed", padding: 22, gap: 20 },
  sidebarBrand: { flexDirection: "row", gap: 12, alignItems: "center" },
  sidebarIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#eaf7f2", alignItems: "center", justifyContent: "center" },
  sidebarTitle: { color: COLOR.text, fontWeight: "800", fontSize: 15 },
  sidebarSub: { color: COLOR.muted, fontSize: 12, marginTop: 2 },
  sidebarNavWrap: { gap: 8 },
  sidebarNavItem: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 10, paddingHorizontal: 10, borderRadius: 12 },
  sidebarNavItemActive: { backgroundColor: "#ecfdf5", borderWidth: 1, borderColor: "#a7f3d0" },
  sidebarNavLabel: { color: COLOR.muted, fontSize: 13, fontWeight: "600" },
  sidebarFooter: { marginTop: "auto", padding: 10, borderRadius: 12, backgroundColor: "#ecfeff", borderWidth: 1, borderColor: "#bae6fd" },
  sidebarFooterText: { color: COLOR.sky600, fontSize: 12, fontWeight: "600" },
  mainWrap: { flex: 1, padding: 30, gap: 22 },
  alertWrapper: { gap: 14 },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderRadius: 20, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#d7e1ed", padding: 22, shadowColor: "#0f172a", shadowOpacity: 0.08, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 4 },
  pageTitle: { color: COLOR.text, fontSize: 20, fontWeight: "800" },
  pageSubtitle: { color: COLOR.muted, fontSize: 12, marginTop: 4 },
  alertButton: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#fff1f2", borderWidth: 1, borderColor: "#fecdd3", paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12 },
  alertButtonText: { color: COLOR.severe, fontWeight: "700", fontSize: 12 },
  alertDrawer: { borderRadius: 18, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#d7e1ed", padding: 16 },
  drawerTitle: { color: COLOR.text, fontWeight: "700", fontSize: 14, marginBottom: 12 },
  alertRow: { flexDirection: "row", gap: 14, alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderColor: "#fecaca", backgroundColor: "#fff5f5", borderRadius: 13, padding: 12, marginBottom: 10 },
  alertRowAck: { opacity: 0.52, borderColor: COLOR.border, backgroundColor: "#f8fafc" },
  alertMeta: { flex: 1, gap: 2 },
  alertPatient: { color: COLOR.text, fontWeight: "700", fontSize: 13 },
  alertTime: { color: COLOR.muted, fontSize: 11 },
  alertEvent: { color: COLOR.text, fontSize: 12 },
  ackButton: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: COLOR.sky50, borderWidth: 1, borderColor: "#bae6fd", paddingVertical: 7, paddingHorizontal: 10, borderRadius: 10 },
  ackButtonDone: { borderColor: "#86efac", backgroundColor: "#ecfdf5" },
  ackButtonText: { color: COLOR.sky600, fontSize: 11, fontWeight: "700" },
  masterDetail: { flexDirection: "row", gap: 22, alignItems: "flex-start" },
  masterDetailStack: { flexDirection: "column" },
  triagePane: { width: 370, minHeight: 600, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#d7e1ed", borderRadius: 22, padding: 22, shadowColor: "#0f172a", shadowOpacity: 0.08, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 4 },
  panelTitle: { color: COLOR.text, fontSize: 16, fontWeight: "800" },
  panelSub: { color: COLOR.muted, fontSize: 12, marginTop: 4, marginBottom: 12, lineHeight: 17 },
  searchInput: { borderWidth: 1, borderColor: COLOR.border, borderRadius: 12, backgroundColor: COLOR.panelSoft, color: COLOR.text, fontSize: 13, paddingHorizontal: 12, paddingVertical: 12 },
  filterRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  filterPill: { borderWidth: 1, borderColor: COLOR.border, backgroundColor: COLOR.slate100, paddingVertical: 7, paddingHorizontal: 10, borderRadius: 999 },
  filterPillActive: { backgroundColor: COLOR.emerald100, borderColor: "#a7f3d0" },
  filterPillText: { color: COLOR.muted, fontSize: 11, fontWeight: "700" },
  filterPillTextActive: { color: COLOR.emerald600 },
  patientListWrap: { marginTop: 14, maxHeight: 520 },
  patientCard: { borderWidth: 1, borderLeftWidth: 4, borderRadius: 16, padding: 15, marginBottom: 12 },
  patientCardActive: { borderWidth: 2, shadowColor: "#0a84ff", shadowOpacity: 0.18, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 4, transform: [{ scale: 1.01 }] },
  patientCardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  patientName: { color: COLOR.text, fontWeight: "800", fontSize: 14 },
  patientMeta: { color: COLOR.muted, fontSize: 12, marginTop: 2 },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 10, fontWeight: "800", letterSpacing: 0.3 },
  detailPane: { flex: 1, minHeight: 600, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#d7e1ed", borderRadius: 22, padding: 22, gap: 16, shadowColor: "#0f172a", shadowOpacity: 0.08, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 4 },
  profileHeader: { backgroundColor: "#eef6ff", borderRadius: 16, borderWidth: 1, borderColor: "#b9d7ff", padding: 17, flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 },
  profileName: { color: COLOR.text, fontSize: 19, fontWeight: "800" },
  profileMeta: { color: COLOR.muted, marginTop: 5, fontSize: 13, lineHeight: 18 },
  profileStatsRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  statPill: { borderRadius: 12, borderWidth: 1, borderColor: "#d7e1ed", paddingVertical: 9, paddingHorizontal: 11, backgroundColor: "#ffffff", minWidth: 88 },
  statPillLabel: { color: COLOR.muted, fontSize: 10, fontWeight: "700", textTransform: "uppercase" },
  statPillValue: { color: COLOR.text, fontSize: 14, fontWeight: "800", marginTop: 4 },
  card: { backgroundColor: "#ffffff", borderRadius: 16, borderWidth: 1, borderColor: "#d7e1ed", padding: 16 },
  cardTitle: { color: COLOR.text, fontWeight: "800", fontSize: 15, marginBottom: 4 },
  cardSub: { color: COLOR.muted, fontSize: 12, marginBottom: 14, lineHeight: 17 },
  chartHostWeb: { width: "100%", height: 220, borderRadius: 14, overflow: "hidden", backgroundColor: "#f8fffd", borderWidth: 1, borderColor: "#d8e5df" },
  chartFallback: { borderRadius: 14, borderWidth: 1, borderColor: "#d7e1ed", backgroundColor: "#f8fffd", padding: 14, minHeight: 150, justifyContent: "center" },
  chartFallbackTitle: { color: COLOR.text, fontWeight: "700", marginBottom: 10 },
  sparkRow: { flexDirection: "row", gap: 4, alignItems: "flex-end", height: 94 },
  sparkBar: { width: 9, borderRadius: 4, backgroundColor: "#14b8a6" },
  chartFallbackNote: { color: COLOR.muted, fontSize: 11, marginTop: 8 },
  vitalsGrid: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", minHeight: 120, gap: 6 },
  vitalsCol: { alignItems: "center", width: 38 },
  vitalsBars: { flexDirection: "row", alignItems: "flex-end", gap: 3, height: 98 },
  vitalsBar: { width: 11, borderRadius: 6 },
  vitalsBarAnxiety: { backgroundColor: "#f97316" },
  vitalsBarSleep: { backgroundColor: "#0284c7" },
  vitalsLabel: { color: COLOR.muted, fontSize: 10, marginTop: 5, fontWeight: "600" },
  vitalsLegend: { marginTop: 10, flexDirection: "row", justifyContent: "space-between" },
  vitalsLegendText: { color: COLOR.muted, fontSize: 11, fontWeight: "700" },
  recoveryRow: { marginBottom: 12 },
  recoveryMeta: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  recoveryName: { color: COLOR.text, fontSize: 12, fontWeight: "700" },
  recoveryValue: { color: COLOR.text, fontSize: 12, fontWeight: "800" },
  recoveryTrack: { width: "100%", height: 8, borderRadius: 999, backgroundColor: "#e2e8f0", overflow: "hidden" },
  recoveryFill: { height: "100%", borderRadius: 999 },
  bulletRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, marginTop: 8 },
  bulletText: { color: COLOR.text, fontSize: 13, lineHeight: 21, flex: 1 },
  actionBox: { borderRadius: 16, borderWidth: 1, borderColor: "#bfdbfe", backgroundColor: "#eff6ff", padding: 16 },
  selectorTitle: { color: COLOR.text, fontSize: 12, fontWeight: "700", marginBottom: 7 },
  optionChip: { borderRadius: 999, borderWidth: 1, borderColor: "#bfdbfe", backgroundColor: "#ffffff", paddingVertical: 7, paddingHorizontal: 10 },
  optionChipActive: { backgroundColor: "#dbeafe", borderColor: "#60a5fa" },
  optionChipText: { color: COLOR.muted, fontSize: 11, fontWeight: "700" },
  optionChipTextActive: { color: COLOR.sky600 },
  promptInput: { minHeight: 76, borderWidth: 1, borderColor: "#bfdbfe", borderRadius: 10, backgroundColor: "#ffffff", color: COLOR.text, paddingHorizontal: 11, paddingVertical: 9, textAlignVertical: "top", marginBottom: 14 },
  pushButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: COLOR.sky600, borderRadius: 12, paddingVertical: 11, paddingHorizontal: 12 },
  pushButtonSuccess: { backgroundColor: COLOR.stable },
  pushButtonText: { color: "#ffffff", fontWeight: "800", fontSize: 12 },
  complianceCard: { borderRadius: 16, borderWidth: 1, borderColor: "#bbf7d0", backgroundColor: "#f0fdf4", padding: 14, gap: 10 },
  complianceRow: { flexDirection: "row", gap: 10, alignItems: "center", borderWidth: 1, borderColor: "#dcfce7", backgroundColor: "#ffffff", borderRadius: 10, padding: 10 },
  complianceTitle: { color: COLOR.text, fontSize: 12, fontWeight: "700" },
  complianceValue: { color: COLOR.muted, fontSize: 11, marginTop: 2 },
  complianceNarrative: { color: COLOR.muted, fontSize: 11, lineHeight: 18, marginTop: 8 },
  refreshButton: { alignSelf: "flex-end", flexDirection: "row", alignItems: "center", gap: 7, borderWidth: 1, borderColor: "#bae6fd", borderRadius: 10, backgroundColor: "#f0f9ff", paddingVertical: 8, paddingHorizontal: 12 },
  refreshText: { color: COLOR.sky600, fontSize: 12, fontWeight: "700" },
  emergencyCard: { borderRadius: 16, borderWidth: 1, borderColor: "#fecaca", backgroundColor: "#fff6f6", padding: 16 },
  emergencyTitle: { color: COLOR.severe, fontWeight: "800", fontSize: 14, marginBottom: 6 },
  emergencyBody: { color: COLOR.text, fontSize: 13, lineHeight: 20 },
  emergencyActions: { marginTop: 12, flexDirection: "row", gap: 10, flexWrap: "wrap" },
  emergencyPrimaryBtn: { backgroundColor: COLOR.severe, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  emergencyPrimaryText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  emergencyGhostBtn: { borderWidth: 1, borderColor: "#fecaca", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: "#fff" },
  emergencyGhostText: { color: COLOR.severe, fontSize: 12, fontWeight: "700" },
  gridTwoLike: { flexDirection: "row", gap: 16, flexWrap: "wrap", alignItems: "flex-start" },
  metricRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#e2e8f0", paddingVertical: 10 },
});

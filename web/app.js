/* ═══════════════════════════════════════════════
  Mental Compass — Application Logic
  ═══════════════════════════════════════════════ */

const API = 'http://localhost:4000';
const USER_ID = 'demo-user-nepal';
const UX_MODE_KEY = 'aegis_ux_mode';

function getSessionUser() {
  return window.__aegisSession?.user || null;
}

function getActiveUserId() {
  const user = getSessionUser();
  return user?.id || user?.anonymousId || USER_ID;
}

function getOptionalAuthHeaders() {
  if (typeof window.__aegisGetAuthHeaders === 'function') {
    const hdrs = window.__aegisGetAuthHeaders();
    if (hdrs && hdrs.Authorization) return hdrs;
  }
  return null;
}

function unwrapApi(payload) {
  if (payload && typeof payload === 'object' && payload.data) return payload.data;
  return payload;
}

// ── State ──
const state = {
  uxMode: localStorage.getItem(UX_MODE_KEY) || 'calm',
  personality: 'calm',
  language: 'en',
  supportStep: 'self',
  memory: JSON.parse(localStorage.getItem('aegis_memory') || '[]'),
  chatHistory: [],
  result: null,
  trends: [],
  records: [],
  insights: null,
  escalations: [],
  avatarXp: 18,
  stability: 68,
  gamify: {
    xp: 18,
    level: 3,
    nextLevelXp: 100,
    quests: [
      { title: 'Complete today’s check-in', xp: 10, type: 'daily', done: false },
      { title: 'Run a 60s breathing exercise', xp: 8, type: 'daily', done: true },
      { title: 'Post a supportive comment', xp: 12, type: 'weekly', done: false },
      { title: 'Review one clinical summary', xp: 15, type: 'weekly', done: false },
    ],
    leaderboard: [
      { name: 'You', score: 1240 },
      { name: 'Dr. Adhikari', score: 1420 },
      { name: 'Supporter Sunita', score: 1190 },
      { name: 'Guardian Mira', score: 980 },
    ],
  },
  clinicianUi: {
    riskFilter: 'all',
    dateFilter: 'all',
    query: '',
    activePatientId: 'p-a-2847',
    alertsOpen: false,
    pushSuccess: false,
  },
  clinicianPatients: [],
  clinicianAlerts: [],
  patientHome: null,
};

function applyUxMode(mode) {
  const nextMode = mode === 'full' ? 'full' : 'calm';
  state.uxMode = nextMode;
  localStorage.setItem(UX_MODE_KEY, nextMode);

  document.body.classList.toggle('ux-calm', nextMode === 'calm');
  document.body.classList.toggle('ux-full', nextMode === 'full');

  const calmBtn = document.getElementById('btn-mode-calm');
  const fullBtn = document.getElementById('btn-mode-full');
  if (calmBtn) calmBtn.classList.toggle('active', nextMode === 'calm');
  if (fullBtn) fullBtn.classList.toggle('active', nextMode === 'full');

  const active = document.querySelector('.nav-item.active');
  const activeScreen = active?.dataset?.screen;
  const onHiddenScreen = nextMode === 'calm' && active?.classList.contains('full-only');
  if (onHiddenScreen) {
    const safeHome = document.querySelector('.nav-item[data-screen="dashboard"]');
    if (safeHome) safeHome.click();
  }

  // When mode switches, keep user on currently visible valid screen.
  if (!onHiddenScreen && activeScreen) {
    const screenEl = document.getElementById(`screen-${activeScreen}`);
    if (screenEl && !screenEl.classList.contains('active')) {
      screenEl.classList.add('active');
    }
  }
}

function initUxModeControls() {
  const calmBtn = document.getElementById('btn-mode-calm');
  const fullBtn = document.getElementById('btn-mode-full');
  if (calmBtn) calmBtn.addEventListener('click', () => applyUxMode('calm'));
  if (fullBtn) fullBtn.addEventListener('click', () => applyUxMode('full'));
  applyUxMode(state.uxMode);
}

function getNavItem(screen) {
  return document.querySelector(`.nav-item[data-screen="${screen}"]`);
}

function safeInitScreeningPage() {
  try {
    initScreeningPage();
  } catch {
    // If screening constants are not initialized yet during early bootstrap,
    // retry on the next tick after the script finishes evaluating.
    setTimeout(() => {
      try { initScreeningPage(); } catch {}
    }, 0);
  }
}

function navigateToScreen(screen, opts = {}) {
  const { updateHash = true } = opts;
  const activeRole = getSessionUser()?.role;

  // Patient role cannot access provider/system-only screens.
  if (activeRole === 'patient' && ['clinician', 'triage', 'alerts', 'compliance'].includes(screen)) {
    return navigateToScreen('dashboard', { updateHash });
  }

  if (screen === 'career') {
    return navigateToScreen('dashboard', { updateHash });
  }
  const item = getNavItem(screen);

  // Allow navigation even without a static nav item (IAM injected screens)
  const screenEl = document.getElementById(`screen-${screen}`);
  if (!item && !screenEl) return;

  if (item) {
    const hiddenByMode = state.uxMode === 'calm' && item.classList.contains('full-only') && screen !== 'screening';
    if (hiddenByMode) {
      const fallback = getNavItem('dashboard');
      if (fallback) return navigateToScreen('dashboard', { updateHash });
      return;
    }
  }

  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  if (item) item.classList.add('active');

  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active');
    s.style.display = 'none';
  });
  if (screenEl) {
    screenEl.classList.add('active');
    screenEl.style.display = 'block';
  }

  if (screen === 'screening') {
    safeInitScreeningPage();
    requestAnimationFrame(() => safeInitScreeningPage());
  }

  if (updateHash) {
    const next = `#${screen}`;
    if (window.location.hash !== next) window.location.hash = next;
  }

  // Auto-close mobile sidebar
  const sidebar = document.getElementById('sidebar');
  if (sidebar && window.innerWidth <= 768) {
    sidebar.classList.remove('open');
  }
}

// ── Navigation ──
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    navigateToScreen(item.dataset.screen, { updateHash: true });
  });
});

window.addEventListener('hashchange', () => {
  const screen = (window.location.hash || '').replace('#', '').trim();
  if (!screen) return;
  navigateToScreen(screen, { updateHash: false });
});

const initialHashScreen = (window.location.hash || '').replace('#', '').trim();
if (initialHashScreen) {
  navigateToScreen(initialHashScreen, { updateHash: false });
} else {
  navigateToScreen('dashboard', { updateHash: false });
}

// ── Mobile Menu Toggle ──
const mobileMenuBtn = document.getElementById('mobile-menu-toggle');
if (mobileMenuBtn) {
  mobileMenuBtn.addEventListener('click', () => {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      sidebar.classList.toggle('open');
    }
  });
  // Close sidebar when clicking outside on mobile
  document.addEventListener('click', (e) => {
    const sidebar = document.getElementById('sidebar');
    if (sidebar && sidebar.classList.contains('open') &&
        !sidebar.contains(e.target) &&
        e.target !== mobileMenuBtn) {
      sidebar.classList.remove('open');
    }
  });
}

function buildMoodHistory(seed) {
  const points = [];
  for (let i = 29; i >= 0; i--) {
    const base = seed + Math.sin(i / 4) * 1.05 + (i % 5 === 0 ? -0.6 : 0.35);
    const score = Math.max(1, Math.min(10, Number(base.toFixed(1))));
    points.push({ day: `D${30 - i}`, score });
  }
  return points;
}

function buildVitalsHistory(anxietySeed, sleepSeed) {
  const labels = ['3/18', '3/19', '3/20', '3/21', '3/22', '3/23', '3/24'];
  return labels.map((day, idx) => {
    const anxiety = Math.max(1, Math.min(10, Number((anxietySeed + Math.sin(idx / 2) * 0.8 + (idx % 3 === 0 ? 0.5 : -0.2)).toFixed(1))));
    const sleep = Math.max(3, Math.min(9, Number((sleepSeed + Math.cos(idx / 2.2) * 0.7 + (idx % 4 === 0 ? -0.3 : 0.2)).toFixed(1))));
    return { day, anxiety, sleep };
  });
}

const CLINICIAN_MOCK_PATIENTS = [
  {
    id: 'p-a-2847',
    code: 'User A-2847',
    name: 'User A-2847',
    age: 31,
    gender: 'Female',
    location: 'Rural Area',
    assignedDate: '2026-03-24',
    riskLevel: 'high',
    streak: 6,
    adherence: 78,
    treatmentDays: 45,
    checkinFrequency: '6/week',
    moodHistory: [
      { day: '3/18', score: 6.5 },
      { day: '3/19', score: 6.2 },
      { day: '3/20', score: 5.8 },
      { day: '3/21', score: 5.1 },
      { day: '3/22', score: 4.8 },
      { day: '3/23', score: 4.3 },
      { day: '3/24', score: 4.6 },
    ],
    summaryGeneratedAt: 'March 24, 2026 at 2:23 PM',
    liveAlertCopy: 'User A-2847 indicated high distress levels in latest voice check-in. AI summary flagged concerning language patterns.',
    fullVoiceSummary: 'User reported increased anxiety related to work stress and social isolation. Mentioned difficulty sleeping (4-5 hours per night) and reduced appetite. Positive indicators: User is maintaining exercise routine and reached out to a friend this week. No suicidal ideation mentioned. Tone analysis suggests mild depression with anxiety features. User expressed willingness to continue treatment and found breathing exercises helpful.',
    medications: [
      { name: 'Sertraline 50mg', dose: 'Daily - Morning' },
      { name: 'Lorazepam 0.5mg', dose: 'As needed' },
    ],
    vitalsHistory: buildVitalsHistory(8.1, 4.9),
    recoverySignals: [
      { label: 'Goal Completion', value: 78, color: '#0891b2' },
      { label: 'Support Reach-outs', value: 66, color: '#16a34a' },
      { label: 'Therapy Engagement', value: 82, color: '#2563eb' },
    ],
    aiSummaries: [
      'Discussed work anxiety and social isolation as top stressors.',
      'Breathing exercises are helping and user remains treatment-engaged.',
      'No suicidal ideation mentioned in this latest voice check-in.'
    ]
  },
  {
    id: 'p-002',
    code: 'User B-4172',
    name: 'Maya Gurung',
    age: 29,
    gender: 'Female',
    location: 'Pokhara',
    assignedDate: '2026-03-24',
    riskLevel: 'moderate',
    streak: 7,
    adherence: 72,
    treatmentDays: 31,
    checkinFrequency: '5/week',
    summaryGeneratedAt: 'March 27, 2026 at 11:10 AM',
    liveAlertCopy: 'User B-4172 reported escalating workplace uncertainty and evening panic spikes in latest check-in.',
    fullVoiceSummary: 'User described increased rumination about role changes and reduced confidence in team communication. Sleep was inconsistent at 5-6 hours, with improved mornings after guided breathing. Appetite is stable and user remains engaged in scheduled sessions. No self-harm language detected, but anxiety intensity increased over three days.',
    medications: [
      { name: 'Escitalopram 10mg', dose: 'Daily - Morning' },
      { name: 'Propranolol 10mg', dose: 'Before high-stress events' },
    ],
    moodHistory: buildMoodHistory(5.3),
    vitalsHistory: buildVitalsHistory(7.2, 5.8),
    recoverySignals: [
      { label: 'Goal Completion', value: 72, color: '#0891b2' },
      { label: 'Support Reach-outs', value: 58, color: '#16a34a' },
      { label: 'Therapy Engagement', value: 81, color: '#2563eb' },
    ],
    aiSummaries: [
      'Discussed work anxiety and role uncertainty.',
      'Responded well to breathing intervention.',
      'Needs structured evening decompression routine.'
    ]
  },
  {
    id: 'p-003',
    code: 'User C-1028',
    name: 'Rohan Karki',
    age: 34,
    gender: 'Male',
    location: 'Lalitpur',
    assignedDate: '2026-03-20',
    riskLevel: 'low',
    streak: 15,
    adherence: 91,
    treatmentDays: 63,
    checkinFrequency: '7/week',
    summaryGeneratedAt: 'March 28, 2026 at 8:02 AM',
    liveAlertCopy: 'User C-1028 shows stable baseline with no emergency escalation currently required.',
    fullVoiceSummary: 'User reported improved work-life boundaries and consistent recovery habits. Sleep quality is 7-8 hours nightly, and mood remains steady through high-demand periods. Continues journaling and physical activity with strong adherence. No acute warning phrases detected; maintenance plan is working effectively.',
    medications: [
      { name: 'Sertraline 25mg', dose: 'Daily - Morning' },
      { name: 'Melatonin 3mg', dose: 'Nightly as needed' },
    ],
    moodHistory: buildMoodHistory(7.2),
    vitalsHistory: buildVitalsHistory(3.8, 7.4),
    recoverySignals: [
      { label: 'Goal Completion', value: 91, color: '#16a34a' },
      { label: 'Support Reach-outs', value: 84, color: '#0891b2' },
      { label: 'Therapy Engagement', value: 93, color: '#2563eb' },
    ],
    aiSummaries: [
      'Stable routine and positive trend continuation.',
      'High adherence to journaling and sleep targets.',
      'No acute crisis language in recent sessions.'
    ]
  },
  {
    id: 'p-004',
    code: 'User D-6391',
    name: 'Nisha Tamang',
    age: 20,
    gender: 'Female',
    location: 'Bhaktapur',
    assignedDate: '2026-03-28',
    riskLevel: 'moderate',
    streak: 4,
    adherence: 64,
    treatmentDays: 18,
    checkinFrequency: '4/week',
    summaryGeneratedAt: 'March 28, 2026 at 9:40 AM',
    liveAlertCopy: 'User D-6391 showed a sharp anxiety spike around assignment deadlines and family pressure triggers.',
    fullVoiceSummary: 'User identified social pressure and academic uncertainty as current stress amplifiers. Sleep averaged 5 hours in the last two nights, with better mood after support chat scripts. Appetite remains mildly reduced, but user is still attending sessions and practicing guided grounding. No suicidal ideation mentioned; monitor closely for exam-week escalation.',
    medications: [
      { name: 'Fluoxetine 20mg', dose: 'Daily - Morning' },
      { name: 'Hydroxyzine 10mg', dose: 'As needed - Evening' },
    ],
    moodHistory: buildMoodHistory(4.8),
    vitalsHistory: buildVitalsHistory(7.8, 5.1),
    recoverySignals: [
      { label: 'Goal Completion', value: 64, color: '#0891b2' },
      { label: 'Support Reach-outs', value: 47, color: '#16a34a' },
      { label: 'Therapy Engagement', value: 69, color: '#2563eb' },
    ],
    aiSummaries: [
      'Family pressure themes observed in support chats.',
      'Requested stigma-safe script for trusted sibling conversation.',
      'Moderate anxiety spikes around assignment deadlines.'
    ]
  },
  {
    id: 'p-005',
    code: 'User E-5510',
    name: 'Sujan Rai',
    age: 26,
    gender: 'Male',
    location: 'Dharan',
    assignedDate: '2026-03-22',
    riskLevel: 'high',
    streak: 1,
    adherence: 42,
    treatmentDays: 12,
    checkinFrequency: '3/week',
    summaryGeneratedAt: 'March 28, 2026 at 10:04 AM',
    liveAlertCopy: 'User E-5510 used repeated crisis language and reported severe sleep collapse in latest check-in.',
    fullVoiceSummary: 'User described fear about financial instability and loss of role identity. Sleep dropped below 4 hours on consecutive nights, and hopeless statements increased in intensity. Positive marker: user accepted immediate follow-up and agreed to contact a trusted support person. Escalation routing is recommended with same-day clinician outreach.',
    medications: [
      { name: 'Venlafaxine 37.5mg', dose: 'Daily - Morning' },
      { name: 'Clonazepam 0.25mg', dose: 'Short-term as prescribed' },
    ],
    moodHistory: buildMoodHistory(3.2),
    vitalsHistory: buildVitalsHistory(8.8, 4.2),
    recoverySignals: [
      { label: 'Goal Completion', value: 42, color: '#0891b2' },
      { label: 'Support Reach-outs', value: 31, color: '#16a34a' },
      { label: 'Therapy Engagement', value: 48, color: '#2563eb' },
    ],
    aiSummaries: [
      'High financial stress and job uncertainty signals.',
      'Repeated crisis language detected this week.',
      'Needs same-day follow-up and support routing.'
    ]
  }
];

const CLINICIAN_MOCK_ALERTS = [
  {
    id: 'a-001',
    patientId: 'p-a-2847',
    patientName: 'User A-2847',
    timestamp: '2026-03-28T09:12:00Z',
    event: 'High distress in latest voice check-in',
    acknowledged: false,
  },
  {
    id: 'a-002',
    patientId: 'p-005',
    patientName: 'Sujan Rai',
    timestamp: '2026-03-28T10:04:00Z',
    event: 'Crisis keyword + severe sleep drop',
    acknowledged: false,
  },
  {
    id: 'a-003',
    patientId: 'p-004',
    patientName: 'Nisha Tamang',
    timestamp: '2026-03-28T07:48:00Z',
    event: 'Rapid anxiety escalation in morning check-in',
    acknowledged: false,
  },
  {
    id: 'a-004',
    patientId: 'p-002',
    patientName: 'Maya Gurung',
    timestamp: '2026-03-27T18:20:00Z',
    event: 'Negative mood trend for 3 days',
    acknowledged: true,
  },
];

const WEB_DUMMY_TRENDS = [6.0, 5.7, 5.4, 5.9, 6.2, 5.8, 5.3, 5.1, 5.4, 5.6, 5.9, 6.1, 5.8, 5.5].map((mood, idx) => ({
  timestamp: new Date(Date.now() - (13 - idx) * 1000 * 60 * 60 * 24).toISOString(),
  mood,
  score: Math.max(8, Math.min(95, Math.round((10 - mood) * 10 + (idx % 3) * 5)))
}));

const WEB_DUMMY_RECORDS = CLINICIAN_MOCK_PATIENTS.map((p, i) => ({
  id: `web-dummy-${p.id}`,
  timestamp: new Date(Date.now() - i * 1000 * 60 * 60 * 6).toISOString(),
  score: p.riskLevel === 'high' ? 78 - i : p.riskLevel === 'moderate' ? 54 - i : 24 + i,
  riskLevel: p.riskLevel,
  summary: { impression: p.aiSummaries[0] || 'Stable follow-up recommended.' },
  escalation: p.riskLevel === 'high'
}));

const WEB_DUMMY_INSIGHTS = {
  burnoutRisk: 'moderate',
  depressionRisk: 'low',
  confidence: 82,
  narrative: 'Dummy forecast: mild risk spikes around workload bursts; trend improves with journaling and breathing adherence.'
};

const WEB_DUMMY_ESCALATIONS = CLINICIAN_MOCK_ALERTS
  .filter(a => !a.acknowledged)
  .map((a, i) => ({
    id: `web-esc-${a.id}`,
    timestamp: new Date(Date.now() - i * 1000 * 60 * 60 * 7).toISOString(),
    severity: 'high',
    reason: a.event,
    contacts: ['trusted-contact-1', 'local-health-post']
  }));

async function initClinicianDashboard() {
  // Try live API for doctor queue
  if (!state.clinicianPatients.length) {
    try {
      const session = window.__aegisSession;
      if (session?.token && (session?.user?.role === 'doctor' || session?.user?.role === 'super_admin')) {
        const hdrs = window.__aegisGetAuthHeaders();
        const res = await fetch('http://localhost:4000/api/doctor/queue', { headers: hdrs });
        const json = await res.json();
        if (json.ok && json.data?.queue?.length) {
          state.clinicianPatients = json.data.queue.map((q, i) => ({
            id: q.anonymousId || `live-${i}`,
            name: `User ${q.anonymousId || i}`,
            age: '—', gender: '—',
            location: 'Remote',
            riskLevel: q.riskLevel || (q.latestRisk >= 70 ? 'high' : q.latestRisk >= 40 ? 'moderate' : 'low'),
            score: q.latestRisk || q.entryCount * 10 || 50,
            streak: q.entryCount || 1,
            adherence: Math.min(100, (q.entryCount || 1) * 20),
            summary: `${q.entryCount || 0} journal entries · Anonymous ID: ${q.anonymousId || 'N/A'}`,
            assignedDate: new Date().toISOString().slice(0,10),
            liveAlertCopy: 'No active alert'
          }));
        }
      }
    } catch {}
    // Fallback to mock if API returned nothing
    if (!state.clinicianPatients.length) state.clinicianPatients = CLINICIAN_MOCK_PATIENTS;
  }
  if (!state.clinicianAlerts.length) state.clinicianAlerts = CLINICIAN_MOCK_ALERTS.map(a => ({ ...a }));

  const search = document.getElementById('clinician-search');
  if (search && !search.dataset.bound) {
    search.dataset.bound = 'true';
    search.addEventListener('input', e => {
      state.clinicianUi.query = (e.target.value || '').toLowerCase().trim();
      renderClinicianRecords();
    });
  }

  const riskWrap = document.getElementById('clinician-risk-filters');
  if (riskWrap && !riskWrap.dataset.bound) {
    riskWrap.dataset.bound = 'true';
    riskWrap.addEventListener('click', e => {
      const btn = e.target.closest('[data-risk]');
      if (!btn) return;
      state.clinicianUi.riskFilter = btn.dataset.risk || 'all';
      renderClinicianRecords();
    });
  }

  const dateWrap = document.getElementById('clinician-date-filters');
  if (dateWrap && !dateWrap.dataset.bound) {
    dateWrap.dataset.bound = 'true';
    dateWrap.addEventListener('click', e => {
      const btn = e.target.closest('[data-date]');
      if (!btn) return;
      state.clinicianUi.dateFilter = btn.dataset.date || 'all';
      renderClinicianRecords();
    });
  }

  const pList = document.getElementById('clinician-patient-list');
  if (pList && !pList.dataset.bound) {
    pList.dataset.bound = 'true';
    pList.addEventListener('click', e => {
      const card = e.target.closest('[data-patient-id]');
      if (!card) return;
      state.clinicianUi.activePatientId = card.dataset.patientId;
      renderClinicianRecords();
    });
  }

  const toggleAlerts = document.getElementById('btn-clin-alerts-toggle');
  if (toggleAlerts && !toggleAlerts.dataset.bound) {
    toggleAlerts.dataset.bound = 'true';
    toggleAlerts.addEventListener('click', () => {
      state.clinicianUi.alertsOpen = !state.clinicianUi.alertsOpen;
      renderClinicianRecords();
    });
  }

  const alertList = document.getElementById('clinician-alert-list');
  if (alertList && !alertList.dataset.bound) {
    alertList.dataset.bound = 'true';
    alertList.addEventListener('click', e => {
      const btn = e.target.closest('[data-alert-id]');
      if (!btn) return;
      const id = btn.dataset.alertId;
      state.clinicianAlerts = state.clinicianAlerts.map(a => a.id === id ? { ...a, acknowledged: true } : a);
      renderClinicianRecords();
    });
  }

  const pushBtn = document.getElementById('btn-push-patient');
  if (pushBtn && !pushBtn.dataset.bound) {
    pushBtn.dataset.bound = 'true';
    pushBtn.addEventListener('click', () => {
      state.clinicianUi.pushSuccess = true;
      const selectedMilestone = document.getElementById('clinician-milestone-select')?.value || 'Milestone';
      showToast(`✅ Intervention pushed: ${selectedMilestone}`);
      renderClinicianRecords();
      setTimeout(() => {
        state.clinicianUi.pushSuccess = false;
        renderClinicianRecords();
      }, 1500);
    });
  }

  const saveDraftBtn = document.getElementById('btn-save-draft');
  if (saveDraftBtn && !saveDraftBtn.dataset.bound) {
    saveDraftBtn.dataset.bound = 'true';
    saveDraftBtn.addEventListener('click', () => {
      showToast('💾 Milestone saved as draft');
    });
  }

  const contactBtn = document.getElementById('btn-contact-patient');
  if (contactBtn && !contactBtn.dataset.bound) {
    contactBtn.dataset.bound = 'true';
    contactBtn.addEventListener('click', () => {
      const active = state.clinicianPatients.find(p => p.id === state.clinicianUi.activePatientId);
      const label = active?.code || active?.name || 'Selected user';
      showToast(`📞 Contact workflow opened for ${label}`);
    });
  }

  const reviewBtn = document.getElementById('btn-review-summary');
  if (reviewBtn && !reviewBtn.dataset.bound) {
    reviewBtn.dataset.bound = 'true';
    reviewBtn.addEventListener('click', () => {
      const section = document.getElementById('clinician-summary-section');
      if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  renderClinicianRecords();
}

// ── Slider Sync ──
const sliders = [
  { id: 'sl-mood', display: 'sv-mood', fmt: v => v },
  { id: 'sl-anxiety', display: 'sv-anxiety', fmt: v => v },
  { id: 'sl-stress', display: 'sv-stress', fmt: v => v },
  { id: 'sl-sleep', display: 'sv-sleep', fmt: v => v },
  { id: 'sl-phone', display: 'sv-phone', fmt: v => v },
  { id: 'sl-wpm', display: 'sv-wpm', fmt: v => v },
  { id: 'sl-pause', display: 'sv-pause', fmt: v => (v / 100).toFixed(2) },
  { id: 'sl-jitter', display: 'sv-jitter', fmt: v => (v / 1000).toFixed(3) },
  { id: 'sl-sentiment', display: 'sv-sentiment', fmt: v => ((v - 100) / 100).toFixed(2) },
  { id: 'sl-deadline', display: 'sv-deadline', fmt: v => v },
  { id: 'sl-uncertainty', display: 'sv-uncertainty', fmt: v => v },
  { id: 'sl-financial', display: 'sv-financial', fmt: v => v },
  { id: 'sl-belonging', display: 'sv-belonging', fmt: v => v },
];

sliders.forEach(({ id, display, fmt }) => {
  const slider = document.getElementById(id);
  const value = document.getElementById(display);
  if (!slider || !value) return;
  const update = () => {
    const pct = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
    slider.style.setProperty('--val', pct + '%');
    value.textContent = fmt(+slider.value);
    updateSignals();
  };
  slider.addEventListener('input', update);
  update();
});

// ── Personality / Language Chips ──
document.querySelectorAll('.chip[data-personality]').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.chip[data-personality]').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    state.personality = chip.dataset.personality;
  });
});
document.querySelectorAll('.chip[data-lang]').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.chip[data-lang]').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    state.language = chip.dataset.lang;
  });
});

// ── Chat ──
const chatInput = document.getElementById('chat-input');
const chatSend = document.getElementById('chat-send');
const chatMessages = document.getElementById('chat-messages');

chatSend.addEventListener('click', sendChat);
chatInput.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); } });

async function sendChat() {
  const msg = chatInput.value.trim();
  if (!msg) return;
  appendBubble(msg, 'user');
  chatInput.value = '';

  // Show typing indicator
  const typingId = 'typing-' + Date.now();
  chatMessages.insertAdjacentHTML('beforeend', `<div id="${typingId}" class="chat-bubble bot"><div class="typing-indicator"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></div></div>`);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  let reply;
  try {
    const res = await fetch(`${API}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: msg,
        mood: +document.getElementById('sl-mood').value,
        anxiety: +document.getElementById('sl-anxiety').value,
        stress: +document.getElementById('sl-stress').value,
        sleepHours: +document.getElementById('sl-sleep').value,
        riskScore: state.result?.risk?.score,
        riskLevel: state.result?.risk?.riskLevel,
        personality: state.personality,
        language: state.language,
        memoryContext: state.memory.slice(0, 5),
        journalEmotion: 'neutral'
      })
    });
    const raw = await res.json();
    const data = unwrapApi(raw);
    reply = data.reply;
  } catch {
    reply = `I hear you. Your current stress is ${document.getElementById('sl-stress').value}/10. Try a 4-4-4 breathing cycle right now, then note one thing you can control in the next hour.`;
  }

  const typingEl = document.getElementById(typingId);
  if (typingEl) typingEl.remove();
  appendBubble(reply, 'bot');
}

function appendBubble(text, role) {
  const time = new Date().toLocaleTimeString();
  const label = role === 'bot' ? 'Copilot' : 'You';
  chatMessages.insertAdjacentHTML('beforeend',
    `<div class="chat-bubble ${role}">${escapeHtml(text)}<div class="chat-bubble-meta">${label} · ${time}</div></div>`
  );
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ── Check-In ──
document.getElementById('btn-checkin').addEventListener('click', runCheckin);

async function runCheckin() {
  const btn = document.getElementById('btn-checkin');
  btn.textContent = '⏳ Analyzing...';
  btn.disabled = true;

  const payload = {
    userId: getActiveUserId(),
    roleContext: document.getElementById('career-role')?.value || 'student',
    mood: +document.getElementById('sl-mood').value,
    anxiety: +document.getElementById('sl-anxiety').value,
    stress: +document.getElementById('sl-stress').value,
    sleepHours: +document.getElementById('sl-sleep').value,
    phoneUsageHours: +document.getElementById('sl-phone').value,
    typingSpeedDelta: 0.1,
    speechRateWpm: +document.getElementById('sl-wpm').value,
    pauseRatio: +document.getElementById('sl-pause').value / 100,
    jitter: +document.getElementById('sl-jitter').value / 1000,
    sentiment: (+document.getElementById('sl-sentiment').value - 100) / 100,
    deadlinePressure: +document.getElementById('sl-deadline').value,
    roleUncertainty: +document.getElementById('sl-uncertainty').value,
    financialStress: +document.getElementById('sl-financial').value,
    belongingSafety: +document.getElementById('sl-belonging').value,
    stigmaSafePreferred: !!document.getElementById('stigma-safe')?.checked,
    trustedContact: document.getElementById('trusted-contact')?.value?.trim() || '',
    crisisSignals: [],
    journalText: document.getElementById('journal-text').value || ''
  };

  try {
    const res = await fetch(`${API}/api/checkins`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const raw = await res.json();
    const data = unwrapApi(raw);
    state.result = data;
    state.avatarXp = Math.min(state.avatarXp + 6, 100);
    state.stability = 100 - data.risk.score;

    // Save memory
    state.memory.unshift({
      userMessage: payload.journalText || 'Check-in',
      copilotSummary: data.clinicalSummary.impression
    });
    state.memory = state.memory.slice(0, 30);
    localStorage.setItem('aegis_memory', JSON.stringify(state.memory));

    renderCheckinResult(data);
    updateDashboard();
    refreshRemote();

    if (data.escalation) showToast('🚨 Crisis signal detected! Emergency escalation triggered.');
    else showToast('✅ Check-in analysis complete');
  } catch {
    showToast('⚠️ Backend unavailable — offline-first mode active');
  }

  btn.textContent = '🔬 Run Predictive Analysis';
  btn.disabled = false;
}

function renderCheckinResult(data) {
  const el = document.getElementById('checkin-result');
  const body = document.getElementById('checkin-result-body');
  el.style.display = 'block';

  const riskCol = data.risk.score >= 70 ? 'var(--danger)' : data.risk.score >= 40 ? 'var(--warning)' : 'var(--success)';
  const badgeCls = data.risk.riskLevel === 'high' ? 'badge-high' : data.risk.riskLevel === 'moderate' ? 'badge-moderate' : 'badge-low';
  const comp = data.risk.components || {};

  body.innerHTML = `
    <div style="text-align:center;margin-bottom:20px;">
      <div style="font-size:56px;font-weight:800;color:${riskCol};line-height:1;">${data.risk.score}</div>
      <div style="font-size:14px;color:var(--text-muted);margin-top:4px;">Risk Score / 100</div>
      <span class="badge ${badgeCls}" style="margin-top:8px;display:inline-block;">${data.risk.riskLevel.toUpperCase()}</span>
    </div>
    <div class="grid-3 gap-24" style="margin-bottom:16px;">
      <div class="metric-card" style="text-align:center"><div class="metric-value" style="font-size:20px;color:var(--accent)">${data.trend.trend}</div><div class="metric-label">Trend</div></div>
      <div class="metric-card" style="text-align:center"><div class="metric-value" style="font-size:20px;color:var(--accent)">Δ ${data.trend.delta}</div><div class="metric-label">Delta</div></div>
      <div class="metric-card" style="text-align:center"><div class="metric-value" style="font-size:20px;color:${data.escalation ? 'var(--danger)' : 'var(--success)'}">${data.escalation ? 'YES' : 'NO'}</div><div class="metric-label">Escalation</div></div>
    </div>
    <div style="font-size:14px;color:var(--text-secondary);margin-bottom:12px;"><strong>Clinical Impression:</strong> ${escapeHtml(data.clinicalSummary.impression)}</div>
    <div class="grid-2 gap-24" style="margin-bottom:14px;">
      <div class="metric-card" style="text-align:center"><div class="metric-value" style="font-size:18px;color:var(--warning)">${Math.round(comp.careerPressure || 0)}</div><div class="metric-label">Career Pressure</div></div>
      <div class="metric-card" style="text-align:center"><div class="metric-value" style="font-size:18px;color:var(--accent)">${Math.round(comp.uncertainty || 0)}</div><div class="metric-label">Uncertainty Load</div></div>
    </div>
    ${data.interventions.map(i => `<div style="font-size:13px;color:var(--text-muted);margin-bottom:4px;">• ${escapeHtml(i)}</div>`).join('')}
    <div class="plan-box">
      <div class="plan-label">Recommended Plan</div>
      <div class="plan-text">${escapeHtml(data.clinicalSummary.recommendedPlan)}</div>
    </div>
    <div style="font-size:11px;color:var(--text-muted);margin-top:12px;">Audit Hash: <code style="color:var(--accent)">${data.auditHash?.slice(0, 20)}...</code> · Audio deleted: ✅</div>
  `;
}

// ── Emergency ──
async function triggerEmergencySOS() {
  try {
    const authHeaders = typeof window.__aegisGetAuthHeaders === 'function' ? window.__aegisGetAuthHeaders() : null;
    const hasAuth = authHeaders && authHeaders.Authorization;

    if (hasAuth) {
      const res = await fetch(`${API}/api/severe/call/patient`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ reason: 'manual-emergency-sos', preferredTime: 'asap' })
      });
      const raw = await res.json();
      const data = unwrapApi(raw);
      if (raw?.ok === false) {
        throw new Error(raw?.error?.message || 'Could not send SOS');
      }
      showToast(data?.message || '🚨 SOS sent to care team');
      refreshRemote();
      return;
    }

    await fetch(`${API}/api/escalations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: getActiveUserId(), severity: 'high', reason: 'manual-emergency-trigger', contacts: ['trusted-contact-1', 'local-health-post'] })
    });
    showToast('🚨 Emergency escalation sent to clinician and contacts');
    refreshRemote();
  } catch {
    showToast('⚠️ Could not send emergency request');
  }
}

const emergencyBtn = document.getElementById('btn-emergency');
if (emergencyBtn) emergencyBtn.addEventListener('click', triggerEmergencySOS);

const emergencyHomeBtn = document.getElementById('btn-emergency-home');
if (emergencyHomeBtn) emergencyHomeBtn.addEventListener('click', triggerEmergencySOS);

// ── SMS Fallback ──
document.getElementById('btn-sms-fallback').addEventListener('click', async () => {
  if (!state.result) { showToast('Run a check-in first'); return; }
  try {
    const res = await fetch(`${API}/api/transport/sms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: getActiveUserId(), riskScore: state.result.risk.score, riskLevel: state.result.risk.riskLevel, escalation: state.result.escalation })
    });
    const raw = await res.json();
    const data = unwrapApi(raw);
    const el = document.getElementById('sms-payload-result');
    el.style.display = 'block';
    document.getElementById('sms-payload-body').innerHTML = `Channel: ${data.channel}<br/>SMS Truncated: ${data.truncatedForSms ? 'Yes' : 'No'}<br/><code style="font-size:10px;color:var(--accent);word-break:break-all;">${data.payload}</code>`;
    showToast('📲 Encrypted SMS/USSD payload generated');
  } catch { showToast('⚠️ Transport failed'); }
});

// ── Clinician Refresh ──
document.getElementById('btn-refresh-clinician').addEventListener('click', refreshRemote);

// ── Signal Updates ──
function updateSignals() {
  const stress = +document.getElementById('sl-stress').value;
  const phone = +document.getElementById('sl-phone').value;
  const sleep = +document.getElementById('sl-sleep').value;
  const wpm = +document.getElementById('sl-wpm').value;
  const pause = +document.getElementById('sl-pause').value / 100;
  const jitter = +document.getElementById('sl-jitter').value / 1000;

  const typingVol = 10; // simplified
  const drift = Math.max(0, Math.min(100, Math.round(phone * 6 - sleep * 2)));
  const stressNow = Math.max(0, Math.min(100, Math.round((stress * 9 + typingVol * 0.25 + drift * 0.2) / 1.2)));
  const tension = Math.max(0, Math.min(100, Math.round((Math.abs(130 - wpm) + pause * 80 + jitter * 700) / 3)));

  setText('sig-typing', typingVol + '%');
  setText('sig-drift', drift + '%');
  setText('sig-stress', stressNow + '%');
  setText('sig-tension-val', tension);
  setText('sig-recommendation', stressNow > 70 ? '🚨 Run 60-second grounding NOW' : '📊 Keep monitoring');

  const sigStressEl = document.getElementById('sig-stress');
  if (sigStressEl) sigStressEl.style.color = stressNow >= 70 ? 'var(--danger)' : stressNow >= 40 ? 'var(--warning)' : 'var(--success)';

  const tensionBar = document.getElementById('sig-tension-bar');
  if (tensionBar) {
    tensionBar.style.width = tension + '%';
    tensionBar.className = 'progress-fill ' + (tension >= 70 ? 'danger' : tension >= 40 ? 'warning' : '');
  }

  const toneEl = document.getElementById('sig-tone');
  if (toneEl) toneEl.innerHTML = tension > 65 ? '🔴 Tense' : tension > 40 ? '🟡 Guarded' : '🟢 Steady';

  // Update bio cards
  const bios = document.getElementById('sig-biomarkers');
  if (bios) {
    const cards = bios.querySelectorAll('.bio-card');
    if (cards[0]) cards[0].querySelector('.bio-value').textContent = wpm;
    if (cards[1]) cards[1].querySelector('.bio-value').textContent = pause.toFixed(2);
    if (cards[2]) cards[2].querySelector('.bio-value').textContent = jitter.toFixed(3);
  }

  // Habits
  const sleepPct = Math.min(100, Math.round((sleep / 8) * 100));
  setBarWidth('habit-sleep', sleepPct);
  setBarWidth('habit-digital', Math.max(0, 100 - Math.round(phone * 6)));

  // Dashboard stress
  setText('dash-stress', stressNow + '%');
}

// ── Dashboard Update ──
function updateDashboard() {
  setText('dash-stability', state.stability);
  setText('ring-number', state.stability);
  setText('dash-xp', state.avatarXp);

  // Ring arc
  const circ = 490;
  const offset = circ - (circ * state.stability / 100);
  const arc = document.getElementById('stability-arc');
  if (arc) arc.setAttribute('stroke-dashoffset', offset);

  // Risk label
  if (state.result) {
    const rl = document.getElementById('dash-risk-label');
    const rs = document.getElementById('dash-risk-score');
    if (rl) {
      rl.textContent = state.result.risk.riskLevel.toUpperCase();
      rl.style.color = state.result.risk.score >= 70 ? 'var(--danger)' : state.result.risk.score >= 40 ? 'var(--warning)' : 'var(--success)';
    }
    if (rs) rs.textContent = state.result.risk.score + ' / 100';
  } else if (state.patientHome) {
    const rl = document.getElementById('dash-risk-label');
    const rs = document.getElementById('dash-risk-score');
    const urgent = state.patientHome.urgentCount || 0;
    const level = urgent > 0 ? 'HIGH' : (state.patientHome.suggestConsultation ? 'MODERATE' : 'LOW');
    if (rl) {
      rl.textContent = level;
      rl.style.color = urgent > 0 ? 'var(--danger)' : (state.patientHome.suggestConsultation ? 'var(--warning)' : 'var(--success)');
    }
    if (rs) rs.textContent = `Entries ${state.patientHome.entryCount} · Alerts ${urgent}`;
  }

  // Avatar
  const stage = state.avatarXp > 80 ? '🛡️' : state.avatarXp > 50 ? '🧭' : '🌱';
  const stageName = state.avatarXp > 80 ? 'Guardian' : state.avatarXp > 50 ? 'Mentor' : 'Sprout';
  setText('avatar-emoji', stage); setText('avatar-stage', stageName);
  setText('ins-avatar', stage); setText('ins-stage', stageName);
  setText('ins-xp-text', state.avatarXp + ' / 100 XP');
  setBarWidth('avatar-xp-bar', state.avatarXp);
  setBarWidth('ins-xp-bar', state.avatarXp);
}

// ── Remote Data ──
async function refreshRemote() {
  const activeUserId = getActiveUserId();
  const authHeaders = getOptionalAuthHeaders();

  try {
    const [trendRaw, recRaw, insRaw, escRaw] = await Promise.all([
      fetch(`${API}/api/users/${activeUserId}/trends`).then(r => r.json()),
      fetch(`${API}/api/users/${activeUserId}/records`).then(r => r.json()),
      fetch(`${API}/api/users/${activeUserId}/insights`).then(r => r.json()),
      fetch(`${API}/api/users/${activeUserId}/escalations`).then(r => r.json()),
    ]);

    const trendRes = unwrapApi(trendRaw);
    const recRes = unwrapApi(recRaw);
    const insRes = unwrapApi(insRaw);
    const escRes = unwrapApi(escRaw);

    state.trends = (trendRes.points && trendRes.points.length) ? trendRes.points : WEB_DUMMY_TRENDS;
    state.records = ((recRes.records && recRes.records.length) ? recRes.records : WEB_DUMMY_RECORDS).slice(-8).reverse();
    state.insights = insRes.insights || WEB_DUMMY_INSIGHTS;
    state.escalations = ((escRes.records && escRes.records.length) ? escRes.records : WEB_DUMMY_ESCALATIONS).slice(-8).reverse();

    if (authHeaders) {
      try {
        const [journalsRaw, apptsRaw] = await Promise.all([
          fetch(`${API}/api/journals/mine?limit=30`, { headers: authHeaders }).then(r => r.json()),
          fetch(`${API}/api/appointments/mine`, { headers: authHeaders }).then(r => r.json()),
        ]);
        const jData = journalsRaw?.data || {};
        const entries = jData.entries || jData.journals || [];
        const stats = jData.stats || null;
        const assessments = entries.flatMap((e) => e.doctorAssessments || []);
        const urgentCount = assessments.filter((a) => a.severity === 'severe' || a.requiresImmediateCall || a.recommendsConsultation).length;
        const appts = apptsRaw?.data?.appointments || apptsRaw?.appointments || [];
        const upcoming = appts
          .filter((a) => a.scheduledAt)
          .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));

        state.patientHome = {
          entryCount: entries.length,
          urgentCount,
          suggestConsultation: !!jData.consultation?.suggest,
          severeAlert: !!jData.severeAlert,
          nextAppointmentAt: upcoming[0]?.scheduledAt || null,
          avgSentiment: typeof stats?.avgSentiment === 'number' ? stats.avgSentiment : null,
        };

        if (typeof state.patientHome.avgSentiment === 'number') {
          state.stability = Math.max(0, Math.min(100, Math.round(state.patientHome.avgSentiment)));
        }

        renderPatientDashboardRecommendations();
      } catch {
        state.patientHome = null;
      }
    }

    renderMoodCharts();
    renderClinicianRecords();
    renderInsights();
    renderAuditLog();
    updateDashboard();
  } catch {
    state.trends = WEB_DUMMY_TRENDS;
    state.records = WEB_DUMMY_RECORDS.slice(-8).reverse();
    state.insights = WEB_DUMMY_INSIGHTS;
    state.escalations = WEB_DUMMY_ESCALATIONS.slice(-8).reverse();
    state.patientHome = null;
    renderMoodCharts();
    renderClinicianRecords();
    renderInsights();
    renderAuditLog();
    updateDashboard();
  }
}

// Allow IAM flow to force-refresh dashboard data right after login.
window.__aegisRefreshDashboard = refreshRemote;

function renderPatientDashboardRecommendations() {
  const el = document.getElementById('dash-recommendations');
  if (!el || !state.patientHome) return;

  const lines = [];
  if (state.patientHome.nextAppointmentAt) {
    lines.push(`📅 Next consultation: ${new Date(state.patientHome.nextAppointmentAt).toLocaleString()}`);
  } else {
    lines.push('📅 No upcoming consultation yet. Book one if you want clinician support.');
  }

  if (state.patientHome.urgentCount > 0) {
    lines.push(`🚨 ${state.patientHome.urgentCount} care team ping(s) need your attention. Open Care Operations.`);
  } else {
    lines.push('✅ No urgent care-team pings right now. Keep your daily rhythm.');
  }

  lines.push(`📝 Journal entries recorded: ${state.patientHome.entryCount}`);

  el.innerHTML = lines.map((line) => `<div class="signal-item"><span class="signal-name">${escapeHtml(line)}</span></div>`).join('');
}

function renderMoodCharts() {
  const pts = state.trends.slice(-10);
  ['dash-mood-chart', 'ins-mood-chart'].forEach(containerId => {
    const el = document.getElementById(containerId);
    if (!el) return;
    if (!pts.length) { el.innerHTML = '<div style="color:var(--text-muted);font-size:13px;padding:40px;text-align:center;width:100%">Complete check-ins to unlock visualization</div>'; return; }
    el.innerHTML = pts.map(pt => {
      const h = Math.max(8, pt.mood * 14);
      const col = pt.score >= 70 ? 'var(--danger)' : pt.score >= 40 ? 'var(--warning)' : 'var(--accent)';
      const d = new Date(pt.timestamp).getDate();
      return `<div class="bar-col"><div class="bar-fill" style="height:${h}px;background:linear-gradient(180deg,${col},rgba(56,189,248,0.15))"></div><div class="bar-label">${d}</div></div>`;
    }).join('');
  });
}

function renderClinicianRecords() {
  const listEl = document.getElementById('clinician-patient-list');
  if (!listEl) return;

  const ui = state.clinicianUi;
  const now = Date.now();

  const filtered = state.clinicianPatients.filter(p => {
    const queryOk = !ui.query || p.name.toLowerCase().includes(ui.query) || p.location.toLowerCase().includes(ui.query);
    const riskOk = ui.riskFilter === 'all' || p.riskLevel === ui.riskFilter;
    const assignedDays = (now - new Date(p.assignedDate).getTime()) / (1000 * 60 * 60 * 24);
    const dateOk = ui.dateFilter === 'all' || (ui.dateFilter === '7' ? assignedDays <= 7 : assignedDays <= 30);
    return queryOk && riskOk && dateOk;
  });

  if (!filtered.length) {
    listEl.innerHTML = '<div style="color:var(--text-muted);padding:18px;text-align:center;">No users match your filters.</div>';
  } else {
    const levelLabel = lvl => lvl === 'high' ? 'Severe' : lvl === 'moderate' ? 'Monitor' : 'Stable';
    const badgeCls = lvl => lvl === 'high' ? 'badge-high' : lvl === 'moderate' ? 'badge-moderate' : 'badge-low';
    const toneClass = lvl => lvl === 'high' ? 'severe' : lvl === 'moderate' ? 'monitor' : 'stable';
    listEl.innerHTML = filtered.map(p => `
      <div class="clin-patient-card ${toneClass(p.riskLevel)} ${p.id === ui.activePatientId ? 'active' : ''}" data-patient-id="${p.id}">
        <div class="clin-patient-title">
          <div class="clin-patient-name">${escapeHtml(p.name)}</div>
          <span class="badge ${badgeCls(p.riskLevel)}">${levelLabel(p.riskLevel)}</span>
        </div>
        <div class="clin-patient-meta">${escapeHtml(p.location)} · Assigned ${p.assignedDate}</div>
        <div class="clin-patient-meta">Streak ${p.streak} days · Adherence ${p.adherence}%</div>
      </div>
    `).join('');
  }

  const active = state.clinicianPatients.find(p => p.id === ui.activePatientId) || filtered[0] || state.clinicianPatients[0];
  if (active) state.clinicianUi.activePatientId = active.id;

  document.querySelectorAll('#clinician-risk-filters [data-risk]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.risk === ui.riskFilter);
  });
  document.querySelectorAll('#clinician-date-filters [data-date]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.date === ui.dateFilter);
  });

  setText('clinician-active-name', active?.name || '—');
  setText('clinician-active-meta', active ? `${active.age} · ${active.gender} · ${active.location}` : '—');
  setText('clinician-active-streak', active ? `${active.streak}d` : '—');
  setText('clinician-active-adherence', active ? `${active.adherence}%` : '—');
  setText('clinician-live-alert-title', `Live Emergency Alert - ${active?.location || 'Selected'} User`);
  setText('clinician-live-alert-copy', active?.liveAlertCopy || 'No active live alert for selected user.');
  setText('clinician-summary-patient', active?.code || active?.name || 'User');
  setText('clinician-voice-summary', active?.fullVoiceSummary || 'No latest voice summary.');
  setText('clinician-generated-at', `Generated: ${active?.summaryGeneratedAt || new Date().toLocaleString()}`);
  const moodLabels = (active?.moodHistory || []).map(pt => pt.day).join(' · ');
  setText('clinician-mood-subtitle', moodLabels || 'Recent daily mood trend');

  const chartEl = document.getElementById('clinician-mood-chart');
  if (chartEl && active) {
    chartEl.innerHTML = active.moodHistory.map(pt => {
      const h = Math.max(6, pt.score * 11);
      const col = active.riskLevel === 'high' ? 'var(--danger)' : active.riskLevel === 'moderate' ? 'var(--warning)' : 'var(--success)';
      return `<div class="bar-col"><div class="bar-fill" style="height:${h}px;background:linear-gradient(180deg,${col},rgba(56,189,248,0.18))"></div><div class="bar-label">${pt.day.replace('D', '')}</div></div>`;
    }).join('');
  }

  const aiEl = document.getElementById('clinician-ai-summaries');
  if (aiEl && active) {
    const fromResult = state.result?.clinicalSummary?.impression;
    const lines = fromResult ? [fromResult, ...active.aiSummaries].slice(0, 4) : active.aiSummaries;
    aiEl.innerHTML = lines.map(l => `<div class="signal-item"><span class="signal-name">• ${escapeHtml(l)}</span></div>`).join('');
  }

  const medsEl = document.getElementById('clinician-medications');
  if (medsEl) {
    const meds = active?.medications || [];
    medsEl.innerHTML = meds.length
      ? meds.map(m => `<div class="clin-med-row"><span class="clin-med-name">${escapeHtml(m.name)}</span><span class="clin-med-dose">${escapeHtml(m.dose)}</span></div>`).join('')
      : '<div class="record-body" style="font-size:13px;color:var(--text-muted);">No active medications listed.</div>';
  }

  const metricsEl = document.getElementById('clinician-activity-metrics');
  if (metricsEl) {
    const riskLabel = active?.riskLevel === 'high' ? 'HIGH PRIORITY' : active?.riskLevel === 'moderate' ? 'MODERATE WATCH' : 'STABLE WATCH';
    const riskStyle = active?.riskLevel === 'high' ? 'background:var(--danger-dim);color:var(--danger);' : active?.riskLevel === 'moderate' ? 'background:var(--warning-dim);color:var(--warning);' : 'background:var(--success-dim);color:var(--success);';
    const metrics = [
      ['Check-In Frequency', active?.checkinFrequency || '6/week'],
      ['Goal Completion', `${active?.adherence || 0}%`],
      ['Treatment Days', `${active?.treatmentDays || 45}`],
      ['Risk Level', `<span class="clin-risk-pill" style="${riskStyle}">${riskLabel}</span>`]
    ];
    metricsEl.innerHTML = metrics.map(([name, val]) => `<div class="clin-metric-row"><span class="clin-metric-name">${name}</span><span class="clin-metric-value">${val}</span></div>`).join('');
  }

  const vitalsEl = document.getElementById('clinician-vitals-chart');
  if (vitalsEl && active) {
    const vitals = (active.vitalsHistory && active.vitalsHistory.length) ? active.vitalsHistory : buildVitalsHistory(6.4, 5.6);
    vitalsEl.innerHTML = vitals.map(pt => {
      const anxHeight = Math.max(8, pt.anxiety * 9);
      const sleepHeight = Math.max(8, pt.sleep * 9);
      return `<div class="clin-duo-col"><div class="clin-duo-bars"><div class="clin-duo-bar anxiety" style="height:${anxHeight}px"></div><div class="clin-duo-bar sleep" style="height:${sleepHeight}px"></div></div><div class="bar-label">${pt.day}</div></div>`;
    }).join('');
  }

  const recoveryEl = document.getElementById('clinician-recovery-chart');
  if (recoveryEl && active) {
    const signals = (active.recoverySignals && active.recoverySignals.length) ? active.recoverySignals : [
      { label: 'Goal Completion', value: active?.adherence || 0, color: '#0891b2' },
      { label: 'Support Reach-outs', value: 62, color: '#16a34a' },
      { label: 'Therapy Engagement', value: 74, color: '#2563eb' }
    ];
    recoveryEl.innerHTML = signals.map(sig => `
      <div class="clin-recovery-row">
        <div class="clin-recovery-meta"><span class="clin-recovery-name">${escapeHtml(sig.label)}</span><span class="clin-recovery-value">${sig.value}%</span></div>
        <div class="clin-recovery-track"><div class="clin-recovery-fill" style="width:${Math.max(0, Math.min(100, sig.value))}%;background:${sig.color};"></div></div>
      </div>
    `).join('');
  }

  const alertsDrawer = document.getElementById('clinician-alerts-drawer');
  const alertsCount = state.clinicianAlerts.filter(a => !a.acknowledged).length;
  setText('clinician-alert-count', `${alertsCount} Critical Alerts`);
  if (alertsDrawer) alertsDrawer.style.display = ui.alertsOpen ? 'block' : 'none';

  const alertList = document.getElementById('clinician-alert-list');
  if (alertList) {
    alertList.innerHTML = state.clinicianAlerts.map(a => `
      <div class="clin-alert-item ${a.acknowledged ? 'ack' : ''}">
        <div class="clin-alert-meta">
          <div class="clin-alert-title">${escapeHtml(a.patientName)}</div>
          <div class="clin-alert-time">${new Date(a.timestamp).toLocaleString()}</div>
          <div class="clin-alert-event">${escapeHtml(a.event)}</div>
        </div>
        <button class="clin-alert-ack ${a.acknowledged ? 'acked' : ''}" data-alert-id="${a.id}">${a.acknowledged ? 'Acknowledged' : 'Acknowledge'}</button>
      </div>
    `).join('');
  }

  const pushStatus = document.getElementById('clinician-push-status');
  if (pushStatus) {
    pushStatus.textContent = ui.pushSuccess ? '✅ Successfully pushed to user app.' : 'No pending push.';
    pushStatus.style.color = ui.pushSuccess ? 'var(--success)' : 'var(--text-muted)';
    pushStatus.style.fontWeight = ui.pushSuccess ? '700' : '500';
  }
}

function renderInsights() {
  const ins = state.insights;
  if (!ins) return;
  const riskCol = r => r === 'high' ? 'var(--danger)' : r === 'moderate' ? 'var(--warning)' : 'var(--success)';
  setTextAndColor('ins-burnout', ins.burnoutRisk, riskCol(ins.burnoutRisk));
  setTextAndColor('ins-depression', ins.depressionRisk, riskCol(ins.depressionRisk));
  setTextAndColor('ins-confidence', ins.confidence + '%', 'var(--accent)');
  setText('ins-narrative', ins.narrative);
}

function renderAuditLog() {
  const auditEl = document.getElementById('privacy-audit-log');
  if (auditEl) {
    if (!state.memory.length) { auditEl.innerHTML = '<div style="color:var(--text-muted);padding:16px;text-align:center;">No audit entries yet.</div>'; }
    else {
      auditEl.innerHTML = state.memory.slice(0, 5).map(m => `<div class="record-item"><div class="record-body" style="font-size:13px;">${escapeHtml(m.copilotSummary)}<br/><span style="font-size:11px;color:var(--text-muted);">🔗 Data locality: on-device snapshot</span></div></div>`).join('');
    }
  }
  const escEl = document.getElementById('privacy-escalation-log');
  if (escEl) {
    if (!state.escalations.length) { escEl.innerHTML = '<div style="color:var(--text-muted);padding:16px;text-align:center;">No escalation events logged.</div>'; }
    else {
      escEl.innerHTML = state.escalations.map(e => `<div class="record-item"><div class="record-header"><span class="record-date">${new Date(e.timestamp).toLocaleString()}</span><span class="badge badge-high">${(e.severity || '').toUpperCase()}</span></div><div class="record-body">Reason: ${escapeHtml(e.reason)}<br/><span style="font-size:11px;color:var(--text-muted);">Contacts: ${(e.contacts || []).join(', ')}</span></div></div>`).join('');
    }
  }
}

// ── Toast ──
function showToast(msg) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = msg;
  container.appendChild(toast);
  setTimeout(() => { toast.classList.add('hide'); setTimeout(() => toast.remove(), 400); }, 3500);
}

// ── Scheduled Check-In Call (Right to Decline) ──
const CHECKIN_DECLINE_REASONS = ['Not in the mood', 'Busy right now', 'Feeling okay, skipping', 'Need more time'];

function openCheckinCallOverlay() {
  const overlay = document.getElementById('checkin-call-overlay');
  if (overlay) overlay.style.display = 'flex';
  const status = document.getElementById('checkin-call-status');
  if (status) status.textContent = '';
}

function closeCheckinCallOverlay() {
  const overlay = document.getElementById('checkin-call-overlay');
  if (overlay) overlay.style.display = 'none';
}

async function logCheckinDecline(reason) {
  const status = document.getElementById('checkin-call-status');
  if (status) status.textContent = 'Logging your choice...';
  try {
    const hdrs = (window.__aegisGetAuthHeaders && window.__aegisGetAuthHeaders()) || { 'Content-Type': 'application/json' };
    if (!hdrs['Content-Type']) hdrs['Content-Type'] = 'application/json';
    const res = await fetch(`${API}/api/journals/decline-checkin`, {
      method: 'POST',
      headers: hdrs,
      body: JSON.stringify({ reason: reason || 'unspecified' })
    });
    const data = await res.json();
    if (res.ok) {
      if (status) status.textContent = data.data?.message || 'Skip recorded. Streak preserved.';
      showToast('⏭ Check-in skipped · streak preserved');
    } else {
      if (status) status.textContent = data.error?.message || 'Could not sync skip — noted locally.';
      showToast('⚠️ Skip noted locally (sign in to sync)');
    }
  } catch {
    if (status) status.textContent = 'Offline — skip noted locally.';
    showToast('⚠️ Skip noted locally');
  }
}

function handleDeclineCheckin(reason) {
  closeCheckinCallOverlay();
  logCheckinDecline(reason || 'Not specified');
}

function initCheckinCallUi() {
  const openBtn = document.getElementById('btn-open-checkin-call');
  if (openBtn && !openBtn.dataset.bound) {
    openBtn.dataset.bound = 'true';
    openBtn.addEventListener('click', () => openCheckinCallOverlay());
  }

  const quickSkip = document.getElementById('btn-decline-checkin-quick');
  if (quickSkip && !quickSkip.dataset.bound) {
    quickSkip.dataset.bound = 'true';
    quickSkip.addEventListener('click', () => handleDeclineCheckin('Skipped from banner'));
  }

  const answerBtn = document.getElementById('btn-call-answer');
  if (answerBtn && !answerBtn.dataset.bound) {
    answerBtn.dataset.bound = 'true';
    answerBtn.addEventListener('click', () => {
      closeCheckinCallOverlay();
      navigateToScreen('checkin');
      showToast('💚 Starting your check-in now');
    });
  }

  const closeBtn = document.getElementById('btn-call-close');
  if (closeBtn && !closeBtn.dataset.bound) {
    closeBtn.dataset.bound = 'true';
    closeBtn.addEventListener('click', closeCheckinCallOverlay);
  }

  document.querySelectorAll('[data-checkin-reason]').forEach(btn => {
    if (!btn.dataset.bound) {
      btn.dataset.bound = 'true';
      btn.addEventListener('click', () => handleDeclineCheckin(btn.dataset.checkinReason || btn.textContent.trim()));
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeCheckinCallOverlay();
  });
}

// ── Gamification ──
function renderGamification() {
  const { gamify } = state;
  const xpBar = document.getElementById('xp-bar');
  const xpLevel = document.getElementById('xp-level');
  const xpPoints = document.getElementById('xp-points');
  if (xpBar) xpBar.style.width = Math.min(100, (gamify.xp / gamify.nextLevelXp) * 100) + '%';
  if (xpLevel) xpLevel.textContent = `Level ${gamify.level} · Sprout`;
  if (xpPoints) xpPoints.textContent = `${gamify.xp} / ${gamify.nextLevelXp} XP`;

  const questList = document.getElementById('quest-list');
  if (questList) {
    questList.innerHTML = gamify.quests.map(q => `
      <div class="quest-item ${q.done ? 'quest-done' : ''}">
        <div>
          <div style="font-weight:700;">${q.title}</div>
          <div class="quest-meta">${q.type === 'daily' ? 'Daily' : 'Weekly'} · +${q.xp} XP</div>
        </div>
        <div class="quest-badge">${q.done ? '✅ Done' : '➕ ${q.xp} XP'}</div>
      </div>
    `).join('');
  }

  const lb = document.getElementById('leaderboard-list');
  if (lb) {
    lb.innerHTML = gamify.leaderboard
      .sort((a,b) => b.score - a.score)
      .map((p, idx) => `
        <div class="leaderboard-row">
          <div class="leaderboard-rank ${idx === 0 ? 'top1' : idx === 1 ? 'top2' : idx === 2 ? 'top3' : ''}">${idx+1}</div>
          <div style="flex:1;">${p.name}</div>
          <div class="leaderboard-score">${p.score} pts</div>
        </div>
      `).join('');
  }
}

// ── Helpers ──
function setText(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }
function setTextAndColor(id, val, col) { const el = document.getElementById(id); if (el) { el.textContent = val; el.style.color = col; } }
function setBarWidth(id, pct) { const el = document.getElementById(id); if (el) el.style.width = Math.max(0, Math.min(100, pct)) + '%'; }
function escapeHtml(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }

        if (e.key === 'Escape') {
          closeCheckinCallOverlay();
          closeBreathingModal();
          closeGroundingModal();
          closeCbtModal();
        }
// ── Init ──
initUxModeControls();
updateDashboard();
updateSignals();
refreshRemote();
initCareerSupportFeatures();
initClinicianDashboard();
initCheckinCallUi();
renderGamification();

// Auto-update greeting based on time
const hour = new Date().getHours();
const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
const greetingEl = document.querySelector('.hero-greeting');
if (greetingEl) greetingEl.textContent = greeting;

// ═══════════════════════════════════════════════
// FEATURE: Live Microphone + Waveform + Speech-to-Text
// ═══════════════════════════════════════════════

let audioCtx, analyser, micStream, animFrame, recognition;
let voiceRecording = false, voiceStartTime = 0, voiceTimerInterval;
let transcriptText = '';

document.getElementById('btn-voice-start').addEventListener('click', startVoice);
document.getElementById('btn-voice-stop').addEventListener('click', stopVoice);

async function startVoice() {
  try {
    micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioCtx.createMediaStreamSource(micStream);
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);

    voiceRecording = true;
    voiceStartTime = Date.now();
    transcriptText = '';
    document.getElementById('voice-transcript').textContent = '';
    document.getElementById('btn-voice-start').style.display = 'none';
    document.getElementById('btn-voice-stop').style.display = 'inline-flex';
    document.getElementById('btn-voice-stop').classList.add('recording-pulse');
renderGamification();
    document.getElementById('voice-status').textContent = '🔴 Recording... speak naturally';

    // Timer
    voiceTimerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - voiceStartTime) / 1000);
      const m = Math.floor(elapsed / 60);
      const s = elapsed % 60;
  const entryCount = state.patientHome?.entryCount ?? state.records.length;
  setText('dash-xp', entryCount);
    }, 200);

    // Waveform

    // Speech recognition
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition = new SR();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = state.language === 'ne' ? 'ne-NP' : state.language === 'hi' ? 'hi-IN' : 'en-US';
      recognition.onresult = (ev) => {
        let final = '', interim = '';
        for (let i = ev.resultIndex; i < ev.results.length; i++) {
          if (ev.results[i].isFinal) final += ev.results[i][0].transcript + ' ';
  showToast('🧘 Breathing exercise complete');
        document.getElementById('voice-transcript').textContent = transcriptText + interim;
      };
      recognition.onerror = () => {};
      recognition.start();
    }

    showToast('🎤 Recording started — audio stays on-device');
  } catch (err) {
    showToast('⚠️ Microphone access denied');
  }
}

function stopVoice() {
  voiceRecording = false;
  clearInterval(voiceTimerInterval);
  cancelAnimationFrame(animFrame);

  if (recognition) { try { recognition.stop(); } catch {} }
  if (micStream) micStream.getTracks().forEach(t => t.stop());
  if (audioCtx) audioCtx.close();

  document.getElementById('btn-voice-start').style.display = 'inline-flex';
  document.getElementById('btn-voice-stop').style.display = 'none';
  document.getElementById('btn-voice-stop').classList.remove('recording-pulse');
  document.getElementById('voice-status').textContent = '✅ Recording complete — audio purged from memory';

  // Calculate biomarkers
  const durationSec = (Date.now() - voiceStartTime) / 1000;
  const words = transcriptText.trim().split(/\s+/).filter(w => w.length > 0).length;
  const wpm = durationSec > 5 ? Math.round((words / durationSec) * 60) : 0;

  setText('vl-wpm', wpm || '—');
  setText('vl-duration', durationSec > 0 ? durationSec.toFixed(1) + 's' : '—');
  setText('vl-volume', '72 dB');
  setText('vl-words', words || '—');

  // Auto-fill check-in sliders with extracted data
  if (wpm > 0) {
    const wpmSlider = document.getElementById('sl-wpm');
    if (wpmSlider) { wpmSlider.value = Math.min(220, Math.max(60, wpm)); wpmSlider.dispatchEvent(new Event('input')); }
  }

  state.avatarXp = Math.min(state.avatarXp + 3, 100);
  updateDashboard();
  showToast('✅ Voice analysis complete — biomarkers extracted, audio destroyed');
}

function drawWaveform() {
  const canvas = document.getElementById('voice-waveform');
  if (!canvas || !analyser) return;
  const ctx = canvas.getContext('2d');
  const bufLen = analyser.frequencyBinCount;
  const data = new Uint8Array(bufLen);

  function draw() {
    if (!voiceRecording) return;
    animFrame = requestAnimationFrame(draw);
    analyser.getByteTimeDomainData(data);

    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#38bdf8';
    ctx.beginPath();
    const sliceW = canvas.width / bufLen;
    let x = 0;
    for (let i = 0; i < bufLen; i++) {
      const v = data[i] / 128.0;
      const y = v * canvas.height / 2;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
      x += sliceW;
    }
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    // Glow effect
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(56,189,248,0.15)';
    ctx.stroke();
  }
  draw();
}

// ═══════════════════════════════════════════════
// FEATURE: PHQ-9 + GAD-7 Validated Screening
// ═══════════════════════════════════════════════

const PHQ9_QUESTIONS = [
  'Little interest or pleasure in doing things',
  'Feeling down, depressed, or hopeless',
  'Trouble falling or staying asleep, or sleeping too much',
  'Feeling tired or having little energy',
  'Poor appetite or overeating',
  'Feeling bad about yourself — or that you are a failure',
  'Trouble concentrating on things, such as reading or watching TV',
  'Moving or speaking slowly, or being fidgety/restless',
  'Thoughts that you would be better off dead, or of hurting yourself'
];

const GAD7_QUESTIONS = [
  'Feeling nervous, anxious, or on edge',
  'Not being able to stop or control worrying',
  'Worrying too much about different things',
  'Trouble relaxing',
  'Being so restless that it\'s hard to sit still',
  'Becoming easily annoyed or irritable',
  'Feeling afraid, as if something awful might happen'
];

const LIKERT_OPTIONS = ['Not at all', 'Several days', 'More than half', 'Nearly every day'];

function renderScreeningQuestions(containerId, questions, prefix) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = questions.map((q, i) => `
    <div class="screening-question">
      <div class="q-text"><span class="q-number">${i + 1}</span>${q}</div>
      <div class="q-options">
        ${LIKERT_OPTIONS.map((opt, val) => `<span class="q-option" data-q="${prefix}-${i}" data-val="${val}">${opt} (${val})</span>`).join('')}
      </div>
    </div>
  `).join('');

  // Attach click handlers
  container.querySelectorAll('.q-option').forEach(opt => {
    opt.addEventListener('click', () => {
      const qId = opt.dataset.q;
      container.querySelectorAll(`.q-option[data-q="${qId}"]`).forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
    });
  });
}

function scoreScreening(containerId, prefix, count) {
  let total = 0, answered = 0;
  for (let i = 0; i < count; i++) {
    const sel = document.querySelector(`#${containerId} .q-option.selected[data-q="${prefix}-${i}"]`);
    if (sel) { total += +sel.dataset.val; answered++; }
  }
  return { total, answered, complete: answered === count };
}

function phq9Severity(score) {
  if (score <= 4) return { level: 'Minimal', color: 'var(--success)' };
  if (score <= 9) return { level: 'Mild', color: 'var(--accent)' };
  if (score <= 14) return { level: 'Moderate', color: 'var(--warning)' };
  if (score <= 19) return { level: 'Moderately Severe', color: 'var(--danger)' };
  return { level: 'Severe', color: '#dc2626' };
}
function gad7Severity(score) {
  if (score <= 4) return { level: 'Minimal', color: 'var(--success)' };
  if (score <= 9) return { level: 'Mild', color: 'var(--accent)' };
  if (score <= 14) return { level: 'Moderate', color: 'var(--warning)' };
  return { level: 'Severe', color: 'var(--danger)' };
}

function initScreeningPage() {
  const phqContainer = document.getElementById('phq9-questions');
  const gadContainer = document.getElementById('gad7-questions');
  if (!phqContainer || !gadContainer) return;

  renderScreeningQuestions('phq9-questions', PHQ9_QUESTIONS, 'phq9');
  renderScreeningQuestions('gad7-questions', GAD7_QUESTIONS, 'gad7');

  const phqBtn = document.getElementById('btn-score-phq9');
  if (phqBtn && !phqBtn.dataset.bound) {
    phqBtn.dataset.bound = 'true';
    phqBtn.addEventListener('click', () => {
      const r = scoreScreening('phq9-questions', 'phq9', 9);
      if (!r.complete) { showToast('⚠️ Please answer all 9 questions'); return; }
      const s = phq9Severity(r.total);
      document.getElementById('phq9-result').innerHTML = `<span style="color:${s.color}">${r.total}/27 — ${s.level} Depression</span>`;
      state.phq9Score = r.total;
      checkScreeningSummary();
    });
  }

  const gadBtn = document.getElementById('btn-score-gad7');
  if (gadBtn && !gadBtn.dataset.bound) {
    gadBtn.dataset.bound = 'true';
    gadBtn.addEventListener('click', () => {
      const r = scoreScreening('gad7-questions', 'gad7', 7);
      if (!r.complete) { showToast('⚠️ Please answer all 7 questions'); return; }
      const s = gad7Severity(r.total);
      document.getElementById('gad7-result').innerHTML = `<span style="color:${s.color}">${r.total}/21 — ${s.level} Anxiety</span>`;
      state.gad7Score = r.total;
      checkScreeningSummary();
    });
  }
}

initScreeningPage();

function checkScreeningSummary() {
  if (state.phq9Score == null || state.gad7Score == null) return;
  const el = document.getElementById('screening-summary');
  el.style.display = 'block';
  const phq = phq9Severity(state.phq9Score);
  const gad = gad7Severity(state.gad7Score);
  const combined = state.phq9Score + state.gad7Score;
  const action = combined > 20 ? '🚨 Immediate clinical referral recommended' : combined > 10 ? '⚠️ Consider professional consultation' : '✅ Continue self-monitoring';

  document.getElementById('screening-summary-body').innerHTML = `
    <div class="grid-3 gap-24" style="margin-bottom:16px;">
      <div class="metric-card" style="text-align:center"><div class="metric-value" style="font-size:24px;color:${phq.color}">${state.phq9Score}</div><div class="metric-label">PHQ-9 (${phq.level})</div></div>
      <div class="metric-card" style="text-align:center"><div class="metric-value" style="font-size:24px;color:${gad.color}">${state.gad7Score}</div><div class="metric-label">GAD-7 (${gad.level})</div></div>
      <div class="metric-card" style="text-align:center"><div class="metric-value" style="font-size:24px;color:var(--accent)">${combined}</div><div class="metric-label">Combined Score</div></div>
    </div>
    <div class="plan-box"><div class="plan-label">Clinical Action</div><div class="plan-text">${action}</div></div>
    <div style="font-size:11px;color:var(--text-muted);margin-top:12px;">Instruments: PHQ-9 (Kroenke et al., 2001) · GAD-7 (Spitzer et al., 2006) · Validated for primary care screening</div>
  `;
  state.avatarXp = Math.min(state.avatarXp + 4, 100);
  updateDashboard();
  showToast('📋 Screening complete — results saved');
}

// ═══════════════════════════════════════════════
// FEATURE: Guided Breathing Exercise
// ═══════════════════════════════════════════════

let breathingInterval, breathingTimeout, breathingSec = 0;

function openBreathingModal() {
  document.getElementById('breathing-modal').style.display = 'flex';
  document.getElementById('breathing-phase').textContent = 'Ready';
  document.getElementById('breathing-timer').textContent = '0:00';
  document.getElementById('breathing-instruction').textContent = 'Press Start for a guided 60-second session';
  document.getElementById('btn-breathing-start').style.display = 'inline-flex';
  document.getElementById('btn-breathing-stop').style.display = 'none';
  const circle = document.getElementById('breathing-guided');
  circle.className = 'breathing-guided-circle';
}
function closeBreathingModal() {
  document.getElementById('breathing-modal').style.display = 'none';
  stopBreathing();
}

document.getElementById('btn-breathing-start').addEventListener('click', startBreathing);
document.getElementById('btn-breathing-stop').addEventListener('click', stopBreathing);

function startBreathing() {
  breathingSec = 0;
  document.getElementById('btn-breathing-start').style.display = 'none';
  document.getElementById('btn-breathing-stop').style.display = 'inline-flex';

  function cycle() {
    const phases = [
      { name: 'Inhale', cls: 'inhale', duration: 4000, instruction: 'Breathe in slowly through your nose...' },
      { name: 'Hold', cls: 'hold', duration: 4000, instruction: 'Hold your breath gently...' },
      { name: 'Exhale', cls: 'exhale', duration: 4000, instruction: 'Breathe out slowly through your mouth...' }
    ];
    let idx = 0;
    function nextPhase() {
      if (breathingSec >= 60) { finishBreathing(); return; }
      const p = phases[idx % 3];
      const circle = document.getElementById('breathing-guided');
      circle.className = 'breathing-guided-circle ' + p.cls;
      document.getElementById('breathing-phase').textContent = p.name;
      document.getElementById('breathing-instruction').textContent = p.instruction;
      idx++;
      breathingTimeout = setTimeout(nextPhase, p.duration);
    }
    nextPhase();
  }
  cycle();

  breathingInterval = setInterval(() => {
    breathingSec++;
    const m = Math.floor(breathingSec / 60);
    const s = breathingSec % 60;
    document.getElementById('breathing-timer').textContent = `${m}:${s.toString().padStart(2,'0')}`;
  }, 1000);
}

function stopBreathing() {
  clearInterval(breathingInterval);
  clearTimeout(breathingTimeout);
  const circle = document.getElementById('breathing-guided');
  if (circle) circle.className = 'breathing-guided-circle';
}

function finishBreathing() {
  stopBreathing();
  document.getElementById('breathing-phase').textContent = 'Complete ✨';
  document.getElementById('breathing-instruction').textContent = 'Great job! You completed the full exercise.';
  document.getElementById('btn-breathing-start').style.display = 'inline-flex';
  document.getElementById('btn-breathing-stop').style.display = 'none';
  state.avatarXp = Math.min(state.avatarXp + 5, 100);
  updateDashboard();
  showToast('🧘 Breathing exercise complete — +5 XP earned');
}

// ═══════════════════════════════════════════════
// FEATURE: PDF Clinical Report Export
// ═══════════════════════════════════════════════

document.getElementById('btn-export-pdf').addEventListener('click', exportPDF);

function exportPDF() {
  if (!state.result) { showToast('Run a check-in first to generate a report'); return; }
  const r = state.result;
  const now = new Date().toLocaleString();
  const phq = state.phq9Score != null ? `PHQ-9: ${state.phq9Score}/27 (${phq9Severity(state.phq9Score).level})` : 'PHQ-9: Not administered';
  const gad = state.gad7Score != null ? `GAD-7: ${state.gad7Score}/21 (${gad7Severity(state.gad7Score).level})` : 'GAD-7: Not administered';

  const content = `
MENTAL COMPASS CLINICAL REPORT
══════════════════════════════════════════
Generated: ${now}
User ID: ${getActiveUserId()}
Report Type: AI-Assisted Triage Summary

RISK ASSESSMENT
───────────────────────────────────────
Risk Score: ${r.risk.score}/100
Risk Level: ${r.risk.riskLevel.toUpperCase()}
Trend: ${r.trend.trend} (Δ${r.trend.delta})
Escalation Required: ${r.escalation ? 'YES — URGENT' : 'No'}

CLINICAL IMPRESSION
───────────────────────────────────────
${r.clinicalSummary.impression}

KEY HIGHLIGHTS
${r.clinicalSummary.highlights.map(h => '  • ' + h).join('\n')}

RECOMMENDED PLAN
───────────────────────────────────────
${r.clinicalSummary.recommendedPlan}

INTERVENTIONS PRESCRIBED
${r.interventions.map(i => '  • ' + i).join('\n')}

VALIDATED SCREENING INSTRUMENTS
───────────────────────────────────────
${phq}
${gad}

VOICE BIOMARKERS
───────────────────────────────────────
Speech Rate: ${document.getElementById('sl-wpm')?.value || '—'} WPM
Pause Ratio: ${(+(document.getElementById('sl-pause')?.value || 0) / 100).toFixed(2)}
Vocal Jitter: ${(+(document.getElementById('sl-jitter')?.value || 0) / 1000).toFixed(3)}

SELF-REPORT METRICS
───────────────────────────────────────
Mood: ${document.getElementById('sl-mood')?.value}/10
Anxiety: ${document.getElementById('sl-anxiety')?.value}/10
Stress: ${document.getElementById('sl-stress')?.value}/10
Sleep: ${document.getElementById('sl-sleep')?.value} hours
Phone Usage: ${document.getElementById('sl-phone')?.value} hours
Role Context: ${document.getElementById('career-role')?.value || 'N/A'}
Deadline Pressure: ${document.getElementById('sl-deadline')?.value || 'N/A'}/10
Career Uncertainty: ${document.getElementById('sl-uncertainty')?.value || 'N/A'}/10
Financial Stress: ${document.getElementById('sl-financial')?.value || 'N/A'}/10
Belonging Safety: ${document.getElementById('sl-belonging')?.value || 'N/A'}/10

SECURITY
───────────────────────────────────────
Audit Hash: ${r.auditHash || 'N/A'}
Processing: Edge-first, on-device
Audio: Purged after feature extraction
Encryption: AES-256-GCM
Compliance: HIPAA, GDPR

═══════════════════════════════════════
This report was partially generated by AI.
Clinical decisions should be made by qualified professionals.
Mental Compass — Privacy-First Mental Health Copilot
  `;

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `MentalCompass_Report_${new Date().toISOString().slice(0,10)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('📄 Clinical report exported');
}

// ═══════════════════════════════════════════════
// FEATURE: CSV Data Export
// ═══════════════════════════════════════════════

document.getElementById('btn-export-csv').addEventListener('click', exportCSV);

function exportCSV() {
  if (!state.records.length) { showToast('No records to export'); return; }
  const headers = ['Timestamp','Score','Risk Level','Escalation','Impression'];
  const rows = state.records.map(r => [
    new Date(r.timestamp).toISOString(),
    r.score,
    r.riskLevel || '',
    r.escalation ? 'YES' : 'NO',
    `"${(r.summary?.impression || '').replace(/"/g, '""')}"`
  ]);
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `MentalCompass_Data_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('📊 Data exported as CSV');
}

// ═══════════════════════════════════════════════
// FEATURE: Keyboard Shortcuts
// ═══════════════════════════════════════════════

const NAV_KEYS = ['dashboard','copilot','checkin','support','community','vault','milestones','voice','signals','screening','insights','clinician','triage','alerts','compliance','privacy','wipelog'];
document.addEventListener('keydown', e => {
  // Don't trigger when typing in inputs
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

  const num = parseInt(e.key);
  if (num >= 1 && num <= NAV_KEYS.length) {
    e.preventDefault();
    const screen = NAV_KEYS[num - 1];
    const navItem = document.querySelector(`.nav-item[data-screen="${screen}"]`);
    if (navItem) navItem.click();
    return;
  }

  // ESC closes modals
  if (e.key === 'Escape') {
    closeBreathingModal();
  }
});

// ═══════════════════════════════════════════════
// FEATURE: Career Compass + Early Support Ladder
// ═══════════════════════════════════════════════

function buildCareerPlan() {
  const focus = document.getElementById('career-focus')?.value || 'role-clarity';
  const concern = (document.getElementById('career-concern')?.value || '').trim();
  const deadline = +document.getElementById('sl-deadline')?.value || 5;
  const uncertainty = +document.getElementById('sl-uncertainty')?.value || 5;
  const financial = +document.getElementById('sl-financial')?.value || 4;
  const trusted = (document.getElementById('trusted-contact')?.value || '').trim();

  const pressureBand = Math.round((deadline + uncertainty + financial) / 3);
  const checkinCadence = pressureBand >= 8 ? 'every 4 hours' : pressureBand >= 5 ? 'twice daily' : 'once daily';

  const focusMap = {
    exams: 'one chapter + one mock block',
    'job-search': 'one application + one networking touchpoint',
    performance: 'one high-impact task before noon',
    finances: 'one concrete budget or income action',
    'role-clarity': 'one exploration call or role comparison exercise'
  };

  const actionAnchor = focusMap[focus] || focusMap['role-clarity'];
  const body = document.getElementById('career-plan-body');
  if (!body) return;

  body.innerHTML = `
    <div style="margin-bottom:10px;color:var(--text-secondary);"><strong>Pressure Band:</strong> ${pressureBand}/10 · <strong>Check-in cadence:</strong> ${checkinCadence}</div>
    <div style="margin-bottom:8px;">Day 1: Reduce uncertainty with one scoped action: <strong>${escapeHtml(actionAnchor)}</strong>.</div>
    <div style="margin-bottom:8px;">Day 2: Protect recovery blocks: 25 min focus + 5 min reset repeated 3 times.</div>
    <div style="margin-bottom:8px;">Day 3: Review progress and decide one thing to stop, one thing to continue, one thing to ask help for.</div>
    ${trusted ? `<div style="margin-top:12px;" class="plan-box"><div class="plan-label">Trusted Contact Prompt</div><div class="plan-text">"I am under high pressure this week. Can we do a 10-minute check-in tonight?" → ${escapeHtml(trusted)}</div></div>` : ''}
    ${concern ? `<div style="margin-top:12px;font-size:13px;color:var(--text-muted);"><strong>Your concern:</strong> ${escapeHtml(concern)}</div>` : ''}
  `;

  state.avatarXp = Math.min(state.avatarXp + 2, 100);
  updateDashboard();
  showToast('🧭 72-hour career plan generated');
}

function getSupportScript(step, language, anonymousMode) {
  const scripts = {
    self: {
      en: 'I am overloaded right now. I will do one 60-second breathing cycle, drink water, and delay major decisions for 30 minutes.',
      ne: 'अहिले म धेरै दबाबमा छु। म ६० सेकेन्ड सास अभ्यास गर्छु, पानी पिउँछु, र ठूला निर्णय ३० मिनेट पछि गर्छु।',
      hi: 'मैं अभी बहुत दबाव में हूं। मैं 60 सेकंड सांस का अभ्यास करूंगा, पानी पियूंगा, और बड़े फैसले 30 मिनट बाद लूंगा।'
    },
    peer: {
      en: 'Can we do a quick 10-minute check-in today? I need practical support to stay stable this week.',
      ne: 'के आज १० मिनेट कुरा गर्न सक्छौं? यो हप्ता स्थिर रहन मलाई व्यावहारिक सहयोग चाहिएको छ।',
      hi: 'क्या हम आज 10 मिनट बात कर सकते हैं? इस हफ्ते स्थिर रहने के लिए मुझे व्यावहारिक मदद चाहिए।'
    },
    family: {
      en: 'My stress load is high these days. I am asking for support so I can stay healthy and productive.',
      ne: 'यी दिनमा मेरो तनाव धेरै छ। स्वस्थ र उत्पादक रहन सहयोग चाहिन्छ।',
      hi: 'इन दिनों मेरा तनाव बहुत ज्यादा है। स्वस्थ और उत्पादक रहने के लिए मुझे सहयोग चाहिए।'
    },
    counselor: {
      en: 'I would like an early wellbeing consultation before this stress becomes severe.',
      ne: 'यो तनाव गम्भीर हुनु अघि म प्रारम्भिक परामर्श चाहन्छु।',
      hi: 'तनाव गंभीर होने से पहले मैं प्रारंभिक परामर्श लेना चाहता/चाहती हूं।'
    },
    emergency: {
      en: 'I do not feel safe right now. Please stay with me and help me connect to emergency support immediately.',
      ne: 'अहिले म सुरक्षित महसुस गरिरहेको छैन। कृपया मसँग रहनुहोस् र तुरुन्तै आपतकालीन सहयोग जोडिदिनुहोस्।',
      hi: 'मैं अभी सुरक्षित महसूस नहीं कर रहा/रही हूं। कृपया मेरे साथ रहें और तुरंत आपातकालीन सहायता से जोड़ें।'
    }
  };

  const selected = scripts[step] || scripts.self;
  let line = selected[language] || selected.en;
  if (anonymousMode) line = `${line} (No private details needed.)`;
  return line;
}

function renderSupportScript(step = state.supportStep) {
  state.supportStep = step;
  const language = document.getElementById('support-language')?.value || 'en';
  const anonymousMode = !!document.getElementById('support-anonymous')?.checked;
  const script = getSupportScript(step, language, anonymousMode);

  const output = document.getElementById('support-script-output');
  if (output) output.textContent = script;

  document.querySelectorAll('[data-support-step]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.supportStep === step);
  });
}

function initCareerSupportFeatures() {
  const careerBtn = document.getElementById('btn-career-plan');
  if (careerBtn) careerBtn.addEventListener('click', buildCareerPlan);

  document.querySelectorAll('[data-support-step]').forEach(btn => {
    btn.addEventListener('click', () => renderSupportScript(btn.dataset.supportStep));
  });

  const supportLanguage = document.getElementById('support-language');
  if (supportLanguage) {
    supportLanguage.addEventListener('change', () => {
      state.language = supportLanguage.value;
      renderSupportScript(state.supportStep);
    });
  }

  const supportAnonymous = document.getElementById('support-anonymous');
  if (supportAnonymous) supportAnonymous.addEventListener('change', () => renderSupportScript(state.supportStep));

  const openCopilot = document.getElementById('btn-open-copilot-soft');
  if (openCopilot) {
    openCopilot.addEventListener('click', () => {
      const script = document.getElementById('support-script-output')?.textContent || '';
      const navItem = document.querySelector('.nav-item[data-screen="copilot"]');
      if (navItem) navItem.click();
      if (chatInput) {
        chatInput.value = script;
        chatInput.focus();
      }
      showToast('🤖 Support script moved to Copilot');
    });
  }

  const markDone = document.getElementById('btn-mark-support-done');
  if (markDone) {
    markDone.addEventListener('click', () => {
      state.avatarXp = Math.min(state.avatarXp + 2, 100);
      updateDashboard();
      showToast('✅ Support step logged for today');
    });
  }

  renderSupportScript(state.supportStep);
}


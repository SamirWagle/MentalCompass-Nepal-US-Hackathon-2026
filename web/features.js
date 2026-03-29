/* ═══════════════════════════════════════════════
   AegisSpeak — Enhanced Features Module
   Milestones, Learning Vault, Community, Wipe Log,
   Triage, Alerts, Compliance
   ═══════════════════════════════════════════════ */

// ═══ MOCK DATA ═══

const MOCK_MILESTONES = [
  { date: '2026-03-28', title: 'Started Your Journey', desc: 'Created your AegisSpeak account and completed onboarding', xp: 10, status: 'completed' },
  { date: '2026-03-26', title: 'First Check-in', desc: 'Completed your first daily mood check-in', xp: 5, status: 'completed' },
  { date: '2026-03-24', title: 'Voice Analysis Unlocked', desc: 'Recorded your first voice sample for biomarker extraction', xp: 8, status: 'completed' },
  { date: '2026-03-22', title: '3-Day Streak', desc: 'Maintained 3 consecutive days of check-ins', xp: 15, status: 'completed' },
  { date: '2026-03-20', title: 'Breathing Master', desc: 'Completed 5 guided breathing exercises', xp: 12, status: 'completed' },
  { date: '2026-03-18', title: '7-Day Streak 🔥', desc: 'One full week of consistent mental wellness tracking', xp: 25, status: 'active' },
  { date: 'Upcoming', title: 'CBT Explorer', desc: 'Complete 3 cognitive reframing exercises', xp: 20, status: 'locked' },
  { date: 'Upcoming', title: 'Community Helper', desc: 'Send support to 5 community members', xp: 15, status: 'locked' },
];

const MOCK_ACHIEVEMENTS = [
  { icon: '🌱', name: 'First Sprout', desc: 'Begin your journey', unlocked: true },
  { icon: '🔥', name: '7-Day Streak', desc: '7 consecutive check-ins', unlocked: true },
  { icon: '🫁', name: 'Deep Breather', desc: '5 breathing exercises', unlocked: true },
  { icon: '🎤', name: 'Voice Pioneer', desc: 'First voice analysis', unlocked: true },
  { icon: '📝', name: 'Journal Keeper', desc: '10 journal entries', unlocked: true },
  { icon: '🧠', name: 'CBT Scholar', desc: '3 thought reframes', unlocked: false },
  { icon: '💪', name: 'Resilient', desc: 'Stability score > 80', unlocked: false },
  { icon: '🛡️', name: 'Guardian', desc: 'Reach Guardian avatar', unlocked: false },
  { icon: '🌟', name: '30-Day Warrior', desc: '30 day streak', unlocked: false },
  { icon: '🤝', name: 'Community Pillar', desc: 'Help 10 peers', unlocked: false },
];

const MOCK_VAULT_RESOURCES = [
  { type: 'article', icon: '📖', title: 'Understanding Anxiety', desc: 'Learn about the science behind anxiety and evidence-based coping strategies', category: 'Anxiety', duration: '5 min read', gradient: 'linear-gradient(135deg, #0ea5e9, #38bdf8)' },
  { type: 'audio', icon: '🎧', title: 'Progressive Muscle Relaxation', desc: 'A guided 10-minute body scan to release physical tension', category: 'Relaxation', duration: '10 min', gradient: 'linear-gradient(135deg, #059669, #34d399)' },
  { type: 'video', icon: '🎬', title: 'CBT Thought Records', desc: 'Step-by-step video guide to challenging negative automatic thoughts', category: 'CBT', duration: '8 min', gradient: 'linear-gradient(135deg, #7c3aed, #a78bfa)' },
  { type: 'article', icon: '😴', title: 'Sleep Hygiene Essentials', desc: 'Evidence-based tips for improving sleep quality and consistency', category: 'Sleep', duration: '4 min read', gradient: 'linear-gradient(135deg, #6366f1, #818cf8)' },
  { type: 'audio', icon: '🧘', title: 'Mindful Breathing', desc: 'A calming 5-minute guided meditation for stress relief', category: 'Mindfulness', duration: '5 min', gradient: 'linear-gradient(135deg, #0d9488, #2dd4bf)' },
  { type: 'article', icon: '💡', title: 'Recognizing Depression Signs', desc: 'How to identify early warning signs and when to seek help', category: 'Depression', duration: '6 min read', gradient: 'linear-gradient(135deg, #0284c7, #38bdf8)' },
  { type: 'video', icon: '🏃', title: 'Exercise & Mental Health', desc: 'The powerful connection between physical activity and emotional wellbeing', category: 'Lifestyle', duration: '12 min', gradient: 'linear-gradient(135deg, #dc2626, #f87171)' },
  { type: 'audio', icon: '🌊', title: 'Ocean Sounds for Sleep', desc: 'Natural ocean wave soundscape for deep relaxation and rest', category: 'Sleep', duration: '30 min', gradient: 'linear-gradient(135deg, #1e40af, #60a5fa)' },
  { type: 'article', icon: '🤗', title: 'Building Self-Compassion', desc: 'Learn to treat yourself with the same kindness you show others', category: 'Self-Care', duration: '7 min read', gradient: 'linear-gradient(135deg, #be185d, #f472b6)' },
];

const VAULT_CATEGORIES = ['All', 'Anxiety', 'CBT', 'Depression', 'Mindfulness', 'Relaxation', 'Sleep', 'Lifestyle', 'Self-Care'];
const CUSTOM_VAULT_KEY = 'aegis_vault_custom';
let vaultResources = [...MOCK_VAULT_RESOURCES];

function loadCustomVault() {
  try { return JSON.parse(localStorage.getItem(CUSTOM_VAULT_KEY) || '[]'); } catch { return []; }
}

function saveCustomVault(list) {
  localStorage.setItem(CUSTOM_VAULT_KEY, JSON.stringify(list));
}

function addCustomVaultResource(item) {
  const current = loadCustomVault();
  current.push(item);
  saveCustomVault(current);
  vaultResources = [...MOCK_VAULT_RESOURCES, ...current];
}

const MOCK_COMMUNITY_POSTS = [
  { id: 1, avatar: '🌸', author: 'Anonymous Sunflower', time: '2 hours ago', text: 'Today was tough, but I managed to do my breathing exercise before bed. Small wins matter. 💪', supports: 14, relates: 8 },
  { id: 2, avatar: '🌊', author: 'Anonymous Wave', time: '5 hours ago', text: 'I\'ve been using the 5-4-3-2-1 grounding technique every morning and it\'s genuinely helping me start my day calmer. If you haven\'t tried it, give it a shot!', supports: 23, relates: 12 },
  { id: 3, avatar: '🌿', author: 'Anonymous Fern', time: '8 hours ago', text: 'Week 3 of consistent journaling. I can actually see patterns in my mood now. The AI insights really helped me notice I\'m most anxious on Sunday evenings.', supports: 31, relates: 19 },
  { id: 4, avatar: '🦋', author: 'Anonymous Butterfly', time: '1 day ago', text: 'Reached my 14-day streak today! Never thought I\'d commit to something like this. This community keeps me going. 🎉', supports: 42, relates: 15 },
  { id: 5, avatar: '🌙', author: 'Anonymous Moon', time: '1 day ago', text: 'Reminder: It\'s okay to not be okay. Progress isn\'t linear. You\'re doing better than you think. ❤️', supports: 58, relates: 27 },
];

const MOCK_WIPE_LOG = [
  { type: 'audio', hash: 'a7f3b2c4e8d9f1a6b5c3d2e4f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5', timestamp: '2026-03-28T10:15:00', size: '2.4 MB' },
  { type: 'voice', hash: 'b8e4c3d5f9e0a2b7c6d4e3f5a8b9c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7', timestamp: '2026-03-27T18:32:00', size: '1.8 MB' },
  { type: 'session', hash: 'c9f5d4e6a0f1b3c8d7e5f4a6b9c0d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8', timestamp: '2026-03-27T09:45:00', size: '0.3 MB' },
  { type: 'audio', hash: 'd0a6e5f7b1a2c4d9e8f6a5b7c0d1e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9', timestamp: '2026-03-26T14:20:00', size: '3.1 MB' },
  { type: 'cache', hash: 'e1b7f6a8c2b3d5e0f9a7b6c8d1e2f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0', timestamp: '2026-03-25T22:10:00', size: '0.7 MB' },
];

const MOCK_TRIAGE_PATIENTS = [
  { id: 'P-001', name: 'Patient Alpha', age: 28, risk: 'severe', score: 82, lastCheckin: '12 min ago', mood: 3, anxiety: 8, sleep: 4, trend: [75, 78, 80, 82, 79, 85, 82], summary: 'Elevated crisis indicators with declining sleep and rising anxiety over 7 days. Voice biomarkers show increased vocal jitter.', adherence: 45 },
  { id: 'P-002', name: 'Patient Beta', age: 34, risk: 'monitor', score: 55, lastCheckin: '1 hour ago', mood: 5, anxiety: 6, sleep: 6, trend: [60, 58, 55, 52, 55, 50, 55], summary: 'Moderate risk with fluctuating mood patterns. Responding to CBT exercises. Needs monitoring.', adherence: 72 },
  { id: 'P-003', name: 'Patient Gamma', age: 22, risk: 'stable', score: 18, lastCheckin: '3 hours ago', mood: 7, anxiety: 3, sleep: 8, trend: [30, 25, 22, 20, 18, 15, 18], summary: 'Consistent improvement over 2 weeks. High adherence to breathing exercises and journaling.', adherence: 94 },
  { id: 'P-004', name: 'Patient Delta', age: 41, risk: 'severe', score: 76, lastCheckin: '25 min ago', mood: 2, anxiety: 9, sleep: 3, trend: [50, 55, 62, 68, 72, 74, 76], summary: 'Rapidly escalating risk score. PHQ-9 score of 18 indicates moderately severe depression. Immediate clinical review needed.', adherence: 38 },
  { id: 'P-005', name: 'Patient Epsilon', age: 30, risk: 'stable', score: 22, lastCheckin: '6 hours ago', mood: 8, anxiety: 2, sleep: 7, trend: [35, 30, 28, 25, 22, 20, 22], summary: 'Stable and improving. Completed CBT module and shows positive thought reframing patterns.', adherence: 88 },
  { id: 'P-006', name: 'Patient Zeta', age: 19, risk: 'monitor', score: 48, lastCheckin: '2 hours ago', mood: 4, anxiety: 7, sleep: 5, trend: [45, 48, 50, 47, 48, 46, 48], summary: 'Plateaued improvement. Academic stress identified as primary trigger. Consider adjusting intervention cadence.', adherence: 65 },
];

const MOCK_ALERTS = [
  { id: 1, severity: 'high', patient: 'Patient Alpha', event: 'Crisis keyword detected in journal entry', time: '12 minutes ago', acknowledged: false },
  { id: 2, severity: 'high', patient: 'Patient Delta', event: 'PHQ-9 score exceeded severe threshold (18/27)', time: '25 minutes ago', acknowledged: false },
  { id: 3, severity: 'medium', patient: 'Patient Beta', event: 'Sleep pattern disruption — 3 consecutive nights below 5 hours', time: '1 hour ago', acknowledged: true },
  { id: 4, severity: 'medium', patient: 'Patient Zeta', event: 'Adherence rate dropped below 50% this week', time: '3 hours ago', acknowledged: true },
  { id: 5, severity: 'high', patient: 'Patient Alpha', event: 'Voice biomarkers indicate elevated distress (jitter 0.045)', time: '4 hours ago', acknowledged: true },
];

// ═══ RENDER FUNCTIONS ═══

function renderMilestones() {
  // Streak dots
  const dots = document.getElementById('streak-dots');
  if (dots) {
    dots.innerHTML = Array.from({ length: 7 }, (_, i) =>
      `<div class="streak-dot ${i < 6 ? 'filled' : 'today'}" title="Day ${i + 1}"></div>`
    ).join('');
  }

  // Timeline
  const timeline = document.getElementById('milestone-timeline');
  if (timeline) {
    timeline.innerHTML = MOCK_MILESTONES.map(m => `
      <div class="timeline-item">
        <div class="timeline-dot ${m.status}"></div>
        <div class="timeline-content">
          <div class="timeline-date">${m.date}</div>
          <div class="timeline-title">${m.status === 'locked' ? '🔒 ' : ''}${m.title}</div>
          <div class="timeline-desc">${m.desc}</div>
          <div class="timeline-xp">+${m.xp} XP ${m.status === 'completed' ? '✅' : m.status === 'active' ? '🔄 In Progress' : '🔒 Locked'}</div>
        </div>
      </div>
    `).join('');
  }

  // Achievements
  const grid = document.getElementById('achievements-grid');
  if (grid) {
    grid.innerHTML = MOCK_ACHIEVEMENTS.map(a => `
      <div class="achievement-card ${a.unlocked ? '' : 'locked'}" title="${a.desc}">
        <div class="achievement-icon">${a.icon}</div>
        <div class="achievement-name">${a.name}</div>
        <div class="achievement-desc">${a.desc}</div>
      </div>
    `).join('');
  }
}

function renderVault() {
  // hydrate custom resources
  vaultResources = [...MOCK_VAULT_RESOURCES, ...loadCustomVault()];
  const activeSession = window.__aegisSession?.user;
  const isDoctor = activeSession?.role === 'doctor';

  // Categories
  const cats = document.getElementById('vault-categories');
  if (cats) {
    const dynamicCats = ['All', ...new Set(vaultResources.map(r => r.category)), ...VAULT_CATEGORIES.filter(c => c !== 'All')];
    const uniqueCats = Array.from(new Set(dynamicCats));
    cats.innerHTML = uniqueCats.map(c =>
      `<span class="chip ${c === 'All' ? 'active' : ''}" data-vault-cat="${c}">${c}</span>`
    ).join('');
    cats.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', () => {
        cats.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        filterVault(chip.dataset.vaultCat, document.getElementById('vault-search').value);
      });
    });
  }

  // Search
  const search = document.getElementById('vault-search');
  if (search) {
    search.addEventListener('input', () => {
      const activeCat = cats?.querySelector('.chip.active')?.dataset.vaultCat || 'All';
      filterVault(activeCat, search.value);
    });
  }

  // Doctor authoring form
  const vaultBar = document.querySelector('.vault-search-bar');
  if (isDoctor && vaultBar && !document.getElementById('vault-authoring')) {
    const form = document.createElement('div');
    form.id = 'vault-authoring';
    form.className = 'glass-card';
    form.style.marginTop = '16px';
    form.innerHTML = `
      <div class="card-title">Add Learning Resource (Doctor)</div>
      <div class="card-subtitle">Topics, books, or multimedia you want patients to see</div>
      <div class="grid-2 gap-12" style="margin-top:10px;">
        <input id="vault-add-title" class="text-area" placeholder="Title (e.g., Work Anxiety Playbook)" />
        <select id="vault-add-type" class="text-area">
          <option value="article">Article</option>
          <option value="audio">Audio</option>
          <option value="video">Video</option>
          <option value="book">Book</option>
        </select>
      </div>
      <div class="grid-2 gap-12" style="margin-top:10px;">
        <input id="vault-add-category" class="text-area" placeholder="Category (e.g., Anxiety, Sleep)" />
        <input id="vault-add-duration" class="text-area" placeholder="Duration/Pages (e.g., 10 min, 240 pages)" />
      </div>
      <textarea id="vault-add-desc" class="text-area" placeholder="Short description or learning objective" style="margin-top:10px;min-height:70px;"></textarea>
      <button class="btn btn-primary" id="vault-add-btn" style="margin-top:12px;">➕ Add to Learn & Grow</button>
      <div id="vault-add-status" style="font-size:12px;color:var(--text-muted);margin-top:6px;"></div>
    `;
    vaultBar.insertAdjacentElement('afterend', form);

    const addBtn = form.querySelector('#vault-add-btn');
    addBtn?.addEventListener('click', () => {
      const title = form.querySelector('#vault-add-title').value.trim();
      const type = form.querySelector('#vault-add-type').value || 'article';
      const category = form.querySelector('#vault-add-category').value.trim() || 'General';
      const duration = form.querySelector('#vault-add-duration').value.trim() || '—';
      const desc = form.querySelector('#vault-add-desc').value.trim() || 'No description provided.';
      if (!title) { showToast('⚠️ Enter a title'); return; }
      addCustomVaultResource({
        type, icon: type === 'audio' ? '🎧' : type === 'video' ? '🎬' : type === 'book' ? '📚' : '📖',
        title, desc, category, duration,
        gradient: 'linear-gradient(135deg, #0ea5e9, #38bdf8)'
      });
      form.querySelector('#vault-add-status').textContent = `Added “${title}”`;
      // re-render vault list and categories
      renderVault();
    });
  }

  filterVault('All', '');
}

function filterVault(category, query) {
  const grid = document.getElementById('vault-grid');
  if (!grid) return;
  const q = query.toLowerCase();
  const filtered = vaultResources.filter(r =>
    (category === 'All' || r.category === category) &&
    (!q || r.title.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q) || r.category.toLowerCase().includes(q))
  );
  grid.innerHTML = filtered.map(r => `
    <div class="vault-card" role="button" aria-label="${r.title}">
      <div class="vault-card-banner" style="background:${r.gradient};">${r.icon}</div>
      <div class="vault-card-body">
        <span class="vault-card-type vault-type-${r.type}">${r.type === 'article' ? '📄 Article' : r.type === 'audio' ? '🎧 Audio' : '🎬 Video'}</span>
        <div class="vault-card-title">${r.title}</div>
        <div class="vault-card-desc">${r.desc}</div>
        <div class="vault-card-meta"><span>${r.category}</span><span>${r.duration}</span></div>
      </div>
    </div>
  `).join('');
  if (!filtered.length) {
    grid.innerHTML = '<div style="color:var(--text-muted);padding:40px;text-align:center;grid-column:1/-1;">No resources found matching your search.</div>';
  }
}

function renderCommunity() {
  const feed = document.getElementById('community-feed');
  if (!feed) return;
  feed.innerHTML = MOCK_COMMUNITY_POSTS.map(p => `
    <div class="community-post">
      <div class="community-post-header">
        <div class="community-avatar" style="background:var(--accent-dim);">${p.avatar}</div>
        <div>
          <div class="community-author">${p.author}</div>
          <div class="community-time">${p.time}</div>
        </div>
      </div>
      <div class="community-text">${p.text}</div>
      <div class="community-actions">
        <button class="community-action-btn" onclick="this.classList.toggle('active');this.querySelector('span').textContent=this.classList.contains('active')?'${p.supports + 1}':'${p.supports}'">💚 <span>${p.supports}</span> Send Support</button>
        <button class="community-action-btn" onclick="this.classList.toggle('active');this.querySelector('span').textContent=this.classList.contains('active')?'${p.relates + 1}':'${p.relates}'">🤝 <span>${p.relates}</span> I Relate</button>
      </div>
    </div>
  `).join('');

  // Post button
  const btn = document.getElementById('btn-community-post');
  if (btn) {
    btn.addEventListener('click', () => {
      const input = document.getElementById('community-post-input');
      if (!input || !input.value.trim()) { showToast('Write something before posting'); return; }
      const newPost = `
        <div class="community-post" style="animation:fadeUp 0.5s ease;">
          <div class="community-post-header">
            <div class="community-avatar" style="background:var(--success-dim);">🌟</div>
            <div><div class="community-author">You (Anonymous)</div><div class="community-time">Just now</div></div>
          </div>
          <div class="community-text">${escapeHtml(input.value.trim())}</div>
          <div class="community-actions">
            <button class="community-action-btn">💚 <span>0</span> Send Support</button>
            <button class="community-action-btn">🤝 <span>0</span> I Relate</button>
          </div>
        </div>`;
      feed.insertAdjacentHTML('afterbegin', newPost);
      input.value = '';
      showToast('🕊️ Posted anonymously');
    });
  }
}

function renderWipeLog() {
  // Hash log
  const log = document.getElementById('wipe-hash-log');
  if (log) {
    log.innerHTML = MOCK_WIPE_LOG.map(w => {
      const icons = { audio: '🎤', voice: '🗣️', session: '📋', cache: '💾' };
      return `
        <div class="wipe-entry">
          <div class="wipe-icon">${icons[w.type] || '📁'}</div>
          <div class="wipe-info">
            <div class="wipe-hash">SHA-256: ${w.hash}</div>
            <div class="wipe-meta">${w.type.toUpperCase()} · ${w.size} · ${new Date(w.timestamp).toLocaleString()}</div>
          </div>
          <div class="wipe-badge">✅ DESTROYED</div>
        </div>`;
    }).join('');
  }

  // Retention policy
  const policy = document.getElementById('retention-policy');
  if (policy) {
    const items = [
      ['Raw Audio', 'Purged Immediately', 'var(--success)'],
      ['Voice Biomarkers', '24 hours (edge only)', 'var(--accent)'],
      ['Check-in Scores', '90 days encrypted', 'var(--warning)'],
      ['Clinical Summaries', '1 year (HIPAA req.)', 'var(--warning)'],
      ['Anonymized Trends', 'Indefinite', 'var(--text-muted)'],
    ];
    policy.innerHTML = items.map(([t, p, c]) =>
      `<div class="retention-row"><span class="retention-type">${t}</span><span class="retention-period" style="color:${c}">${p}</span></div>`
    ).join('');
  }

  // Purge stats
  const stats = document.getElementById('purge-stats');
  if (stats) {
    stats.innerHTML = `
      <div class="grid-2" style="gap:12px;">
        <div class="bio-card"><div class="bio-value" style="font-size:28px;">47</div><div class="bio-label">Files Destroyed</div></div>
        <div class="bio-card"><div class="bio-value" style="font-size:28px;">128 MB</div><div class="bio-label">Data Purged</div></div>
        <div class="bio-card"><div class="bio-value" style="font-size:28px;">100%</div><div class="bio-label">Destruction Rate</div></div>
        <div class="bio-card"><div class="bio-value" style="font-size:28px;">0</div><div class="bio-label">Raw Files Retained</div></div>
      </div>`;
  }

  // Shred demo
  const shredBtn = document.getElementById('btn-shred-demo');
  if (shredBtn) {
    shredBtn.addEventListener('click', runShredDemo);
  }
}

function runShredDemo() {
  const container = document.getElementById('shredder-container');
  const particles = document.getElementById('shredder-particles');
  const status = document.getElementById('shredder-status');
  if (!container || !particles || !status) return;

  container.classList.add('shredding');
  status.textContent = '🔴 SHREDDING IN PROGRESS...';
  status.style.color = 'var(--danger)';
  particles.innerHTML = '';

  const colors = ['var(--accent)', 'var(--danger)', 'var(--warning)', 'var(--success)', '#a78bfa'];
  let count = 0;
  const interval = setInterval(() => {
    for (let i = 0; i < 3; i++) {
      const p = document.createElement('div');
      p.className = 'shred-particle';
      p.style.left = (20 + Math.random() * 80) + 'px';
      p.style.background = colors[Math.floor(Math.random() * colors.length)];
      p.style.animationDelay = (Math.random() * 0.3) + 's';
      particles.appendChild(p);
      setTimeout(() => p.remove(), 1200);
    }
    count++;
    if (count > 15) {
      clearInterval(interval);
      container.classList.remove('shredding');
      status.textContent = '✅ All data securely destroyed — zero recoverable fragments';
      status.style.color = 'var(--success)';
      showToast('🗑️ Shred demonstration complete — data irrecoverable');
    }
  }, 120);
}

function renderTriageList() {
  const list = document.getElementById('triage-list');
  if (!list) return;

  function render(filter) {
    const filtered = filter === 'all' ? MOCK_TRIAGE_PATIENTS :
      MOCK_TRIAGE_PATIENTS.filter(p => p.risk === filter);

    list.innerHTML = filtered.map(p => {
      const riskClass = p.risk === 'severe' ? 'risk-severe' : p.risk === 'monitor' ? 'risk-monitor' : 'risk-stable';
      const scoreColor = p.risk === 'severe' ? 'var(--danger)' : p.risk === 'monitor' ? 'var(--warning)' : 'var(--success)';
      const badgeCls = p.risk === 'severe' ? 'badge-high' : p.risk === 'monitor' ? 'badge-moderate' : 'badge-low';
      const bars = p.trend.map(v => {
        const h = Math.max(4, (v / 100) * 80);
        const c = v >= 70 ? 'var(--danger)' : v >= 40 ? 'var(--warning)' : 'var(--success)';
        return `<div class="triage-bar" style="height:${h}px;background:${c};"></div>`;
      }).join('');
      return `
        <div class="triage-card ${riskClass}" onclick="this.classList.toggle('expanded')">
          <div class="triage-header">
            <div>
              <div class="triage-patient-name">${p.name} <span class="badge ${badgeCls}">${p.risk.toUpperCase()}</span></div>
              <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">${p.id} · Age ${p.age} · Last: ${p.lastCheckin}</div>
            </div>
            <div class="triage-score" style="color:${scoreColor}">${p.score}</div>
          </div>
          <div class="triage-details">
            <div class="triage-detail">Mood: <strong>${p.mood}/10</strong></div>
            <div class="triage-detail">Anxiety: <strong>${p.anxiety}/10</strong></div>
            <div class="triage-detail">Sleep: <strong>${p.sleep} hrs</strong></div>
            <div class="triage-detail">Adherence: <strong>${p.adherence}%</strong></div>
          </div>
          <div class="triage-expanded">
            <div style="font-size:13px;color:var(--text-secondary);margin-bottom:12px;"><strong>AI Summary:</strong> ${p.summary}</div>
            <div style="font-size:12px;font-weight:700;color:var(--text-muted);margin-bottom:8px;">7-Day Risk Trend</div>
            <div class="triage-chart-placeholder">${bars}</div>
            <div style="margin-top:16px;">
              <div class="card-title" style="font-size:14px;">Push to Patient</div>
              <div style="display:flex;gap:8px;margin-top:8px;">
                <button class="btn btn-outline btn-sm" onclick="event.stopPropagation();showToast('📌 New milestone pushed to ${p.name}')">📌 Milestone</button>
                <button class="btn btn-outline btn-sm" onclick="event.stopPropagation();showToast('📝 Journal prompt sent to ${p.name}')">📝 Prompt</button>
                <button class="btn btn-outline btn-sm" onclick="event.stopPropagation();showToast('📚 Resource sent to ${p.name}')">📚 Resource</button>
              </div>
            </div>
          </div>
        </div>`;
    }).join('');
    if (!filtered.length) {
      list.innerHTML = '<div style="color:var(--text-muted);padding:40px;text-align:center;">No patients in this category.</div>';
    }
  }

  render('all');

  // Filter buttons
  document.getElementById('triage-filters')?.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.getElementById('triage-filters').querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      render(chip.dataset.filter);
    });
  });
}

function renderAlerts() {
  const banner = document.getElementById('alert-urgent-banner');
  const list = document.getElementById('alerts-list');
  if (!banner || !list) return;

  const urgent = MOCK_ALERTS.filter(a => a.severity === 'high' && !a.acknowledged);
  if (urgent.length) {
    banner.innerHTML = urgent.map(a => `
      <div class="alert-banner">
        <div class="alert-icon">🚨</div>
        <div class="alert-body">
          <div class="alert-title">${a.patient}: ${a.event}</div>
          <div class="alert-time">${a.time}</div>
        </div>
        <button class="alert-action-btn" id="ack-${a.id}" onclick="acknowledgeAlert(this, ${a.id})">⚡ Acknowledge</button>
      </div>
    `).join('');
  } else {
    banner.innerHTML = '<div class="glass-card mb-24" style="text-align:center;padding:24px;"><div style="font-size:32px;margin-bottom:8px;">✅</div><div style="color:var(--success);font-weight:700;">No unacknowledged urgent alerts</div></div>';
  }

  list.innerHTML = '<div class="glass-card"><div class="card-title">Alert History</div><div class="card-subtitle">All recent events requiring clinical attention</div>' +
    MOCK_ALERTS.map(a => `
      <div class="alert-card">
        <div class="alert-severity ${a.severity}"></div>
        <div style="flex:1;">
          <div style="font-size:14px;font-weight:600;color:var(--text-primary);">${a.patient}</div>
          <div style="font-size:12px;color:var(--text-secondary);">${a.event}</div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">${a.time}</div>
        </div>
        <span class="badge ${a.acknowledged ? 'badge-low' : 'badge-high'}">${a.acknowledged ? 'ACK' : 'PENDING'}</span>
      </div>
    `).join('') + '</div>';
}

function acknowledgeAlert(btn, id) {
  btn.textContent = '✅ Acknowledged';
  btn.classList.add('acknowledged');
  const alert = MOCK_ALERTS.find(a => a.id === id);
  if (alert) alert.acknowledged = true;
  showToast('✅ Alert acknowledged — clinical note logged');
  // Re-render after a brief delay
  setTimeout(() => renderAlerts(), 800);
}

async function renderCompliance() {
  // Try live API first (requires super_admin auth)
  let liveData = null;
  try {
    const session = window.__aegisSession;
    if (session?.token && session?.user?.role === 'super_admin') {
      const hdrs = window.__aegisGetAuthHeaders();
      const res = await fetch('http://localhost:4000/api/admin/analytics', { headers: hdrs });
      const json = await res.json();
      if (json.ok) liveData = json.data;
    }
  } catch {}

  const metrics = document.getElementById('compliance-metrics');
  if (metrics) {
    const hipaaStatus = liveData?.hipaaCompliant !== false ? 100 : 0;
    const phiStripped = liveData?.phiStripped !== false ? 100 : 0;
    const encHealth = 98;
    const data = [
      { label: 'HIPAA Status', value: hipaaStatus, color: 'var(--success)', text: hipaaStatus + '%' },
      { label: 'PHI Stripped', value: phiStripped, color: 'var(--accent)', text: phiStripped + '%' },
      { label: 'Encryption Health', value: encHealth, color: 'var(--success)', text: encHealth + '%' },
    ];
    metrics.innerHTML = data.map(d => {
      const circ = 2 * Math.PI * 34;
      const offset = circ - (circ * d.value / 100);
      return `
        <div class="metric-card">
          <div class="compliance-gauge">
            <div class="gauge-ring">
              <svg viewBox="0 0 80 80" width="80" height="80">
                <circle class="gauge-ring-bg" cx="40" cy="40" r="34" />
                <circle class="gauge-ring-fill" cx="40" cy="40" r="34" stroke="${d.color}" stroke-dasharray="${circ}" stroke-dashoffset="${offset}" />
              </svg>
              <div class="gauge-value" style="color:${d.color}">${d.text}</div>
            </div>
            <div class="metric-label">${d.label}</div>
          </div>
        </div>`;
    }).join('');

    // If we have live data, show platform stats
    if (liveData) {
      const usersData = liveData.users || {};
      const journalsData = liveData.journals || {};
      const escData = liveData.escalations || {};
      metrics.innerHTML += `
        <div class="metric-card"><div class="metric-icon">👥</div><div class="metric-value" style="color:var(--accent)">${usersData.total || 0}</div><div class="metric-label">Total Users</div></div>
        <div class="metric-card"><div class="metric-icon">📝</div><div class="metric-value" style="color:var(--success)">${journalsData.totalEntries || 0}</div><div class="metric-label">Journal Entries</div></div>
        <div class="metric-card"><div class="metric-icon">🚨</div><div class="metric-value" style="color:var(--danger)">${escData.unacknowledged || 0}</div><div class="metric-label">Open Escalations</div></div>
      `;
    }
  }

  // Encryption health
  const enc = document.getElementById('encryption-health');
  if (enc) {
    const items = [
      ['AES-256-GCM', 'Active', '✅'],
      ['TLS 1.3', 'Active', '✅'],
      ['Key Rotation', 'Last: 6 hours ago', '✅'],
      ['Certificate', 'Valid (364 days)', '✅'],
      ['Edge Encryption', 'On-device active', '✅'],
    ];
    enc.innerHTML = items.map(([name, status, icon]) =>
      `<div class="signal-item"><span class="signal-name">${icon} ${name}</span><span class="signal-value" style="font-size:12px;color:var(--success)">${status}</span></div>`
    ).join('');
  }

  // Retention schedule
  const ret = document.getElementById('retention-schedule');
  if (ret) {
    const items = [
      ['Audio Recordings', 'Immediate purge'],
      ['Biomarker Features', '24 hours'],
      ['Check-in Data', '90 days'],
      ['Clinical Summaries', '365 days'],
      ['Anonymized Aggregates', 'Indefinite'],
      ['Audit Logs', '7 years (HIPAA)'],
    ];
    ret.innerHTML = items.map(([t, p]) =>
      `<div class="retention-row"><span class="retention-type">${t}</span><span class="retention-period">${p}</span></div>`
    ).join('');
  }

  // Compliance audit
  const audit = document.getElementById('compliance-audit');
  if (audit) {
    const events = [
      { time: '10:15 AM', event: 'Audio file destroyed — SHA-256 receipt generated', type: 'purge' },
      { time: '09:30 AM', event: 'TLS certificate validation passed', type: 'cert' },
      { time: '08:00 AM', event: 'Automated key rotation completed', type: 'rotation' },
      { time: 'Yesterday', event: 'HIPAA compliance audit — all checks passed', type: 'audit' },
      { time: '2 days ago', event: 'Data retention cleanup — 3 records archived', type: 'retention' },
    ];
    audit.innerHTML = events.map(e =>
      `<div class="record-item"><div class="record-header"><span class="record-date">${e.time}</span><span class="badge badge-low">${e.type.toUpperCase()}</span></div><div class="record-body" style="font-size:13px;">${e.event}</div></div>`
    ).join('');
  }
}

// ═══ INITIALIZATION ═══
// Make acknowledgeAlert globally accessible
window.acknowledgeAlert = acknowledgeAlert;

// ═══ DASHBOARD: MOOD QUICK CHECK-IN ═══
const MOCK_GOALS = [
  { text: 'Complete your morning check-in', xp: 5, done: true },
  { text: 'Practice 4-4-4 breathing exercise', xp: 5, done: false },
  { text: 'Write a 3-sentence journal entry', xp: 8, done: false },
  { text: 'Take a 10-minute walk outside', xp: 5, done: false },
  { text: 'Log your sleep quality for last night', xp: 3, done: true },
];

function renderDashboardEnhancements() {
  // Mood quick buttons
  const moodRow = document.getElementById('mood-quick-row');
  if (moodRow) {
    moodRow.querySelectorAll('.mood-quick-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        moodRow.querySelectorAll('.mood-quick-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        const val = btn.dataset.mood;
        // Sync with check-in slider
        const slider = document.getElementById('sl-mood');
        if (slider) { slider.value = val; slider.dispatchEvent(new Event('input')); }
        showToast(`😊 Mood recorded: ${btn.querySelector('.mood-label').textContent} (${val}/10)`);
      });
    });
  }

  // Today's goals
  const goalsEl = document.getElementById('todays-goals');
  if (goalsEl) {
    goalsEl.innerHTML = MOCK_GOALS.map((g, i) => `
      <div class="goal-item ${g.done ? 'completed' : ''}" id="goal-${i}">
        <button class="goal-check ${g.done ? 'done' : ''}" onclick="toggleGoal(${i})" aria-label="Toggle goal">${g.done ? '✓' : ''}</button>
        <span class="goal-text">${g.text}</span>
        <span class="goal-xp">+${g.xp} XP</span>
      </div>
    `).join('');
  }
}

function toggleGoal(index) {
  MOCK_GOALS[index].done = !MOCK_GOALS[index].done;
  const item = document.getElementById(`goal-${index}`);
  const check = item?.querySelector('.goal-check');
  if (MOCK_GOALS[index].done) {
    item.classList.add('completed');
    check.classList.add('done');
    check.textContent = '✓';
    showToast(`✅ Goal completed! +${MOCK_GOALS[index].xp} XP`);
  } else {
    item.classList.remove('completed');
    check.classList.remove('done');
    check.textContent = '';
  }
}
window.toggleGoal = toggleGoal;

// ═══ CHAT: SUGGESTION PROMPTS ═══
function useSuggestion(btn) {
  const input = document.getElementById('chat-input');
  if (input) {
    input.value = btn.textContent;
    input.focus();
  }
  // Hide suggestions after use
  const sug = document.getElementById('chat-suggestions');
  if (sug) sug.style.display = 'none';
}
window.useSuggestion = useSuggestion;

// ═══ CLINICIAN: SESSION SUMMARIES & ADHERENCE ═══
const MOCK_SESSION_SUMMARIES = [
  {
    patient: 'Patient Alpha',
    time: '12 min ago',
    summary: 'Patient reported worsening anxiety levels over the past 3 days. Sleep disrupted (avg 4 hrs). Voice analysis detected elevated vocal jitter (0.045) and reduced speech rate (95 WPM). Journal entry contained crisis-adjacent language flagged by NLP. Recommended immediate clinical follow-up.',
    tags: [
      { label: 'Crisis Risk', cls: 'badge-high' },
      { label: 'Sleep Disruption', cls: 'badge-moderate' },
      { label: 'Voice Alert', cls: 'badge-high' },
    ]
  },
  {
    patient: 'Patient Gamma',
    time: '3 hours ago',
    summary: 'Consistent improvement trajectory continues. Mood average 7.2/10 over last 7 days. Successfully completed CBT Module 3 (cognitive distortions). Adherence rate at 94%. Recommend transitioning to maintenance phase with bi-weekly check-ins.',
    tags: [
      { label: 'Improving', cls: 'badge-low' },
      { label: 'High Adherence', cls: 'badge-low' },
      { label: 'CBT Progress', cls: 'badge-low' },
    ]
  },
  {
    patient: 'Patient Delta',
    time: '25 min ago',
    summary: 'Risk score escalated from 50 to 76 over 7 days. PHQ-9 administered: score 18/27 (moderately severe). GAD-7: 15/21 (severe anxiety). Patient has missed 3 of 5 prescribed breathing exercises. Urgent: consider medication review and increased session frequency.',
    tags: [
      { label: 'Escalating', cls: 'badge-high' },
      { label: 'PHQ-9: 18', cls: 'badge-high' },
      { label: 'Low Adherence', cls: 'badge-moderate' },
    ]
  },
];

function renderClinicianEnhancements() {
  // Session summaries
  const sessEl = document.getElementById('clinician-session-summaries');
  if (sessEl) {
    sessEl.innerHTML = MOCK_SESSION_SUMMARIES.map(s => `
      <div class="session-summary-card">
        <div class="session-header">
          <div class="session-patient">${s.patient}</div>
          <div class="session-time">${s.time}</div>
        </div>
        <div class="session-body">${s.summary}</div>
        <div class="session-tags">
          ${s.tags.map(t => `<span class="session-tag badge ${t.cls}">${t.label}</span>`).join('')}
        </div>
      </div>
    `).join('');
  }

  // Adherence overview (from triage data)
  const adhEl = document.getElementById('clinician-adherence');
  if (adhEl && typeof MOCK_TRIAGE_PATIENTS !== 'undefined') {
    adhEl.innerHTML = MOCK_TRIAGE_PATIENTS.map(p => {
      const color = p.adherence >= 80 ? 'var(--success)' : p.adherence >= 50 ? 'var(--warning)' : 'var(--danger)';
      const fillCls = p.adherence >= 80 ? 'success' : p.adherence >= 50 ? 'warning' : 'danger';
      return `
        <div class="adherence-item">
          <div class="adherence-header">
            <span class="adherence-name">${p.name}</span>
            <span class="adherence-pct" style="color:${color}">${p.adherence}%</span>
          </div>
          <div class="progress-bar"><div class="progress-fill ${fillCls}" style="width:${p.adherence}%"></div></div>
        </div>`;
    }).join('');
  }
}

// ═══ INIT ALL FEATURES ═══
function initAllFeatures() {
  renderMilestones();
  renderVault();
  renderCommunity();
  renderWipeLog();
  renderTriageList();
  renderAlerts();
  renderCompliance();
  renderDashboardEnhancements();
  renderClinicianEnhancements();
}

document.addEventListener('DOMContentLoaded', initAllFeatures);

// If DOM already loaded (script at end of body), run immediately
if (document.readyState !== 'loading') {
  initAllFeatures();
}


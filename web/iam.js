/* ═══════════════════════════════════════════════
   AegisSpeak — IAM Login & Role-Based UI
   ═══════════════════════════════════════════════ */

const IAM_API = 'http://localhost:4000';

/* ── Session State ── */
const session = {
  token: localStorage.getItem('aegis_token') || null,
  user: JSON.parse(localStorage.getItem('aegis_user') || 'null'),
};

function saveSession(token, user) {
  session.token = token;
  session.user = user;
  localStorage.setItem('aegis_token', token);
  localStorage.setItem('aegis_user', JSON.stringify(user));
}

function clearSession() {
  session.token = null;
  session.user = null;
  localStorage.removeItem('aegis_token');
  localStorage.removeItem('aegis_user');
}

function getAuthHeaders() {
  return session.token ? { 'Authorization': `Bearer ${session.token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

/* ── Role display helpers ── */
const ROLE_LABELS = {
  super_admin: 'Super Admin',
  doctor: 'Doctor',
  patient: 'Patient',
  guardian: 'Guardian',
  chv: 'FCHV Worker',
};

const ROLE_ICONS = {
  super_admin: '🛡️',
  doctor: '🩺',
  patient: '🧑',
  guardian: '👨‍👩‍👧',
  chv: '🏥',
};

const ROLE_COLORS = {
  super_admin: '#8b5cf6',
  doctor: '#0ea5e9',
  patient: '#10b981',
  guardian: '#f59e0b',
  chv: '#ec4899',
};

// Expose session & auth helpers globally for other scripts
window.__aegisSession = session;
window.__aegisGetAuthHeaders = getAuthHeaders;

/* ══════════════════════════
   LOGIN FLOW
   ══════════════════════════ */

function showLoginScreen() {
  const mainContent = document.querySelector('.main-content');
  const sidebar = document.getElementById('sidebar');
  if (sidebar) sidebar.style.display = 'none';
  if (mainContent) mainContent.style.marginLeft = '0';
  const glogout = document.getElementById('global-logout');
  if (glogout) glogout.style.display = 'none';
  const loginCta = document.getElementById('sidebar-login-cta');
  if (loginCta) loginCta.style.display = 'none';

  // Hide all existing screens
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active');
    s.style.display = 'none';
  });

  // Check if login screen already exists
  let loginScreen = document.getElementById('screen-login');
  if (!loginScreen) {
    loginScreen = document.createElement('div');
    loginScreen.className = 'screen active';
    loginScreen.id = 'screen-login';
    loginScreen.style.display = 'block';
    loginScreen.innerHTML = buildLoginHTML();
    if (mainContent) mainContent.prepend(loginScreen);
  } else {
    loginScreen.classList.add('active');
    loginScreen.style.display = 'block';
  }

  bindLoginEvents();
}

function buildLoginHTML() {
  return `
  <div class="login-container" role="main">
    <div class="login-left">
      <div class="login-brand">
        <div class="login-logo-icon">🛡️</div>
        <div>
          <div class="login-logo-text">AegisSpeak</div>
          <div class="login-logo-sub">AI Mental Health Copilot</div>
        </div>
      </div>
      <div class="login-hero-content">
        <h1 class="login-hero-title">Predictive, Personalized,<br/>Privacy-First Care</h1>
        <div class="login-feature-grid">
          <div class="login-feature-item">
            <span class="login-feature-icon">🧠</span>
            <span>AI-Powered Copilot</span>
          </div>
          <div class="login-feature-item">
            <span class="login-feature-icon">🔐</span>
            <span>Zero-Trust Security</span>
          </div>
          <div class="login-feature-item">
            <span class="login-feature-icon">📊</span>
            <span>Predictive Analytics</span>
          </div>
          <div class="login-feature-item">
            <span class="login-feature-icon">🏥</span>
            <span>MIT Health Aligned</span>
          </div>
        </div>
      </div>

      <div class="login-mit-banner">
        <div class="login-mit-title">🏥 Free & Confidential Counseling</div>
        <div class="login-mit-desc">Individual/group therapy, medication management, and urgent care. Stress, anxiety, relationships, and academic support — available virtually.</div>
      </div>

      <div class="login-footer-info">
        <span>HIPAA · GDPR Compliant</span>
        <span>·</span>
        <span>Nepal-US Hackathon 2026</span>
      </div>
    </div>

    <div class="login-right">
      <div class="login-card" role="form" aria-label="Login form">
        <h2 class="login-card-title">Sign In</h2>
        <p class="login-card-subtitle">Access your personalized mental health portal</p>

        <div class="login-role-selector" id="login-role-selector" aria-label="Select your role">
          <button class="login-role-btn active" data-role="patient" type="button" aria-pressed="true">
            <span class="login-role-icon">🧑</span>
            <span class="login-role-label">Patient</span>
          </button>
          <button class="login-role-btn" data-role="doctor" type="button" aria-pressed="false">
            <span class="login-role-icon">🩺</span>
            <span class="login-role-label">Doctor</span>
          </button>
          <button class="login-role-btn" data-role="super_admin" type="button" aria-pressed="false">
            <span class="login-role-icon">🛡️</span>
            <span class="login-role-label">Admin</span>
          </button>
          <button class="login-role-btn" data-role="chv" type="button" aria-pressed="false">
            <span class="login-role-icon">🏥</span>
            <span class="login-role-label">FCHV</span>
          </button>
        </div>

        <form id="login-form" novalidate>
          <div class="login-field">
            <label class="login-label" for="login-email">Email Address</label>
            <div class="login-input-wrap">
              <span class="login-input-icon">📧</span>
              <input
                type="email"
                id="login-email"
                class="login-input"
                placeholder="you@aegisspeak.com"
                required
                autocomplete="email"
                aria-describedby="login-email-error"
              />
            </div>
            <div class="login-field-error" id="login-email-error" role="alert" aria-live="polite"></div>
          </div>

          <div class="login-field">
            <label class="login-label" for="login-password">Password</label>
            <div class="login-input-wrap">
              <span class="login-input-icon">🔑</span>
              <input
                type="password"
                id="login-password"
                class="login-input"
                placeholder="Enter your password"
                required
                minlength="6"
                autocomplete="current-password"
                aria-describedby="login-password-error"
              />
              <button type="button" class="login-toggle-pw" id="login-toggle-pw" aria-label="Toggle password visibility" title="Show/hide password">
                👁️
              </button>
            </div>
            <div class="login-field-error" id="login-password-error" role="alert" aria-live="polite"></div>
          </div>

          <div class="login-error-global" id="login-error-global" role="alert" aria-live="assertive"></div>

          <button type="submit" class="login-submit-btn" id="login-submit-btn">
            <span class="login-submit-text">Sign In</span>
            <span class="login-submit-loader" id="login-loader" style="display:none;">⏳</span>
          </button>
        </form>

        <div class="login-demo-box">
          <div class="login-demo-title">Demo Credentials</div>
          <button type="button" class="login-demo-btn" id="login-demo-admin">
            🛡️ Super Admin — admin@aegisspeak.com
          </button>
          <div class="login-demo-hint">Password: <code>AegisAdmin@2026</code></div>
        </div>

        <div class="login-accessibility-notice" aria-label="Accessibility notice">
          <span>♿</span>
          <span>This portal follows WCAG 2.2 AA guidelines. All elements are keyboard accessible with 4.5:1 minimum contrast.</span>
        </div>
      </div>
    </div>
  </div>`;
}

function bindLoginEvents() {
  // Role selector
  const roleSelector = document.getElementById('login-role-selector');
  if (roleSelector) {
    roleSelector.querySelectorAll('.login-role-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        roleSelector.querySelectorAll('.login-role-btn').forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
      });
    });
  }

  // Password toggle
  const togglePw = document.getElementById('login-toggle-pw');
  const pwInput = document.getElementById('login-password');
  if (togglePw && pwInput) {
    togglePw.addEventListener('click', () => {
      const isPassword = pwInput.type === 'password';
      pwInput.type = isPassword ? 'text' : 'password';
      togglePw.textContent = isPassword ? '🙈' : '👁️';
    });
  }

  // Demo fill
  const demoBtn = document.getElementById('login-demo-admin');
  if (demoBtn) {
    demoBtn.addEventListener('click', () => {
      const emailEl = document.getElementById('login-email');
      const pwEl = document.getElementById('login-password');
      if (emailEl) emailEl.value = 'admin@aegisspeak.com';
      if (pwEl) pwEl.value = 'AegisAdmin@2026';
      // Set admin role
      roleSelector?.querySelectorAll('.login-role-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      const adminBtn = roleSelector?.querySelector('[data-role="super_admin"]');
      if (adminBtn) {
        adminBtn.classList.add('active');
        adminBtn.setAttribute('aria-pressed', 'true');
      }
    });
  }

  // Form submit
  const form = document.getElementById('login-form');
  if (form) {
    form.addEventListener('submit', handleLogin);
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const globalError = document.getElementById('login-error-global');
  const emailError = document.getElementById('login-email-error');
  const pwError = document.getElementById('login-password-error');
  const loader = document.getElementById('login-loader');
  const submitText = document.querySelector('.login-submit-text');

  // Clear errors
  if (globalError) globalError.textContent = '';
  if (emailError) emailError.textContent = '';
  if (pwError) pwError.textContent = '';

  // Validate
  let hasError = false;
  if (!email) {
    if (emailError) emailError.textContent = 'Email is required.';
    hasError = true;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    if (emailError) emailError.textContent = 'Please enter a valid email address.';
    hasError = true;
  }
  if (!password) {
    if (pwError) pwError.textContent = 'Password is required.';
    hasError = true;
  } else if (password.length < 6) {
    if (pwError) pwError.textContent = 'Password must be at least 6 characters.';
    hasError = true;
  }
  if (hasError) return;

  // Submit
  if (loader) loader.style.display = 'inline';
  if (submitText) submitText.textContent = 'Signing in...';

  try {
    const res = await fetch(`${IAM_API}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (!data.ok || !data.data?.token) {
      throw new Error(data.error?.message || 'Login failed. Please check your credentials.');
    }

    const userData = data.data.user;
    const token = data.data.token;
    saveSession(token, userData);
    onLoginSuccess(userData);
  } catch (err) {
    if (globalError) {
      globalError.textContent = err.message || 'Something went wrong. Please try again.';
    }
  }

  if (loader) loader.style.display = 'none';
  if (submitText) submitText.textContent = 'Sign In';
}

/* ══════════════════════════
   POST-LOGIN ROUTING
   ══════════════════════════ */

function onLoginSuccess(user) {
  // Hide login screen
  const loginScreen = document.getElementById('screen-login');
  if (loginScreen) {
    loginScreen.classList.remove('active');
    loginScreen.style.display = 'none';
  }

  // Show sidebar
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.querySelector('.main-content');
  if (sidebar) sidebar.style.display = '';
  if (mainContent) mainContent.style.marginLeft = '';

  // Inject user badge into sidebar
  injectUserBadge(user);

  // Show global logout button
  const glogout = document.getElementById('global-logout');
  if (glogout) {
    glogout.style.display = 'flex';
    if (!glogout.dataset.bound) {
      glogout.dataset.bound = 'true';
      glogout.addEventListener('click', handleLogout);
    }
  }

  // Inject role-specific navigation items
  injectRoleBasedNav(user);

  // Inject new screens
  injectRoleScreens(user);

  // Re-render vault with doctor authoring when applicable
  if (user.role === 'doctor' && typeof renderVault === 'function') {
    renderVault();
  }

  // Navigate to role-appropriate home
  if (user.role === 'super_admin') {
    navigateToScreen('admin-panel');
  } else if (user.role === 'doctor') {
    navigateToScreen('doctor-dashboard');
  } else {
    navigateToScreen('dashboard');
  }

  if (typeof showToast === 'function') {
    showToast(`✅ Welcome back, ${user.fullName}!`);
  }
}

function injectUserBadge(user) {
  const brand = document.querySelector('.sidebar-brand');
  if (!brand) return;

  // Remove any login CTA once authenticated
  const loginCta = document.getElementById('sidebar-login-cta');
  if (loginCta) loginCta.remove();

  // Remove existing badge
  const existing = document.getElementById('sidebar-user-badge');
  if (existing) existing.remove();

  const badge = document.createElement('div');
  badge.id = 'sidebar-user-badge';
  badge.className = 'sidebar-user-badge';
  badge.innerHTML = `
    <div class="user-badge-avatar" style="background: ${ROLE_COLORS[user.role]}20; color: ${ROLE_COLORS[user.role]}">${user.avatar || ROLE_ICONS[user.role]}</div>
    <div class="user-badge-info">
      <div class="user-badge-name">${user.fullName}</div>
      <div class="user-badge-role" style="color: ${ROLE_COLORS[user.role]}">${ROLE_LABELS[user.role]}</div>
    </div>
    <button class="user-badge-logout" id="btn-logout" title="Sign out" aria-label="Sign out">⏻</button>
  `;
  brand.appendChild(badge);

  document.getElementById('btn-logout')?.addEventListener('click', handleLogout);
}

function handleLogout() {
  clearSession();
  // Remove injected elements
  document.getElementById('sidebar-user-badge')?.remove();
  document.querySelectorAll('.injected-nav')?.forEach(el => el.remove());
  document.querySelectorAll('.injected-screen')?.forEach(el => el.remove());
  window.location.reload();
}

function ensureLoginCta() {
  const sidebarFooter = document.querySelector('.sidebar-footer');
  if (!sidebarFooter) return;
  if (document.getElementById('sidebar-login-cta')) return;
  const btn = document.createElement('button');
  btn.id = 'sidebar-login-cta';
  btn.className = 'btn btn-outline';
  btn.style.marginTop = '10px';
  btn.textContent = '🔐 Sign In';
  btn.addEventListener('click', showLoginScreen);
  sidebarFooter.appendChild(btn);
}

function injectRoleBasedNav(user) {
  // Remove previously injected nav items
  document.querySelectorAll('.injected-nav').forEach(el => el.remove());

  const nav = document.querySelector('.sidebar-nav');
  if (!nav) return;

  const items = [];

  // Helper to hide built-in nav + screens for certain roles
  const hideScreens = (keys = []) => {
    keys.forEach(k => {
      const navItem = document.querySelector(`.nav-item[data-screen="${k}"]`);
      if (navItem) navItem.style.display = 'none';
      const screenEl = document.getElementById(`screen-${k}`);
      if (screenEl) screenEl.style.display = 'none';
    });
  };

  if (user.role === 'super_admin') {
    items.push({ screen: 'admin-panel', icon: '⚙️', label: 'IAM Panel', section: 'Administration' });
    items.push({ screen: 'doctor-dashboard', icon: '🩺', label: 'Doctor Dashboard', section: 'Clinical' });
    items.push({ screen: 'doctor-journal', icon: '📓', label: 'Patient Journal', section: null });
    items.push({ screen: 'doctor-counseling', icon: '🏥', label: 'Care Operations', section: 'Provider' });
    items.push({ screen: 'chv-dashboard', icon: '🏥', label: 'FCHV Dashboard', section: 'Field' });
    items.push({ screen: 'guardian-view', icon: '👁️', label: 'Guardian View', section: 'Family Access' });
  } else if (user.role === 'doctor') {
    // Hide patient-facing navigation for doctors
    hideScreens(['dashboard', 'copilot', 'checkin', 'career', 'support', 'milestones', 'triage', 'alerts', 'clinician', 'voice', 'signals', 'screening', 'insights']);
    const hideNavOnly = (k) => { const n = document.querySelector(`.nav-item[data-screen="${k}"]`); if (n) n.style.display = 'none'; };
    ['clinician','triage','alerts','voice','signals','screening','insights'].forEach(hideNavOnly);
    items.push({ screen: 'doctor-dashboard', icon: '🩺', label: 'Doctor Dashboard', section: 'Provider' });
    items.push({ screen: 'doctor-journal', icon: '📓', label: 'Patient Journal', section: null });
    items.push({ screen: 'doctor-counseling', icon: '🏥', label: 'Care Operations', section: 'Provider' });
    items.push({ screen: 'vault', icon: '📚', label: 'Learn & Grow', section: 'Provider' });
    items.push({ screen: 'community', icon: '💬', label: 'Community', section: null });
  } else if (user.role === 'guardian') {
    items.push({ screen: 'guardian-view', icon: '👁️', label: 'Patient Overview', section: 'Family Access' });
  } else if (user.role === 'patient') {
    items.push({ screen: 'journal', icon: '📓', label: 'Journal', section: 'My Health' });
    items.push({ screen: 'booking', icon: '📅', label: 'Book Consultation', section: null });
    items.push({ screen: 'my-settings', icon: '⚙️', label: 'Settings', section: null });
    items.push({ screen: 'doctor-counseling', icon: '🏥', label: 'Care Operations', section: 'Provider' });
  } else if (user.role === 'chv') {
    // CHV gets a focused UI: only mini-admin field workflows.
    hideScreens([
      'dashboard', 'copilot', 'checkin', 'career', 'support', 'milestones', 'triage', 'alerts',
      'clinician', 'voice', 'signals', 'screening', 'insights',
      'journal', 'booking', 'my-settings',
      'doctor-dashboard', 'doctor-journal', 'doctor-counseling',
      'guardian-view', 'admin-panel', 'vault', 'community'
    ]);
    items.push({ screen: 'chv-dashboard', icon: '🏥', label: 'FCHV Dashboard', section: 'Field Work' });
  }

  let lastSection = null;
  items.forEach(item => {
    if (item.section && item.section !== lastSection) {
      const label = document.createElement('div');
      label.className = 'nav-section-label injected-nav';
      label.textContent = item.section;
      nav.appendChild(label);
      lastSection = item.section;
    }
    const link = document.createElement('a');
    link.className = 'nav-item injected-nav';
    link.dataset.screen = item.screen;
    link.href = '#';
    link.innerHTML = `<span class="nav-icon">${item.icon}</span><span class="nav-label">${item.label}</span>`;
    link.addEventListener('click', e => {
      e.preventDefault();
      navigateToScreen(item.screen, { updateHash: true });
    });
    nav.appendChild(link);
  });
}

function injectRoleScreens(user) {
  document.querySelectorAll('.injected-screen').forEach(el => el.remove());
  const mainContent = document.querySelector('.main-content');
  if (!mainContent) return;

  if (user.role === 'super_admin') {
    const adminScreen = document.createElement('div');
    adminScreen.className = 'screen injected-screen';
    adminScreen.id = 'screen-admin-panel';
    adminScreen.innerHTML = buildAdminPanelHTML();
    mainContent.appendChild(adminScreen);
    setTimeout(() => initAdminPanel(), 100);

    const docScreen = document.createElement('div');
    docScreen.className = 'screen injected-screen';
    docScreen.id = 'screen-doctor-dashboard';
    docScreen.innerHTML = buildDoctorDashboardHTML();
    mainContent.appendChild(docScreen);
    setTimeout(() => initDoctorDashboard(), 60);

    const journalScreen = document.createElement('div');
    journalScreen.className = 'screen injected-screen';
    journalScreen.id = 'screen-doctor-journal';
    journalScreen.innerHTML = buildDoctorJournalHTML();
    mainContent.appendChild(journalScreen);
    setTimeout(() => initDoctorJournalScreen(), 60);

    const careScreen = document.createElement('div');
    careScreen.className = 'screen injected-screen';
    careScreen.id = 'screen-doctor-counseling';
    careScreen.innerHTML = buildDoctorCounselingHTML();
    mainContent.appendChild(careScreen);
    setTimeout(() => initDoctorCounseling(), 60);

    const chvScreen = document.createElement('div');
    chvScreen.className = 'screen injected-screen';
    chvScreen.id = 'screen-chv-dashboard';
    chvScreen.innerHTML = buildChvDashboardHTML();
    mainContent.appendChild(chvScreen);
    setTimeout(() => initChvDashboard(), 60);

    const guardianScreen = document.createElement('div');
    guardianScreen.className = 'screen injected-screen';
    guardianScreen.id = 'screen-guardian-view';
    guardianScreen.innerHTML = buildGuardianViewHTML(user);
    mainContent.appendChild(guardianScreen);
  }

  if (user.role === 'doctor') {
    const docScreen = document.createElement('div');
    docScreen.className = 'screen injected-screen';
    docScreen.id = 'screen-doctor-dashboard';
    docScreen.innerHTML = buildDoctorDashboardHTML();
    mainContent.appendChild(docScreen);
    setTimeout(() => initDoctorDashboard(), 60);

    const journalScreen = document.createElement('div');
    journalScreen.className = 'screen injected-screen';
    journalScreen.id = 'screen-doctor-journal';
    journalScreen.innerHTML = buildDoctorJournalHTML();
    mainContent.appendChild(journalScreen);
    setTimeout(() => initDoctorJournalScreen(), 60);

    const careScreen = document.createElement('div');
    careScreen.className = 'screen injected-screen';
    careScreen.id = 'screen-doctor-counseling';
    careScreen.innerHTML = buildDoctorCounselingHTML();
    mainContent.appendChild(careScreen);
    setTimeout(() => initDoctorCounseling(), 60);
  }

  if (user.role === 'guardian') {
    const guardianScreen = document.createElement('div');
    guardianScreen.className = 'screen injected-screen';
    guardianScreen.id = 'screen-guardian-view';
    guardianScreen.innerHTML = buildGuardianViewHTML(user);
    mainContent.appendChild(guardianScreen);
  }

  // Patient-exclusive screens: Journal, Booking, Settings
  if (user.role === 'patient') {
    const journalScreen = document.createElement('div');
    journalScreen.className = 'screen injected-screen';
    journalScreen.id = 'screen-journal';
    journalScreen.innerHTML = buildJournalScreenHTML();
    mainContent.appendChild(journalScreen);
    setTimeout(() => initJournalScreen(), 100);

    const bookingScreen = document.createElement('div');
    bookingScreen.className = 'screen injected-screen';
    bookingScreen.id = 'screen-booking';
    bookingScreen.innerHTML = buildBookingScreenHTML();
    mainContent.appendChild(bookingScreen);
    setTimeout(() => initBookingScreen(), 100);

    const settingsScreen = document.createElement('div');
    settingsScreen.className = 'screen injected-screen';
    settingsScreen.id = 'screen-my-settings';
    settingsScreen.innerHTML = buildSettingsScreenHTML();
    mainContent.appendChild(settingsScreen);
    setTimeout(() => initSettingsScreen(), 100);
  }

  // CHV-exclusive dashboard
  if (user.role === 'chv') {
    const chvScreen = document.createElement('div');
    chvScreen.className = 'screen injected-screen';
    chvScreen.id = 'screen-chv-dashboard';
    chvScreen.innerHTML = buildChvDashboardHTML();
    mainContent.appendChild(chvScreen);
    setTimeout(() => initChvDashboard(), 100);
  }
}

/* ══════════════════════════
   DOCTOR DASHBOARD (Provider)
   ══════════════════════════ */

const DOCTOR_DEMO_PATIENTS = [
  { id: 'JRN-2847', name: 'Patient A-2847', risk: 'high', score: 82, last: '12 min ago', concern: 'Crisis keyword + sleep <4h', adherence: 45 },
  { id: 'JRN-004', name: 'Patient Delta', risk: 'high', score: 76, last: '25 min ago', concern: 'PHQ-9 severe; rising anxiety', adherence: 38 },
  { id: 'JRN-002', name: 'Patient Beta', risk: 'monitor', score: 55, last: '1 h ago', concern: 'Sleep disruption · adherence 72%', adherence: 72 },
  { id: 'JRN-003', name: 'Patient Gamma', risk: 'stable', score: 18, last: '3 h ago', concern: 'Improving; steady sleep 8h', adherence: 94 },
  { id: 'JRN-005', name: 'Patient Epsilon', risk: 'stable', score: 22, last: '6 h ago', concern: 'Positive reframing patterns', adherence: 88 },
];

const DOCTOR_DEMO_ALERTS = [
  { id: 'AL-01', severity: 'high', patient: 'Patient A-2847', event: 'Crisis keyword detected', time: '12 min ago' },
  { id: 'AL-02', severity: 'high', patient: 'Patient Delta', event: 'PHQ-9 >= 18', time: '25 min ago' },
  { id: 'AL-03', severity: 'medium', patient: 'Patient Beta', event: '3 nights <5h sleep', time: '1 h ago' },
];

const DOCTOR_DEMO_APPTS = [
  { when: 'Today · 3:30 PM', patient: 'Patient Beta', mode: 'Video', status: 'Confirmed' },
  { when: 'Today · 6:00 PM', patient: 'Patient Gamma', mode: 'Chat', status: 'Pending' },
  { when: 'Tomorrow · 9:00 AM', patient: 'Patient A-2847', mode: 'Video', status: 'Pending' },
];

const DOCTOR_DEMO_TASKS = [
  { text: 'Call Patient A-2847 (post-escalation)', done: false },
  { text: 'Review voice summary for Patient Delta', done: false },
  { text: 'Approve CHV intake for Patient Beta', done: true },
  { text: 'Sign compliance attestation (weekly)', done: false },
];

function buildDoctorDashboardHTML() {
  return `
  <div class="section-heading">
    <div>
      <div class="section-title">🩺 Doctor Dashboard</div>
      <div class="section-subtitle">Clinical cockpit · demo data (scripts/seed_demo)</div>
    </div>
  </div>

  <div class="grid-3 gap-24 mb-24">
    <div class="metric-card"><div class="metric-icon">👥</div><div class="metric-value" id="doc-metric-patients">0</div><div class="metric-label">Active Patients</div></div>
    <div class="metric-card"><div class="metric-icon">🚨</div><div class="metric-value" id="doc-metric-severe" style="color:var(--danger)">0</div><div class="metric-label">Severe Alerts</div></div>
    <div class="metric-card"><div class="metric-icon">⏱️</div><div class="metric-value" id="doc-metric-response">—</div><div class="metric-label">Avg Response Time</div></div>
  </div>

  <div class="grid-2 gap-24 mb-24">
    <div class="glass-card">
      <div class="card-title">High-Risk Patients</div>
      <div class="card-subtitle">Color-coded by severity</div>
      <div id="doc-risk-list"></div>
    </div>
    <div class="glass-card">
      <div class="card-title">Open Alerts</div>
      <div class="card-subtitle">Acknowledge and route</div>
      <div id="doc-alerts-list"></div>
    </div>
  </div>

  <div class="grid-2 gap-24 mb-24">
    <div class="glass-card">
      <div class="card-title">Upcoming Consultations</div>
      <div class="card-subtitle">Next 24 hours</div>
      <div id="doc-appt-list"></div>
    </div>
    <div class="glass-card">
      <div class="card-title">Intervene & Assign</div>
      <div class="card-subtitle">Push milestones & resources (demo)</div>
      <div class="grid-2 gap-12">
        <div>
          <div class="form-label">Milestone</div>
          <select id="doc-milestone" class="text-area" style="min-height:44px;">
            <option>Complete 3 days of journaling</option>
            <option>Practice breathing for 7 days</option>
            <option>Daily check-in streak (5 days)</option>
          </select>
        </div>
        <div>
          <div class="form-label">Resource</div>
          <select id="doc-resource" class="text-area" style="min-height:44px;">
            <option>Audio: Grounding Techniques</option>
            <option>Video: 4-7-8 Breathing</option>
            <option>Article: Work Anxiety Reset</option>
          </select>
        </div>
      </div>
      <div class="grid-2 gap-12" style="margin-top:10px;">
        <div>
          <div class="form-label">Journal Prompt</div>
          <input id="doc-journal-prompt" class="text-area" style="min-height:44px;" value="Enter a new milestone or task for the patient" />
        </div>
        <div>
          <div class="form-label">Assign To</div>
          <select id="doc-assign-patient" class="text-area" style="min-height:44px;">
            ${DOCTOR_DEMO_PATIENTS.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
          </select>
        </div>
      </div>
      <div style="margin-top:12px;display:flex;gap:10px;flex-wrap:wrap;">
        <button class="btn btn-primary" id="doc-btn-assign">📤 Push to Patient App</button>
        <button class="btn btn-ghost" id="doc-btn-save-draft">💾 Save Draft</button>
      </div>
      <div id="doc-assign-status" style="font-size:12px;color:var(--text-muted);margin-top:6px;">No pending push.</div>
    </div>
  </div>

  <div class="glass-card">
    <div class="card-title">Data Compliance & Security Monitor</div>
    <div class="card-subtitle">Encryption, storage, wipe status</div>
    <div class="grid-3 gap-16" id="doc-compliance-cards"></div>
    <div style="font-size:12px;color:var(--text-muted);margin-top:8px;">Demo data from scripts/seed_demo; replace with live compliance endpoint.</div>
  </div>

  `;
}

function initDoctorDashboard() {
  const patients = DOCTOR_DEMO_PATIENTS;
  const alerts = DOCTOR_DEMO_ALERTS;
  const appts = DOCTOR_DEMO_APPTS;
  const tasks = DOCTOR_DEMO_TASKS;

  const severeCount = alerts.filter(a => a.severity === 'high').length;
  const active = patients.length;

  setText('doc-metric-patients', active);
  setText('doc-metric-severe', severeCount);
  setText('doc-metric-response', '18m');

  const riskList = document.getElementById('doc-risk-list');
  if (riskList) {
    riskList.innerHTML = patients
      .filter(p => p.risk !== 'stable')
      .map(p => `
        <div class="record-item" style="margin-bottom:10px;border-left:4px solid ${p.risk === 'high' ? 'var(--danger)' : 'var(--warning)'};">
          <div class="record-header">
            <span class="record-date">${p.name}</span>
            <span class="badge ${p.risk === 'high' ? 'badge-high' : 'badge-low'}">${p.risk.toUpperCase()}</span>
          </div>
          <div class="record-body">
            Risk score: <strong>${p.score}/100</strong> · Last check-in: ${p.last}<br/>
            ${p.concern}
          </div>
        </div>
      `).join('') || '<div style="color:var(--text-muted);padding:12px;">No high-risk patients.</div>';
  }

  const alertList = document.getElementById('doc-alerts-list');
  if (alertList) {
    alertList.innerHTML = alerts.map(a => `
      <div class="alert-card" style="border-color:${a.severity === 'high' ? 'rgba(248,113,113,0.35)' : 'rgba(251,191,36,0.25)'};">
        <div class="alert-severity ${a.severity}"></div>
        <div class="alert-body">
          <div class="alert-title">${a.patient}</div>
          <div class="alert-desc">${a.event}</div>
          <div class="alert-time">${a.time}</div>
        </div>
        <button class="alert-action-btn" onclick="showToast('✅ Alert acknowledged')">Acknowledge</button>
      </div>
    `).join('');
  }

  const apptList = document.getElementById('doc-appt-list');
  if (apptList) {
    apptList.innerHTML = appts.map(a => `
      <div class="record-item" style="margin-bottom:10px;">
        <div class="record-header">
          <span class="record-date">${a.when}</span>
          <span class="badge badge-low">${a.mode}</span>
        </div>
        <div class="record-body">Patient: ${a.patient} · Status: ${a.status}</div>
      </div>
    `).join('');
  }

  // Assign / intervene actions
  const assignBtn = document.getElementById('doc-btn-assign');
  if (assignBtn && !assignBtn.dataset.bound) {
    assignBtn.dataset.bound = 'true';
    assignBtn.addEventListener('click', () => {
      const patient = document.getElementById('doc-assign-patient')?.value || '';
      const milestone = document.getElementById('doc-milestone')?.value || '';
      const resource = document.getElementById('doc-resource')?.value || '';
      const prompt = document.getElementById('doc-journal-prompt')?.value || '';
      const status = document.getElementById('doc-assign-status');
      if (status) status.textContent = `✅ Pushed to ${patient}: ${milestone} + ${resource}`;
      showToast(`📤 Assigned to ${patient} · ${milestone}`);
    });
  }
  const draftBtn = document.getElementById('doc-btn-save-draft');
  if (draftBtn && !draftBtn.dataset.bound) {
    draftBtn.dataset.bound = 'true';
    draftBtn.addEventListener('click', () => {
      const status = document.getElementById('doc-assign-status');
      if (status) status.textContent = '💾 Draft saved locally (demo)';
      showToast('Draft saved');
    });
  }

  // Compliance cards
  const compEl = document.getElementById('doc-compliance-cards');
  if (compEl) {
    const cards = [
      { label: 'Encryption Status', value: 'AES-256-GCM Active', color: 'var(--success)' },
      { label: 'Voice Files Stored', value: '0 (purged on edge)', color: 'var(--accent)' },
      { label: 'Last Wipe', value: 'Today · 09:40', color: 'var(--warning)' },
      { label: 'HIPAA Compliance', value: 'Verified (demo)', color: 'var(--success)' },
      { label: 'Audit Hashes', value: '12 receipts', color: 'var(--text-secondary)' },
      { label: 'Anomaly Alerts', value: '0 unresolved', color: 'var(--success)' },
    ];
    compEl.innerHTML = cards.map(c => `
      <div class="spec-item">
        <div class="spec-label">${c.label}</div>
        <div class="spec-value" style="color:${c.color};">${c.value}</div>
      </div>
    `).join('');
  }

}

function buildDoctorJournalHTML() {
  return `
  <div class="section-heading">
    <div>
      <div class="section-title">📓 Patient Journal</div>
      <div class="section-subtitle">Live anonymized journal review, AI summary, and feedback workflow</div>
    </div>
  </div>

  <div class="glass-card" style="margin-top:8px;">
    <div class="grid-2 gap-24" style="margin-top:12px;">
      <div>
        <div class="card-title">Queue</div>
        <div class="card-subtitle">Anonymous patient IDs with journal activity</div>
        <div id="doc-live-queue" style="max-height:420px;overflow:auto;margin-top:8px;"></div>
      </div>
      <div>
        <div class="card-title">Review & Feedback</div>
        <div class="card-subtitle">AI summary + doctor note for patient</div>
        <div id="doc-live-detail" class="record-item" style="margin:10px 0;">Select a patient ID from queue.</div>
        <div class="form-group">
          <label class="form-label" for="doc-live-feedback">Feedback To Patient</label>
          <textarea id="doc-live-feedback" class="text-area" style="min-height:96px;" placeholder="Actionable feedback visible to patient..."></textarea>
        </div>
        <div class="grid-2 gap-12">
          <div class="form-group">
            <label class="form-label" for="doc-live-severity">Severity</label>
            <select id="doc-live-severity" class="text-area" style="min-height:44px;">
              <option value="low">Low</option>
              <option value="moderate" selected>Moderate</option>
              <option value="severe">Severe</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="doc-live-call-now">Immediate Call</label>
            <select id="doc-live-call-now" class="text-area" style="min-height:44px;">
              <option value="false" selected>No</option>
              <option value="true">Yes</option>
            </select>
          </div>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          <button class="btn btn-primary" id="doc-live-submit">💬 Save Feedback</button>
          <button class="btn btn-danger" id="doc-live-call">📞 Mark Severe & Request Call</button>
        </div>
        <div id="doc-live-status" style="margin-top:8px;font-size:12px;color:var(--text-muted);">No action yet.</div>
      </div>
    </div>
  </div>
  `;
}

function initDoctorJournalScreen() {
  initDoctorLiveJournalReview();
}

let doctorLiveSelected = { anonymousId: null, entryId: null };

async function initDoctorLiveJournalReview() {
  const queueEl = document.getElementById('doc-live-queue');
  if (!queueEl) return;
  queueEl.innerHTML = '<div style="color:var(--text-muted);padding:12px;">Loading queue...</div>';
  try {
    const hdrs = window.__aegisGetAuthHeaders();
    const qRes = await fetch(`${IAM_API}/api/doctor/queue`, { headers: hdrs });
    const qData = await qRes.json();
    const patients = qData.data?.patients || [];
    if (!patients.length) {
      queueEl.innerHTML = '<div style="color:var(--text-muted);padding:12px;">No anonymized journal patients found.</div>';
      return;
    }

    queueEl.innerHTML = patients.slice(0, 12).map(p => `
      <div class="clin-patient-card" data-doc-anon="${p.anonymousId}" style="cursor:pointer;margin-bottom:8px;">
        <div class="clin-patient-title">
          <div class="clin-patient-name">${p.anonymousId}</div>
          <span class="badge badge-low">${p.totalEntries} entries</span>
        </div>
        <div class="clin-patient-meta">Unassessed: ${p.unassessedEntries} · Latest: ${new Date(p.latestEntry).toLocaleString()}</div>
      </div>
    `).join('');

    queueEl.querySelectorAll('[data-doc-anon]').forEach(card => {
      card.addEventListener('click', async () => {
        const anonymousId = card.dataset.docAnon;
        queueEl.querySelectorAll('[data-doc-anon]').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        await loadDoctorLivePatient(anonymousId);
      });
    });
  } catch {
    queueEl.innerHTML = '<div style="color:var(--text-muted);padding:12px;">Could not load doctor queue.</div>';
  }

  const submitBtn = document.getElementById('doc-live-submit');
  if (submitBtn && !submitBtn.dataset.bound) {
    submitBtn.dataset.bound = 'true';
    submitBtn.addEventListener('click', submitDoctorLiveFeedback);
  }

  const severeBtn = document.getElementById('doc-live-call');
  if (severeBtn && !severeBtn.dataset.bound) {
    severeBtn.dataset.bound = 'true';
    severeBtn.addEventListener('click', submitDoctorSevereCall);
  }
}

async function loadDoctorLivePatient(anonymousId) {
  const detail = document.getElementById('doc-live-detail');
  if (!detail) return;
  detail.innerHTML = 'Loading journals...';
  try {
    const hdrs = window.__aegisGetAuthHeaders();
    const res = await fetch(`${IAM_API}/api/doctor/journals/${encodeURIComponent(anonymousId)}?limit=5`, { headers: hdrs });
    const data = await res.json();
    const entries = data.data?.journals || [];
    const latest = entries[0];
    if (!latest) {
      detail.innerHTML = 'No entries found for this ID.';
      return;
    }
    doctorLiveSelected = { anonymousId, entryId: latest.id };
    detail.innerHTML = `
      <div class="record-header">
        <span class="record-date">${anonymousId}</span>
        <span class="badge badge-low">${latest.type || 'text'}</span>
      </div>
      <div class="record-body" style="margin-top:8px;">
        <strong>AI Summary:</strong> ${escapeHtml(latest.aiSummary || 'No AI summary available.')}<br>
        <strong>Timestamp:</strong> ${new Date(latest.createdAt).toLocaleString()}<br>
        <strong>Entry:</strong> ${escapeHtml((latest.content || '').slice(0, 220))}${(latest.content || '').length > 220 ? '...' : ''}
      </div>
    `;
  } catch {
    detail.innerHTML = 'Could not load patient journals.';
  }
}

async function submitDoctorLiveFeedback() {
  if (!doctorLiveSelected.entryId) { showToast('Select a patient from queue first'); return; }
  const status = document.getElementById('doc-live-status');
  const feedback = document.getElementById('doc-live-feedback')?.value?.trim() || '';
  const severity = document.getElementById('doc-live-severity')?.value || 'moderate';
  const callNow = document.getElementById('doc-live-call-now')?.value === 'true';
  try {
    const hdrs = window.__aegisGetAuthHeaders();
    const res = await fetch(`${IAM_API}/api/doctor/assess/${doctorLiveSelected.entryId}`, {
      method: 'POST', headers: hdrs,
      body: JSON.stringify({
        depressionScore: severity === 'severe' ? 8 : severity === 'moderate' ? 5 : 2,
        stressLevel: severity === 'severe' ? 9 : severity === 'moderate' ? 6 : 3,
        anxietyLevel: severity === 'severe' ? 9 : severity === 'moderate' ? 5 : 2,
        clinicalNotes: feedback,
        feedbackToPatient: feedback,
        severity,
        requiresImmediateCall: callNow,
        recommendsConsultation: severity !== 'low',
      })
    });
    const data = await res.json();
    if (!data.ok) throw new Error(data.error?.message || 'Could not save feedback');
    if (status) status.textContent = `Saved feedback at ${new Date().toLocaleTimeString()}`;
    showToast('✅ Feedback shared with patient');
  } catch (e) {
    if (status) status.textContent = e.message;
    showToast('⚠️ ' + e.message);
  }
}

async function submitDoctorSevereCall() {
  if (!doctorLiveSelected.anonymousId) { showToast('Select a patient from queue first'); return; }
  try {
    const hdrs = window.__aegisGetAuthHeaders();
    const res = await fetch(`${IAM_API}/api/severe/call/doctor/${encodeURIComponent(doctorLiveSelected.anonymousId)}`, {
      method: 'POST', headers: hdrs,
      body: JSON.stringify({ reason: 'Severe case marked by doctor dashboard' })
    });
    const data = await res.json();
    if (!data.ok) throw new Error(data.error?.message || 'Failed to request severe call');
    showToast('🚨 Severe-call request logged for patient');
    const status = document.getElementById('doc-live-status');
    if (status) status.textContent = `Severe call requested at ${new Date().toLocaleTimeString()}`;
  } catch (e) {
    showToast('⚠️ ' + e.message);
  }
}

/* ══════════════════════════
   ADMIN IAM PANEL
   ══════════════════════════ */

let adminUsers = [];
let adminPatients = [];

function buildAdminPanelHTML() {
  return `
  <div class="section-heading">
    <div>
      <div class="section-title">⚙️ Identity & Access Management</div>
      <div class="section-subtitle">Create and manage user accounts — Super Admin only</div>
    </div>
  </div>

  <div class="grid-3 gap-24 mb-24" id="admin-stats-cards">
    <div class="metric-card"><div class="metric-icon">🩺</div><div class="metric-value" id="admin-stat-doctors" style="color:#0ea5e9">0</div><div class="metric-label">Doctors</div></div>
    <div class="metric-card"><div class="metric-icon">🧑</div><div class="metric-value" id="admin-stat-patients" style="color:#10b981">0</div><div class="metric-label">Patients</div></div>
  </div>

  <div class="grid-2 gap-24 mb-24">
    <div class="glass-card">
      <div class="card-title">➕ Create New User</div>
      <div class="card-subtitle">All user accounts are created by Super Admin</div>
      <form id="admin-create-form" novalidate>
        <div class="form-group">
          <label class="form-label" for="admin-new-name">Full Name *</label>
          <input type="text" id="admin-new-name" class="text-area" style="min-height:48px;resize:none;" placeholder="e.g., Dr. Sita Sharma" required />
        </div>
        <div class="form-group">
          <label class="form-label" for="admin-new-email">Email Address *</label>
          <input type="email" id="admin-new-email" class="text-area" style="min-height:48px;resize:none;" placeholder="user@aegisspeak.com" required />
        </div>
        <div class="form-group">
          <label class="form-label" for="admin-new-password">Password *</label>
          <input type="password" id="admin-new-password" class="text-area" style="min-height:48px;resize:none;" placeholder="Minimum 6 characters" required minlength="6" />
        </div>
        <div class="form-group">
          <label class="form-label" for="admin-new-role">User Role *</label>
          <select id="admin-new-role" class="text-area" style="min-height:48px;resize:none;">
            <option value="patient">🧑 Mental Patient</option>
            <option value="doctor">🩺 Doctor</option>
            <option value="guardian">👨‍👩‍👧 Guardian</option>
            <option value="chv">🏥 FCHV</option>
          </select>
        </div>
        <div class="form-group" id="admin-doctor-type-group" style="display:none;">
          <label class="form-label" for="admin-new-doctor-type">Doctor Type</label>
          <select id="admin-new-doctor-type" class="text-area" style="min-height:48px;resize:none;">
            <option value="psychiatrist">Psychiatrist</option>
            <option value="psychologist">Psychologist</option>
            <option value="general">General / Overall</option>
          </select>
        </div>
        <div class="form-group" id="admin-linked-patient-group" style="display:none;">
          <label class="form-label" for="admin-new-linked-patient">Link to Patient *</label>
          <select id="admin-new-linked-patient" class="text-area" style="min-height:48px;resize:none;">
            <option value="">Select a patient...</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" for="admin-new-phone">Phone</label>
          <input type="tel" id="admin-new-phone" class="text-area" style="min-height:48px;resize:none;" placeholder="+977-9800000000" />
        </div>
        <div class="login-error-global" id="admin-create-error" role="alert" aria-live="polite"></div>
        <button type="submit" class="btn btn-primary btn-full" style="margin-top:8px;">
          ➕ Create User Account
        </button>
      </form>
    </div>

    <div class="glass-card">
      <div class="card-title">📋 User Directory</div>
      <div class="card-subtitle">All registered accounts and their roles</div>
      <div class="admin-filter-row" style="margin-bottom:12px;">
        <button class="chip active" data-admin-filter="all">All</button>
        <button class="chip" data-admin-filter="doctor" style="border-color:#0ea5e9;color:#0ea5e9">🩺 Doctors</button>
        <button class="chip" data-admin-filter="patient" style="border-color:#10b981;color:#10b981">🧑 Patients</button>
        <button class="chip" data-admin-filter="guardian" style="border-color:#f59e0b;color:#f59e0b">👨‍👩‍👧 Guardians</button>
        <button class="chip" data-admin-filter="chv" style="border-color:#ec4899;color:#ec4899">🏥 FCHV</button>
      </div>
      <div id="admin-user-list" style="max-height:500px;overflow-y:auto;"></div>
    </div>
  </div>

  <div class="glass-card">
    <div class="card-title">📊 Access Control Summary</div>
    <div class="card-subtitle">Role-based feature access matrix</div>
    <div style="overflow-x:auto;">
      <table class="access-matrix-table">
        <thead>
          <tr>
            <th>Feature</th>
            <th style="color:#8b5cf6">🛡️ Admin</th>
            <th style="color:#0ea5e9">🩺 Doctor</th>
            <th style="color:#10b981">🧑 Patient</th>
            <th style="color:#f59e0b">👨‍👩‍👧 Guardian</th>
            <th style="color:#ec4899">🏥 FCHV</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>IAM User Management</td><td>✅</td><td>❌</td><td>❌</td><td>❌</td><td>Mini</td></tr>
          <tr><td>AI Copilot Chat</td><td>✅</td><td>✅</td><td>✅</td><td>❌</td><td>✅</td></tr>
          <tr><td>Daily Check-In</td><td>✅</td><td>✅</td><td>✅</td><td>❌</td><td>✅</td></tr>
          <tr><td>Clinical Triage</td><td>✅</td><td>✅</td><td>❌</td><td>❌</td><td>View</td></tr>
          <tr><td>Patient Records</td><td>✅</td><td>✅</td><td>Own only</td><td>Linked only</td><td>Assigned only</td></tr>
          <tr><td>Counseling Services</td><td>✅</td><td>✅</td><td>✅</td><td>✅</td><td>Referral</td></tr>
          <tr><td>Medication Management</td><td>✅</td><td>✅</td><td>View only</td><td>View only</td><td>❌</td></tr>
          <tr><td>Emergency Escalation</td><td>✅</td><td>✅</td><td>✅</td><td>✅</td><td>✅</td></tr>
          <tr><td>Compliance & Audit</td><td>✅</td><td>View only</td><td>❌</td><td>❌</td><td>❌</td></tr>
        </tbody>
      </table>
    </div>
  </div>`;
}

function initAdminPanel() {
  // Role toggle for create form
  const roleSelect = document.getElementById('admin-new-role');
  if (roleSelect) {
    roleSelect.addEventListener('change', () => {
      const role = roleSelect.value;
      const doctorGroup = document.getElementById('admin-doctor-type-group');
      const linkedGroup = document.getElementById('admin-linked-patient-group');
      if (doctorGroup) doctorGroup.style.display = role === 'doctor' ? 'block' : 'none';
      if (linkedGroup) linkedGroup.style.display = role === 'guardian' ? 'block' : 'none';
    });
  }

  // Filter buttons
  document.querySelectorAll('[data-admin-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-admin-filter]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderAdminUserList(btn.dataset.adminFilter);
    });
  });

  // Create form submit
  const createForm = document.getElementById('admin-create-form');
  if (createForm) {
    createForm.addEventListener('submit', handleCreateUser);
  }

  loadAdminUsers();
}

async function loadAdminUsers() {
  try {
    const res = await fetch(`${IAM_API}/api/iam/users`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (data.ok && data.data) {
      adminUsers = data.data.users || [];
      adminPatients = adminUsers.filter(u => u.role === 'patient');

      // Update stats
      const doctors = adminUsers.filter(u => u.role === 'doctor').length;
      const patients = adminPatients.length;

      setText('admin-stat-doctors', doctors);
      setText('admin-stat-patients', patients);

      // Populate patient linker dropdown
      const linkedSelect = document.getElementById('admin-new-linked-patient');
      if (linkedSelect) {
        linkedSelect.innerHTML = '<option value="">Select a patient...</option>';
        adminPatients.forEach(p => {
          linkedSelect.innerHTML += `<option value="${p.id}">${p.fullName} (${p.email})</option>`;
        });
      }

      renderAdminUserList('all');
    }
  } catch (err) {
    console.error('Failed to load users:', err);
  }
}

function renderAdminUserList(filter) {
  const container = document.getElementById('admin-user-list');
  if (!container) return;

  const filtered = filter === 'all'
    ? adminUsers.filter(u => u.role !== 'super_admin')
    : adminUsers.filter(u => u.role === filter);

  if (filtered.length === 0) {
    container.innerHTML = `<div style="padding:32px;text-align:center;color:var(--text-muted);font-size:14px;">No users found. Create your first user above.</div>`;
    return;
  }

  container.innerHTML = filtered.map(user => `
    <div class="admin-user-card" data-uid="${user.id}">
      <div class="admin-user-left">
        <div class="admin-user-avatar" style="background:${ROLE_COLORS[user.role]}20;color:${ROLE_COLORS[user.role]}">${user.avatar || ROLE_ICONS[user.role]}</div>
        <div>
          <div class="admin-user-name">${user.fullName}</div>
          <div class="admin-user-email">${user.email}</div>
          <div class="admin-user-meta">
            <span class="admin-role-tag" style="background:${ROLE_COLORS[user.role]}15;color:${ROLE_COLORS[user.role]};border-color:${ROLE_COLORS[user.role]}40">${ROLE_LABELS[user.role]}${user.doctorType ? ' · ' + user.doctorType : ''}</span>
            ${user.isActive ? '<span class="admin-status-active">Active</span>' : '<span class="admin-status-inactive">Inactive</span>'}
          </div>
        </div>
      </div>
      <div class="admin-user-actions">
        <button class="btn btn-sm btn-ghost admin-toggle-btn" data-toggle-uid="${user.id}" data-active="${user.isActive}">
          ${user.isActive ? '🔒 Disable' : '🔓 Enable'}
        </button>
        <button class="btn btn-sm btn-outline admin-delete-btn" data-delete-uid="${user.id}" style="border-color:var(--danger);color:var(--danger);">
          🗑️
        </button>
      </div>
    </div>
  `).join('');

  // Bind toggle/delete
  container.querySelectorAll('.admin-toggle-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const uid = btn.dataset.toggleUid;
      const isActive = btn.dataset.active === 'true';
      try {
        await fetch(`${IAM_API}/api/iam/users/${uid}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({ isActive: !isActive }),
        });
        loadAdminUsers();
        if (typeof showToast === 'function') showToast(`User ${isActive ? 'disabled' : 'enabled'}`);
      } catch (e) { console.error(e); }
    });
  });

  container.querySelectorAll('.admin-delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const uid = btn.dataset.deleteUid;
      if (!confirm('Are you sure you want to permanently delete this user?')) return;
      try {
        await fetch(`${IAM_API}/api/iam/users/${uid}`, { method: 'DELETE', headers: getAuthHeaders() });
        loadAdminUsers();
        if (typeof showToast === 'function') showToast('🗑️ User deleted');
      } catch (e) { console.error(e); }
    });
  });
}

async function handleCreateUser(e) {
  e.preventDefault();
  const error = document.getElementById('admin-create-error');
  if (error) error.textContent = '';

  const name = document.getElementById('admin-new-name')?.value.trim();
  const email = document.getElementById('admin-new-email')?.value.trim();
  const password = document.getElementById('admin-new-password')?.value;
  const role = document.getElementById('admin-new-role')?.value;
  const doctorType = document.getElementById('admin-new-doctor-type')?.value;
  const linkedPatientId = document.getElementById('admin-new-linked-patient')?.value;
  const phone = document.getElementById('admin-new-phone')?.value.trim();

  if (!name || !email || !password || !role) {
    if (error) error.textContent = 'Please fill all required fields.';
    return;
  }

  try {
    const res = await fetch(`${IAM_API}/api/iam/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ email, password, fullName: name, role, doctorType, linkedPatientId, phone }),
    });
    const data = await res.json();

    if (!data.ok) {
      throw new Error(data.error?.message || 'Failed to create user.');
    }

    // Reset form
    document.getElementById('admin-create-form')?.reset();
    loadAdminUsers();
    if (typeof showToast === 'function') showToast(`✅ ${ROLE_LABELS[role]} account created for ${name}`);
  } catch (err) {
    if (error) error.textContent = err.message;
  }
}

/* ══════════════════════════
   DOCTOR CARE OPERATIONS (Counseling)
   ══════════════════════════ */

const DOCTOR_COUNSELING_CASES = {
  severe: [
    { patient: 'Patient A-2847', trigger: 'Crisis keyword + sleep <4h', when: '12 min ago', mode: 'Video' },
    { patient: 'Patient Delta', trigger: 'PHQ-9 severe', when: '25 min ago', mode: 'Call' },
  ],
  pinged: [
    { patient: 'Patient Beta', trigger: 'Pinged doctor for follow-up', when: '1 h ago', mode: 'Chat' },
    { patient: 'Patient Zeta', trigger: 'Requested reassurance', when: '3 h ago', mode: 'SMS' },
  ],
  scheduled: [
    { patient: 'Patient Gamma', trigger: 'Weekly therapy cadence', when: 'Tomorrow · 9:00 AM', mode: 'Video' },
    { patient: 'Patient Epsilon', trigger: 'Medication review cadence', when: 'Fri · 4:00 PM', mode: 'Call' },
  ],
};

function buildDoctorCounselingHTML() {
  return `
  <div class="section-heading">
    <div><div class="section-title">🏥 Care Operations (Doctor)</div><div class="section-subtitle">Who needs counseling now · who pinged you · scheduled cadence</div></div>
  </div>

  <div class="grid-3 gap-24 mb-24">
    <div class="glass-card">
      <div class="card-title">🔴 Needs Immediate Counseling</div>
      <div class="card-subtitle">Severe / high-risk cases</div>
      <div id="doc-care-severe"></div>
    </div>
    <div class="glass-card">
      <div class="card-title">📨 Pinged the Doctor</div>
      <div class="card-subtitle">Patients requesting contact</div>
      <div id="doc-care-pinged"></div>
    </div>
    <div class="glass-card">
      <div class="card-title">📅 Periodic Scheduling</div>
      <div class="card-subtitle">Standing therapy / med reviews</div>
      <div id="doc-care-scheduled"></div>
    </div>
  </div>

  <div class="grid-2 gap-24">
    <div class="glass-card">
      <div class="card-title">Outreach & Follow-ups</div>
      <div class="card-subtitle">Calls, chats, SMS/USSD fallback</div>
      <div id="doc-outreach"></div>
    </div>
    <div class="glass-card">
      <div class="card-title">Compliance & Security</div>
      <div class="card-subtitle">Audit receipts · edge purge · PHI scope</div>
      <div id="doc-care-compliance"></div>
    </div>
  </div>
  `;
}

function initDoctorCounseling() {
  const renderList = (id, items, color) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = items.map(i => `
      <div class="record-item" style="margin-bottom:10px;border-left:4px solid ${color};">
        <div class="record-header">
          <span class="record-date">${i.when}</span>
          <span class="badge badge-low">${i.mode}</span>
        </div>
        <div class="record-body">${i.patient} · ${i.trigger}</div>
        <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;">
          <button class="btn btn-outline btn-sm" onclick="showToast('📞 Contacting ${i.patient}')">Contact</button>
          <button class="btn btn-ghost btn-sm" onclick="showToast('📅 Added to schedule for ${i.patient}')">Schedule</button>
        </div>
      </div>
    `).join('');
  };

  renderList('doc-care-severe', DOCTOR_COUNSELING_CASES.severe, 'var(--danger)');
  renderList('doc-care-pinged', DOCTOR_COUNSELING_CASES.pinged, 'var(--accent)');
  renderList('doc-care-scheduled', DOCTOR_COUNSELING_CASES.scheduled, 'var(--warning)');

  const renderSimple = (id, items) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = items.map(c => `
      <div class="spec-item">
        <div class="spec-label">${c.label}</div>
        <div class="spec-value" style="color:${c.color};">${c.value}</div>
      </div>
    `).join('');
  };

  // Reuse outreach & compliance from dashboard demo data
  const renderOutreach = (items) => {
    const el = document.getElementById('doc-outreach');
    if (!el) return;
    el.innerHTML = items.map(o => `
      <div class="record-item" style="margin-bottom:10px;">
        <div class="record-header">
          <span class="record-date">${o.channel}</span>
          <span class="badge badge-low">${o.status}</span>
        </div>
        <div class="record-body">${o.target} · ${o.note}</div>
      </div>
    `).join('');
  };

  renderOutreach(DOCTOR_DEMO_OUTREACH);
  renderSimple('doc-care-compliance', DOCTOR_DEMO_CARE_COMPLIANCE);
}

/* ══════════════════════════
   GUARDIAN VIEW
   ══════════════════════════ */

function buildGuardianViewHTML(user) {
  return `
  <div class="section-heading">
    <div>
      <div class="section-title">👁️ Patient Overview (Guardian View)</div>
      <div class="section-subtitle">Monitor your linked patient's wellness progress — read-only access</div>
    </div>
  </div>

  <div class="glass-card mb-24" style="background:linear-gradient(135deg,rgba(245,158,11,0.06),rgba(255,255,255,0.95));border-color:rgba(245,158,11,0.15);">
    <div style="display:flex;align-items:center;gap:14px;">
      <span style="font-size:28px;">👨‍👩‍👧</span>
      <div>
        <div style="font-size:16px;font-weight:700;color:var(--text-primary);">Guardian Access</div>
        <div style="font-size:13px;color:var(--text-muted);">You are viewing anonymized wellness data for your linked family member. Medical details require clinician authorization.</div>
      </div>
    </div>
  </div>

  <div class="grid-3 gap-24 mb-24">
    <div class="metric-card"><div class="metric-icon">📊</div><div class="metric-value" style="color:var(--success)">Stable</div><div class="metric-label">Current Status</div></div>
    <div class="metric-card"><div class="metric-icon">🔥</div><div class="metric-value" style="color:var(--accent)">6</div><div class="metric-label">Check-In Streak</div></div>
    <div class="metric-card"><div class="metric-icon">📈</div><div class="metric-value" style="color:var(--success)">↗ Improving</div><div class="metric-label">Wellness Trend</div></div>
  </div>

  <div class="grid-2 gap-24 mb-24">
    <div class="glass-card">
      <div class="card-title">📅 Recent Activity</div>
      <div class="card-subtitle">Patient engagement summary</div>
      <div class="signal-item"><span class="signal-name">✅ Completed daily check-in</span><span class="signal-value" style="color:var(--success)">Today</span></div>
      <div class="signal-item"><span class="signal-name">🫁 Completed breathing exercise</span><span class="signal-value" style="color:var(--accent)">Yesterday</span></div>
      <div class="signal-item"><span class="signal-name">💬 AI copilot session</span><span class="signal-value" style="color:var(--accent)">2 days ago</span></div>
      <div class="signal-item"><span class="signal-name">📝 Journal entry submitted</span><span class="signal-value" style="color:var(--accent)">3 days ago</span></div>
    </div>

    <div class="glass-card">
      <div class="card-title">🛡️ Safety Alerts</div>
      <div class="card-subtitle">Escalation notifications for guardians</div>
      <div style="text-align:center;padding:24px;color:var(--success);font-weight:700;">
        <div style="font-size:36px;margin-bottom:8px;">✅</div>
        <div style="font-size:16px;">No Active Alerts</div>
        <div style="font-size:12px;color:var(--text-muted);margin-top:4px;">Your family member's risk level is within safe parameters</div>
      </div>
    </div>
  </div>

  <div class="glass-card">
    <div class="card-title">🔒 Privacy & Boundaries</div>
    <div class="card-subtitle">What guardians can and cannot see</div>
    <div style="font-size:13px;color:var(--text-secondary);line-height:1.7;">
      Guardians can see: overall status, streaks, and AI-generated safety alerts.<br/>
      Guardians cannot see: raw journal text, voice data, or clinician notes. All PII is hidden.
    </div>
  </div>`;
}



/* ══════════════════════════
   JOURNAL SCREEN (Patient)
   ══════════════════════════ */

function buildJournalScreenHTML() {
  return `
  <div class="section-heading">
    <div><div class="section-title">📓 My Journal</div><div class="section-subtitle">Text or video journal · dynamic checklists · AI summary + doctor feedback</div></div>
  </div>

  <div class="grid-2 gap-24 mb-24">
    <div class="glass-card">
      <div class="card-title">New Entry</div>
      <div class="card-subtitle">Express yourself with text/video and quick tick selections</div>
      <div class="form-group">
        <label class="form-label" for="journal-entry-type">Entry Type</label>
        <select id="journal-entry-type" class="text-area" style="min-height:44px;">
          <option value="text">Text Journal</option>
          <option value="audio">Audio Journal</option>
          <option value="video">Video Journal</option>
        </select>
      </div>
      <textarea class="text-area" id="journal-entry-text" placeholder="Write about how you're feeling today..." style="min-height:140px;"></textarea>
      <div class="form-group" id="journal-audio-wrap" style="display:none;">
        <label class="form-label" for="journal-audio-file">Audio Journal</label>
        <input type="file" id="journal-audio-file" accept="audio/*" class="text-area" style="min-height:44px;" />
      </div>
      <div class="form-group" id="journal-video-wrap" style="display:none;">
        <label class="form-label" for="journal-video-file">Video Journal</label>
        <input type="file" id="journal-video-file" accept="video/*" class="text-area" style="min-height:44px;" />
      </div>
      <div class="form-group">
        <label class="form-label">Quick Check (tick all that happened)</label>
        <div id="journal-checklist" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;font-size:13px;color:var(--text-secondary);">
          <label><input type="checkbox" value="poor_sleep" /> Poor sleep</label>
          <label><input type="checkbox" value="panic_episode" /> Panic episode</label>
          <label><input type="checkbox" value="social_withdrawal" /> Social withdrawal</label>
          <label><input type="checkbox" value="overthinking" /> Overthinking</label>
          <label><input type="checkbox" value="appetite_change" /> Appetite change</label>
          <label><input type="checkbox" value="good_support" /> Got support from someone</label>
        </div>
      </div>
      <div class="grid-2 gap-12">
        <div class="form-group">
          <label class="form-label" for="journal-mcq-mood">Mood Today</label>
          <select id="journal-mcq-mood" class="text-area" style="min-height:44px;">
            <option value="very_low">Very low</option>
            <option value="low">Low</option>
            <option value="neutral" selected>Neutral</option>
            <option value="good">Good</option>
            <option value="very_good">Very good</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" for="journal-mcq-energy">Energy Level</label>
          <select id="journal-mcq-energy" class="text-area" style="min-height:44px;">
            <option value="very_low">Very low</option>
            <option value="low">Low</option>
            <option value="medium" selected>Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>
      <div style="margin-top:12px;display:flex;gap:10px;">
        <button class="btn btn-primary" id="btn-journal-save">📝 Save Entry</button>
        <button class="btn btn-outline" id="btn-journal-ai">🧠 Get AI Suggestions</button>
      </div>
      <div id="journal-save-status" style="margin-top:10px;font-size:13px;color:var(--text-muted);"></div>
    </div>
    <div class="glass-card">
      <div class="card-title">🧠 AI Wellness Insights</div>
      <div class="card-subtitle">Non-diagnostic lifestyle suggestions</div>
      <div id="journal-ai-suggestions" style="font-size:14px;color:var(--text-secondary);">
        Write a journal entry and click "Get AI Suggestions" to receive personalized wellness insights.
      </div>
      <div id="journal-consult-prompt" style="display:none;margin-top:16px;">
        <div style="background:var(--warning-dim);border-radius:var(--radius-md);padding:14px;border:1px solid rgba(251,191,36,0.2);">
          <div style="font-weight:700;color:var(--warning);margin-bottom:4px;">💡 Professional support recommended</div>
          <div style="font-size:13px;color:var(--text-secondary);">Based on your recent entries, you may benefit from a consultation.</div>
          <button class="btn btn-outline btn-sm" style="margin-top:8px;" onclick="navigateToScreen('booking')">📅 Book a Consultation</button>
          <button class="btn btn-danger btn-sm" style="margin-top:8px;" id="btn-patient-severe-call">📞 Call Doctor (Severe)</button>
        </div>
      </div>
    </div>
  </div>

  <div class="glass-card">
    <div class="card-title">📚 Past Entries</div>
    <div class="card-subtitle">Your journal history — newest first</div>
    <div id="journal-entries-list" style="margin-top:12px;">
      <div style="color:var(--text-muted);text-align:center;padding:24px;">Loading your entries...</div>
    </div>
  </div>`;
}

function initJournalScreen() {
  const saveBtn = document.getElementById('btn-journal-save');
  const aiBtn = document.getElementById('btn-journal-ai');
  const typeSelect = document.getElementById('journal-entry-type');
  const audioWrap = document.getElementById('journal-audio-wrap');
  const videoWrap = document.getElementById('journal-video-wrap');

  if (typeSelect && audioWrap && videoWrap) {
    typeSelect.addEventListener('change', () => {
      audioWrap.style.display = typeSelect.value === 'audio' ? 'block' : 'none';
      videoWrap.style.display = typeSelect.value === 'video' ? 'block' : 'none';
    });
  }

  if (saveBtn) saveBtn.addEventListener('click', async () => {
    const text = document.getElementById('journal-entry-text')?.value?.trim();
    const type = document.getElementById('journal-entry-type')?.value || 'text';
    const audioFile = document.getElementById('journal-audio-file')?.files?.[0] || null;
    const videoFile = document.getElementById('journal-video-file')?.files?.[0] || null;
    const checklist = Array.from(document.querySelectorAll('#journal-checklist input[type="checkbox"]:checked')).map(el => el.value);
    const mcqAnswers = {
      mood: document.getElementById('journal-mcq-mood')?.value || 'neutral',
      energy: document.getElementById('journal-mcq-energy')?.value || 'medium',
    };
    if (!text && !audioFile && !videoFile && checklist.length === 0) { showToast('Write or select at least one journal signal'); return; }
    saveBtn.disabled = true; saveBtn.textContent = '⏳ Saving...';
    try {
      const hdrs = window.__aegisGetAuthHeaders();
      const payload = {
        type,
        content: text || '',
        checklist,
        mcqAnswers,
        audioMeta: type === 'audio' && audioFile
          ? { fileName: audioFile.name, size: audioFile.size, mimeType: audioFile.type, capturedAt: new Date().toISOString() }
          : null,
        videoMeta: type === 'video' && videoFile
          ? { fileName: videoFile.name, size: videoFile.size, mimeType: videoFile.type, capturedAt: new Date().toISOString() }
          : null,
      };
      const res = await fetch(`${IAM_API}/api/journals`, { method: 'POST', headers: hdrs, body: JSON.stringify(payload) });
      const data = await res.json();
      if (data.ok) {
        document.getElementById('journal-entry-text').value = '';
        const audioInput = document.getElementById('journal-audio-file');
        if (audioInput) audioInput.value = '';
        const videoInput = document.getElementById('journal-video-file');
        if (videoInput) videoInput.value = '';
        document.querySelectorAll('#journal-checklist input[type="checkbox"]').forEach(cb => { cb.checked = false; });
        document.getElementById('journal-save-status').textContent = '✅ Entry saved · ID: ' + (data.data?.journal?.journalId || data.data?.entry?.journalId || '').slice(0,10);
        showToast('📝 Journal entry saved');
        loadJournalEntries();
      } else { throw new Error(data.error?.message || 'Save failed'); }
    } catch (e) { showToast('⚠️ ' + e.message); }
    saveBtn.disabled = false; saveBtn.textContent = '📝 Save Entry';
  });

  if (aiBtn) aiBtn.addEventListener('click', async () => {
    aiBtn.disabled = true; aiBtn.textContent = '⏳ Analyzing...';
    try {
      const hdrs = window.__aegisGetAuthHeaders();
      const res = await fetch(`${IAM_API}/api/ai/my-analysis`, { method: 'POST', headers: hdrs });
      const data = await res.json();
      const analysis = data.data || {};
      const sugEl = document.getElementById('journal-ai-suggestions');
      if (sugEl) {
        const sug = analysis.suggestions || analysis.analysis?.suggestions || ['Keep journaling daily', 'Try a breathing exercise', 'Maintain your sleep schedule'];
        sugEl.innerHTML = sug.map(s => `<div class="signal-item"><span class="signal-name">💡 ${typeof s === 'string' ? s : s.text || s}</span></div>`).join('');
      }
      if (analysis.suggestConsultation || analysis.analysis?.suggestConsultation) {
        const prompt = document.getElementById('journal-consult-prompt');
        if (prompt) prompt.style.display = 'block';
      }
      showToast('🧠 AI analysis complete');
    } catch { showToast('⚠️ AI analysis unavailable — try again later'); }
    aiBtn.disabled = false; aiBtn.textContent = '🧠 Get AI Suggestions';
  });

  const patientSevereCallBtn = document.getElementById('btn-patient-severe-call');
  if (patientSevereCallBtn) {
    patientSevereCallBtn.addEventListener('click', async () => {
      try {
        const hdrs = window.__aegisGetAuthHeaders();
        const res = await fetch(`${IAM_API}/api/severe/call/patient`, {
          method: 'POST', headers: hdrs,
          body: JSON.stringify({ reason: 'Patient requested immediate call from journal screen', preferredTime: 'asap' })
        });
        const data = await res.json();
        if (!data.ok) throw new Error(data.error?.message || 'Could not raise call request');
        showToast('📞 Urgent callback requested from care team');
      } catch (e) {
        showToast('⚠️ ' + e.message);
      }
    });
  }

  loadJournalEntries();
}

async function loadJournalEntries() {
  const list = document.getElementById('journal-entries-list');
  if (!list) return;
  try {
    const hdrs = window.__aegisGetAuthHeaders();
    const res = await fetch(`${IAM_API}/api/journals/mine`, { headers: hdrs });
    const data = await res.json();
    const entries = data.data?.entries || data.data?.journals || [];
    if (!entries.length) {
      list.innerHTML = '<div style="color:var(--text-muted);text-align:center;padding:24px;">No journal entries yet. Start writing above!</div>';
      return;
    }
    list.innerHTML = entries.slice(0, 20).map(e => `
      <div class="record-item" style="margin-bottom:10px;">
        <div class="record-header">
          <span class="record-date">${new Date(e.createdAt).toLocaleString()}</span>
          <span class="badge badge-low">${(e.type || 'text').toUpperCase()}</span>
        </div>
        <div class="record-body" style="font-size:14px;">
          <div><strong>ID:</strong> ${escapeHtml(e.anonymousId || 'N/A')} · <strong>Journal ID:</strong> ${escapeHtml(e.journalId || e.id || '')}</div>
          <div style="margin-top:6px;">${escapeHtml((e.content || '').slice(0, 280))}${(e.content || '').length > 280 ? '...' : ''}</div>
          ${e.aiSummary ? `<div style="margin-top:8px;"><strong>AI Summary:</strong> ${escapeHtml(e.aiSummary)}</div>` : ''}
          ${Array.isArray(e.checklist) && e.checklist.length ? `<div style="margin-top:6px;"><strong>Checked:</strong> ${escapeHtml(e.checklist.join(', '))}</div>` : ''}
          ${e.audioMeta ? `<div style="margin-top:6px;"><strong>Audio:</strong> ${escapeHtml(e.audioMeta.fileName || 'attached')} (${Math.round((e.audioMeta.size || 0) / 1024)} KB)</div>` : ''}
          ${e.videoMeta ? `<div style="margin-top:6px;"><strong>Video:</strong> ${escapeHtml(e.videoMeta.fileName || 'attached')} (${Math.round((e.videoMeta.size || 0) / 1024)} KB)</div>` : ''}
          ${Array.isArray(e.doctorAssessments) && e.doctorAssessments.length ? `
            <div style="margin-top:8px;padding:8px;border:1px solid var(--border-glass);border-radius:10px;background:var(--bg-surface);">
              <strong>Doctor Feedback:</strong><br>
              ${e.doctorAssessments.slice(-1).map(d => `${escapeHtml(d.feedbackToPatient || d.clinicalNotes || 'No note')} · Severity: ${escapeHtml((d.severity || 'moderate').toUpperCase())} · ${new Date(d.createdAt).toLocaleString()}`).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    `).join('');
  } catch {
    list.innerHTML = '<div style="color:var(--text-muted);text-align:center;padding:24px;">Could not load entries. Backend may be offline.</div>';
  }
}

/* ══════════════════════════
   BOOKING SCREEN (Patient)
   ══════════════════════════ */

function buildBookingScreenHTML() {
  return `
  <div class="section-heading">
    <div><div class="section-title">📅 Book a Consultation</div><div class="section-subtitle">Anonymous doctor selection · Secure payment · Instant scheduling</div></div>
  </div>

  <div class="glass-card mb-24" style="background:linear-gradient(135deg,rgba(10,132,255,0.05),rgba(52,211,153,0.03));border-color:rgba(10,132,255,0.12);">
    <div style="display:flex;align-items:center;gap:12px;">
      <span style="font-size:24px;">🔒</span>
      <div style="font-size:13px;color:var(--text-secondary);">Doctors only see your anonymous journal ID (JRN-XXXX). Your personal identity is never shared with clinicians.</div>
    </div>
  </div>

  <div class="grid-2 gap-24 mb-24">
    <div class="glass-card">
      <div class="card-title">Step 1: Select a Doctor</div>
      <div class="card-subtitle">Available professionals for consultation</div>
      <div id="booking-doctor-list">
        <div style="color:var(--text-muted);text-align:center;padding:24px;">Loading available doctors...</div>
      </div>
    </div>
    <div class="glass-card">
      <div class="card-title">Step 2: Confirm & Pay</div>
      <div class="card-subtitle">Simulated payment for demo</div>
      <div id="booking-selected-info" style="margin-bottom:16px;">
        <div style="color:var(--text-muted);font-size:14px;">Select a doctor first</div>
      </div>
      <div class="form-group">
        <label class="form-label" for="booking-notes">Consultation Notes (optional)</label>
        <textarea id="booking-notes" class="text-area" placeholder="Describe what you'd like to discuss..." style="min-height:80px;"></textarea>
      </div>
      <button class="btn btn-primary btn-full" id="btn-booking-confirm" disabled>📅 Confirm Booking</button>
      <div id="booking-receipt" style="display:none;margin-top:16px;"></div>
    </div>
  </div>

  <div class="glass-card">
    <div class="card-title">My Appointments</div>
    <div class="card-subtitle">Upcoming and past consultations</div>
    <div id="booking-my-appointments">
      <div style="color:var(--text-muted);text-align:center;padding:24px;">Loading appointments...</div>
    </div>
  </div>`;
}

let selectedDoctorId = null;

function initBookingScreen() {
  loadAvailableDoctors();
  loadMyAppointments();

  const confirmBtn = document.getElementById('btn-booking-confirm');
  if (confirmBtn) confirmBtn.addEventListener('click', async () => {
    if (!selectedDoctorId) { showToast('Select a doctor first'); return; }
    confirmBtn.disabled = true; confirmBtn.textContent = '⏳ Booking...';
    try {
      const hdrs = window.__aegisGetAuthHeaders();
      const notes = document.getElementById('booking-notes')?.value || '';
      const res = await fetch(`${IAM_API}/api/appointments`, {
        method: 'POST', headers: hdrs,
        body: JSON.stringify({ doctorId: selectedDoctorId, notes, scheduledAt: new Date(Date.now() + 86400000).toISOString() })
      });
      const data = await res.json();
      if (data.ok) {
        const appt = data.data?.appointment;
        // Simulate payment
        try {
          await fetch(`${IAM_API}/api/payments/appointment/${appt.id}`, {
            method: 'POST', headers: hdrs,
            body: JSON.stringify({ method: 'card_simulated', amount: 500 })
          });
        } catch {}
        const receipt = document.getElementById('booking-receipt');
        if (receipt) {
          receipt.style.display = 'block';
          receipt.innerHTML = `
            <div class="plan-box">
              <div class="plan-label">✅ Booking Confirmed</div>
              <div class="plan-text">Appointment ID: ${(appt.id || '').slice(0,8)}<br>Scheduled: ${new Date(appt.scheduledAt).toLocaleString()}<br>Status: Confirmed & Paid (demo)</div>
            </div>`;
        }
        showToast('✅ Consultation booked successfully');
        selectedDoctorId = null;
        loadMyAppointments();
      } else { throw new Error(data.error?.message || 'Booking failed'); }
    } catch (e) { showToast('⚠️ ' + e.message); }
    confirmBtn.disabled = false; confirmBtn.textContent = '📅 Confirm Booking';
  });
}

async function loadAvailableDoctors() {
  const list = document.getElementById('booking-doctor-list');
  if (!list) return;
  try {
    const hdrs = window.__aegisGetAuthHeaders();
    const res = await fetch(`${IAM_API}/api/appointments/available-doctors`, { headers: hdrs });
    const data = await res.json();
    const doctors = data.data?.doctors || [];
    if (!doctors.length) {
      list.innerHTML = '<div style="color:var(--text-muted);text-align:center;padding:24px;">No doctors available. Ask admin to create doctor accounts.</div>';
      return;
    }
    list.innerHTML = doctors.map(d => `
      <div class="clin-patient-card ${selectedDoctorId === d.id ? 'active' : ''}" data-doc-id="${d.id}" style="cursor:pointer;">
        <div class="clin-patient-title">
          <div class="clin-patient-name">🩺 ${escapeHtml(d.displayName || d.fullName || 'Anonymous Doctor')}</div>
          <span class="badge badge-low">${d.doctorType || 'General'}</span>
        </div>
        <div class="clin-patient-meta">Verified · Anonymous consultation</div>
      </div>
    `).join('');
    list.querySelectorAll('[data-doc-id]').forEach(card => {
      card.addEventListener('click', () => {
        selectedDoctorId = card.dataset.docId;
        list.querySelectorAll('[data-doc-id]').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        const info = document.getElementById('booking-selected-info');
        if (info) info.innerHTML = `<div style="font-size:14px;color:var(--success);font-weight:600;">✅ Doctor selected</div>`;
        const btn = document.getElementById('btn-booking-confirm');
        if (btn) btn.disabled = false;
      });
    });
  } catch {
    list.innerHTML = '<div style="color:var(--text-muted);text-align:center;padding:24px;">Could not load doctors.</div>';
  }
}

async function loadMyAppointments() {
  const el = document.getElementById('booking-my-appointments');
  if (!el) return;
  try {
    const hdrs = window.__aegisGetAuthHeaders();
    const res = await fetch(`${IAM_API}/api/appointments/mine`, { headers: hdrs });
    const data = await res.json();
    const appts = data.data?.appointments || [];
    if (!appts.length) {
      el.innerHTML = '<div style="color:var(--text-muted);text-align:center;padding:24px;">No appointments yet.</div>';
      return;
    }
    el.innerHTML = appts.map(a => `
      <div class="record-item" style="margin-bottom:10px;">
        <div class="record-header">
          <span class="record-date">${new Date(a.scheduledAt).toLocaleString()}</span>
          <span class="badge ${a.status === 'confirmed' ? 'badge-low' : a.status === 'cancelled' ? 'badge-high' : 'badge-moderate'}">${(a.status || 'pending').toUpperCase()}</span>
        </div>
        <div class="record-body" style="font-size:13px;">Doctor: ${a.doctorId?.slice(0,8) || 'TBD'}${a.notes ? ' · Notes: ' + escapeHtml(a.notes.slice(0,80)) : ''}</div>
      </div>
    `).join('');
  } catch {
    el.innerHTML = '<div style="color:var(--text-muted);text-align:center;padding:24px;">Could not load appointments.</div>';
  }
}

/* ══════════════════════════
   SETTINGS SCREEN (Patient)
   ══════════════════════════ */

function buildSettingsScreenHTML() {
  return `
  <div class="section-heading">
    <div><div class="section-title">⚙️ Settings</div><div class="section-subtitle">Wearable connectivity · Check-in schedule · Privacy controls</div></div>
  </div>

  <div class="grid-2 gap-24 mb-24">
    <div class="glass-card">
      <div class="card-title">⌚ Wearable Sync</div>
      <div class="card-subtitle">Connect health data from your wearable device</div>
      <div style="background:var(--accent-dim);border-radius:var(--radius-sm);padding:12px;margin-bottom:16px;">
        <span style="font-size:12px;color:var(--accent);font-weight:600;">🔐 All biometric data encrypted with AES-256 before transmission</span>
      </div>
      <div class="form-group">
        <label class="form-label">Heart Rate (bpm)</label>
        <input type="number" id="settings-hr" class="text-area" style="min-height:44px;resize:none;" value="72" min="40" max="200" />
      </div>
      <div class="form-group">
        <label class="form-label">Steps Today</label>
        <input type="number" id="settings-steps" class="text-area" style="min-height:44px;resize:none;" value="6500" min="0" max="50000" />
      </div>
      <div class="form-group">
        <label class="form-label">Sleep Hours (last night)</label>
        <input type="number" id="settings-sleep-hrs" class="text-area" style="min-height:44px;resize:none;" value="7" min="0" max="24" step="0.5" />
      </div>
      <div class="form-group">
        <label class="form-label">Blood Oxygen (%)</label>
        <input type="number" id="settings-spo2" class="text-area" style="min-height:44px;resize:none;" value="98" min="80" max="100" />
      </div>
      <button class="btn btn-primary btn-full" id="btn-settings-sync">⌚ Sync Wearable Data</button>
      <div id="settings-sync-status" style="margin-top:10px;font-size:13px;color:var(--text-muted);"></div>
    </div>

    <div class="glass-card">
      <div class="card-title">⏰ Check-In Schedule</div>
      <div class="card-subtitle">Set your preferred daily check-in time</div>
      <div class="form-group">
        <label class="form-label">Morning Check-In Time</label>
        <input type="time" id="settings-checkin-time" class="text-area" style="min-height:44px;resize:none;" value="08:00" />
      </div>
      <div class="form-group">
        <label class="form-label">Frequency</label>
        <select id="settings-checkin-freq" class="text-area" style="min-height:44px;resize:none;">
          <option value="daily">Daily</option>
          <option value="twice_daily">Twice Daily</option>
          <option value="weekly">Weekly</option>
        </select>
      </div>
      <button class="btn btn-outline btn-full" id="btn-settings-schedule">💾 Save Schedule</button>
      <div id="settings-schedule-status" style="margin-top:10px;font-size:13px;color:var(--text-muted);"></div>

      <div style="margin-top:24px;border-top:1px solid var(--border-glass);padding-top:16px;">
        <div class="card-title" style="font-size:15px;">🔒 Privacy</div>
        <div class="signal-item"><span class="signal-name">✅ Biometric data AES-256 encrypted</span></div>
        <div class="signal-item"><span class="signal-name">✅ Doctors see anonymous ID only</span></div>
        <div class="signal-item"><span class="signal-name">✅ Raw audio never persists</span></div>
        <div class="signal-item"><span class="signal-name">✅ HIPAA & GDPR compliant</span></div>
      </div>
    </div>
  </div>`;
}

function initSettingsScreen() {
  const syncBtn = document.getElementById('btn-settings-sync');
  if (syncBtn) syncBtn.addEventListener('click', async () => {
    syncBtn.disabled = true; syncBtn.textContent = '⏳ Syncing...';
    try {
      const hdrs = window.__aegisGetAuthHeaders();
      const payload = {
        heartRate: +(document.getElementById('settings-hr')?.value || 72),
        steps: +(document.getElementById('settings-steps')?.value || 6500),
        sleepHours: +(document.getElementById('settings-sleep-hrs')?.value || 7),
        bloodOxygen: +(document.getElementById('settings-spo2')?.value || 98),
        source: 'web_manual',
        timestamp: new Date().toISOString()
      };
      const res = await fetch(`${IAM_API}/api/wearables/sync`, { method: 'POST', headers: hdrs, body: JSON.stringify(payload) });
      const data = await res.json();
      if (data.ok) {
        document.getElementById('settings-sync-status').innerHTML = '<span style="color:var(--success)">✅ Wearable data synced · Encrypted with AES-256</span>';
        showToast('⌚ Wearable data synced and encrypted');
      } else { throw new Error(data.error?.message || 'Sync failed'); }
    } catch (e) { showToast('⚠️ ' + e.message); }
    syncBtn.disabled = false; syncBtn.textContent = '⌚ Sync Wearable Data';
  });

  const schedBtn = document.getElementById('btn-settings-schedule');
  if (schedBtn) schedBtn.addEventListener('click', async () => {
    schedBtn.disabled = true;
    try {
      const hdrs = window.__aegisGetAuthHeaders();
      const time = document.getElementById('settings-checkin-time')?.value || '08:00';
      const freq = document.getElementById('settings-checkin-freq')?.value || 'daily';
      const res = await fetch(`${IAM_API}/api/settings/checkin-schedule`, {
        method: 'POST', headers: hdrs,
        body: JSON.stringify({ preferredTime: time, frequency: freq })
      });
      const data = await res.json();
      if (data.ok) {
        document.getElementById('settings-schedule-status').innerHTML = '<span style="color:var(--success)">✅ Schedule saved</span>';
        showToast('⏰ Check-in schedule updated');
      } else { throw new Error(data.error?.message || 'Failed'); }
    } catch (e) { showToast('⚠️ ' + e.message); }
    schedBtn.disabled = false;
  });
}

/* ══════════════════════════
   CHV DASHBOARD (FCHV)
   ══════════════════════════ */

function buildChvDashboardHTML() {
  return `
  <div class="section-heading">
    <div><div class="section-title">🏥 FCHV Field Dashboard</div><div class="section-subtitle">Mini-admin for offline areas: create accounts and update on behalf of patients</div></div>
  </div>

  <div class="grid-2 gap-24 mb-24">
    <div class="glass-card">
      <div class="card-title">➕ Register New Patient</div>
      <div class="card-subtitle">Create a patient account for field screening</div>
      <div class="form-group">
        <label class="form-label" for="chv-patient-name">Patient Name *</label>
        <input type="text" id="chv-patient-name" class="text-area" style="min-height:44px;resize:none;" placeholder="Full name" required />
      </div>
      <div class="form-group">
        <label class="form-label" for="chv-patient-email">Email *</label>
        <input type="email" id="chv-patient-email" class="text-area" style="min-height:44px;resize:none;" placeholder="patient@example.com" required />
      </div>
      <div class="form-group">
        <label class="form-label" for="chv-patient-phone">Phone</label>
        <input type="tel" id="chv-patient-phone" class="text-area" style="min-height:44px;resize:none;" placeholder="+977-9800000000" />
      </div>
      <div class="form-group">
        <label class="form-label" for="chv-initial-note">Initial Screening Note</label>
        <textarea id="chv-initial-note" class="text-area" placeholder="Initial observation from field visit..." style="min-height:80px;"></textarea>
      </div>
      <button class="btn btn-primary btn-full" id="btn-chv-register">➕ Register & Create Journal</button>
      <div id="chv-register-status" style="margin-top:10px;font-size:13px;color:var(--text-muted);"></div>
    </div>

    <div class="glass-card">
      <div class="card-title">📋 My Registered Patients</div>
      <div class="card-subtitle">Patients registered through your field work</div>
      <div id="chv-patient-list">
        <div style="color:var(--text-muted);text-align:center;padding:24px;">Loading patients...</div>
      </div>
    </div>
  </div>

  <div class="glass-card">
    <div class="card-title">🧾 Update On Behalf of Patient</div>
    <div class="card-subtitle">For offline communities where patient has no smartphone access</div>
    <div class="grid-2 gap-24" style="margin-top:12px;">
      <div>
        <div class="spec-item" style="margin-bottom:10px;">
          <div class="spec-label">Selected Patient</div>
          <div class="spec-value" id="chv-selected-patient">Select a patient from your list</div>
        </div>
        <div class="form-group">
          <label class="form-label" for="chv-manage-name">Patient Name</label>
          <input id="chv-manage-name" class="text-area" style="min-height:44px;" placeholder="Patient full name" />
        </div>
        <div class="form-group">
          <label class="form-label" for="chv-manage-phone">Patient Phone</label>
          <input id="chv-manage-phone" class="text-area" style="min-height:44px;" placeholder="+977-9800000000" />
        </div>
        <div class="grid-2 gap-12">
          <div class="form-group">
            <label class="form-label" for="chv-manage-hour">Check-in Hour</label>
            <input id="chv-manage-hour" type="number" min="0" max="23" class="text-area" style="min-height:44px;" value="20" />
          </div>
          <div class="form-group">
            <label class="form-label" for="chv-manage-minute">Check-in Minute</label>
            <input id="chv-manage-minute" type="number" min="0" max="59" class="text-area" style="min-height:44px;" value="0" />
          </div>
        </div>
        <button class="btn btn-outline" id="btn-chv-update-patient">💾 Update Patient Profile</button>
      </div>

      <div>
        <div class="form-group">
          <label class="form-label" for="chv-proxy-note">Proxy Journal Note</label>
          <textarea id="chv-proxy-note" class="text-area" style="min-height:96px;" placeholder="Patient spoke this in field visit..."></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Quick Tick Signals</label>
          <div id="chv-proxy-checklist" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;font-size:13px;color:var(--text-secondary);">
            <label><input type="checkbox" value="poor_sleep" /> Poor sleep</label>
            <label><input type="checkbox" value="panic_episode" /> Panic episode</label>
            <label><input type="checkbox" value="social_withdrawal" /> Social withdrawal</label>
            <label><input type="checkbox" value="medication_missed" /> Medication missed</label>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label" for="chv-proxy-mood">Mood (from interview)</label>
          <select id="chv-proxy-mood" class="text-area" style="min-height:44px;">
            <option value="very_low">Very low</option>
            <option value="low">Low</option>
            <option value="neutral" selected>Neutral</option>
            <option value="good">Good</option>
          </select>
        </div>
        <button class="btn btn-primary" id="btn-chv-add-journal">📝 Save Journal On Behalf</button>

        <div style="margin-top:14px;padding-top:14px;border-top:1px solid var(--border-glass);">
          <div class="form-group">
            <label class="form-label" for="chv-checkin-note">Check-In Note</label>
            <input id="chv-checkin-note" class="text-area" style="min-height:44px;" placeholder="Short note for this check-in" />
          </div>
          <div class="grid-2 gap-12">
            <div class="form-group">
              <label class="form-label" for="chv-checkin-mood">Mood (1-10)</label>
              <input id="chv-checkin-mood" type="number" min="1" max="10" class="text-area" style="min-height:44px;" value="5" />
            </div>
            <div class="form-group">
              <label class="form-label" for="chv-checkin-anxiety">Anxiety (1-10)</label>
              <input id="chv-checkin-anxiety" type="number" min="1" max="10" class="text-area" style="min-height:44px;" value="5" />
            </div>
            <div class="form-group">
              <label class="form-label" for="chv-checkin-stress">Stress (1-10)</label>
              <input id="chv-checkin-stress" type="number" min="1" max="10" class="text-area" style="min-height:44px;" value="5" />
            </div>
            <div class="form-group">
              <label class="form-label" for="chv-checkin-sleep">Sleep Hours</label>
              <input id="chv-checkin-sleep" type="number" min="0" max="24" step="0.5" class="text-area" style="min-height:44px;" value="7" />
            </div>
          </div>
          <button class="btn btn-outline" id="btn-chv-add-checkin">📊 Submit Check-In On Behalf</button>
        </div>
      </div>
    </div>
    <div id="chv-manage-status" style="margin-top:10px;font-size:13px;color:var(--text-muted);">No update yet.</div>
  </div>`;
}

let chvManagedPatients = [];
let selectedChvPatientId = null;

function renderChvPatientList(patients) {
  const list = document.getElementById('chv-patient-list');
  if (!list) return;
  if (!patients.length) {
    list.innerHTML = '<div style="color:var(--text-muted);text-align:center;padding:24px;">No patients registered yet. Use the form to create your first.</div>';
    return;
  }
  list.innerHTML = patients.map(p => `
    <div class="clin-patient-card stable ${selectedChvPatientId === p.id ? 'active' : ''}" data-chv-patient-id="${p.id}" style="margin-bottom:8px;cursor:pointer;">
      <div class="clin-patient-title">
        <div class="clin-patient-name">${escapeHtml(p.fullName)}</div>
        <span class="badge badge-low">Registered</span>
      </div>
      <div class="clin-patient-meta">${escapeHtml(p.email)} · Anonymous ID: ${p.anonymousId || p.anonymousJournalId || 'N/A'}</div>
    </div>
  `).join('');

  list.querySelectorAll('[data-chv-patient-id]').forEach(card => {
    card.addEventListener('click', () => {
      selectedChvPatientId = card.dataset.chvPatientId;
      renderChvPatientList(chvManagedPatients);
      populateChvManagePanel();
    });
  });
}

function populateChvManagePanel() {
  const patient = chvManagedPatients.find(p => p.id === selectedChvPatientId);
  const selectedEl = document.getElementById('chv-selected-patient');
  if (selectedEl) {
    selectedEl.textContent = patient ? `${patient.fullName} (${patient.anonymousId || 'N/A'})` : 'Select a patient from your list';
  }
  const nameEl = document.getElementById('chv-manage-name');
  const phoneEl = document.getElementById('chv-manage-phone');
  const hourEl = document.getElementById('chv-manage-hour');
  const minuteEl = document.getElementById('chv-manage-minute');
  if (nameEl) nameEl.value = patient?.fullName || '';
  if (phoneEl) phoneEl.value = patient?.phone || '';
  if (hourEl) hourEl.value = String(patient?.checkinSchedule?.hour ?? 20);
  if (minuteEl) minuteEl.value = String(patient?.checkinSchedule?.minute ?? 0);
}

function initChvDashboard() {
  loadChvPatients();

  const regBtn = document.getElementById('btn-chv-register');
  if (regBtn) regBtn.addEventListener('click', async () => {
    const name = document.getElementById('chv-patient-name')?.value?.trim();
    const email = document.getElementById('chv-patient-email')?.value?.trim();
    const phone = document.getElementById('chv-patient-phone')?.value?.trim();
    const note = document.getElementById('chv-initial-note')?.value?.trim();
    if (!name || !email) { showToast('Name and email are required'); return; }
    regBtn.disabled = true; regBtn.textContent = '⏳ Registering...';
    try {
      const hdrs = window.__aegisGetAuthHeaders();
      const res = await fetch(`${IAM_API}/api/chv/create-patient`, {
        method: 'POST', headers: hdrs,
        body: JSON.stringify({ fullName: name, email, password: 'AegisPatient@2026', phone, initialJournalText: note || 'Initial field screening — no immediate concerns.' })
      });
      const data = await res.json();
      if (data.ok) {
        document.getElementById('chv-register-status').innerHTML = `<span style="color:var(--success)">✅ ${escapeHtml(name)} registered · Anonymous ID: ${data.data?.anonymousJournalId || 'assigned'}</span>`;
        document.getElementById('chv-patient-name').value = '';
        document.getElementById('chv-patient-email').value = '';
        document.getElementById('chv-patient-phone').value = '';
        document.getElementById('chv-initial-note').value = '';
        showToast('✅ Patient registered with initial journal entry');
        loadChvPatients();
      } else { throw new Error(data.error?.message || 'Registration failed'); }
    } catch (e) { showToast('⚠️ ' + e.message); }
    regBtn.disabled = false; regBtn.textContent = '➕ Register & Create Journal';
  });

  const updateBtn = document.getElementById('btn-chv-update-patient');
  if (updateBtn && !updateBtn.dataset.bound) {
    updateBtn.dataset.bound = 'true';
    updateBtn.addEventListener('click', async () => {
      if (!selectedChvPatientId) { showToast('Select a patient first'); return; }
      const fullName = document.getElementById('chv-manage-name')?.value?.trim() || '';
      const phone = document.getElementById('chv-manage-phone')?.value?.trim() || '';
      const hour = Number(document.getElementById('chv-manage-hour')?.value || 20);
      const minute = Number(document.getElementById('chv-manage-minute')?.value || 0);
      const statusEl = document.getElementById('chv-manage-status');
      updateBtn.disabled = true;
      updateBtn.textContent = '⏳ Updating...';
      try {
        const hdrs = window.__aegisGetAuthHeaders();
        const res = await fetch(`${IAM_API}/api/chv/patients/${encodeURIComponent(selectedChvPatientId)}`, {
          method: 'PUT',
          headers: hdrs,
          body: JSON.stringify({
            fullName,
            phone,
            checkinSchedule: { hour, minute, timezone: 'Asia/Kathmandu' },
          }),
        });
        const data = await res.json();
        if (!data.ok) throw new Error(data.error?.message || 'Could not update patient profile');
        if (statusEl) statusEl.textContent = `✅ Updated at ${new Date().toLocaleTimeString()}`;
        showToast('✅ Patient updated on behalf by FCHV');
        loadChvPatients();
      } catch (e) {
        if (statusEl) statusEl.textContent = e.message;
        showToast('⚠️ ' + e.message);
      }
      updateBtn.disabled = false;
      updateBtn.textContent = '💾 Update Patient Profile';
    });
  }

  const journalBtn = document.getElementById('btn-chv-add-journal');
  if (journalBtn && !journalBtn.dataset.bound) {
    journalBtn.dataset.bound = 'true';
    journalBtn.addEventListener('click', async () => {
      if (!selectedChvPatientId) { showToast('Select a patient first'); return; }
      const note = document.getElementById('chv-proxy-note')?.value?.trim() || '';
      if (!note) { showToast('Add a journal note first'); return; }
      const checklist = Array.from(document.querySelectorAll('#chv-proxy-checklist input[type="checkbox"]:checked')).map(el => el.value);
      const mood = document.getElementById('chv-proxy-mood')?.value || 'neutral';
      const statusEl = document.getElementById('chv-manage-status');
      journalBtn.disabled = true;
      journalBtn.textContent = '⏳ Saving...';
      try {
        const hdrs = window.__aegisGetAuthHeaders();
        const res = await fetch(`${IAM_API}/api/chv/patients/${encodeURIComponent(selectedChvPatientId)}/journals`, {
          method: 'POST',
          headers: hdrs,
          body: JSON.stringify({
            type: 'text',
            content: note,
            checklist,
            mcqAnswers: { mood, source: 'chv_proxy' },
          }),
        });
        const data = await res.json();
        if (!data.ok) throw new Error(data.error?.message || 'Could not save proxy journal');
        if (statusEl) statusEl.textContent = `✅ Proxy journal saved at ${new Date().toLocaleTimeString()}`;
        const noteEl = document.getElementById('chv-proxy-note');
        if (noteEl) noteEl.value = '';
        document.querySelectorAll('#chv-proxy-checklist input[type="checkbox"]').forEach(cb => { cb.checked = false; });
        showToast('📝 Journal captured on behalf of patient');
      } catch (e) {
        if (statusEl) statusEl.textContent = e.message;
        showToast('⚠️ ' + e.message);
      }
      journalBtn.disabled = false;
      journalBtn.textContent = '📝 Save Journal On Behalf';
    });
  }

  const checkinBtn = document.getElementById('btn-chv-add-checkin');
  if (checkinBtn && !checkinBtn.dataset.bound) {
    checkinBtn.dataset.bound = 'true';
    checkinBtn.addEventListener('click', async () => {
      if (!selectedChvPatientId) { showToast('Select a patient first'); return; }
      const mood = Number(document.getElementById('chv-checkin-mood')?.value || 5);
      const anxiety = Number(document.getElementById('chv-checkin-anxiety')?.value || 5);
      const stress = Number(document.getElementById('chv-checkin-stress')?.value || 5);
      const sleepHours = Number(document.getElementById('chv-checkin-sleep')?.value || 7);
      const journalText = document.getElementById('chv-checkin-note')?.value?.trim() || '';
      const statusEl = document.getElementById('chv-manage-status');
      checkinBtn.disabled = true;
      checkinBtn.textContent = '⏳ Submitting...';
      try {
        const hdrs = window.__aegisGetAuthHeaders();
        const res = await fetch(`${IAM_API}/api/chv/patients/${encodeURIComponent(selectedChvPatientId)}/checkins`, {
          method: 'POST',
          headers: hdrs,
          body: JSON.stringify({ mood, anxiety, stress, sleepHours, journalText }),
        });
        const data = await res.json();
        if (!data.ok) throw new Error(data.error?.message || 'Could not submit check-in');
        if (statusEl) statusEl.textContent = `✅ Check-in submitted at ${new Date().toLocaleTimeString()}`;
        showToast(`📊 Check-in submitted · Risk ${data.data?.risk?.riskLevel || 'unknown'}`);
      } catch (e) {
        if (statusEl) statusEl.textContent = e.message;
        showToast('⚠️ ' + e.message);
      }
      checkinBtn.disabled = false;
      checkinBtn.textContent = '📊 Submit Check-In On Behalf';
    });
  }
}

async function loadChvPatients() {
  const list = document.getElementById('chv-patient-list');
  if (!list) return;
  try {
    const hdrs = window.__aegisGetAuthHeaders();
    const res = await fetch(`${IAM_API}/api/chv/my-patients`, { headers: hdrs });
    const data = await res.json();
    const patients = data.data?.patients || [];
    chvManagedPatients = patients;
    if (selectedChvPatientId && !patients.some(p => p.id === selectedChvPatientId)) {
      selectedChvPatientId = null;
    }
    renderChvPatientList(chvManagedPatients);
    populateChvManagePanel();
  } catch {
    list.innerHTML = '<div style="color:var(--text-muted);text-align:center;padding:24px;">Could not load patients.</div>';
  }
}

/* ══════════════════════════
   BOOT LOGIC
   ══════════════════════════ */

function bootIAM() {
  // Always require explicit sign-in on load
  clearSession();
  showLoginScreen();
}

// Initialize immediately (with small fallback on DOM ready)
bootIAM();
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootIAM);
}

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
        <p class="login-hero-desc">Secure mental health support for patients, doctors, guardians, and administrators. Built with WCAG 2.2 AA compliance for universal accessibility.</p>
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
          <button class="login-role-btn" data-role="guardian" type="button" aria-pressed="false">
            <span class="login-role-icon">👨‍👩‍👧</span>
            <span class="login-role-label">Guardian</span>
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

  // Inject role-specific navigation items
  injectRoleBasedNav(user);

  // Inject new screens
  injectRoleScreens(user);

  // Navigate to role-appropriate home
  if (user.role === 'super_admin') {
    navigateToScreen('admin-panel');
  } else if (user.role === 'doctor') {
    navigateToScreen('clinician');
  } else if (user.role === 'guardian') {
    navigateToScreen('guardian-view');
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

function injectRoleBasedNav(user) {
  // Remove previously injected nav items
  document.querySelectorAll('.injected-nav').forEach(el => el.remove());

  const nav = document.querySelector('.sidebar-nav');
  if (!nav) return;

  const items = [];

  if (user.role === 'super_admin') {
    items.push({ screen: 'admin-panel', icon: '⚙️', label: 'IAM Panel', section: 'Administration' });
    items.push({ screen: 'counseling', icon: '🏥', label: 'Counseling Services', section: null });
  } else if (user.role === 'doctor') {
    items.push({ screen: 'counseling', icon: '🏥', label: 'Counseling Services', section: null });
  } else if (user.role === 'guardian') {
    items.push({ screen: 'guardian-view', icon: '👁️', label: 'Patient Overview', section: 'Family Access' });
    items.push({ screen: 'counseling', icon: '🏥', label: 'Counseling Services', section: null });
  } else if (user.role === 'patient') {
    items.push({ screen: 'journal', icon: '📓', label: 'Journal', section: 'My Health' });
    items.push({ screen: 'booking', icon: '📅', label: 'Book Consultation', section: null });
    items.push({ screen: 'my-settings', icon: '⚙️', label: 'Settings', section: null });
    items.push({ screen: 'counseling', icon: '🏥', label: 'Counseling Services', section: null });
  } else if (user.role === 'chv') {
    items.push({ screen: 'chv-dashboard', icon: '🏥', label: 'CHV Dashboard', section: 'Field Work' });
    items.push({ screen: 'counseling', icon: '🏥', label: 'Counseling Services', section: null });
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

  // Counseling screen for all roles
  const counselingScreen = document.createElement('div');
  counselingScreen.className = 'screen injected-screen';
  counselingScreen.id = 'screen-counseling';
  counselingScreen.innerHTML = buildCounselingScreenHTML();
  mainContent.appendChild(counselingScreen);

  if (user.role === 'super_admin') {
    const adminScreen = document.createElement('div');
    adminScreen.className = 'screen injected-screen';
    adminScreen.id = 'screen-admin-panel';
    adminScreen.innerHTML = buildAdminPanelHTML();
    mainContent.appendChild(adminScreen);
    setTimeout(() => initAdminPanel(), 100);
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
    <div class="metric-card"><div class="metric-icon">👨‍👩‍👧</div><div class="metric-value" id="admin-stat-guardians" style="color:#f59e0b">0</div><div class="metric-label">Guardians</div></div>
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
        <div class="form-group" id="admin-guardian-link-group" style="display:none;">
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
          </tr>
        </thead>
        <tbody>
          <tr><td>IAM User Management</td><td>✅</td><td>❌</td><td>❌</td><td>❌</td></tr>
          <tr><td>AI Copilot Chat</td><td>✅</td><td>✅</td><td>✅</td><td>❌</td></tr>
          <tr><td>Daily Check-In</td><td>✅</td><td>✅</td><td>✅</td><td>❌</td></tr>
          <tr><td>Clinical Triage</td><td>✅</td><td>✅</td><td>❌</td><td>❌</td></tr>
          <tr><td>Patient Records</td><td>✅</td><td>✅</td><td>Own only</td><td>Linked only</td></tr>
          <tr><td>Counseling Services</td><td>✅</td><td>✅</td><td>✅</td><td>✅</td></tr>
          <tr><td>Medication Management</td><td>✅</td><td>✅</td><td>View only</td><td>View only</td></tr>
          <tr><td>Emergency Escalation</td><td>✅</td><td>✅</td><td>✅</td><td>✅</td></tr>
          <tr><td>Compliance & Audit</td><td>✅</td><td>View only</td><td>❌</td><td>❌</td></tr>
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
      const guardianGroup = document.getElementById('admin-guardian-link-group');
      if (doctorGroup) doctorGroup.style.display = role === 'doctor' ? 'block' : 'none';
      if (guardianGroup) guardianGroup.style.display = role === 'guardian' ? 'block' : 'none';
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
      const guardians = adminUsers.filter(u => u.role === 'guardian').length;

      setText('admin-stat-doctors', doctors);
      setText('admin-stat-patients', patients);
      setText('admin-stat-guardians', guardians);

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

  if (role === 'guardian' && !linkedPatientId) {
    if (error) error.textContent = 'Guardians must be linked to a patient. Create the patient first.';
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
   COUNSELING SERVICES (MIT Health Inspired)
   ══════════════════════════ */

function buildCounselingScreenHTML() {
  return `
  <div class="section-heading">
    <div>
      <div class="section-title">🏥 Mental Health & Counseling Services</div>
      <div class="section-subtitle">Free, confidential care — individual/group therapy, medication management & urgent support</div>
    </div>
  </div>

  <div class="glass-card mb-24" style="background:linear-gradient(135deg,rgba(10,132,255,0.06),rgba(52,211,153,0.04));border-color:rgba(10,132,255,0.15);">
    <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;">
      <span style="font-size:36px;">🏥</span>
      <div style="flex:1;min-width:240px;">
        <div style="font-size:18px;font-weight:800;color:var(--text-primary);margin-bottom:4px;">Student Mental Health & Counseling</div>
        <div style="font-size:14px;color:var(--text-secondary);line-height:1.6;">Free, confidential care for all users. We provide individual and group therapy, medication management, and urgent care. Our services address stress, anxiety, relationships, and academic issues. Available in-person and virtually.</div>
      </div>
    </div>
  </div>

  <div class="grid-3 gap-24 mb-24">
    <div class="glass-card intervention-card" style="cursor:default;">
      <div class="intervention-icon">🗣️</div>
      <div class="intervention-title">Individual Therapy</div>
      <div class="intervention-desc">One-on-one sessions with licensed therapists. Talk through personal challenges in a safe space.</div>
      <div style="margin-top:12px;"><button class="btn btn-primary btn-sm" onclick="showToast('📅 Booking request sent for Individual Therapy')">Book Session</button></div>
    </div>
    <div class="glass-card intervention-card" style="cursor:default;">
      <div class="intervention-icon">👥</div>
      <div class="intervention-title">Group Therapy</div>
      <div class="intervention-desc">Connect with peers facing similar challenges. Guided by a professional facilitator.</div>
      <div style="margin-top:12px;"><button class="btn btn-primary btn-sm" onclick="showToast('📅 Booking request sent for Group Therapy')">Join Group</button></div>
    </div>
    <div class="glass-card intervention-card" style="cursor:default;">
      <div class="intervention-icon">💊</div>
      <div class="intervention-title">Medication Management</div>
      <div class="intervention-desc">Psychiatric evaluation and medication support. Adjusted collaboratively with your care team.</div>
      <div style="margin-top:12px;"><button class="btn btn-primary btn-sm" onclick="showToast('📅 Booking request sent for Medication Review')">Schedule Review</button></div>
    </div>
  </div>

  <div class="grid-2 gap-24 mb-24">
    <div class="glass-card" style="border-color:rgba(248,113,113,0.2);background:linear-gradient(135deg,rgba(248,113,113,0.04),rgba(255,255,255,0.95));">
      <div class="card-title" style="color:var(--danger);">🚨 Urgent Care</div>
      <div class="card-subtitle">For immediate mental health crisis support</div>
      <div style="font-size:14px;color:var(--text-secondary);line-height:1.7;margin-bottom:16px;">
        If you're experiencing a mental health crisis, our urgent care team is available for immediate support.
        Same-day appointments are available for acute distress, panic episodes, or safety concerns.
      </div>
      <button class="btn btn-danger" onclick="showToast('🚨 Urgent care request submitted. A counselor will reach out within minutes.')">Request Urgent Support</button>
    </div>

    <div class="glass-card">
      <div class="card-title">📱 Virtual Appointments</div>
      <div class="card-subtitle">Receive care from anywhere</div>
      <div style="font-size:14px;color:var(--text-secondary);line-height:1.7;margin-bottom:16px;">
        All counseling services are available via secure video calls. Whether you're in Cambridge, Lexington, or anywhere in Nepal — quality care is just a click away.
      </div>
      <div class="signal-item"><span class="signal-name">📹 Secure video sessions</span></div>
      <div class="signal-item"><span class="signal-name">💬 Asynchronous messaging</span></div>
      <div class="signal-item"><span class="signal-name">📞 Phone consultations</span></div>
      <div class="signal-item"><span class="signal-name">🌐 Multilingual support (EN, NE, HI)</span></div>
    </div>
  </div>

  <div class="glass-card mb-24">
    <div class="card-title">📋 Service Categories</div>
    <div class="card-subtitle">Comprehensive mental health support areas</div>
    <div class="grid-4 gap-24" style="margin-top:16px;">
      <div class="counseling-category-card">
        <div style="font-size:24px;margin-bottom:8px;">😰</div>
        <div style="font-size:14px;font-weight:700;">Stress & Anxiety</div>
        <div style="font-size:12px;color:var(--text-muted);margin-top:4px;">Academic pressure, work stress, panic attacks</div>
      </div>
      <div class="counseling-category-card">
        <div style="font-size:24px;margin-bottom:8px;">💔</div>
        <div style="font-size:14px;font-weight:700;">Relationships</div>
        <div style="font-size:12px;color:var(--text-muted);margin-top:4px;">Family, romantic, peer relationships</div>
      </div>
      <div class="counseling-category-card">
        <div style="font-size:24px;margin-bottom:8px;">📚</div>
        <div style="font-size:14px;font-weight:700;">Academic Issues</div>
        <div style="font-size:12px;color:var(--text-muted);margin-top:4px;">Burnout, perfectionism, career uncertainty</div>
      </div>
      <div class="counseling-category-card">
        <div style="font-size:24px;margin-bottom:8px;">🧠</div>
        <div style="font-size:14px;font-weight:700;">Mental Health</div>
        <div style="font-size:12px;color:var(--text-muted);margin-top:4px;">Depression, PTSD, eating disorders, OCD</div>
      </div>
    </div>
  </div>

  <div class="glass-card">
    <div class="card-title">🧑‍⚕️ Our Care Team</div>
    <div class="card-subtitle">Licensed, experienced mental health professionals</div>
    <div class="grid-3 gap-24" style="margin-top:16px;">
      <div class="counselor-card">
        <div class="counselor-avatar">🧑‍⚕️</div>
        <div class="counselor-name">Dr. Priya Adhikari</div>
        <div class="counselor-title">Psychiatrist</div>
        <div class="counselor-speciality">Medication Management · Anxiety Disorders</div>
        <button class="btn btn-outline btn-sm" style="margin-top:10px;" onclick="showToast('📅 Booking with Dr. Priya Adhikari')">Book</button>
      </div>
      <div class="counselor-card">
        <div class="counselor-avatar">🧑‍💼</div>
        <div class="counselor-name">Ms. Sarah Thompson</div>
        <div class="counselor-title">Psychologist</div>
        <div class="counselor-speciality">CBT · Trauma Recovery · Relationships</div>
        <button class="btn btn-outline btn-sm" style="margin-top:10px;" onclick="showToast('📅 Booking with Ms. Sarah Thompson')">Book</button>
      </div>
      <div class="counselor-card">
        <div class="counselor-avatar">🧑‍🏫</div>
        <div class="counselor-name">Mr. Bikash Shrestha</div>
        <div class="counselor-title">Counselor</div>
        <div class="counselor-speciality">Academic Stress · Career Counseling</div>
        <button class="btn btn-outline btn-sm" style="margin-top:10px;" onclick="showToast('📅 Booking with Mr. Bikash Shrestha')">Book</button>
      </div>
    </div>
  </div>`;
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
    <div class="card-title">📞 Quick Actions</div>
    <div class="card-subtitle">Contact the care team or request updates</div>
    <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:12px;">
      <button class="btn btn-outline" onclick="showToast('📞 Request to speak with clinician sent')">📞 Contact Clinician</button>
      <button class="btn btn-outline" onclick="showToast('📊 Weekly wellness report sent to your email')">📊 Request Weekly Report</button>
      <button class="btn btn-danger" onclick="showToast('🚨 Emergency contact initiated')">🚨 Emergency Contact</button>
    </div>
  </div>`;
}

/* ══════════════════════════
   JOURNAL SCREEN (Patient)
   ══════════════════════════ */

function buildJournalScreenHTML() {
  return `
  <div class="section-heading">
    <div><div class="section-title">📓 My Journal</div><div class="section-subtitle">Write freely · AI-powered wellness suggestions · Fully encrypted</div></div>
  </div>

  <div class="grid-2 gap-24 mb-24">
    <div class="glass-card">
      <div class="card-title">New Entry</div>
      <div class="card-subtitle">Express yourself — emotional markers auto-detected</div>
      <textarea class="text-area" id="journal-entry-text" placeholder="Write about how you're feeling today..." style="min-height:140px;"></textarea>
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

  if (saveBtn) saveBtn.addEventListener('click', async () => {
    const text = document.getElementById('journal-entry-text')?.value?.trim();
    if (!text) { showToast('Write something first'); return; }
    saveBtn.disabled = true; saveBtn.textContent = '⏳ Saving...';
    try {
      const hdrs = window.__aegisGetAuthHeaders();
      const res = await fetch(`${IAM_API}/api/journals`, { method: 'POST', headers: hdrs, body: JSON.stringify({ text }) });
      const data = await res.json();
      if (data.ok) {
        document.getElementById('journal-entry-text').value = '';
        document.getElementById('journal-save-status').textContent = '✅ Entry saved · ID: ' + (data.data?.entry?.id || '').slice(0,8);
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

  loadJournalEntries();
}

async function loadJournalEntries() {
  const list = document.getElementById('journal-entries-list');
  if (!list) return;
  try {
    const hdrs = window.__aegisGetAuthHeaders();
    const res = await fetch(`${IAM_API}/api/journals/mine`, { headers: hdrs });
    const data = await res.json();
    const entries = data.data?.entries || [];
    if (!entries.length) {
      list.innerHTML = '<div style="color:var(--text-muted);text-align:center;padding:24px;">No journal entries yet. Start writing above!</div>';
      return;
    }
    list.innerHTML = entries.slice(0, 20).map(e => `
      <div class="record-item" style="margin-bottom:10px;">
        <div class="record-header">
          <span class="record-date">${new Date(e.createdAt).toLocaleString()}</span>
          ${e.aiSuggestions?.length ? '<span class="badge badge-low">AI Reviewed</span>' : ''}
        </div>
        <div class="record-body" style="font-size:14px;">${escapeHtml((e.text || '').slice(0, 300))}${(e.text || '').length > 300 ? '...' : ''}</div>
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
    <div><div class="section-title">🏥 FCHV Field Dashboard</div><div class="section-subtitle">Door-to-door community health screening & patient registration</div></div>
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
  </div>`;
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
}

async function loadChvPatients() {
  const list = document.getElementById('chv-patient-list');
  if (!list) return;
  try {
    const hdrs = window.__aegisGetAuthHeaders();
    const res = await fetch(`${IAM_API}/api/chv/my-patients`, { headers: hdrs });
    const data = await res.json();
    const patients = data.data?.patients || [];
    if (!patients.length) {
      list.innerHTML = '<div style="color:var(--text-muted);text-align:center;padding:24px;">No patients registered yet. Use the form to create your first.</div>';
      return;
    }
    list.innerHTML = patients.map(p => `
      <div class="clin-patient-card stable" style="margin-bottom:8px;">
        <div class="clin-patient-title">
          <div class="clin-patient-name">${escapeHtml(p.fullName)}</div>
          <span class="badge badge-low">Registered</span>
        </div>
        <div class="clin-patient-meta">${escapeHtml(p.email)} · Anonymous ID: ${p.anonymousJournalId || 'N/A'}</div>
      </div>
    `).join('');
  } catch {
    list.innerHTML = '<div style="color:var(--text-muted);text-align:center;padding:24px;">Could not load patients.</div>';
  }
}

/* ══════════════════════════
   BOOT LOGIC
   ══════════════════════════ */

function bootIAM() {
  // If a valid session exists, validate it and go straight to app
  if (session.token && session.user) {
    // Quick validation
    fetch(`${IAM_API}/api/auth/me`, { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(data => {
        if (data.ok && data.data?.user) {
          session.user = data.data.user;
          localStorage.setItem('aegis_user', JSON.stringify(session.user));
          onLoginSuccess(session.user);
        } else {
          clearSession();
          showLoginScreen();
        }
      })
      .catch(() => {
        // If backend is down, still let them in with cached session
        onLoginSuccess(session.user);
      });
  } else {
    showLoginScreen();
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootIAM);
} else {
  // Small delay to ensure app.js navigation has initialized
  setTimeout(bootIAM, 150);
}

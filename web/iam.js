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
};

const ROLE_ICONS = {
  super_admin: '🛡️',
  doctor: '🩺',
  patient: '🧑',
  guardian: '👨‍👩‍👧',
};

const ROLE_COLORS = {
  super_admin: '#8b5cf6',
  doctor: '#0ea5e9',
  patient: '#10b981',
  guardian: '#f59e0b',
};

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

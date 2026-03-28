<p align="center">
  <img src="https://img.shields.io/badge/Platform-iOS%20%7C%20Android%20%7C%20Web-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/AI-Google%20Gemini-orange?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Security-HIPAA%20%7C%20GDPR-green?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Architecture-Zero--Trust-critical?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Accessibility-WCAG%202.2%20AA-purple?style=for-the-badge" />
  <img src="https://img.shields.io/badge/IAM-Role%20Based-yellow?style=for-the-badge" />
</p>

# AegisSpeak - AI Mental Health Copilot

Predictive, personalized, privacy-first mental health support across mobile, web, and backend APIs.

AegisSpeak is designed for Nepal-US Hackathon 2026 problem statements:
- Reduce career pressure, burnout, and uncertainty for students and professionals.
- Lower stigma and improve early support in conservative communities.
- Provide free, confidential counseling services (MIT Health–inspired).

---

## What Is Implemented

### Core Platform
- Cross-platform experience:
  - **Mobile app** (Expo React Native, 13 screens).
  - **Web app** (single-page app with calm/full UX modes and 20+ views).
  - **Backend API** (Express + Gemini integration + local JSON persistence).

### Identity & Access Management (IAM)
- **Super Admin–controlled IAM system** — only super admin can create user accounts.
- **Role-based access control (RBAC)** with 4 user types:
  - 🛡️ **Super Admin** — Full system access, user management, compliance, analytics.
  - 🩺 **Doctor** (psychiatrist, psychologist, general) — Clinical triage, patient records, prescriptions.
  - 🧑 **Mental Patient** — Check-ins, AI copilot, journaling, milestones, counseling.
  - 👨‍👩‍👧 **Guardian** — Read-only linked patient monitoring, alerts, care team contact.
- **JWT authentication** with secure bcrypt password hashing.
- **Login portal** with role selector, demo credentials, password visibility toggle.
- **Access control matrix** showing feature permissions per role.
- **User directory** with search, filter, enable/disable, and delete.

### Counseling Services (MIT Health–Inspired)
- **Individual therapy** sessions with licensed therapists.
- **Group therapy** with peer support and professional facilitation.
- **Medication management** with psychiatric evaluation support.
- **Urgent care** for immediate mental health crisis support.
- **Virtual appointments** via secure video, messaging, and phone.
- **Service categories**: Stress & Anxiety, Relationships, Academic Issues, Mental Health.
- **Care team profiles** with speciality listings and booking.

### Accessibility & Design Standards (WCAG 2.2 AA)
- ♿ **Skip navigation** link for keyboard users.
- 🎯 **Focus indicators** (3px solid outline) on all interactive elements.
- 📐 **Touch targets** ≥ 44×44 CSS pixels for buttons and inputs.
- 🎨 **Color contrast** ≥ 4.5:1 for all text/background combinations.
- 🏷️ **Semantic HTML** (`<nav>`, `<main>`, `<form>`, `<label>`, `role` attributes).
- 📢 **ARIA live regions** for dynamic error messages and alerts.
- 🔇 **Reduced motion support** (`prefers-reduced-motion` media query).
- 📱 **Fully responsive** — mobile, tablet, and desktop layouts.
- 🍔 **Mobile hamburger menu** with auto-close on navigation.

### Problem-Statement Features
- **Career Compass**: 72-hour action-plan builder for exam/job/performance/financial uncertainty.
- **Early Support Pathway**: stigma-safe progressive ladder (self → peer → family → counselor → emergency).
- **Daily check-in** captures career pressure dimensions:
  - roleContext, deadlinePressure, roleUncertainty
  - financialStress, belongingSafety, stigmaSafePreferred, trustedContact

### Backend Intelligence
- Risk scoring includes career pressure and uncertainty factors.
- Context-aware interventions use payload-aware planning.
- API responses use structured envelope:
  - `ok`, `data`, `meta`, `error` (for failures)

---

## Architecture Overview

### Frontend Mobile
- React Native + Expo SDK 51
- TypeScript
- AsyncStorage and UI token system

### Frontend Web
- HTML/CSS/Vanilla JS with Inter (Google Fonts) typography
- Calm mode for lower cognitive load (WHO-aligned)
- Full mode for advanced analytics and clinician workflows
- IAM: role-based navigation injection and screen rendering

### Backend
- Node.js + Express (ES modules)
- Google Gemini for chat/summary/sentiment
- Local file stores for check-ins, escalations, and users
- JWT auth with bcrypt password hashing
- Role-based middleware (`requireAuth`, `requireRole`)

### Security Model
- AES-256-GCM payload encryption support
- SHA-256 audit hashes
- Ephemeral raw-audio handling flow
- JWT with 24h expiry and secure token management

---

## Project Structure

```text
Nepal-US-Hackathon-2026/
├── backend/
│   ├── .env.example
│   ├── package.json
│   ├── data/
│   │   ├── checkins.json
│   │   ├── escalations.json
│   │   └── users.json            ← IAM user store
│   └── src/
│       ├── index.js               ← Express app + IAM endpoints
│       ├── lib/
│       │   ├── auth.js            ← JWT + RBAC middleware
│       │   ├── gemini.js
│       │   ├── insights.js
│       │   ├── interventions.js
│       │   ├── scoring.js
│       │   ├── security.js
│       │   └── transport.js
│       └── store/
│           ├── checkinStore.js
│           ├── escalationStore.js
│           └── userStore.js       ← User CRUD + seed admin
├── frontend/
│   ├── App.tsx
│   ├── package.json
│   └── src/
│       ├── api.ts
│       ├── components.tsx
│       ├── constants.ts
│       ├── mockData.ts
│       ├── theme.ts
│       ├── types.ts
│       └── screens/
│           ├── AlertsScreen.tsx
│           ├── CheckinScreen.tsx
│           ├── ClinicianScreen.tsx
│           ├── CommunityScreen.tsx
│           ├── ComplianceScreen.tsx
│           ├── CopilotScreen.tsx
│           ├── InsightsScreen.tsx
│           ├── MilestonesScreen.tsx
│           ├── PrivacyScreen.tsx
│           ├── SignalsScreen.tsx
│           ├── TriageScreen.tsx
│           ├── VaultScreen.tsx
│           └── WipeLogScreen.tsx
├── web/
│   ├── app.js                     ← Core SPA logic + navigation
│   ├── features.js                ← Enhanced modules
│   ├── iam.js                     ← IAM login + admin panel + counseling
│   ├── index.html                 ← Main entry point
│   └── styles.css                 ← Design system + IAM styles
└── README.md
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm 9+
- Google Gemini API key (optional but recommended for AI quality)

### 1) Backend + Web

```bash
cd backend
copy .env.example .env   # or: cp .env.example .env
npm install
npm run dev
```

Backend runs on `http://localhost:4000` and serves the web app from the same origin.

### Default Super Admin Credentials
| Field | Value |
|-------|-------|
| Email | `admin@aegisspeak.com` |
| Password | `AegisAdmin@2026` |

### 2) Mobile (Expo)

```bash
cd frontend
npm install
npx expo start
```

Then press:
- `i` for iOS simulator
- `a` for Android emulator
- `w` for web preview

---

## API Endpoints

### Public
| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |

### Authentication
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/login` | Login (returns JWT + user) |
| GET | `/api/auth/me` | Get current user profile (auth required) |

### IAM (Super Admin only)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/iam/users` | Create user |
| GET | `/api/iam/users` | List all users (filter by `?role=`) |
| GET | `/api/iam/users/:userId` | Get user by ID |
| PUT | `/api/iam/users/:userId` | Update user |
| DELETE | `/api/iam/users/:userId` | Delete user |
| GET | `/api/iam/patients/:patientId/guardians` | List guardians for patient |
| GET | `/api/iam/my-patient` | Guardian: get linked patient |

### Core Features
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/checkins` | Submit daily check-in |
| POST | `/api/chat` | AI copilot chat |
| POST | `/api/journal/analyze` | Journal sentiment analysis |
| GET | `/api/users/:userId/trends` | Mood trends |
| GET | `/api/users/:userId/records` | Check-in records |
| GET | `/api/users/:userId/insights` | Predictive insights |
| POST | `/api/transport/sms` | SMS/USSD fallback |
| POST | `/api/escalations` | Create escalation |
| GET | `/api/users/:userId/escalations` | List escalations |

---

## UX Modes (Web)

- **Calm mode** (default):
  - Reduced interface complexity and lower stimulation.
  - Safer default for distressed users.
  - WHO-aligned cognitive load management.
  - Animations disabled, subtler visual effects.

- **Full mode**:
  - Access to advanced analytics, triage, alerts, and compliance views.
  - Voice Lab, Signals, Screening, and Insights screens.
  - Full clinician workflows and data export.

---

## User Roles & Access Matrix

| Feature | 🛡️ Admin | 🩺 Doctor | 🧑 Patient | 👨‍👩‍👧 Guardian |
|---------|----------|----------|-----------|-----------|
| IAM User Management | ✅ | ❌ | ❌ | ❌ |
| AI Copilot Chat | ✅ | ✅ | ✅ | ❌ |
| Daily Check-In | ✅ | ✅ | ✅ | ❌ |
| Clinical Triage | ✅ | ✅ | ❌ | ❌ |
| Patient Records | ✅ | ✅ | Own only | Linked only |
| Counseling Services | ✅ | ✅ | ✅ | ✅ |
| Medication Management | ✅ | ✅ | View only | View only |
| Emergency Escalation | ✅ | ✅ | ✅ | ✅ |
| Compliance & Audit | ✅ | View only | ❌ | ❌ |

---

## Hackathon Value

AegisSpeak is built for low-resource, stigma-sensitive contexts:
- 🌐 Multilingual support (English, Nepali, Hindi paths)
- 📶 Offline-friendly workflows
- 📲 SMS/USSD fallback support
- 🔐 Privacy-first, clinician-aware architecture
- ♿ WCAG 2.2 AA accessible
- 🏥 MIT Health–inspired free counseling services

<p align="center">
  <strong>Built for Nepal-US Hackathon 2026</strong><br/>
  <em>Mental health support that is early, private, and actionable.</em>
</p>

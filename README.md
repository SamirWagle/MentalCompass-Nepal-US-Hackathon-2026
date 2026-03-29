<p align="center">
  <img src="https://img.shields.io/badge/Platform-iOS%20%7C%20Android%20%7C%20Web-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/AI-Azure%20OpenAI-orange?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Security-HIPAA%20%7C%20GDPR-green?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Architecture-Zero--Trust-critical?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Accessibility-WCAG%202.2%20AA-purple?style=for-the-badge" />
  <img src="https://img.shields.io/badge/IAM-Role%20Based-yellow?style=for-the-badge" />
</p>

# AegisSpeak - AI Mental Health Copilot

A journaling-first mental health platform with an anonymous pipeline connecting patients, doctors, and community health volunteers. Users journal daily; doctors review anonymized data; AI provides gentle habit suggestions — never diagnoses.

Built for Nepal-US Hackathon 2026:
- Reduce career pressure, burnout, and uncertainty for students and professionals.
- Lower stigma and improve early support in conservative communities.
- Digitize community health volunteer door-to-door screening.
- Provide free, confidential counseling services (MIT Health–inspired).

---

## What Is Implemented

### Core Platform
- Cross-platform experience:
  - **Mobile app** (Expo React Native, 13 screens).
  - **Web app** (single-page app with calm/full UX modes and 20+ views).
  - **Backend API** (Express + Azure OpenAI integration + local JSON persistence).

### Identity & Access Management (IAM)
- **Super Admin–controlled IAM system** — only super admin (and CHVs for patients) can create accounts.
- **Role-based access control (RBAC)** with 5 user types:
  - 🛡️ **Super Admin** — Full system access, user management, compliance, doctor verification.
  - 🩺 **Doctor** (psychiatrist, psychologist, general) — Reads anonymized journals by ID, rates conditions, consults. **Pays to onboard.**
  - 🧑 **Patient** — Daily journaling (text/voice/wearable), receives AI habit suggestions, opts into doctor consultation. **Pays on consult only.**
  - 👨‍👩‍👧 **Guardian** — Read-only linked patient monitoring, alerts, care team contact.
  - 👩‍⚕️ **FCHV/CHV (Community Health Volunteer)** — Mini Admin for low-connectivity/offline communities: creates patient accounts and performs updates/check-ins/journal capture on behalf of managed patients.
- **Anonymous IDs** — Patients get `JRN-XXXX` format IDs. Doctors NEVER see real names.
- **JWT authentication** with secure bcrypt password hashing.

### Journaling System (Core Product)
- **Multi-input journaling**: text, audio, video, wearable data, scheduled calls.
- **AI sentiment analysis** on each entry (Azure OpenAI with local fallback).
- **AI gentle suggestions**: music, articles, exercises, breathing — **NEVER diagnoses**.
- **Doctor anonymous reader**: views journals by anonymous ID, rates depression/stress/anxiety.
- **Decline detection**: AI monitors 1-month patterns and gently asks "Would you like to meet a doctor?"
- **Right to reject**: Patient can decline consultation — reason tracked but respected.
- **FCHV proxy capture**: field worker can submit journals/check-ins on behalf of patients with no smartphone access.

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
- FCHV role is intentionally simplified to show only FCHV-required workflows

### Backend
- Node.js + Express (ES modules)
- Azure OpenAI for chat/summary/sentiment
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
│   │   ├── journals.json          ← Journal entries (anonymous pipeline)
│   │   └── users.json             ← IAM user store (with anonymousIds)
│   └── src/
│       ├── index.js                ← Express app + all API routes
│       ├── lib/
│       │   ├── auth.js             ← JWT + RBAC middleware
│       │   ├── gemini.js           ← Azure OpenAI integration helpers
│       │   ├── insights.js
│       │   ├── interventions.js
│       │   ├── scoring.js
│       │   ├── security.js
│       │   ├── suggestions.js      ← AI gentle suggestion engine
│       │   └── transport.js
│       └── store/
│           ├── checkinStore.js
│           ├── escalationStore.js
│           ├── journalStore.js     ← Journal CRUD + anonymous reader
│           └── userStore.js        ← User CRUD + CHV + anonymous IDs
├── frontend/
│   └── ... (Expo React Native)
├── scripts/
│   └── seed_demo.py               ← Python demo data generator
├── web/
│   ├── app.js
│   ├── features.js
│   ├── iam.js                      ← Login + admin panel + counseling
│   ├── index.html
│   └── styles.css
└── README.md
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm 9+
- Azure OpenAI endpoint, API key, and deployment name

### 1) Backend + Web

```bash
cd backend
copy .env.example .env   # or: cp .env.example .env
npm install
npm run dev
```

Backend runs on `http://localhost:4000` and serves the web app from the same origin.

LLM provider configuration in `.env`:
- Azure OpenAI (primary LLM provider):
  - `AZURE_OPENAI_ENDPOINT`
  - `AZURE_OPENAI_API_KEY`
  - `AZURE_OPENAI_DEPLOYMENT`
  - `AZURE_OPENAI_API_VERSION` (default `2024-10-21`)

### Default Super Admin Credentials
| Field | Value |
|-------|-------|
| Email | `admin@aegisspeak.com` |
| Password | `AegisAdmin@2026` |

### 3) Seed Demo Data (optional)

```bash
pip install requests
python3 scripts/seed_demo.py
```

This creates 5 patients, 2 doctors, 1 CHV, 50+ journal entries, and doctor assessments.

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

### Journaling (Patient only)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/journals` | Create journal entry (text/voice/wearable) → returns AI suggestions |
| GET | `/api/journals/mine` | Get own journals + stats + consultation suggestion |
| POST | `/api/journals/decline-consult` | Decline doctor consultation (reason tracked) |

### Doctor (Anonymized Reader)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/doctor/queue` | Get queue of anonymous patient IDs with journal counts |
| GET | `/api/doctor/journals/:anonymousId` | Read journals for an anonymous ID (NO real identity) |
| POST | `/api/doctor/assess/:entryId` | Submit assessment (depression, stress, anxiety scores) |

### CHV (Community Health Volunteer)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/chv/create-patient` | Create patient account (Mini Admin privilege, optional initial intake note) |
| GET | `/api/chv/my-patients` | List patients created by this CHV |
| PUT | `/api/chv/patients/:patientId` | Update managed patient profile + check-in schedule on behalf |
| POST | `/api/chv/patients/:patientId/journals` | Submit journal entry on behalf of managed patient |
| POST | `/api/chv/patients/:patientId/checkins` | Submit check-in on behalf of managed patient |

Notes:
- CHV/FCHV can manage only patients they created.
- Super Admin can use the same CHV endpoints across all patients.

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

| Feature | 🛡️ Admin | 🩺 Doctor | 🧑 Patient | 👨‍👩‍👧 Guardian | 👩‍⚕️ CHV |
|---------|----------|----------|-----------|-----------|---------|
| IAM User Management | ✅ | ❌ | ❌ | ❌ | Patients only |
| Journaling | ✅ | ❌ | ✅ (own) | ❌ | ✅ (on behalf of managed patients) |
| Anonymous Journal Reader | ✅ | ✅ (by ID) | ❌ | ❌ | ❌ |
| Doctor Assessments | ✅ | ✅ | ❌ | ❌ | ❌ |
| AI Suggestions | ✅ | ❌ | ✅ (auto) | ❌ | ❌ |
| Counseling Services | ✅ | ✅ | ✅ | ✅ | ✅ |
| Patient Records | ✅ | Anonymous only | Own only | Linked only | Created/managed only |
| Emergency Escalation | ✅ | ✅ | ✅ | ✅ | ✅ |
| Screening (door-to-door) | ✅ | ❌ | ❌ | ❌ | ✅ |
| Compliance & Audit | ✅ | View only | ❌ | ❌ | ❌ |

### FCHV-Focused Web UX

- FCHV sees only FCHV-relevant navigation and screens.
- Hidden from FCHV UI: doctor dashboard/journal/care operations, patient self-service screens, guardian screens, and admin-only surfaces.
- Exposed to FCHV UI:
  - Register new patient
  - View/select managed patients
  - Update patient profile and check-in schedule on behalf
  - Save proxy journal entry
  - Submit proxy check-in

---

## Hackathon Value

AegisSpeak is built for low-resource, stigma-sensitive contexts:
- 📝 **Journaling-first** — no clinical language, just daily reflections
- 🔒 **Anonymous pipeline** — doctors never see patient names, only `JRN-XXXX` IDs
- 🤖 **AI never diagnoses** — only suggests music, articles, exercises, breathing
- 👩‍⚕️ **CHV integration** — digitalized door-to-door screening (FCHV model)
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


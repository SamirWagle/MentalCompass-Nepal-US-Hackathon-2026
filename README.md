<p align="center">
  <img src="https://img.shields.io/badge/Platform-iOS%20%7C%20Android%20%7C%20Web-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/AI-Google%20Gemini-orange?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Security-HIPAA%20%7C%20GDPR-green?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Architecture-Zero--Trust-critical?style=for-the-badge" />
</p>

# AegisSpeak - AI Mental Health Copilot

Predictive, personalized, privacy-first mental health support across mobile, web, and backend APIs.

AegisSpeak is designed for Nepal-US Hackathon 2026 problem statements:
- Reduce career pressure, burnout, and uncertainty for students and professionals.
- Lower stigma and improve early support in conservative communities.

## What Is Implemented

- Cross-platform experience:
  - Mobile app (Expo React Native, 13 screens).
  - Web app (single-page app with calm/full UX modes and 18 views).
  - Backend API (Express + Gemini integration + local JSON persistence).

- Problem-statement focused web features:
  - Career Compass: 72-hour action-plan builder for exam/job/performance/financial uncertainty.
  - Early Support Pathway: stigma-safe progressive ladder (self, peer, family, counselor, emergency).
  - Daily check-in now captures career pressure dimensions:
    - roleContext
    - deadlinePressure
    - roleUncertainty
    - financialStress
    - belongingSafety
    - stigmaSafePreferred
    - trustedContact

- Backend intelligence:
  - Risk scoring now includes career pressure and uncertainty factors.
  - Context-aware interventions use payload-aware planning.
  - API responses use a structured envelope for compatibility:
    - ok
    - data
    - meta
    - error (for failures)

## Architecture Overview

- Frontend mobile:
  - React Native + Expo SDK 51
  - TypeScript
  - AsyncStorage and UI token system

- Frontend web:
  - HTML/CSS/Vanilla JS
  - Calm mode for lower cognitive load
  - Full mode for advanced analytics and clinician workflows

- Backend:
  - Node.js + Express (ES modules)
  - Google Gemini for chat/summary/sentiment
  - Local file stores for check-ins and escalations

- Security model:
  - AES-256-GCM payload encryption support
  - SHA-256 audit hashes
  - Ephemeral raw-audio handling flow

## Project Structure

```text
Nepal-US-Hackathon-2026/
├── backend/
│   ├── .env.example
│   ├── package.json
│   ├── data/
│   │   ├── checkins.json
│   │   └── escalations.json
│   └── src/
│       ├── index.js
│       ├── lib/
│       │   ├── gemini.js
│       │   ├── insights.js
│       │   ├── interventions.js
│       │   ├── scoring.js
│       │   ├── security.js
│       │   └── transport.js
│       └── store/
│           ├── checkinStore.js
│           └── escalationStore.js
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
│   ├── app.js
│   ├── features.js
│   ├── index.html
│   └── styles.css
└── README.md
```

## Quick Start

### Prerequisites
- Node.js 18+
- npm 9+
- Google Gemini API key (optional but recommended for AI quality)

### 1) Backend + Web

```bash
cd backend
copy .env.example .env
npm install
npm run dev
```

Backend runs on `http://localhost:4000` and serves the web app from the same origin.

### 2) Mobile (Expo)

```bash
cd frontend
npm install
npx expo start
```

Then press:
- i for iOS simulator
- a for Android emulator
- w for web preview

## API Endpoints

- GET `/health`
- POST `/api/checkins`
- POST `/api/chat`
- POST `/api/journal/analyze`
- GET `/api/users/:userId/trends`
- GET `/api/users/:userId/records`
- GET `/api/users/:userId/insights`
- POST `/api/transport/sms`
- POST `/api/escalations`
- GET `/api/users/:userId/escalations`

## UX Modes (Web)

- Calm mode:
  - Reduced interface complexity and lower stimulation.
  - Safer default for distressed users.

- Full mode:
  - Access to advanced analytics, triage, alerts, and compliance views.

## Hackathon Value

AegisSpeak is built for low-resource, stigma-sensitive contexts:
- Multilingual support (English, Nepali, Hindi paths)
- Offline-friendly workflows
- SMS/USSD fallback support
- Privacy-first, clinician-aware architecture

<p align="center">
  <strong>Built for Nepal-US Hackathon 2026</strong><br/>
  <em>Mental health support that is early, private, and actionable.</em>
</p>

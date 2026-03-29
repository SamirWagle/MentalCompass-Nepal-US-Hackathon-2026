# AegisSpeak - React Web App

A unified React + TypeScript mental health companion web application, consolidating all features from the previous Expo and vanilla JS implementations.

## 📁 Project Structure

```
app/
├── src/
│   ├── components/
│   │   ├── common/              # Shared components
│   │   │   ├── Layout.tsx       # Main app layout with sidebar
│   │   │   ├── Sidebar.tsx      # Navigation sidebar
│   │   │   └── *.css            # Component styles
│   │   └── screens/             # Full page screens
│   │       ├── DashboardScreen.tsx      # Home screen with wellness overview
│   │       ├── CopilotScreen.tsx        # AI chat interface
│   │       ├── CheckinScreen.tsx        # Multi-step mood/vitals check-in
│   │       ├── ClinicianScreen.tsx      # Patient triage & monitoring dashboard
│   │       ├── InsightsScreen.tsx       # Predictive analytics
│   │       ├── SignalsScreen.tsx        # Voice biomarker analysis
│   │       ├── PrivacyScreen.tsx        # Data control & compliance
│   │       └── *.css            # Screen-specific styles
│   ├── hooks/
│   │   └── useApp.tsx           # Global app context & state management
│   ├── types/
│   │   └── index.ts             # TypeScript type definitions
│   ├── utils/
│   │   ├── api.ts               # Backend API client
│   │   ├── constants.ts         # App constants & demo data
│   │   └── theme.ts             # Design system tokens
│   ├── styles/
│   │   └── global.ts            # Global CSS variables
│   ├── App.tsx                  # Root component & screen router
│   ├── App.css                  # App-level styles
│   ├── main.tsx                 # React entry point
│   └── index.ts                 # Public exports
├── public/                       # Static assets
├── index.html                    # HTML entry point
├── vite.config.ts               # Vite build configuration
├── tsconfig.json                # TypeScript configuration
├── package.json                 # Dependencies & scripts
└── .gitignore                   # Git ignore rules
```

## 🚀 Getting Started

### Installation

```bash
cd app
npm install
```

### Development Server

```bash
npm run dev
```

The app will run on `http://localhost:3000` with hot module reloading.

### Build for Production

```bash
npm run build
```

Generates optimized production assets in `dist/` folder.

### Type Checking

```bash
npm run type-check
```

Validates TypeScript code without emitting files.

## 🎨 Design System

All styling follows an Apple-inspired design language with:
- **Color palette**: Blues (#0a84ff), Greens (#30d158), Reds (#ff453a), Oranges (#ff9f0a)
- **Spacing**: 8px rhythm scale (12px, 16px, 20px, 28px, etc.)
- **Typography**: Inter font family with clear hierarchy
- **Shadows**: Subtle depth with glassmorphic effects
- **Animations**: Smooth transitions and spring effects

See `src/utils/theme.ts` for all design tokens.

## 🧠 Features

### Core Screens

- **Dashboard**: Wellness overview with mood, sleep, activity metrics
- **Copilot**: 24/7 AI-powered mental health chat
- **Daily Check-In**: 4-step mood, anxiety, stress, and sleep assessment
- **Clinician Dashboard**: Patient triage with risk stratification and vital trends
- **Predictive Insights**: Burnout and depression risk analysis with recommendations
- **Voice Signals**: Passive voice biomarker analysis (speech rate, pause ratio, pitch variability)
- **Privacy & Data**: Full GDPR/HIPAA compliance, data export/deletion controls

### State Management

App state is managed via React Context (`useApp` hook) with localStorage persistence:
- Current screen navigation
- UX mode (calm/full)
- User preferences (language, personality, notifications)
- Chat history
- Memory items
- All data survives page reloads

### API Integration

The app connects to a Node.js/Express backend on `http://localhost:4000`:
- `POST /api/checkins` – Submit mood/vitals data
- `POST /api/chat` – Send messages to AI copilot
- `GET /api/users/:id/trends` – Fetch mood trends
- `GET /api/users/:id/insights` – Fetch predictive insights
- `POST /api/escalations` – Raise crisis alerts
- `GET /health` – Service health check

See `src/utils/api.ts` for all endpoints.

## 🛠️ Technology Stack

- **Framework**: React 18.2 with React Router
- **Language**: TypeScript 5.3
- **Bundler**: Vite 5.0
- **Styling**: CSS Modules with design tokens
- **State**: React Context API + localStorage
- **Icons**: Lucide React (or inline emojis)

## 📝 Development Notes

### Path Aliases

Configured in `tsconfig.json` and `vite.config.ts`:
```
@components → src/components
@screens → src/components/screens
@hooks → src/hooks
@utils → src/utils
@types → src/types
@styles → src/styles
```

### Environment Variables

Create `.env.local`:
```
VITE_API_BASE=http://localhost:4000
```

### Adding New Screens

1. Create `src/components/screens/NewScreen.tsx`
2. Add styles `src/components/screens/NewScreen.css`
3. Update `ScreenKey` type in `src/types/index.ts`
4. Add route in `src/App.tsx`
5. Add navigation item in `src/components/common/Sidebar.tsx`

## 📦 What Changed

This unified React app consolidates:
- ✅ **Expo (React Native)** screens → React web components
- ✅ **Vanilla JS web app** → React state management
- ✅ **Styling** → CSS modules with design tokens
- ✅ **Navigation** → React-based routing
- ✅ **All features** → Single cohesive application

**Deleted**: `/frontend` (Expo) and `/web` (vanilla JS) directories

## 🔄 Next Steps

1. **Run dev server**: `npm run dev`
2. **Connect to backend**: Ensure backend runs on `http://localhost:4000`
3. **Test endpoints**: Check browser console for API errors
4. **Deploy**: Build with `npm run build`, deploy `dist/` to hosting

## 🐛 Troubleshooting

**"npm: not found"** → Install Node.js from nodejs.org

**"Module not found"** → Run `npm install` again

**"API errors"** → Check backend is running on port 4000

**"TypeScript errors"** → Run `npm run type-check` for detailed errors

## 📄 License

MIT - See LICENSE file in root directory

---

**Questions?** Check `/backend` for API documentation or refer to React docs at react.dev

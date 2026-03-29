# Mental Compass — Pattern Ruleset

> **MANDATORY READ** before writing any new backend or frontend code for this project.
> All new code MUST follow these conventions exactly. Deviation = rejection.

---

## 1. Backend Node.js Patterns (Express + ES Modules)

### 1.1 Response Envelope

Always use the project helpers. Never call `res.json()` directly.

```js
// ✅ Correct
sendOk(req, res, { userId, journals }, 200, { domain: 'journals' });
sendError(req, res, 400, 'MISSING_FIELDS', 'content is required.');

// ❌ Wrong
res.json({ success: true, data });
res.status(400).json({ message: 'error' });
```

`sendOk` shape: `{ ok: true, ...data, data, meta: { requestId, timestamp, ...extra } }`  
`sendError` shape: `{ ok: false, error: { code, message, details }, meta }`

### 1.2 Route Pattern

```js
app.post('/api/resource', requireAuth, requireRole(ROLES.PATIENT), async (req, res) => {
  try {
    const { field } = req.body || {};
    if (!field) return sendError(req, res, 400, 'MISSING_FIELDS', 'field is required.');
    const result = doSomething(field);
    sendOk(req, res, { result }, 201, { domain: 'resource' });
  } catch (err) {
    sendError(req, res, 500, 'RESOURCE_ERROR', err.message);
  }
});
```

### 1.3 Store Pattern

Every new store lives in `backend/src/store/xxxStore.js`. This is the canonical template:

```js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORE_PATH = path.resolve(__dirname, '../../data/xxx.json');

function readStore() {
  try {
    if (!fs.existsSync(STORE_PATH)) { fs.writeFileSync(STORE_PATH, '[]', 'utf-8'); return []; }
    return JSON.parse(fs.readFileSync(STORE_PATH, 'utf-8'));
  } catch { return []; }
}

function writeStore(data) {
  fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export function createXxx({ ...fields }) { ... }
export function listXxx(filter) { ... }
```

### 1.4 Lib Pattern

Pure functions only. No side effects. No imports of express. Imported in `index.js`.

```js
// backend/src/lib/myFeature.js
export function computeSomething(input) { ... }
export function buildPayload(data) { ... }
```

### 1.5 Roles & Auth

```js
import { ROLES } from './store/userStore.js';
// ROLES: super_admin | doctor | patient | guardian | chv

// Single role guard
requireRole(ROLES.PATIENT)

// Multiple allowed roles
requireRole(ROLES.DOCTOR, ROLES.SUPER_ADMIN)
```

`req.user` is always the full sanitized user object (no password). Contains: `id`, `email`, `role`, `fullName`, `anonymousId`, `doctorType`, `subscription`, etc.

### 1.6 PHI & Anonymity

- **NEVER** expose `userId` in doctor-facing endpoints. Only `anonymousId` (`JRN-XXXX`).
- **NEVER** expose real names in `/api/doctor/*` routes.
- Sensitive biometrics MUST be encrypted with `encryptPayload()` from `lib/security.js`.
- Mirror `sanitizeForDoctor()` pattern for all doctor-visible objects.

### 1.7 Error Codes

All error codes are `SCREAMING_SNAKE_CASE`, e.g., `MISSING_FIELDS`, `NOT_FOUND`, `FORBIDDEN`, `JOURNAL_ERROR`.

---

## 2. Frontend Mobile Patterns (React Native + Expo TypeScript)

### 2.1 Theme System

**Always** import `theme` from `./theme`. Never hardcode hex values in new screens.

```ts
import { theme } from '../theme';
// Use: theme.accent, theme.danger, theme.success, theme.bg, theme.card,
//      theme.text, theme.textDim, theme.textMuted, theme.cardBorder,
//      theme.radiusSm (12), theme.radiusMd (16), theme.radiusLg (22), theme.radiusXl (28)
```

Exception: `ClinicianScreen.tsx` has its own local `COLOR` object — leave it alone.

### 2.2 Typography Scale

Use `fontFamily: 'System'` (SF Pro on iOS, Roboto on Android). Never load external fonts in React Native.

| Usage | fontSize | fontWeight |
|---|---|---|
| Caption / label | 11 | 600 |
| Body small | 13 | 400/600 |
| Body | 15 | 400 |
| Body large | 17 | 500 |
| Title small | 19 | 700 |
| Title | 22 | 800 |
| Hero | 28 | 800 |

### 2.3 Shared Components

Compose from `src/components.tsx`. Always use these before building custom:
- `SectionCard` — card with title + subtitle + children
- `NavChip` — navigation tab pill
- `StatPill` — metric label + value display
- `MetricStepper` — ± stepper for numeric inputs
- `SmallInputRow` — label + text input inline
- `ToggleRow` — label + iOS-style switch
- `HabitBar` — progress bar with color-coded fill
- `SignalRow` — dot + label + value row
- `ChoiceChip` — selectable option chip

New shared components go in `components.tsx` as named exports.

### 2.4 Spacing (4pt Grid)

```
Card internal padding:      18px
Screen content padding:     12px
Gap between chips:          8px
Gap between cards:          14px
Section header margin-bottom: 13px
Touch target minimum:       44×44px → enforce with: { minHeight: 44, minWidth: 44 }
```

### 2.5 Screen Template

```tsx
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SectionCard } from '../components';
import { theme } from '../theme';

type Props = { ... };

export default function XxxScreen({ ... }: Props) {
  return (
    <ScrollView contentContainerStyle={s.content}>
      <SectionCard title="Title" subtitle="Subtitle">
        {/* content */}
      </SectionCard>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  content: { padding: 12, paddingBottom: 60 },
});
```

### 2.6 API Calls

All API calls live in `src/api.ts`. Pattern:

```ts
export async function doThing(payload: PayloadType, token: string): Promise<ResultType> {
  const response = await fetch(`${API_BASE}/api/endpoint`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseApiResponse<ResultType>(response, 'Fallback error message');
}
```

### 2.7 Cross-Platform (Web vs Native)

```ts
const Recharts: any = Platform.OS === 'web' ? require('recharts') : null;
const Lucide: any = Platform.OS === 'web' ? require('lucide-react') : null;
const Motion: any = Platform.OS === 'web' ? require('framer-motion') : null;

// Always provide a React Native fallback when the web library is absent
if (Platform.OS === 'web' && Recharts) {
  return <WebChart />;
}
return <NativeFallback />;
```

### 2.8 Screen Registration

New screens must be added to:
1. `ScreenKey` union type in `constants.ts`
2. `tabs` array in `App.tsx`
3. `<AnimatedScreen>` block in `App.tsx`

### 2.9 AI & Suggestions — CRITICAL RULE

The AI engine MUST NEVER:
- Diagnose the user
- Call them "mad", "depressed", "mentally ill", or similar
- Use aggressive medical terminology
- Suggest medication

It ONLY provides: gentle lifestyle habits, music, articles, exercises, breathing techniques.

### 2.10 Dark Mode Scaffold

Add `useColorScheme()` import to new screens but don't implement full dark mode yet:
```ts
// Scaffold only — dark mode Phase 5
// const colorScheme = useColorScheme();
```

---

## 3. Frontend Web Patterns (`/web/`)

- Pure HTML/CSS/Vanilla JS — no framework, no build step.
- Typography: `Inter` (Google Fonts) — already loaded.
- Event handling: `addEventListener` + `document.querySelector`.
- State: module-level variables + DOM mutation.
- API calls: `fetch` with `Authorization: Bearer ${token}` header.
- All UI follows calm mode by default; full mode unlocked by toggle.

---

## 4. Data Privacy Rules (Enforced at All Layers)

| Data | Rule |
|---|---|
| Patient real name | Never sent to doctor endpoints |
| Patient email/phone | Never sent to doctor endpoints |
| `userId` | Never in doctor-facing response — use `anonymousId` only |
| Biometric data | Encrypted with `encryptPayload()` before storage |
| Voice audio files | Delete after processing; only summary stored |
| Aggregated analytics | Strip all PII; show only counts and averages |
| Doctor assessments | Linked to entry `id`, never to patient real identity |

---

## 5. Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Route paths | kebab-case | `/api/doctor/journals/:anonymousId` |
| Error codes | SCREAMING_SNAKE_CASE | `MISSING_FIELDS` |
| Store file | camelCase | `appointmentStore.js` |
| Lib file | camelCase | `aiAnalysis.js` |
| React screen | PascalCase + Screen suffix | `JournalScreen.tsx` |
| React component | PascalCase | `SectionCard` |
| StyleSheet keys | camelCase short | `s.card`, `s.title` |
| JSON store paths | kebab-case | `data/appointments.json` |

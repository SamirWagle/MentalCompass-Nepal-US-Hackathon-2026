// Constants for the application
import type { Preferences, LanguageCode, Personality } from '../types';

export const USER_ID = "demo-user-nepal";
export const MEMORY_KEY = "aegisspeak_memory_v2";
export const CHAT_KEY = "aegisspeak_chat_v1";
export const PREFS_KEY = "aegisspeak_prefs_v1";
export const UX_MODE_KEY = "aegis_ux_mode";

export const defaultPreferences: Preferences = {
  language: "en",
  personality: "calm",
  notificationsEnabled: true,
  offlineMode: false,
  lowBandwidthMode: false,
  locationTag: "Kathmandu",
  calendarLoad: "moderate"
};

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function getLanguageLabel(language: LanguageCode): string {
  return { en: "English", ne: "नेपाली", hi: "हिन्दी" }[language];
}

export function getPersonalityLabel(personality: Personality): string {
  return { calm: "Calm & Supportive", analytical: "Analytical", motivational: "Motivational" }[personality];
}

export const DEMO_CLINICIAN_PATIENTS = [
  {
    id: "p-a-2847",
    name: "Patient A",
    age: 28,
    riskScore: 67,
    riskLevel: "high" as const,
    lastCheckin: "2 hours ago",
    avatar: "👤",
    mood: 3,
    anxiety: 7,
    vitalsHistory: [
      { time: "Mon", anxiety: 6, sleep: 5 },
      { time: "Tue", anxiety: 7, sleep: 4 },
      { time: "Wed", anxiety: 8, sleep: 3 },
      { time: "Thu", anxiety: 7, sleep: 4 },
      { time: "Fri", anxiety: 7, sleep: 5 }
    ],
    recoverySignals: [
      { label: "Mindfulness", value: 45 },
      { label: "Exercise", value: 62 },
      { label: "Social", value: 38 }
    ],
    medications: ["Sertraline 50mg", "Melatonin 3mg"],
    treatmentDays: 147,
    checkinFrequency: 2.3,
    voiceSummary: "Patient reports ongoing anxiety with sleep disruption",
    liveAlert: "⚠️ Escalation needed - High anxiety detected"
  },
  {
    id: "p-b-5124",
    name: "Patient B",
    age: 35,
    riskScore: 42,
    riskLevel: "moderate" as const,
    lastCheckin: "5 hours ago",
    avatar: "👤",
    mood: 5,
    anxiety: 4,
    vitalsHistory: [
      { time: "Mon", anxiety: 4, sleep: 7 },
      { time: "Tue", anxiety: 4, sleep: 7 },
      { time: "Wed", anxiety: 5, sleep: 6 },
      { time: "Thu", anxiety: 4, sleep: 7 },
      { time: "Fri", anxiety: 3, sleep: 8 }
    ],
    recoverySignals: [
      { label: "Mindfulness", value: 78 },
      { label: "Exercise", value: 85 },
      { label: "Social", value: 72 }
    ],
    medications: ["Bupropion 300mg"],
    treatmentDays: 89,
    checkinFrequency: 1.8,
    voiceSummary: "Patient showing stable improvement in mood",
    liveAlert: ""
  },
  {
    id: "p-c-8901",
    name: "Patient C",
    age: 42,
    riskScore: 28,
    riskLevel: "low" as const,
    lastCheckin: "12 hours ago",
    avatar: "👤",
    mood: 7,
    anxiety: 2,
    vitalsHistory: [
      { time: "Mon", anxiety: 2, sleep: 8 },
      { time: "Tue", anxiety: 2, sleep: 8 },
      { time: "Wed", anxiety: 1, sleep: 8 },
      { time: "Thu", anxiety: 2, sleep: 8 },
      { time: "Fri", anxiety: 1, sleep: 9 }
    ],
    recoverySignals: [
      { label: "Mindfulness", value: 92 },
      { label: "Exercise", value: 88 },
      { label: "Social", value: 95 }
    ],
    medications: [],
    treatmentDays: 256,
    checkinFrequency: 0.9,
    voiceSummary: "Patient in remission with excellent engagement",
    liveAlert: ""
  },
  {
    id: "p-d-3456",
    name: "Patient D",
    age: 31,
    riskScore: 55,
    riskLevel: "moderate" as const,
    lastCheckin: "1 hour ago",
    avatar: "👤",
    mood: 4,
    anxiety: 5,
    vitalsHistory: [
      { time: "Mon", anxiety: 5, sleep: 6 },
      { time: "Tue", anxiety: 6, sleep: 5 },
      { time: "Wed", anxiety: 5, sleep: 6 },
      { time: "Thu", anxiety: 5, sleep: 6 },
      { time: "Fri", anxiety: 4, sleep: 7 }
    ],
    recoverySignals: [
      { label: "Mindfulness", value: 58 },
      { label: "Exercise", value: 65 },
      { label: "Social", value: 52 }
    ],
    medications: ["Citalopram 30mg"],
    treatmentDays: 124,
    checkinFrequency: 2.1,
    voiceSummary: "Patient managing anxiety with mixed compliance",
    liveAlert: "⚠️ Attention needed - Declining engagement"
  },
  {
    id: "p-e-7890",
    name: "Patient E",
    age: 26,
    riskScore: 71,
    riskLevel: "high" as const,
    lastCheckin: "30 minutes ago",
    avatar: "👤",
    mood: 2,
    anxiety: 8,
    vitalsHistory: [
      { time: "Mon", anxiety: 7, sleep: 4 },
      { time: "Tue", anxiety: 8, sleep: 3 },
      { time: "Wed", anxiety: 9, sleep: 2 },
      { time: "Thu", anxiety: 8, sleep: 3 },
      { time: "Fri", anxiety: 8, sleep: 3 }
    ],
    recoverySignals: [
      { label: "Mindfulness", value: 22 },
      { label: "Exercise", value: 28 },
      { label: "Social", value: 15 }
    ],
    medications: ["Fluoxetine 40mg", "Alprazolam 0.5mg PRN"],
    treatmentDays: 67,
    checkinFrequency: 3.2,
    voiceSummary: "Patient in crisis - severe anxiety and insomnia",
    liveAlert: "🚨 URGENT: Crisis intervention needed"
  }
];

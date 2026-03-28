// ═══ AegisSpeak Mock Data for Expo App ═══

export const MOCK_GOALS = [
  { text: 'Complete your morning check-in', xp: 5, done: true },
  { text: 'Practice 4-4-4 breathing exercise', xp: 5, done: false },
  { text: 'Write a 3-sentence journal entry', xp: 8, done: false },
  { text: 'Take a 10-minute walk outside', xp: 5, done: false },
  { text: 'Log your sleep quality', xp: 3, done: true },
];

export const MOCK_MILESTONES = [
  { date: '2026-03-28', title: 'Started Your Journey', desc: 'Created your AegisSpeak account', xp: 10, status: 'completed' as const },
  { date: '2026-03-26', title: 'First Check-in', desc: 'Completed your first mood check-in', xp: 5, status: 'completed' as const },
  { date: '2026-03-24', title: 'Voice Analysis Unlocked', desc: 'First voice biomarker extraction', xp: 8, status: 'completed' as const },
  { date: '2026-03-22', title: '3-Day Streak', desc: '3 consecutive days of check-ins', xp: 15, status: 'completed' as const },
  { date: '2026-03-20', title: 'Breathing Master', desc: '5 guided breathing exercises', xp: 12, status: 'completed' as const },
  { date: '2026-03-18', title: '7-Day Streak 🔥', desc: 'Full week of wellness tracking', xp: 25, status: 'active' as const },
  { date: 'Upcoming', title: 'CBT Explorer', desc: 'Complete 3 reframing exercises', xp: 20, status: 'locked' as const },
  { date: 'Upcoming', title: 'Community Helper', desc: 'Support 5 community members', xp: 15, status: 'locked' as const },
];

export const MOCK_ACHIEVEMENTS = [
  { icon: '🌱', name: 'First Sprout', desc: 'Begin your journey', unlocked: true },
  { icon: '🔥', name: '7-Day Streak', desc: '7 consecutive check-ins', unlocked: true },
  { icon: '🫁', name: 'Deep Breather', desc: '5 breathing exercises', unlocked: true },
  { icon: '🎤', name: 'Voice Pioneer', desc: 'First voice analysis', unlocked: true },
  { icon: '📝', name: 'Journal Keeper', desc: '10 journal entries', unlocked: true },
  { icon: '🧠', name: 'CBT Scholar', desc: '3 thought reframes', unlocked: false },
  { icon: '💪', name: 'Resilient', desc: 'Stability score > 80', unlocked: false },
  { icon: '🛡️', name: 'Guardian', desc: 'Reach Guardian avatar', unlocked: false },
];

export const MOCK_VAULT = [
  { type: 'article' as const, icon: '📖', title: 'Understanding Anxiety', desc: 'Science behind anxiety and coping strategies', category: 'Anxiety', duration: '5 min read', colors: ['#0ea5e9', '#38bdf8'] as [string, string] },
  { type: 'audio' as const, icon: '🎧', title: 'Progressive Muscle Relaxation', desc: 'Guided 10-min body scan', category: 'Relaxation', duration: '10 min', colors: ['#059669', '#34d399'] as [string, string] },
  { type: 'video' as const, icon: '🎬', title: 'CBT Thought Records', desc: 'Challenging negative thoughts', category: 'CBT', duration: '8 min', colors: ['#7c3aed', '#a78bfa'] as [string, string] },
  { type: 'article' as const, icon: '😴', title: 'Sleep Hygiene Essentials', desc: 'Evidence-based sleep tips', category: 'Sleep', duration: '4 min read', colors: ['#6366f1', '#818cf8'] as [string, string] },
  { type: 'audio' as const, icon: '🧘', title: 'Mindful Breathing', desc: 'Calming 5-min meditation', category: 'Mindfulness', duration: '5 min', colors: ['#0d9488', '#2dd4bf'] as [string, string] },
  { type: 'article' as const, icon: '💡', title: 'Recognizing Depression', desc: 'Identify early warning signs', category: 'Depression', duration: '6 min read', colors: ['#0284c7', '#38bdf8'] as [string, string] },
];

export const VAULT_CATEGORIES = ['All', 'Anxiety', 'CBT', 'Depression', 'Mindfulness', 'Relaxation', 'Sleep'];

export const MOCK_COMMUNITY = [
  { id: '1', avatar: '🌸', author: 'Anonymous Sunflower', time: '2h ago', text: 'Today was tough, but I did my breathing exercise. Small wins. 💪', supports: 14, relates: 8 },
  { id: '2', avatar: '🌊', author: 'Anonymous Wave', time: '5h ago', text: "The 5-4-3-2-1 grounding technique is genuinely helping me start calmer mornings!", supports: 23, relates: 12 },
  { id: '3', avatar: '🌿', author: 'Anonymous Fern', time: '8h ago', text: 'Week 3 of journaling. I can see mood patterns now. AI insights helped me notice Sunday anxiety.', supports: 31, relates: 19 },
  { id: '4', avatar: '🦋', author: 'Anonymous Butterfly', time: '1d ago', text: '14-day streak! This community keeps me going. 🎉', supports: 42, relates: 15 },
];

export const MOCK_WIPE_LOG = [
  { type: 'audio', hash: 'a7f3b2c4e8d9f1a6b5c3d2e4f7a8b9c0d1e2f3a4', ts: '2026-03-28T10:15:00', size: '2.4 MB' },
  { type: 'voice', hash: 'b8e4c3d5f9e0a2b7c6d4e3f5a8b9c1d2e3f4a5b6', ts: '2026-03-27T18:32:00', size: '1.8 MB' },
  { type: 'session', hash: 'c9f5d4e6a0f1b3c8d7e5f4a6b9c0d2e3f4a5b6c7', ts: '2026-03-27T09:45:00', size: '0.3 MB' },
  { type: 'audio', hash: 'd0a6e5f7b1a2c4d9e8f6a5b7c0d1e3f4a5b6c7d8', ts: '2026-03-26T14:20:00', size: '3.1 MB' },
  { type: 'cache', hash: 'e1b7f6a8c2b3d5e0f9a7b6c8d1e2f4a5b6c7d8e9', ts: '2026-03-25T22:10:00', size: '0.7 MB' },
];

export const MOCK_PATIENTS = [
  { id: 'P-001', name: 'Patient Alpha', age: 28, risk: 'severe' as const, score: 82, lastCheckin: '12 min ago', mood: 3, anxiety: 8, sleep: 4, trend: [75, 78, 80, 82, 79, 85, 82], summary: 'Elevated crisis indicators. Declining sleep and rising anxiety. Voice biomarkers show increased jitter.', adherence: 45 },
  { id: 'P-002', name: 'Patient Beta', age: 34, risk: 'monitor' as const, score: 55, lastCheckin: '1h ago', mood: 5, anxiety: 6, sleep: 6, trend: [60, 58, 55, 52, 55, 50, 55], summary: 'Moderate risk, fluctuating mood. Responding to CBT exercises.', adherence: 72 },
  { id: 'P-003', name: 'Patient Gamma', age: 22, risk: 'stable' as const, score: 18, lastCheckin: '3h ago', mood: 7, anxiety: 3, sleep: 8, trend: [30, 25, 22, 20, 18, 15, 18], summary: 'Consistent improvement. High adherence to prescribed exercises.', adherence: 94 },
  { id: 'P-004', name: 'Patient Delta', age: 41, risk: 'severe' as const, score: 76, lastCheckin: '25 min ago', mood: 2, anxiety: 9, sleep: 3, trend: [50, 55, 62, 68, 72, 74, 76], summary: 'Rapidly escalating. PHQ-9 of 18 — immediate clinical review needed.', adherence: 38 },
  { id: 'P-005', name: 'Patient Epsilon', age: 30, risk: 'stable' as const, score: 22, lastCheckin: '6h ago', mood: 8, anxiety: 2, sleep: 7, trend: [35, 30, 28, 25, 22, 20, 22], summary: 'Stable and improving. Positive thought reframing patterns.', adherence: 88 },
];

export const MOCK_ALERTS = [
  { id: '1', severity: 'high' as const, patient: 'Patient Alpha', event: 'Crisis keyword in journal', time: '12 min ago', acknowledged: false },
  { id: '2', severity: 'high' as const, patient: 'Patient Delta', event: 'PHQ-9 exceeded severe (18/27)', time: '25 min ago', acknowledged: false },
  { id: '3', severity: 'medium' as const, patient: 'Patient Beta', event: '3 nights below 5h sleep', time: '1h ago', acknowledged: true },
  { id: '4', severity: 'medium' as const, patient: 'Patient Zeta', event: 'Adherence dropped below 50%', time: '3h ago', acknowledged: true },
];

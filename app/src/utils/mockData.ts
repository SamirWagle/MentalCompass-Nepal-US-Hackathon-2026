export const MOCK_MILESTONES = [
  { date: '2026-03-28', title: 'Started Your Journey', desc: 'Created your AegisSpeak account', xp: 10, status: 'completed' as const },
  { date: '2026-03-26', title: 'First Check-in', desc: 'Completed your first mood check-in', xp: 5, status: 'completed' as const },
  { date: '2026-03-24', title: 'Voice Analysis Unlocked', desc: 'First voice biomarker extraction', xp: 8, status: 'completed' as const },
  { date: '2026-03-22', title: '3-Day Streak', desc: '3 consecutive days of check-ins', xp: 15, status: 'completed' as const },
  { date: '2026-03-18', title: '7-Day Streak', desc: 'Full week of wellness tracking', xp: 25, status: 'active' as const },
  { date: 'Upcoming', title: 'CBT Explorer', desc: 'Complete 3 reframing exercises', xp: 20, status: 'locked' as const },
];

export const MOCK_VAULT = [
  { type: 'article' as const, icon: '📖', title: 'Understanding Anxiety', desc: 'Science behind anxiety and coping strategies', category: 'Anxiety', duration: '5 min read' },
  { type: 'audio' as const, icon: '🎧', title: 'Progressive Muscle Relaxation', desc: 'Guided 10-min body scan', category: 'Relaxation', duration: '10 min' },
  { type: 'video' as const, icon: '🎬', title: 'CBT Thought Records', desc: 'Challenging negative thoughts', category: 'CBT', duration: '8 min' },
  { type: 'article' as const, icon: '😴', title: 'Sleep Hygiene Essentials', desc: 'Evidence-based sleep tips', category: 'Sleep', duration: '4 min read' },
];

export const MOCK_COMMUNITY = [
  { id: '1', avatar: '🌸', author: 'Anonymous Sunflower', time: '2h ago', text: 'Today was tough, but I did my breathing exercise. Small wins. 💪', supports: 14, relates: 8 },
  { id: '2', avatar: '🌊', author: 'Anonymous Wave', time: '5h ago', text: 'The 5-4-3-2-1 grounding technique is helping me start calmer mornings!', supports: 23, relates: 12 },
  { id: '3', avatar: '🌿', author: 'Anonymous Fern', time: '8h ago', text: 'Week 3 of journaling. I can see mood patterns now. AI insights helped me notice Sunday anxiety.', supports: 31, relates: 19 },
];

export const MOCK_ALERTS = [
  { id: '1', severity: 'high' as const, patient: 'Patient Alpha', event: 'Crisis keyword in journal', time: '12 min ago', acknowledged: false },
  { id: '2', severity: 'high' as const, patient: 'Patient Delta', event: 'PHQ-9 exceeded severe (18/27)', time: '25 min ago', acknowledged: false },
  { id: '3', severity: 'medium' as const, patient: 'Patient Beta', event: '3 nights below 5h sleep', time: '1h ago', acknowledged: true },
];

export const MOCK_PATIENTS = [
  { id: 'P-001', name: 'Patient Alpha', age: 28, risk: 'severe' as const, score: 82, lastCheckin: '12 min ago', mood: 3, anxiety: 8, sleep: 4, summary: 'Elevated crisis indicators. Declining sleep and rising anxiety.', adherence: 45 },
  { id: 'P-002', name: 'Patient Beta', age: 34, risk: 'monitor' as const, score: 55, lastCheckin: '1h ago', mood: 5, anxiety: 6, sleep: 6, summary: 'Moderate risk, fluctuating mood. Responding to CBT exercises.', adherence: 72 },
  { id: 'P-003', name: 'Patient Gamma', age: 22, risk: 'stable' as const, score: 18, lastCheckin: '3h ago', mood: 7, anxiety: 3, sleep: 8, summary: 'Consistent improvement. High adherence to exercises.', adherence: 94 },
];

export const MOCK_WIPE_LOG = [
  { type: 'audio', hash: 'a7f3b2c4e8d9f1a6b5c3d2e4f7a8b9c0d1e2f3a4', ts: '2026-03-28T10:15:00', size: '2.4 MB' },
  { type: 'session', hash: 'c9f5d4e6a0f1b3c8d7e5f4a6b9c0d2e3f4a5b6c7', ts: '2026-03-27T09:45:00', size: '0.3 MB' },
];

export const MOCK_DOCTORS = [
  { doctorCode: 'DR-A1B2', doctorType: 'psychiatrist', consultationFee: 500, isActive: true },
  { doctorCode: 'DR-C3D4', doctorType: 'psychologist', consultationFee: 450, isActive: true },
];

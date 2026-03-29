import React from 'react';
import './SampleFeatureScreens.css';

const PLAN_TEMPLATES: Record<string, string[]> = {
  exams: [
    'Block 2 focused 25-minute study sprints before noon.',
    'Take a 7-minute breathing reset after every two sprints.',
    'Send one accountability update to a trusted peer tonight.',
  ],
  'job-search': [
    'Prepare one interview story using STAR format today.',
    'Apply to 2 realistic openings, not 20 random ones.',
    'Run a 15-minute decompression walk before sleep.',
  ],
  performance: [
    'List top 3 outcomes for tomorrow before ending work.',
    'Timebox difficult task to first 90 minutes.',
    'Use short grounding script before meetings.',
  ],
  finances: [
    'Write immediate, medium and long horizon worries separately.',
    'Take one practical action: budget review or advisor call.',
    'Do one calming exercise before bedtime to reduce rumination.',
  ],
  'role-clarity': [
    'Define one role to explore this week and why.',
    'Book one informational conversation with mentor or peer.',
    'Reflect for 10 minutes on strengths and energy patterns.',
  ],
};

export function CareerScreen() {
  const [focus, setFocus] = React.useState<keyof typeof PLAN_TEMPLATES>('exams');
  const [concern, setConcern] = React.useState('');
  const [plan, setPlan] = React.useState<string[]>([]);

  const buildPlan = () => {
    const base = PLAN_TEMPLATES[focus];
    const concernLine = concern.trim()
      ? `Address this first: ${concern.trim()}`
      : 'Address this first: reduce uncertainty with one concrete step.';
    setPlan([concernLine, ...base]);
  };

  return (
    <div className="sample-screen">
      <div>
        <h1 className="sample-title">Career Compass</h1>
        <p className="sample-subtitle">Reduce burnout from career pressure with short, practical action plans.</p>
      </div>

      <div className="sample-grid">
        <section className="sample-card">
          <h3>Uncertainty Planner</h3>
          <p>Convert anxiety into a 72-hour plan.</p>
          <select className="sample-select" value={focus} onChange={(e) => setFocus(e.target.value as keyof typeof PLAN_TEMPLATES)}>
            <option value="exams">Exam preparation</option>
            <option value="job-search">Job search / interviews</option>
            <option value="performance">Performance pressure</option>
            <option value="finances">Financial stress</option>
            <option value="role-clarity">Role clarity / future direction</option>
          </select>
          <textarea
            className="sample-textarea"
            placeholder="What feels hardest right now?"
            value={concern}
            onChange={(e) => setConcern(e.target.value)}
          />
          <div className="sample-row">
            <button className="sample-btn primary" onClick={buildPlan} type="button">Build 72-Hour Plan</button>
          </div>
        </section>

        <section className="sample-card">
          <h3>Protective Factors</h3>
          <p>Stability anchors we can build into your week.</p>
          <div className="sample-list">
            <div className="sample-item">Break big tasks into 25-minute focus sprints.</div>
            <div className="sample-item">Share one weekly stress update with a trusted person.</div>
            <div className="sample-item">Protect sleep before high-stakes decisions.</div>
            <div className="sample-item">Track pressure trends, not just mood trends.</div>
          </div>
        </section>
      </div>

      <section className="sample-card">
        <h3>Action Plan Output</h3>
        <p>Your plan appears here after generation.</p>
        <div className="sample-list">
          {(plan.length ? plan : ['No plan generated yet.']).map((line, idx) => (
            <div key={idx} className="sample-item">{line}</div>
          ))}
        </div>
      </section>
    </div>
  );
}

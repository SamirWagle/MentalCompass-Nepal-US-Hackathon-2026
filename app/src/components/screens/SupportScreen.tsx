import React from 'react';
import './SampleFeatureScreens.css';

type StepKey = 'self' | 'peer' | 'family' | 'counselor' | 'emergency';

const SCRIPTS: Record<StepKey, string> = {
  self: 'I am overloaded right now. I will take one 7-minute calming reset and re-check my stress level after that.',
  peer: 'I have had a heavy week and need a short check-in. Are you available for 10 minutes today?',
  family: 'I am facing high stress and want practical support to stay stable. Can we talk calmly this evening?',
  counselor: 'I need an early support appointment before symptoms escalate. I am open to brief, practical steps.',
  emergency: 'I am not feeling safe and need immediate support. Please stay with me while we contact emergency services.',
};

export function SupportScreen() {
  const [step, setStep] = React.useState<StepKey>('self');
  const [doneCount, setDoneCount] = React.useState(0);

  return (
    <div className="sample-screen">
      <div>
        <h1 className="sample-title">Early Support Pathway</h1>
        <p className="sample-subtitle">Low-stigma help ladder for conservative communities and family systems.</p>
      </div>

      <section className="sample-card">
        <h3>Support Ladder</h3>
        <p>Choose the smallest next step that still moves you toward support.</p>
        <div className="sample-row">
          {([
            ['self', '1. Self-regulation'],
            ['peer', '2. Trusted peer'],
            ['family', '3. Family conversation'],
            ['counselor', '4. Counselor / health post'],
            ['emergency', '5. Emergency safety'],
          ] as Array<[StepKey, string]>).map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={`sample-chip ${step === key ? 'active' : ''}`}
              onClick={() => setStep(key)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="sample-note" style={{ marginTop: 12 }}>
          Suggested Script: {SCRIPTS[step]}
        </div>

        <div className="sample-row">
          <button className="sample-btn ghost" type="button">Open This in AI Copilot</button>
          <button
            className="sample-btn primary"
            type="button"
            onClick={() => setDoneCount((v) => v + 1)}
          >
            Mark Today's Support Step Done
          </button>
        </div>
        <div className="sample-note">Completed support steps this week: {doneCount}</div>
      </section>

      <section className="sample-card">
        <h3>Stigma-Safe Principles</h3>
        <p>Language patterns that reduce shame and increase help-seeking.</p>
        <div className="sample-list">
          <div className="sample-item">Use stress load and wellbeing if mental health language feels unsafe in your context.</div>
          <div className="sample-item">Ask for practical support first, then discuss emotional support.</div>
          <div className="sample-item">Frame support as strength: I want to stay stable and productive.</div>
        </div>
      </section>
    </div>
  );
}

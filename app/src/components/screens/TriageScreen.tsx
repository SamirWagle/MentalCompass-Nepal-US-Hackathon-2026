import React from 'react';
import { MOCK_PATIENTS } from '@utils/mockData';
import './GenericCards.css';

export function TriageScreen() {
  return (
    <div className="card">
      <div className="card-title">Patient Triage</div>
      {MOCK_PATIENTS.map((p) => (
        <div key={p.id} className="list-row">
          <div>
            <div className="card-title">{p.name}</div>
            <div className="list-meta">{p.id} · Last: {p.lastCheckin}</div>
            <div className="card-subtitle">{p.summary}</div>
          </div>
          <div className="pill" style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>{p.risk.toUpperCase()}</div>
          <div className="xp">Score {p.score}</div>
        </div>
      ))}
    </div>
  );
}

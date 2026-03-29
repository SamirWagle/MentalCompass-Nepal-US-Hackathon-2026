import React from 'react';
import { MOCK_MILESTONES } from '@utils/mockData';
import './GenericCards.css';

export function MilestonesScreen() {
  return (
    <div className="card-grid">
      {MOCK_MILESTONES.map((m) => (
        <div key={m.title} className="card">
          <div className="card-header">
            <div className="pill">{m.status === 'completed' ? 'Completed' : m.status === 'active' ? 'Active' : 'Locked'}</div>
            <div className="date-text">{m.date}</div>
          </div>
          <div className="card-title">{m.title}</div>
          <div className="card-subtitle">{m.desc}</div>
          <div className="xp">XP {m.xp}</div>
        </div>
      ))}
    </div>
  );
}

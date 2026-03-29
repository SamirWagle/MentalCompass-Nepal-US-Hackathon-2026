import React from 'react';
import { MOCK_ALERTS } from '@utils/mockData';
import './GenericCards.css';

export function AlertsScreen() {
  return (
    <div className="card">
      <div className="card-title">Critical Alerts</div>
      {MOCK_ALERTS.map((a) => (
        <div key={a.id} className="list-row">
          <div>
            <div className="card-title">{a.patient}</div>
            <div className="list-meta">{a.event}</div>
          </div>
          <div className="pill" style={{ background: a.severity === 'high' ? 'var(--danger-dim)' : 'var(--warning-dim)', color: a.severity === 'high' ? 'var(--danger)' : 'var(--warning)' }}>
            {a.severity.toUpperCase()}
          </div>
          <div className="date-text">{a.time}</div>
        </div>
      ))}
    </div>
  );
}

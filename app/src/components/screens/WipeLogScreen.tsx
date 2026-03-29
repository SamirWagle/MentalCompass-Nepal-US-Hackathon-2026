import React from 'react';
import { MOCK_WIPE_LOG } from '@utils/mockData';
import './GenericCards.css';

export function WipeLogScreen() {
  return (
    <div className="card">
      <div className="card-title">Wipe Log (ephemeral deletions)</div>
      {MOCK_WIPE_LOG.map((w) => (
        <div key={w.hash} className="list-row">
          <div className="card-subtitle">{w.type.toUpperCase()}</div>
          <div className="list-meta">{w.ts}</div>
          <div className="date-text">{w.size}</div>
        </div>
      ))}
    </div>
  );
}

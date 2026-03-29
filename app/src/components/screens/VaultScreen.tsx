import React from 'react';
import { MOCK_VAULT } from '@utils/mockData';
import './GenericCards.css';

export function VaultScreen() {
  return (
    <div className="card-grid">
      {MOCK_VAULT.map((item) => (
        <div key={item.title} className="card">
          <div className="card-header">
            <div className="pill">{item.category}</div>
            <div className="date-text">{item.duration}</div>
          </div>
          <div className="card-title">{item.icon} {item.title}</div>
          <div className="card-subtitle">{item.desc}</div>
        </div>
      ))}
    </div>
  );
}

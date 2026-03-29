import React from 'react';
import './GenericCards.css';

export function ComplianceScreen() {
  const rows = [
    { title: 'Encryption Status', value: 'Active (AES-256-GCM)' },
    { title: 'Voice Files Stored', value: '0 (ephemeral only)' },
    { title: 'HIPAA / GDPR', value: 'Aligned · Audit ready' },
    { title: 'Data Residency', value: 'Local JSON store (demo)' },
  ];
  return (
    <div className="card">
      <div className="card-title">Compliance & Security</div>
      {rows.map((r) => (
        <div key={r.title} className="list-row">
          <div className="card-subtitle">{r.title}</div>
          <div className="card-title">{r.value}</div>
        </div>
      ))}
    </div>
  );
}

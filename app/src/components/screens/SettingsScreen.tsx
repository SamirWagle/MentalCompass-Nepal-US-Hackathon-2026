import React from 'react';
import './GenericCards.css';

export function SettingsScreen() {
  const rows = [
    { label: 'Notifications', value: 'Enabled' },
    { label: 'Offline Mode', value: 'On (low bandwidth)' },
    { label: 'Check-in Reminder', value: '20:00 Asia/Kathmandu' },
  ];
  return (
    <div className="card">
      <div className="card-title">Settings</div>
      {rows.map((r) => (
        <div key={r.label} className="list-row">
          <div className="card-subtitle">{r.label}</div>
          <div className="card-title">{r.value}</div>
        </div>
      ))}
    </div>
  );
}

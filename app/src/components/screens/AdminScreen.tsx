import React from 'react';
import './GenericCards.css';

export function AdminScreen() {
  return (
    <div className="card">
      <div className="card-title">Super Admin</div>
      <div className="card-subtitle">IAM actions are API-only in this demo. Use backend `/api/iam/users` endpoints to create users.</div>
      <div className="list-meta" style={{ marginTop: 10 }}>This placeholder keeps navigation consistent with the Expo app.</div>
    </div>
  );
}

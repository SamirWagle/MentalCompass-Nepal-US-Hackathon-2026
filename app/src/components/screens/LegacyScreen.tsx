import React from 'react';
import './GenericCards.css';

export function LegacyScreen() {
  return (
    <div className="card" style={{ height: '80vh', padding: 0 }}>
      <iframe
        title="Legacy UI"
        src="/legacy/index.html"
        style={{ border: 'none', width: '100%', height: '100%', borderRadius: '16px' }}
      />
    </div>
  );
}

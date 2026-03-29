import React from 'react';
import { MOCK_DOCTORS } from '@utils/mockData';
import './GenericCards.css';

export function BookingScreen() {
  return (
    <div className="card-grid">
      {MOCK_DOCTORS.map((d) => (
        <div key={d.doctorCode} className="card">
          <div className="card-title">{d.doctorCode}</div>
          <div className="card-subtitle">Type: {d.doctorType}</div>
          <div className="xp">Consultation Fee: NPR {d.consultationFee}</div>
          <div className="pill" style={{ marginTop: 8 }}>{d.isActive ? 'Available' : 'Offline'}</div>
        </div>
      ))}
    </div>
  );
}

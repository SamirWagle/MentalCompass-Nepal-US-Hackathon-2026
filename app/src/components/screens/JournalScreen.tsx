import React from 'react';
import './GenericCards.css';

export function JournalScreen() {
  const entries = [
    { id: 'J-1', mood: 'anxious', text: 'Feeling overwhelmed by deadlines but did breathing.' , date: 'Today' },
    { id: 'J-2', mood: 'calm', text: 'Walked 5k steps, slept 7h, grateful for friends.' , date: 'Yesterday' },
  ];
  return (
    <div className="card">
      <div className="card-title">My Journals</div>
      {entries.map(e => (
        <div key={e.id} className="list-row">
          <div>
            <div className="card-title">{e.date}</div>
            <div className="card-subtitle">Mood: {e.mood}</div>
            <div className="list-meta">{e.text}</div>
          </div>
          <div className="pill">{e.id}</div>
        </div>
      ))}
      <div className="xp" style={{ marginTop: 12 }}>Create new entry via daily check-in.</div>
    </div>
  );
}

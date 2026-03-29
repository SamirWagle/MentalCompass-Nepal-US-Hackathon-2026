import React from 'react';
import { MOCK_COMMUNITY } from '@utils/mockData';
import './GenericCards.css';

export function CommunityScreen() {
  return (
    <div className="card-grid">
      {MOCK_COMMUNITY.map((post) => (
        <div key={post.id} className="card">
          <div className="card-header">
            <div className="card-title">{post.avatar} {post.author}</div>
            <div className="date-text">{post.time}</div>
          </div>
          <div className="card-subtitle" style={{ color: 'var(--text-primary)', marginTop: 4 }}>{post.text}</div>
          <div className="list-meta">Supports {post.supports} · Relates {post.relates}</div>
        </div>
      ))}
    </div>
  );
}

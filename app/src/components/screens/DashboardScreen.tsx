import React from 'react';
import './DashboardScreen.css';

export function DashboardScreen() {
  return (
    <div className="screen dashboard-screen">
      <div className="screen-header">
        <h1 className="screen-title">Welcome to AegisSpeak</h1>
        <p className="screen-subtitle">Your privacy-first mental health companion</p>
      </div>

      <div className="dashboard-grid">
        {/* Mood Card */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3 className="card-title">Today's Mood</h3>
            <span className="card-badge">↑ 2 from yesterday</span>
          </div>
          <div className="mood-display">
            <div className="mood-circle">😊</div>
            <div className="mood-value">5.2 / 10</div>
            <p className="mood-label">Moderately Positive</p>
          </div>
          <div className="chart-placeholder">
            [Mood Chart]
          </div>
        </div>

        {/* Wellness Check */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3 className="card-title">Wellness Check</h3>
            <span className="card-badge">Today</span>
          </div>
          <div className="wellness-items">
            <div className="wellness-item">
              <div className="wellness-icon">😴</div>
              <div className="wellness-info">
                <div className="wellness-name">Sleep</div>
                <div className="wellness-detail">7.5 hours</div>
              </div>
            </div>
            <div className="wellness-item">
              <div className="wellness-icon">❤️</div>
              <div className="wellness-info">
                <div className="wellness-name">Stress</div>
                <div className="wellness-detail">Low</div>
              </div>
            </div>
            <div className="wellness-item">
              <div className="wellness-icon">🚶</div>
              <div className="wellness-info">
                <div className="wellness-name">Activity</div>
                <div className="wellness-detail">8,234 steps</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-card wide">
          <div className="card-header">
            <h3 className="card-title">Get Started</h3>
          </div>
          <div className="quick-actions">
            <button className="action-btn primary">
              <span className="action-icon">📝</span>
              <div>
                <div className="action-title">Daily Check-in</div>
                <div className="action-desc">5 min assessment</div>
              </div>
            </button>
            <button className="action-btn secondary">
              <span className="action-icon">💬</span>
              <div>
                <div className="action-title">Talk to AI</div>
                <div className="action-desc">24/7 support</div>
              </div>
            </button>
            <button className="action-btn secondary">
              <span className="action-icon">📊</span>
              <div>
                <div className="action-title">View Insights</div>
                <div className="action-desc">Trends & patterns</div>
              </div>
            </button>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3 className="card-title">Your Schedule</h3>
            <span className="card-badge">Next 7 days</span>
          </div>
          <div className="schedule-list">
            <div className="schedule-item">
              <div className="schedule-time">Tomorrow, 2:00 PM</div>
              <div className="schedule-title">Session with Dr. Sharma</div>
              <div className="schedule-type">Video Call</div>
            </div>
            <div className="schedule-item">
              <div className="schedule-time">Friday, 10:00 AM</div>
              <div className="schedule-title">Group Mindfulness Session</div>
              <div className="schedule-type">Online</div>
            </div>
          </div>
        </div>

        {/* Daily Tip */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3 className="card-title">Daily Insight</h3>
          </div>
          <div className="tip-content">
            <div className="tip-emoji">💡</div>
            <p className="tip-text">
              "A 10-minute mindfulness break can reduce stress levels by up to 20%. Try it now!"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

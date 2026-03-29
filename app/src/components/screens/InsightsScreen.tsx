import React from 'react';
import './InsightsScreen.css';

export function InsightsScreen() {
  return (
    <div className="screen insights-screen">
      <div className="screen-header">
        <h1 className="screen-title">Predictive Insights</h1>
        <p className="screen-subtitle">AI-powered mental health Analytics</p>
      </div>

      <div className="insights-grid">
        {/* Burnout Risk */}
        <div className="insight-card">
          <div className="card-header">
            <h3 className="card-title">Burnout Risk</h3>
            <span className="risk-indicator low">Low</span>
          </div>
          <div className="risk-meter">
            <div className="meter-bar">
              <div className="meter-fill" style={{ width: '25%' }}></div>
            </div>
            <div className="meter-label">25% confidence</div>
          </div>
          <p className="insight-text">Your current patterns suggest low risk of burnout. Maintain current wellness practices.</p>
        </div>

        {/* Depression Risk */}
        <div className="insight-card">
          <div className="card-header">
            <h3 className="card-title">Depression Risk</h3>
            <span className="risk-indicator moderate">Moderate</span>
          </div>
          <div className="risk-meter">
            <div className="meter-bar">
              <div className="meter-fill moderate" style={{ width: '45%' }}></div>
            </div>
            <div className="meter-label">45% confidence</div>
          </div>
          <p className="insight-text">Monitor mood trends closely. Consider increasing social engagement and physical activity.</p>
        </div>

        {/* 72-Hour Outlook */}
        <div className="insight-card">
          <div className="card-header">
            <h3 className="card-title">72-Hour Outlook</h3>
            <span className="forecast-badge">Predicted</span>
          </div>
          <div className="outlook-chart">
            <div className="outlook-bars">
              {[24, 32, 28, 18, 22].map((value, i) => (
                <div key={i} className="outlook-bar">
                  <div className="bar-fill" style={{ height: `${value}px` }}></div>
                </div>
              ))}
            </div>
            <div className="outlook-labels">
              <span>Today</span>
              <span>+24h</span>
              <span>+48h</span>
              <span>+60h</span>
              <span>+72h</span>
            </div>
          </div>
          <p className="insight-text">Risk score expected to remain stable over the next 3 days.</p>
        </div>

        {/* Recommendations */}
        <div className="insight-card wide">
          <div className="card-header">
            <h3 className="card-title">AI Recommendations</h3>
          </div>
          <div className="recommendations-list">
            <div className="recommendation-item">
              <div className="rec-icon">🧘</div>
              <div className="rec-content">
                <div className="rec-title">Daily Mindfulness</div>
                <div className="rec-desc">10 min morning meditation would reduce stress by ~20%</div>
              </div>
              <button className="rec-action">→</button>
            </div>
            <div className="recommendation-item">
              <div className="rec-icon">🚶</div>
              <div className="rec-content">
                <div className="rec-title">Increase Activity</div>
                <div className="rec-desc">You're 30% below your average step count</div>
              </div>
              <button className="rec-action">→</button>
            </div>
            <div className="recommendation-item">
              <div className="rec-icon">😴</div>
              <div className="rec-content">
                <div className="rec-title">Sleep Optimization</div>
                <div className="rec-desc">Earlier bedtime correlates with 15% mood improvement</div>
              </div>
              <button className="rec-action">→</button>
            </div>
          </div>
        </div>

        {/* Key Trends */}
        <div className="insight-card">
          <div className="card-header">
            <h3 className="card-title">Key Trends</h3>
          </div>
          <div className="trends-list">
            <div className="trend-item">
              <div className="trend-metric">Mood</div>
              <div className="trend-value">↑ 12%</div>
              <div className="trend-status">Improving</div>
            </div>
            <div className="trend-item">
              <div className="trend-metric">Sleep</div>
              <div className="trend-value">→ 0%</div>
              <div className="trend-status">Stable</div>
            </div>
            <div className="trend-item">
              <div className="trend-metric">Anxiety</div>
              <div className="trend-value">↓ 8%</div>
              <div className="trend-status">Improving</div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="insight-card">
          <div className="card-header">
            <h3 className="card-title">Next Steps</h3>
          </div>
          <div className="checklist">
            <label className="checklist-item">
              <input type="checkbox" defaultChecked />
              <span>Complete daily check-in</span>
            </label>
            <label className="checklist-item">
              <input type="checkbox" />
              <span>Schedule therapy session</span>
            </label>
            <label className="checklist-item">
              <input type="checkbox" />
              <span>Review meditation practice</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

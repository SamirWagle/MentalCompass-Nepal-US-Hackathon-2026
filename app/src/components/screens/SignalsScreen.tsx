import React from 'react';
import './SignalsScreen.css';

export function SignalsScreen() {
  return (
    <div className="screen signals-screen">
      <div className="screen-header">
        <h1 className="screen-title">Voice Biomarker Signals</h1>
        <p className="screen-subtitle">Passive voice analytics for mental health monitoring</p>
      </div>

      <div className="signals-grid">
        {/* Processing Status */}
        <div className="signal-card">
          <div className="card-header">
            <h3 className="card-title">Status</h3>
            <span className="status-badge recording">🔴 Recording</span>
          </div>
          <div className="status-info">
            <div className="status-item">
              <span className="status-label">Microphone</span>
              <span className="status-value">✓ Active</span>
            </div>
            <div className="status-item">
              <span className="status-label">Processing</span>
              <span className="status-value">🔄 Real-time</span>
            </div>
            <div className="status-item">
              <span className="status-label">Privacy</span>
              <span className="status-value">✓ On-device</span>
            </div>
          </div>
          <button className="btn-control">◼ Stop Recording</button>
        </div>

        {/* Speech Rate */}
        <div className="signal-card">
          <div className="card-header">
            <h3 className="card-title">Speech Rate</h3>
            <span className="signal-badge">Normal</span>
          </div>
          <div className="metric-display">
            <div className="metric-value">142 WPM</div>
            <div className="metric-label">words per minute</div>
          </div>
          <div className="status-bar">
            <div className="status-bar-fill" style={{ width: '60%' }}></div>
          </div>
          <p className="signal-note">Baseline: 120-150 WPM. Your speech speed is within normal range.</p>
        </div>

        {/* Pause Ratio */}
        <div className="signal-card">
          <div className="card-header">
            <h3 className="card-title">Pause Ratio</h3>
            <span className="signal-badge warning">Elevated</span>
          </div>
          <div className="metric-display">
            <div className="metric-value">18%</div>
            <div className="metric-label">of speech time</div>
          </div>
          <div className="status-bar">
            <div className="status-bar-fill elevated" style={{ width: '72%' }}></div>
          </div>
          <p className="signal-note">Slightly elevated pausing may indicate thoughtfulness or mild hesitation.</p>
        </div>

        {/* Jitter (Pitch Variability) */}
        <div className="signal-card">
          <div className="card-header">
            <h3 className="card-title">Pitch Variability</h3>
            <span className="signal-badge">Low</span>
          </div>
          <div className="metric-display">
            <div className="metric-value">2.1%</div>
            <div className="metric-label">jitter coefficient</div>
          </div>
          <div className="status-bar">
            <div className="status-bar-fill" style={{ width: '35%' }}></div>
          </div>
          <p className="signal-note">Low jitter suggests stable emotional state and clear speech control.</p>
        </div>

        {/* Signal History */}
        <div className="signal-card wide">
          <div className="card-header">
            <h3 className="card-title">Weekly Trend</h3>
            <span className="trend-badge">↓ Improving</span>
          </div>
          <div className="trend-chart">
            <div className="chart-container">
              <div className="chart-bars">
                {[65, 68, 72, 70, 68, 65, 62].map((value, i) => (
                  <div key={i} className="chart-bar-group">
                    <div className="chart-bar" style={{ height: `${(value / 80) * 100}%` }}></div>
                    <span className="chart-label">{'MTWRFSS'[i]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Key Insights */}
        <div className="signal-card">
          <div className="card-header">
            <h3 className="card-title">Key Insights</h3>
          </div>
          <div className="insights-list">
            <div className="insight-item positive">
              <span className="insight-icon">✓</span>
              <span className="insight-text">Consistent speech patterns</span>
            </div>
            <div className="insight-item positive">
              <span className="insight-icon">✓</span>
              <span className="insight-text">Steady pitch control</span>
            </div>
            <div className="insight-item warning">
              <span className="insight-icon">⚠</span>
              <span className="insight-text">Slightly elevated hesitation</span>
            </div>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="signal-card wide">
          <div className="card-header">
            <h3 className="card-title">🔒 Privacy & Security</h3>
          </div>
          <div className="privacy-notice">
            <p>
              Voice data is processed entirely on your device. No audio is stored or transmitted to servers. 
              Only anonymized biomarker features are used for analysis. You can stop recording at any time.
            </p>
            <div className="privacy-features">
              <div className="feature">✓ On-device processing</div>
              <div className="feature">✓ No audio storage</div>
              <div className="feature">✓ Anonymous analysis</div>
              <div className="feature">✓ Full control</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

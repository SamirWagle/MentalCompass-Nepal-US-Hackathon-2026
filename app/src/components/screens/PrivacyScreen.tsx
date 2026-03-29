import React from 'react';
import './PrivacyScreen.css';

export function PrivacyScreen() {
  const [dataExport, setDataExport] = React.useState(false);
  const [dataDelete, setDataDelete] = React.useState(false);

  return (
    <div className="screen privacy-screen">
      <div className="screen-header">
        <h1 className="screen-title">Privacy & Data Control</h1>
        <p className="screen-subtitle">Your data, your control</p>
      </div>

      <div className="privacy-grid">
        {/* Data Overview */}
        <div className="privacy-card wide">
          <div className="card-header">
            <h3 className="card-title">Your Data</h3>
          </div>
          <div className="data-overview">
            <div className="data-item">
              <div className="data-icon">📝</div>
              <div className="data-info">
                <div className="data-label">Check-ins</div>
                <div className="data-value">127 records</div>
                <div className="data-size">~850 KB</div>
              </div>
            </div>
            <div className="data-item">
              <div className="data-icon">💬</div>
              <div className="data-info">
                <div className="data-label">Chat History</div>
                <div className="data-value">342 messages</div>
                <div className="data-size">~1.2 MB</div>
              </div>
            </div>
            <div className="data-item">
              <div className="data-icon">📔</div>
              <div className="data-info">
                <div className="data-label">Journal Entries</div>
                <div className="data-value">47 entries</div>
                <div className="data-size">~620 KB</div>
              </div>
            </div>
            <div className="data-item">
              <div className="data-icon">🔊</div>
              <div className="data-info">
                <div className="data-label">Voice Biomarkers</div>
                <div className="data-value">23 sessions</div>
                <div className="data-size">~450 KB</div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Rights */}
        <div className="privacy-card">
          <div className="card-header">
            <h3 className="card-title">Your Rights</h3>
          </div>
          <div className="rights-list">
            <div className="right-item">
              <div className="right-icon">✓</div>
              <div className="right-content">
                <div className="right-title">Access</div>
                <div className="right-desc">Download all your data anytime</div>
              </div>
            </div>
            <div className="right-item">
              <div className="right-icon">✓</div>
              <div className="right-content">
                <div className="right-title">Portability</div>
                <div className="right-desc">Export in standard formats</div>
              </div>
            </div>
            <div className="right-item">
              <div className="right-icon">✓</div>
              <div className="right-content">
                <div className="right-title">Deletion</div>
                <div className="right-desc">Permanently erase your data</div>
              </div>
            </div>
            <div className="right-item">
              <div className="right-icon">✓</div>
              <div className="right-content">
                <div className="right-title">Control</div>
                <div className="right-desc">Choose what gets shared</div>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Policy */}
        <div className="privacy-card">
          <div className="card-header">
            <h3 className="card-title">🔒 Privacy Principles</h3>
          </div>
          <div className="principles-list">
            <div className="principle">
              <div className="principle-icon">🛡️</div>
              <div className="principle-text">End-to-end encrypted communications</div>
            </div>
            <div className="principle">
              <div className="principle-icon">🔐</div>
              <div className="principle-text">On-device processing where possible</div>
            </div>
            <div className="principle">
              <div className="principle-icon">🚫</div>
              <div className="principle-text">Zero third-party data sharing</div>
            </div>
            <div className="principle">
              <div className="principle-icon">📋</div>
              <div className="principle-text">Transparent privacy policy</div>
            </div>
          </div>
        </div>

        {/* Data Export */}
        <div className="privacy-card">
          <div className="card-header">
            <h3 className="card-title">Export Your Data</h3>
          </div>
          <p className="card-description">
            Download all your personal data in a standard format that you can import into another service.
          </p>
          <div className="action-group">
            <label className="checkbox-item">
              <input 
                type="checkbox" 
                checked={dataExport}
                onChange={(e) => setDataExport(e.target.checked)}
              />
              <span>I understand my data will be sent to my email</span>
            </label>
            <button className="action-btn" disabled={!dataExport}>
              📥 Request Export
            </button>
          </div>
        </div>

        {/* Data Deletion */}
        <div className="privacy-card danger">
          <div className="card-header">
            <h3 className="card-title">Delete All Data</h3>
          </div>
          <p className="card-description">
            Permanently delete all your personal data. This action cannot be undone.
          </p>
          <div className="action-group">
            <label className="checkbox-item warning">
              <input 
                type="checkbox" 
                checked={dataDelete}
                onChange={(e) => setDataDelete(e.target.checked)}
              />
              <span>I understand this is irreversible</span>
            </label>
            <button className="action-btn danger" disabled={!dataDelete}>
              🗑️ Delete All Data
            </button>
          </div>
        </div>

        {/* Data Processing */}
        <div className="privacy-card wide">
          <div className="card-header">
            <h3 className="card-title">Data Processing Agreement</h3>
          </div>
          <div className="agreement-text">
            <p>
              <strong>What we collect:</strong> Check-in data, mood entries, messaging history, voice biomarkers, and optional wearable data. No audio files are stored.
            </p>
            <p>
              <strong>How we use it:</strong> To provide personalized insights, predict mental health risks, and improve the service. All processing is HIPAA-compliant and encrypted.
            </p>
            <p>
              <strong>Who can access:</strong> Only you and your authorized clinicians. Never sold to third parties. Government requests require court orders.
            </p>
            <p>
              <strong>Data retention:</strong> Kept until you request deletion. You can export or delete at any time.
            </p>
          </div>
          <a href="#" className="read-more">Read Full Privacy Policy →</a>
        </div>

        {/* HIPAA Compliance */}
        <div className="privacy-card">
          <div className="card-header">
            <h3 className="card-title">🏥 HIPAA Compliant</h3>
          </div>
          <div className="compliance-info">
            <p className="compliance-text">
              AegisSpeak is HIPAA-compliant and operates under strict healthcare data protection standards.
            </p>
            <div className="compliance-details">
              <div className="detail">✓ Data Encryption</div>
              <div className="detail">✓ Access Logs</div>
              <div className="detail">✓ Regular Audits</div>
              <div className="detail">✓ Breach Notification</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

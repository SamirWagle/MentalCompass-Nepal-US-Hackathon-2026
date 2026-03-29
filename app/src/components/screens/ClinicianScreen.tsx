import React from 'react';
import { DEMO_CLINICIAN_PATIENTS } from '@utils/constants';
import './ClinicianScreen.css';

export function ClinicianScreen() {
  const [selectedPatientId, setSelectedPatientId] = React.useState(DEMO_CLINICIAN_PATIENTS[0].id);
  const [riskFilter, setRiskFilter] = React.useState('all');
  
  const selectedPatient = DEMO_CLINICIAN_PATIENTS.find(p => p.id === selectedPatientId);
  
  const filteredPatients = riskFilter === 'all' 
    ? DEMO_CLINICIAN_PATIENTS 
    : DEMO_CLINICIAN_PATIENTS.filter(p => p.riskLevel === riskFilter);

  return (
    <div className="screen clinician-screen">
      <div className="screen-header">
        <h1 className="screen-title">Clinician Dashboard</h1>
        <p className="screen-subtitle">Patient triage and monitoring</p>
      </div>

      <div className="clinician-container">
        {/* Patient List */}
        <div className="patient-list-panel">
          <div className="panel-header">
            <h2 className="panel-title">Patients</h2>
            <div className="filter-group">
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Patients</option>
                <option value="low">Low Risk</option>
                <option value="moderate">Moderate Risk</option>
                <option value="high">High Risk</option>
              </select>
            </div>
          </div>

          <div className="patient-list">
            {filteredPatients.map(patient => (
              <button
                key={patient.id}
                className={`patient-item ${selectedPatientId === patient.id ? 'active' : ''} risk-${patient.riskLevel}`}
                onClick={() => setSelectedPatientId(patient.id)}
              >
                <div className="patient-avatar">{patient.avatar}</div>
                <div className="patient-summary">
                  <div className="patient-name">{patient.name}</div>
                  <div className="patient-meta">
                    <span className="risk-badge">{patient.riskLevel.toUpperCase()}</span>
                    <span className="patient-time">{patient.lastCheckin}</span>
                  </div>
                </div>
                <div className="risk-score">{patient.riskScore}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Patient Detail */}
        {selectedPatient && (
          <div className="patient-detail-panel">
            <div className="detail-header">
              <div className="detail-title">
                <h2>{selectedPatient.name}</h2>
                <span className={`risk-badge risk-${selectedPatient.riskLevel}`}>
                  {selectedPatient.riskLevel.toUpperCase()}
                </span>
              </div>
              <div className="detail-actions">
                <button className="action-link">📞 Call</button>
                <button className="action-link">💬 Message</button>
                <button className="action-link">📅 Schedule</button>
              </div>
            </div>

            {selectedPatient.liveAlert && (
              <div className="live-alert">
                <span className="alert-icon">⚠️</span>
                <span className="alert-text">{selectedPatient.liveAlert}</span>
              </div>
            )}

            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-label">Age</div>
                <div className="metric-value">{selectedPatient.age}</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Risk Score</div>
                <div className="metric-value">{selectedPatient.riskScore}</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Treatment Days</div>
                <div className="metric-value">{selectedPatient.treatmentDays}</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Check-in Freq.</div>
                <div className="metric-value">{selectedPatient.checkinFrequency}x/wk</div>
              </div>
            </div>

            <div className="vitals-chart">
              <h3 className="chart-title">Vital Trends (Anxiety vs Sleep)</h3>
              <div className="chart-container">
                <div className="chart-bars">
                  {selectedPatient.vitalsHistory?.map((point, idx) => (
                    <div key={idx} className="bar-group">
                      <div className="bar-pair">
                        <div 
                          className="bar anxiety" 
                          style={{ height: `${(point.anxiety / 10) * 100}%` }}
                          title={`Anxiety: ${point.anxiety}`}
                        ></div>
                        <div 
                          className="bar sleep" 
                          style={{ height: `${(point.sleep / 10) * 100}%` }}
                          title={`Sleep: ${point.sleep}`}
                        ></div>
                      </div>
                      <div className="bar-label">{point.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="recovery-signals">
              <h3 className="chart-title">Recovery Signals</h3>
              <div className="signals-list">
                {selectedPatient.recoverySignals?.map((signal, idx) => (
                  <div key={idx} className="signal-item">
                    <div className="signal-label">{signal.label}</div>
                    <div className="signal-bar">
                      <div 
                        className="signal-fill" 
                        style={{ width: `${signal.value}%` }}
                      ></div>
                    </div>
                    <div className="signal-value">{signal.value}%</div>
                  </div>
                ))}
              </div>
            </div>

            {selectedPatient.medications && selectedPatient.medications.length > 0 && (
              <div className="medications-section">
                <h3 className="section-title">Current Medications</h3>
                <ul className="medications-list">
                  {selectedPatient.medications.map((med, idx) => (
                    <li key={idx} className="medication-item">{med}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedPatient.voiceSummary && (
              <div className="summary-section">
                <h3 className="section-title">Clinical Note</h3>
                <p className="summary-text">{selectedPatient.voiceSummary}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

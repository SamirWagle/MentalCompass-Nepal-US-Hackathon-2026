import React from 'react';
import './CheckinScreen.css';

export function CheckinScreen() {
  const [step, setStep] = React.useState(1);
  const [formData, setFormData] = React.useState({
    mood: 5,
    anxiety: 5,
    stress: 5,
    sleep: 7,
    journal: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Checkin submitted:', formData);
    // TODO: Call API
    setStep(1);
    setFormData({ mood: 5, anxiety: 5, stress: 5, sleep: 7, journal: '' });
  };

  return (
    <div className="screen checkin-screen">
      <div className="screen-header">
        <h1 className="screen-title">Daily Check-In</h1>
        <p className="screen-subtitle">How are you feeling today?</p>
      </div>

      <form onSubmit={handleSubmit} className="checkin-form">
        <div className="form-steps">
          {/* Step 1: Mood */}
          {step === 1 && (
            <div className="form-step active">
              <h2 className="step-title">What's your mood right now?</h2>
              <div className="mood-slider">
                <div className="slider-labels">
                  <span>😢</span>
                  <span>😐</span>
                  <span>😊</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.mood}
                  onChange={(e) => setFormData({ ...formData, mood: Number(e.target.value) })}
                  className="slider"
                />
                <div className="slider-value">{formData.mood}/10</div>
              </div>
              <button type="button" onClick={() => setStep(2)} className="btn btn-next">
                Next
              </button>
            </div>
          )}

          {/* Step 2: Anxiety & Stress */}
          {step === 2 && (
            <div className="form-step active">
              <h2 className="step-title">How's your anxiety and stress?</h2>
              <div className="double-slider">
                <div className="slider-group">
                  <label>Anxiety: {formData.anxiety}/10</label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={formData.anxiety}
                    onChange={(e) => setFormData({ ...formData, anxiety: Number(e.target.value) })}
                    className="slider"
                  />
                </div>
                <div className="slider-group">
                  <label>Stress: {formData.stress}/10</label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={formData.stress}
                    onChange={(e) => setFormData({ ...formData, stress: Number(e.target.value) })}
                    className="slider"
                  />
                </div>
              </div>
              <div className="button-group">
                <button type="button" onClick={() => setStep(1)} className="btn btn-back">
                  Back
                </button>
                <button type="button" onClick={() => setStep(3)} className="btn btn-next">
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Sleep */}
          {step === 3 && (
            <div className="form-step active">
              <h2 className="step-title">How many hours did you sleep?</h2>
              <div className="sleep-input">
                <input
                  type="number"
                  min="0"
                  max="24"
                  step="0.5"
                  value={formData.sleep}
                  onChange={(e) => setFormData({ ...formData, sleep: Number(e.target.value) })}
                  className="input-field"
                />
                <span className="sleep-label">hours</span>
              </div>
              <div className="button-group">
                <button type="button" onClick={() => setStep(2)} className="btn btn-back">
                  Back
                </button>
                <button type="button" onClick={() => setStep(4)} className="btn btn-next">
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Journal */}
          {step === 4 && (
            <div className="form-step active">
              <h2 className="step-title">Any thoughts to share?</h2>
              <textarea
                value={formData.journal}
                onChange={(e) => setFormData({ ...formData, journal: e.target.value })}
                placeholder="Write anything you'd like to share... (optional)"
                className="journal-textarea"
              />
              <div className="button-group">
                <button type="button" onClick={() => setStep(3)} className="btn btn-back">
                  Back
                </button>
                <button type="submit" className="btn btn-submit">
                  Submit Check-In
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Progress Indicator */}
        <div className="progress-indicator">
          <div className="progress-steps">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`progress-dot ${step === s ? 'active' : ''} ${s < step ? 'completed' : ''}`}
              />
            ))}
          </div>
          <span className="progress-text">Step {step} of 4</span>
        </div>
      </form>
    </div>
  );
}

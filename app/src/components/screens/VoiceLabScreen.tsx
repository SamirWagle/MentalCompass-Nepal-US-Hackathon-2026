import React from 'react';
import './SampleFeatureScreens.css';

export function VoiceLabScreen() {
  const [recording, setRecording] = React.useState(false);
  const [seconds, setSeconds] = React.useState(0);
  const [transcript, setTranscript] = React.useState('Transcript will appear here during recording...');

  React.useEffect(() => {
    if (!recording) {
      return;
    }
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [recording]);

  const startRecording = () => {
    setRecording(true);
    setSeconds(0);
    setTranscript('Listening... start speaking naturally.');
  };

  const stopRecording = () => {
    setRecording(false);
    setTranscript('Analysis complete. Tone and pacing markers captured from this session.');
  };

  const mm = Math.floor(seconds / 60);
  const ss = String(seconds % 60).padStart(2, '0');

  return (
    <div className="sample-screen">
      <div>
        <h1 className="sample-title">Voice Lab</h1>
        <p className="sample-subtitle">Live microphone capture, speech-to-text, and acoustic biomarker extraction.</p>
      </div>

      <section className="sample-card">
        <h3>Live Voice Capture</h3>
        <p>Audio is processed locally and immediately purged.</p>
        <div className="sample-row">
          {!recording ? (
            <button className="sample-btn primary" type="button" onClick={startRecording}>Start Recording</button>
          ) : (
            <button className="sample-btn ghost" type="button" onClick={stopRecording}>Stop and Analyze</button>
          )}
          <div className="sample-note">Timer: {mm}:{ss}</div>
        </div>
      </section>

      <div className="sample-grid">
        <section className="sample-card">
          <h3>Speech Transcription</h3>
          <p>Real-time speech to text.</p>
          <div className="sample-item" style={{ minHeight: 120 }}>{transcript}</div>
        </section>

        <section className="sample-card">
          <h3>Extracted Biomarkers</h3>
          <p>Acoustic features detected from voice.</p>
          <div className="sample-kpi">
            <div className="sample-kpi-item"><strong>{recording ? '132' : '125'}</strong><span>Est. WPM</span></div>
            <div className="sample-kpi-item"><strong>{recording ? 'Live' : `${mm}:${ss}`}</strong><span>Duration</span></div>
            <div className="sample-kpi-item"><strong>{recording ? '0.68' : '0.55'}</strong><span>Avg Volume</span></div>
            <div className="sample-kpi-item"><strong>{recording ? '42' : '28'}</strong><span>Word Count</span></div>
          </div>
          <div className="sample-note">Audio purged after analysis, never stored as raw file.</div>
        </section>
      </div>
    </div>
  );
}

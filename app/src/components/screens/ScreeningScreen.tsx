import React from 'react';
import './SampleFeatureScreens.css';

const PHQ9 = [
  'Little interest or pleasure in doing things',
  'Feeling down, depressed, or hopeless',
  'Trouble falling or staying asleep, or sleeping too much',
  'Feeling tired or having little energy',
  'Poor appetite or overeating',
  'Feeling bad about yourself, or that you are a failure',
  'Trouble concentrating on things',
  'Moving or speaking slowly, or being fidgety/restless',
  'Thoughts that you would be better off dead, or of hurting yourself',
];

const GAD7 = [
  'Feeling nervous, anxious, or on edge',
  'Not being able to stop or control worrying',
  'Worrying too much about different things',
  'Trouble relaxing',
  'Being so restless that it is hard to sit still',
  'Becoming easily annoyed or irritable',
  'Feeling afraid, as if something awful might happen',
];

const severity = (score: number, cuts: number[], labels: string[]) => {
  const idx = cuts.findIndex((cut) => score <= cut);
  return labels[idx === -1 ? labels.length - 1 : idx];
};

export function ScreeningScreen() {
  const [phq, setPhq] = React.useState<number[]>(new Array(PHQ9.length).fill(0));
  const [gad, setGad] = React.useState<number[]>(new Array(GAD7.length).fill(0));

  const phqScore = phq.reduce((a, b) => a + b, 0);
  const gadScore = gad.reduce((a, b) => a + b, 0);

  const phqLabel = severity(phqScore, [4, 9, 14, 19, 27], ['Minimal', 'Mild', 'Moderate', 'Moderately Severe', 'Severe']);
  const gadLabel = severity(gadScore, [4, 9, 14, 21], ['Minimal', 'Mild', 'Moderate', 'Severe']);

  const renderQuestions = (questions: string[], values: number[], setValues: React.Dispatch<React.SetStateAction<number[]>>) => (
    <div className="sample-list">
      {questions.map((q, i) => (
        <div className="sample-item" key={q}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>{i + 1}. {q}</div>
          <div className="sample-row">
            {[0, 1, 2, 3].map((v) => (
              <button
                key={v}
                type="button"
                className={`sample-chip ${values[i] === v ? 'active' : ''}`}
                onClick={() => setValues((prev) => prev.map((p, idx) => (idx === i ? v : p)))}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="sample-screen">
      <div>
        <h1 className="sample-title">Clinical Screening</h1>
        <p className="sample-subtitle">Validated PHQ-9 Depression and GAD-7 Anxiety screening instruments.</p>
      </div>

      <section className="sample-card">
        <h3>PHQ-9</h3>
        <p>Over the last 2 weeks, how often have you been bothered by the following?</p>
        {renderQuestions(PHQ9, phq, setPhq)}
      </section>

      <section className="sample-card">
        <h3>GAD-7</h3>
        <p>Over the last 2 weeks, how often have you been bothered by the following?</p>
        {renderQuestions(GAD7, gad, setGad)}
      </section>

      <section className="sample-card">
        <h3>Screening Summary</h3>
        <div className="sample-kpi">
          <div className="sample-kpi-item"><strong>{phqScore}</strong><span>PHQ-9</span></div>
          <div className="sample-kpi-item"><strong>{gadScore}</strong><span>GAD-7</span></div>
          <div className="sample-kpi-item"><strong>{phqLabel}</strong><span>Depression</span></div>
          <div className="sample-kpi-item"><strong>{gadLabel}</strong><span>Anxiety</span></div>
        </div>
      </section>
    </div>
  );
}

import { branchFamilies, ctaRoutes, stageOrder, universalQuestions } from './data.js';
import {
  buildBlueprintSession,
  buildPayload,
  buildQuestionSequence,
  buildReport,
  persistBlueprintArtifacts,
  queueEmailReport,
  restoreBlueprintArtifacts,
} from './logic.js';

const app = document.getElementById('blueprint-app');

const state = {
  step: 'entry',
  pairIndex: 0,
  answers: {},
  identity: {
    firstName: '',
    email: '',
  },
  branchKey: null,
  trustSensitiveOverride: false,
  session: null,
  payload: null,
  report: null,
  emailDelivery: null,
};

const questionPairs = (questions) => {
  const pairs = [];
  for (let index = 0; index < questions.length; index += 2) {
    pairs.push(questions.slice(index, index + 2));
  }
  return pairs;
};

function currentQuestionBundle() {
  const sequence = buildQuestionSequence(state.answers);
  state.branchKey = sequence.branchSelection.branchKey;
  state.trustSensitiveOverride = sequence.branchSelection.provisional.trustSensitive;
  return sequence;
}

function clearBranchAnswers() {
  ['q7', 'q8', 'q9', 'q10', 'q11', 'q12'].forEach((key) => delete state.answers[key]);
}

function setAnswer(questionId, value) {
  const previousBranch = state.branchKey;
  state.answers[questionId] = value;
  const sequence = buildQuestionSequence(state.answers);
  if (previousBranch && sequence.branchSelection.branchKey !== previousBranch) {
    clearBranchAnswers();
    state.answers[questionId] = value;
  }
  state.branchKey = sequence.branchSelection.branchKey;
  state.trustSensitiveOverride = sequence.branchSelection.provisional.trustSensitive;
  render();
}

function updateIdentity(field, value) {
  state.identity[field] = value;
}

function screenIndex() {
  if (state.step === 'entry') return 0;
  if (state.step === 'questions') return state.pairIndex + 1;
  if (state.step === 'gate') return 7;
  return 8;
}

function stageLabelForScreen() {
  if (state.step === 'entry') return 'Framing';
  if (state.step === 'gate') return 'Blueprint Ready';
  if (state.step === 'results') return 'Results';
  const bundle = currentQuestionBundle();
  const pair = questionPairs(bundle.questions)[state.pairIndex] || [];
  return pair[0]?.stage || 'Blueprint';
}

function renderProgress() {
  const activeIndex = screenIndex();
  const totalVisibleScreens = 8;
  const labels = ['Framing', 'Operating Reality', 'Breakdown Pattern', 'System Pressure', 'Branch Diagnosis', 'Route Clarity', 'Recommendation', 'Blueprint Ready'];

  return `
    <section class="blueprint-progress-shell">
      <div>
        <p class="eyebrow blueprint-eyebrow">AARYX Blueprint Assessment</p>
        <h1 class="blueprint-title">A premium diagnostic for follow-through risk.</h1>
        <p class="blueprint-subtitle">Built for founder-led service businesses with real workflow complexity. This is a fit assessment, not a generic AI quiz.</p>
      </div>
      <div class="blueprint-progress-meta">
        <div>
          <p class="blueprint-progress-kicker">Current stage</p>
          <strong>${stageLabelForScreen()}</strong>
        </div>
        <div>
          <p class="blueprint-progress-kicker">Progress</p>
          <strong>${Math.min(activeIndex + 1, totalVisibleScreens)} / ${totalVisibleScreens}</strong>
        </div>
      </div>
      <div class="blueprint-stage-track" aria-hidden="true">
        ${labels
          .map(
            (label, index) => `
              <span class="blueprint-stage-pill ${index <= activeIndex ? 'is-active' : ''}">${label}</span>
            `
          )
          .join('')}
      </div>
    </section>
  `;
}

function renderEntry() {
  return `
    ${renderProgress()}
    <section class="blueprint-panel blueprint-entry-panel">
      <div class="blueprint-entry-copy">
        <p class="section-tag">What this does</p>
        <h2>Separate communication risk from broader operating-layer failure.</h2>
        <p>
          In 12 questions, this diagnostic looks at where follow-through is breaking, what that is likely affecting first, and what should come before you add another tool or workflow layer.
        </p>
        <div class="blueprint-trust-grid">
          <article>
            <h3>Seriousness first</h3>
            <p>Built for founder-led service businesses where trust, timing, and handoffs actually affect revenue.</p>
          </article>
          <article>
            <h3>One recommendation only</h3>
            <p>You will not get a buffet of offers. The result points to one primary next move.</p>
          </article>
          <article>
            <h3>Privacy by default</h3>
            <p>We are not asking for inbox access in this assessment. Sensitive workflows require caution, and the diagnostic is built to determine fit first.</p>
          </article>
        </div>
      </div>
      <aside class="blueprint-preview-card" aria-label="Blueprint output preview">
        <p class="card-kicker">What your Blueprint will surface</p>
        <ul class="blueprint-preview-list">
          <li>Your dominant breakdown pattern</li>
          <li>Why the current setup is missing it</li>
          <li>Whether the sharper issue is communication visibility or broader process fragility</li>
          <li>One next step only</li>
        </ul>
        <button class="button button-primary blueprint-primary-button" type="button" data-action="start">Begin the Assessment</button>
        <p class="blueprint-trust-line">No spam. No newsletter bait. This assessment is designed to determine fit first, not push you into the wrong solution.</p>
      </aside>
    </section>
  `;
}

function renderQuestionCard(question) {
  const selected = state.answers[question.id] || '';

  return `
    <article class="blueprint-question-card">
      <p class="blueprint-question-stage">${question.stage}</p>
      <h2>${question.prompt}</h2>
      <div class="blueprint-option-list" role="radiogroup" aria-label="${question.prompt}">
        ${question.options
          .map(
            (option) => `
              <label class="blueprint-option ${selected === option.value ? 'is-selected' : ''}">
                <input
                  type="radio"
                  name="${question.id}"
                  value="${option.value}"
                  ${selected === option.value ? 'checked' : ''}
                  data-question="${question.id}"
                />
                <span>${option.label}</span>
              </label>
            `
          )
          .join('')}
      </div>
    </article>
  `;
}

function currentPairState() {
  const bundle = currentQuestionBundle();
  const pairs = questionPairs(bundle.questions);
  return {
    branchKey: bundle.branchSelection.branchKey,
    pair: pairs[state.pairIndex] || [],
    pairs,
  };
}

function pairIsComplete(pair) {
  return pair.every((question) => Boolean(state.answers[question.id]));
}

function renderQuestionScreen() {
  const { branchKey, pair, pairs } = currentPairState();
  const lastPair = state.pairIndex === pairs.length - 1;

  return `
    ${renderProgress()}
    <section class="blueprint-panel blueprint-question-panel">
      <div class="blueprint-panel-topline">
        <div>
          <p class="section-tag">Question set ${state.pairIndex + 1} of ${pairs.length}</p>
          <h2>${branchFamilies[branchKey].label}</h2>
        </div>
        <p class="blueprint-branch-note">Two questions per screen. Premium diagnostic. No score theatre.</p>
      </div>
      <div class="blueprint-question-grid">
        ${pair.map(renderQuestionCard).join('')}
      </div>
      <div class="blueprint-actions">
        <button class="button button-secondary" type="button" data-action="back-question">Back</button>
        <button class="button button-primary" type="button" data-action="next-question" ${pairIsComplete(pair) ? '' : 'disabled'}>
          ${lastPair ? 'Continue to Blueprint' : 'Continue'}
        </button>
      </div>
    </section>
  `;
}

function gateSession() {
  return buildBlueprintSession(state.answers, state.identity);
}

function renderGate() {
  const previewSession = gateSession();

  return `
    ${renderProgress()}
    <section class="blueprint-panel blueprint-gate-panel">
      <div class="blueprint-gate-copy">
        <p class="section-tag">Your Blueprint is ready</p>
        <h2>${previewSession.gateSentence}</h2>
        <div class="blueprint-severity-chip severity-${previewSession.severityCue.toLowerCase()}">${previewSession.severityCue}</div>
        <ul class="blueprint-preview-list gate-preview-list">
          ${previewSession.preview.map((item) => `<li>${item}</li>`).join('')}
        </ul>
        <div class="blueprint-gate-trust">
          <p>No spam. No newsletter bait.</p>
          <p>Your answers are used to generate your Blueprint result and next-step recommendation.</p>
          <p>We are not asking for inbox access in this assessment.</p>
        </div>
      </div>
      <form class="blueprint-email-form" id="blueprint-email-form">
        <label>
          <span>Work email</span>
          <input type="email" name="email" value="${state.identity.email}" placeholder="you@company.com" required />
        </label>
        <label>
          <span>First name <small>Optional</small></span>
          <input type="text" name="firstName" value="${state.identity.firstName}" placeholder="Tejas" />
        </label>
        <button class="button button-primary blueprint-primary-button" type="submit">Show My Blueprint</button>
        <p class="blueprint-trust-line">We’ll send your result and a copy of your report. No spam. No newsletter bait. This assessment is designed to determine fit first, not push you into the wrong solution.</p>
      </form>
    </section>
  `;
}

function renderResults() {
  const { session, emailDelivery } = state;
  const breakdownMarkup = session.breakdowns
    .map(
      (item) => `
        <article class="blueprint-breakdown-card">
          <h3>${item.title}</h3>
          <p>${item.summary}</p>
        </article>
      `
    )
    .join('');

  return `
    ${renderProgress()}
    <section class="blueprint-panel blueprint-results-panel">
      <div class="blueprint-results-hero">
        <div>
          <p class="section-tag">Blueprint summary</p>
          <h2>${session.headline}</h2>
          <p class="blueprint-result-lead">${session.recommendationText}</p>
        </div>
        <div class="blueprint-results-meta">
          <div class="blueprint-meta-card">
            <span>Severity cue</span>
            <strong>${session.severityCue}</strong>
          </div>
          <div class="blueprint-meta-card">
            <span>Urgency read</span>
            <strong>${session.urgencyRead}</strong>
          </div>
          <div class="blueprint-meta-card">
            <span>Primary recommendation</span>
            <strong>${session.recommendation}</strong>
          </div>
        </div>
      </div>

      <div class="blueprint-results-grid">
        <section>
          <p class="card-kicker">Top 3 breakdowns</p>
          <div class="blueprint-breakdown-grid">${breakdownMarkup}</div>
        </section>
        <section class="blueprint-insight-card">
          <p class="card-kicker">Why the current setup is missing it</p>
          <p>${session.whyMissed}</p>
        </section>
        <section class="blueprint-insight-card">
          <p class="card-kicker">What should come first</p>
          <p>${session.recommendationText}</p>
          ${session.sequence ? `<p class="blueprint-sequence-note">${session.sequence}</p>` : ''}
        </section>
      </div>

      <div class="blueprint-trust-footer">
        <p>Recommendations are based on the pattern in your answers, not a full system audit.</p>
        <p>Trackt is only recommended when earlier visibility appears to be the sharpest problem.</p>
        <p>The Blueprint does not assume software is the answer every time.</p>
      </div>

      <div class="blueprint-primary-cta-wrap">
        <a class="button button-primary blueprint-primary-button" href="${session.primaryCta.href}" target="_blank" rel="noopener noreferrer">${session.primaryCta.label}</a>
        <p class="blueprint-trust-line">Only one next step is shown on purpose. Clarity beats option overload.</p>
      </div>

      <details class="blueprint-local-note">
        <summary>Local test notes</summary>
        <p>${emailDelivery?.message || ''}</p>
        <p>CRM-ready payload saved to localStorage key <code>aaryx-blueprint-payload-v1</code>.</p>
        <p>Email report draft saved to localStorage key <code>aaryx-blueprint-report-v1</code>.</p>
      </details>
    </section>
  `;
}

function render() {
  if (state.step === 'entry') {
    app.innerHTML = renderEntry();
    return;
  }

  if (state.step === 'questions') {
    app.innerHTML = renderQuestionScreen();
    return;
  }

  if (state.step === 'gate') {
    app.innerHTML = renderGate();
    return;
  }

  app.innerHTML = renderResults();
}

function startAssessment() {
  state.step = 'questions';
  state.pairIndex = 0;
  render();
}

function goBackQuestion() {
  if (state.pairIndex === 0) {
    state.step = 'entry';
  } else {
    state.pairIndex -= 1;
  }
  render();
}

function goNextQuestion() {
  const { pair, pairs } = currentPairState();
  if (!pairIsComplete(pair)) return;
  if (state.pairIndex === pairs.length - 1) {
    state.step = 'gate';
  } else {
    state.pairIndex += 1;
  }
  render();
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function submitGate(form) {
  const formData = new FormData(form);
  const email = String(formData.get('email') || '').trim();
  const firstName = String(formData.get('firstName') || '').trim();

  if (!validateEmail(email)) {
    const emailField = form.querySelector('input[name="email"]');
    emailField?.focus();
    emailField?.setCustomValidity('Enter a valid work email.');
    emailField?.reportValidity();
    return;
  }

  const emailField = form.querySelector('input[name="email"]');
  emailField?.setCustomValidity('');

  state.identity.email = email;
  state.identity.firstName = firstName;
  state.session = buildBlueprintSession(state.answers, state.identity);
  state.payload = buildPayload(state.session);
  state.report = buildReport(state.session, state.payload);
  state.emailDelivery = queueEmailReport(state.report);
  persistBlueprintArtifacts(state.session, state.payload, state.report);
  state.step = 'results';
  render();
}

function restart() {
  state.step = 'entry';
  state.pairIndex = 0;
  state.answers = {};
  state.identity = { firstName: '', email: '' };
  state.branchKey = null;
  state.trustSensitiveOverride = false;
  state.session = null;
  state.payload = null;
  state.report = null;
  state.emailDelivery = null;
  render();
}

app.addEventListener('change', (event) => {
  const input = event.target;
  if (!(input instanceof HTMLInputElement)) return;
  if (input.type === 'radio' && input.dataset.question) {
    setAnswer(input.dataset.question, input.value);
  }
});

app.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const button = target.closest('[data-action]');
  if (!button) return;

  const action = button.getAttribute('data-action');
  if (action === 'start') startAssessment();
  if (action === 'back-question') goBackQuestion();
  if (action === 'next-question') goNextQuestion();
  if (action === 'restart') restart();
});

app.addEventListener('submit', (event) => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) return;
  if (form.id === 'blueprint-email-form') {
    event.preventDefault();
    submitGate(form);
  }
});

const restored = restoreBlueprintArtifacts();
if (restored.session && restored.payload && restored.report) {
  state.session = restored.session;
  state.payload = restored.payload;
  state.report = restored.report;
  state.identity = restored.session.identity || state.identity;
}

window.__AARYX_BLUEPRINT__ = {
  getState: () => structuredClone(state),
  ctaRoutes,
};

render();

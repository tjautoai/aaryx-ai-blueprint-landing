import { ASSESSMENT_VERSION, CTA_ROUTES, QUESTION_MAP, QUESTIONS, QUESTION_SCREENS, ROUTE_LABELS, STAGE_LABELS } from './data.js';
import {
  buildBlueprintSession,
  buildPayload,
  buildReport,
  clearBlueprintDraft,
  persistBlueprintArtifacts,
  persistBlueprintDraft,
  queueEmailReport,
  restoreBlueprintArtifacts,
  restoreBlueprintDraft,
} from './logic.js';

const app = document.getElementById('blueprint-app');

const state = {
  step: 'entry',
  screenIndex: 0,
  answers: {},
  identity: {
    firstName: '',
    lastName: '',
    email: '',
  },
  submissionMeta: {
    assessmentId: '',
    submittedAt: '',
  },
  gateError: '',
  gatePending: false,
  session: null,
  payload: null,
  report: null,
  emailDelivery: null,
};

function currentScreenQuestionIds() {
  return QUESTION_SCREENS[state.screenIndex] || [];
}

function currentScreenQuestions() {
  return currentScreenQuestionIds().map((id) => QUESTION_MAP[id]).filter(Boolean);
}

function screenComplete() {
  return currentScreenQuestionIds().every((id) => Boolean(state.answers[id]));
}

function activeStageLabel() {
  if (state.step === 'entry') return 'Framing';
  if (state.step === 'questions') return STAGE_LABELS[state.screenIndex + 1] || 'Blueprint';
  if (state.step === 'gate') return 'Blueprint Ready';
  return 'Results';
}

function activeProgressNumber() {
  if (state.step === 'entry') return 0;
  if (state.step === 'questions') {
    const answeredCount = Math.max(...currentScreenQuestionIds().map((id) => QUESTIONS.findIndex((q) => q.id === id) + 1));
    return answeredCount;
  }
  return 9;
}

function progressSupportLine() {
  if (state.step === 'entry') return 'A premium diagnostic built to route the first move cleanly.';
  if (state.step === 'questions') {
    if (state.screenIndex <= 1) return 'About 4 minutes left.';
    if (state.screenIndex <= 3) return 'Now narrowing the diagnosis.';
    return 'Final recommendation next.';
  }
  if (state.step === 'gate') return 'Enter your email to unlock the full result.';
  return 'One recommendation. One next step.';
}

function renderProgress() {
  const progress = activeProgressNumber();
  const activeStage = activeStageLabel();

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
          <strong>${activeStage}</strong>
          <p class="blueprint-progress-support">${progressSupportLine()}</p>
        </div>
        <div>
          <p class="blueprint-progress-kicker">Progress</p>
          <strong>${progress} / 9 questions</strong>
        </div>
      </div>
      <div class="blueprint-stage-track" aria-hidden="true">
        ${STAGE_LABELS.slice(0, 7)
          .map((label, index) => {
            const isActive =
              (state.step === 'entry' && index === 0) ||
              (state.step === 'questions' && index <= state.screenIndex + 1) ||
              (state.step === 'gate' && index <= 6) ||
              state.step === 'results';
            return `<span class="blueprint-stage-pill ${isActive ? 'is-active' : ''}">${label}</span>`;
          })
          .join('')}
      </div>
    </section>
  `;
}

function snapshotDraft() {
  return {
    step: state.step,
    screenIndex: state.screenIndex,
    answers: state.answers,
    identity: state.identity,
    submissionMeta: state.submissionMeta,
  };
}

function persistCurrentDraft() {
  persistBlueprintDraft(snapshotDraft());
}

function clearGateError() {
  state.gateError = '';
}

function inlineErrorMarkup() {
  if (!state.gateError) return '';
  return `<p class="blueprint-trust-line" role="alert">${state.gateError}</p>`;
}

function ensureSubmissionMeta() {
  if (!state.submissionMeta.assessmentId) {
    state.submissionMeta.assessmentId = crypto.randomUUID();
  }
  if (!state.submissionMeta.submittedAt) {
    state.submissionMeta.submittedAt = new Date().toISOString();
  }
  persistCurrentDraft();
}

async function submitBlueprintPayload(payload) {
  const response = await fetch('/api/blueprint-submit', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok || !data?.ok) {
    const details = Array.isArray(data?.details) ? ` ${data.details.join(' ')}` : '';
    const message = data?.error || 'Blueprint persistence failed.';
    const error = new Error(`${message}${details}`.trim());
    error.retryable = Boolean(data?.retryable);
    throw error;
  }

  return data;
}

function renderEntry() {
  return `
    ${renderProgress()}
    <section class="blueprint-panel blueprint-entry-panel">
      <div class="blueprint-entry-copy">
        <p class="section-tag">What this does</p>
        <h2>Separate communication risk from broader operating fragility.</h2>
        <p>
          In 9 questions, this diagnostic determines whether the sharper issue is at-risk follow-through visibility, broader workflow fragility, or cleanup that should happen before a tool-first move.
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
          <li>Your headline diagnosis</li>
          <li>Your severity and urgency read</li>
          <li>Why the current setup is missing the problem</li>
          <li>One primary recommendation and one next step</li>
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
      <p class="blueprint-question-stage">Question ${question.display_order} of 9</p>
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

function renderQuestionScreen() {
  const questions = currentScreenQuestions();
  const lastScreen = state.screenIndex === QUESTION_SCREENS.length - 1;

  return `
    ${renderProgress()}
    <section class="blueprint-panel blueprint-question-panel">
      <div class="blueprint-panel-topline">
        <div>
          <p class="section-tag">Question block ${state.screenIndex + 1} of ${QUESTION_SCREENS.length}</p>
          <h2>${activeStageLabel()}</h2>
        </div>
        <p class="blueprint-branch-note">Stable 9-question flow. No variable public question count.</p>
      </div>
      <div class="blueprint-question-grid ${questions.length === 1 ? 'is-single' : ''}">
        ${questions.map(renderQuestionCard).join('')}
      </div>
      <div class="blueprint-actions">
        <button class="button button-secondary" type="button" data-action="back-question">Back</button>
        <button class="button button-primary" type="button" data-action="next-question" ${screenComplete() ? '' : 'disabled'}>
          ${lastScreen ? 'Continue to Blueprint' : 'Continue'}
        </button>
      </div>
    </section>
  `;
}

function previewSession() {
  return buildBlueprintSession(state.answers, state.identity);
}

function renderGate() {
  const session = previewSession();
  const severityChipClass = session.result_page_model.severity_band.replace('_', '-');

  return `
    ${renderProgress()}
    <section class="blueprint-panel blueprint-gate-panel">
      <div class="blueprint-gate-copy">
        <p class="section-tag">Your Blueprint is ready</p>
        <h2>${session.gate_diagnosis_sentence}</h2>
        <div class="blueprint-severity-chip severity-${severityChipClass}">${session.result_page_model.severity_band}</div>
        <ul class="blueprint-preview-list gate-preview-list">
          ${session.gate_preview_bullets.map((item) => `<li>${item}</li>`).join('')}
        </ul>
        <div class="blueprint-gate-trust">
          <p>No spam. No newsletter bait.</p>
          <p>Your answers are used to generate your Blueprint result and next-step recommendation.</p>
          <p>We are not asking for inbox access in this assessment.</p>
        </div>
      </div>
      <form class="blueprint-email-form" id="blueprint-email-form" novalidate>
        <label>
          <span>First Name</span>
          <input type="text" name="firstName" value="${state.identity.firstName}" placeholder="Tejas" required autocomplete="given-name" />
        </label>
        <label>
          <span>Last Name</span>
          <input type="text" name="lastName" value="${state.identity.lastName}" placeholder="Desai" required autocomplete="family-name" />
        </label>
        <label>
          <span>Work Email</span>
          <input type="email" name="email" value="${state.identity.email}" placeholder="you@company.com" required autocomplete="email" inputmode="email" />
        </label>
        ${inlineErrorMarkup()}
        <button class="button button-primary blueprint-primary-button" type="submit" ${state.gatePending ? 'disabled' : ''}>${state.gatePending ? 'Saving Blueprint...' : 'Show My Blueprint'}</button>
        <p class="blueprint-trust-line">We’ll unlock your result after your Blueprint is saved. No spam. No newsletter bait. This assessment is designed to determine fit first, not push you into the wrong solution.</p>
      </form>
    </section>
  `;
}

function renderReasonList(items, type) {
  if (!items.length) return '';
  return `
    <details class="blueprint-local-note">
      <summary>${type === 'reasons' ? 'Why this route was chosen' : 'Mixed-signal notes'}</summary>
      <ul class="blueprint-reason-list">
        ${items.map((item) => `<li>${item}</li>`).join('')}
      </ul>
    </details>
  `;
}

function renderResults() {
  const { session, emailDelivery } = state;
  const model = session.result_page_model;
  const severityChipClass = model.severity_band.replace('_', '-');

  const breakdownMarkup = model.top_breakdowns
    .map(
      (item) => `
        <article class="blueprint-breakdown-card">
          <h3>${item.title}</h3>
          <p>${item.summary}</p>
        </article>
      `
    )
    .join('');

  const reasonText = session.classification.route_reason_codes.map((code) => session.route_reason_code_labels?.[code] || code.replaceAll('_', ' '));
  const conflictText = session.classification.conflict_flags.map((code) => session.conflict_flag_labels?.[code] || code.replaceAll('_', ' '));

  return `
    ${renderProgress()}
    <section class="blueprint-panel blueprint-results-panel">
      <div class="blueprint-results-hero">
        <div>
          <p class="section-tag">Blueprint summary</p>
          <h2>${model.headline_diagnosis}</h2>
          <p class="blueprint-result-lead">${model.primary_recommendation}</p>
        </div>
        <div class="blueprint-results-meta">
          <div class="blueprint-meta-card">
            <span>Severity</span>
            <strong><span class="blueprint-inline-chip severity-${severityChipClass}">${model.severity_band}</span></strong>
          </div>
          <div class="blueprint-meta-card">
            <span>Urgency</span>
            <strong>${model.urgency_read.replaceAll('_', ' ')}</strong>
          </div>
          <div class="blueprint-meta-card">
            <span>Primary route</span>
            <strong>${ROUTE_LABELS[model.route]}</strong>
          </div>
          <div class="blueprint-meta-card">
            <span>Confidence</span>
            <strong>${model.confidence_band.replaceAll('_', ' ')}</strong>
          </div>
        </div>
      </div>

      <div class="blueprint-results-grid">
        <section>
          <p class="card-kicker">Top breakdowns</p>
          <div class="blueprint-breakdown-grid">${breakdownMarkup}</div>
        </section>
        <section class="blueprint-insight-card">
          <p class="card-kicker">Why the current setup is missing the problem</p>
          <p>${model.why_current_setup_misses_it}</p>
        </section>
        <section class="blueprint-insight-card">
          <p class="card-kicker">What should happen first</p>
          <p>${model.primary_recommendation}</p>
          ${model.sequence_note_optional ? `<p class="blueprint-sequence-note">${model.sequence_note_optional}</p>` : ''}
        </section>
      </div>

      ${renderReasonList(reasonText, 'reasons')}
      ${renderReasonList(conflictText, 'conflicts')}

      <div class="blueprint-trust-footer">
        <p>${model.disclaimer_line}</p>
        <p>Trackt remains positioned as a communication and follow-through risk visibility product. It is not an inbox cleanup tool, generic CRM, task manager, or generic productivity app.</p>
      </div>

      <div class="blueprint-primary-cta-wrap">
        <a class="button button-primary blueprint-primary-button" href="${model.cta.href}" target="_blank" rel="noopener noreferrer">${model.cta.label}</a>
        <p class="blueprint-trust-line">Only one next step is shown on purpose. Clarity beats option overload.</p>
      </div>

      <details class="blueprint-local-note">
        <summary>Local test notes</summary>
        <p>${emailDelivery?.message || ''}</p>
        <p>Assessment version: <code>${ASSESSMENT_VERSION}</code></p>
        <p>CRM-ready payload saved to localStorage key <code>aaryx-blueprint-payload-v2</code>.</p>
        <p>Email report draft saved to localStorage key <code>aaryx-blueprint-report-v2</code>.</p>
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
  state.screenIndex = 0;
  clearGateError();
  persistCurrentDraft();
  render();
}

function setAnswer(questionId, value) {
  state.answers[questionId] = value;
  clearGateError();
  persistCurrentDraft();
  render();
}

function goBackQuestion() {
  if (state.screenIndex === 0) {
    state.step = 'entry';
  } else {
    state.screenIndex -= 1;
  }
  clearGateError();
  persistCurrentDraft();
  render();
}

function goNextQuestion() {
  if (!screenComplete()) return;
  if (state.screenIndex === QUESTION_SCREENS.length - 1) {
    state.step = 'gate';
  } else {
    state.screenIndex += 1;
  }
  clearGateError();
  persistCurrentDraft();
  render();
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function validateRequiredText(value) {
  return String(value || '').trim().length > 0;
}

async function submitGate(form) {
  const formData = new FormData(form);
  const firstName = String(formData.get('firstName') || '').trim();
  const lastName = String(formData.get('lastName') || '').trim();
  const email = String(formData.get('email') || '').trim();

  clearGateError();

  const firstNameField = form.querySelector('input[name="firstName"]');
  const lastNameField = form.querySelector('input[name="lastName"]');
  const emailField = form.querySelector('input[name="email"]');

  firstNameField?.setCustomValidity('');
  lastNameField?.setCustomValidity('');
  emailField?.setCustomValidity('');

  if (!validateRequiredText(firstName)) {
    firstNameField?.focus();
    firstNameField?.setCustomValidity('Enter your first name.');
    firstNameField?.reportValidity();
    return;
  }

  if (!validateRequiredText(lastName)) {
    lastNameField?.focus();
    lastNameField?.setCustomValidity('Enter your last name.');
    lastNameField?.reportValidity();
    return;
  }

  if (!validateEmail(email)) {
    emailField?.focus();
    emailField?.setCustomValidity('Enter a valid work email.');
    emailField?.reportValidity();
    return;
  }

  state.identity = { firstName, lastName, email };
  ensureSubmissionMeta();
  state.gatePending = true;
  persistCurrentDraft();
  render();

  try {
    state.session = buildBlueprintSession(state.answers, state.identity);
    state.payload = buildPayload(state.session, state.submissionMeta);
    state.report = buildReport(state.session, state.payload);
    persistBlueprintArtifacts(state.session, state.payload, state.report);
    persistCurrentDraft();
    await submitBlueprintPayload(state.payload);
    state.emailDelivery = queueEmailReport(state.report);
    state.gatePending = false;
    state.step = 'results';
    render();
  } catch (error) {
    state.gatePending = false;
    state.gateError = error instanceof Error ? error.message : 'Blueprint persistence failed.';
    persistCurrentDraft();
    render();
  }
}

function restart() {
  state.step = 'entry';
  state.screenIndex = 0;
  state.answers = {};
  state.identity = { firstName: '', lastName: '', email: '' };
  state.submissionMeta = { assessmentId: '', submittedAt: '' };
  state.gateError = '';
  state.gatePending = false;
  state.session = null;
  state.payload = null;
  state.report = null;
  state.emailDelivery = null;
  clearBlueprintDraft();
  render();
}

app.addEventListener('change', (event) => {
  const input = event.target;
  if (!(input instanceof HTMLInputElement)) return;
  if (input.type === 'radio' && input.dataset.question) {
    setAnswer(input.dataset.question, input.value);
  }
});

app.addEventListener('input', (event) => {
  const input = event.target;
  if (!(input instanceof HTMLInputElement)) return;
  if (input.form?.id !== 'blueprint-email-form') return;
  state.identity = {
    ...state.identity,
    [input.name]: input.value,
  };
  clearGateError();
  persistCurrentDraft();
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

const draft = restoreBlueprintDraft();
if (draft) {
  state.step = draft.step || state.step;
  state.screenIndex = Number.isInteger(draft.screenIndex) ? draft.screenIndex : state.screenIndex;
  state.answers = draft.answers || state.answers;
  state.identity = { ...state.identity, ...(draft.identity || {}) };
  state.submissionMeta = { ...state.submissionMeta, ...(draft.submissionMeta || {}) };
}

window.__AARYX_BLUEPRINT__ = {
  getState: () => structuredClone(state),
  questions: QUESTIONS,
  ctaRoutes: CTA_ROUTES,
};

render();

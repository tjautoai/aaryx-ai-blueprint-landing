import { STORAGE_KEYS, branchFamilies, ctaRoutes, getBranchQuestions, questionBank, universalQuestions } from './data.js';

const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));

const normalize = (value) => clamp(Math.round(value));

function getQuestionById(id, branchKey, trustSensitiveOverride = false) {
  const branchQuestions = getBranchQuestions(branchKey, trustSensitiveOverride);
  return [...universalQuestions, ...branchQuestions].find((question) => question.id === id);
}

function getOption(question, value) {
  return question?.options.find((option) => option.value === value) || null;
}

function applyEffects(totals, effects = {}) {
  Object.entries(effects).forEach(([key, value]) => {
    totals[key] = (totals[key] || 0) + value;
  });
}

function emptyTotals() {
  return {
    severity: 0,
    communication: 0,
    maturity: 0,
    urgency: 0,
    readiness: 0,
    breadth: 0,
    trust: 0,
    lowMaturity: 0,
    confidence: 0,
  };
}

function collectBreakdownCounts(questions, answers) {
  const counts = new Map();

  questions.forEach((question) => {
    const answer = answers[question.id];
    if (!answer) return;
    const selected = getOption(question, answer);
    if (!selected) return;

    (selected.breakdownTags || []).forEach((tag) => {
      counts.set(tag, (counts.get(tag) || 0) + 1);
    });
  });

  return counts;
}

function provisionalQuestions() {
  return universalQuestions;
}

function mapProvisionalScores(answers) {
  const totals = emptyTotals();
  const questions = provisionalQuestions();
  questions.forEach((question) => {
    const selected = getOption(question, answers[question.id]);
    if (selected) applyEffects(totals, selected.effects);
  });

  const communicationDominance = normalize(28 + totals.communication - totals.breadth * 0.15 + totals.confidence * 0.1);
  const operationalMaturity = normalize(26 + totals.maturity - totals.lowMaturity * 0.45 - totals.breadth * 0.08);
  const breakdownSeverity = normalize(24 + totals.severity + totals.breadth * 0.18 + totals.communication * 0.08);
  const urgencyReadiness = normalize(20 + totals.urgency + totals.readiness * 0.45 + totals.severity * 0.05);
  const trustSensitive = totals.trust >= 14 && (answers.q4 === 'client-trust' || answers.q4 === 'referral-partner-confidence');
  const lowMaturity = totals.lowMaturity >= 18 || answers.q5 === 'memory-inbox-habits' || answers.q5 === 'mixed-tools-no-center';

  return {
    totals,
    communicationDominance,
    operationalMaturity,
    breakdownSeverity,
    urgencyReadiness,
    lowMaturity,
    trustSensitive,
  };
}

export function selectBranchFamily(answers) {
  const provisional = mapProvisionalScores(answers);
  const communicationSignal = provisional.communicationDominance;
  const operationalSignal = normalize(22 + provisional.totals.breadth + provisional.totals.lowMaturity * 0.45 + (answers.q3 === 'handoffs-ownership-gaps' ? 18 : 0));
  const mixedSignal = normalize(24 + (answers.q3 === 'do-not-know-what-first' ? 18 : 0) + (answers.q6 === 'wasting-time-root-problem' ? 10 : 0));

  if (provisional.lowMaturity || provisional.trustSensitive) {
    return { branchKey: 'D', provisional, reasons: ['low-maturity-or-trust-sensitive'] };
  }

  if (
    communicationSignal >= 62 &&
    (answers.q3 === 'missed-follow-up' || answers.q3 === 'buried-commitments') &&
    (answers.q6 === 'deals-revenue-slip' || answers.q6 === 'clients-partners-neglected')
  ) {
    return { branchKey: 'B', provisional, reasons: ['communication-risk-dominant'] };
  }

  if (
    operationalSignal >= 62 &&
    (answers.q3 === 'handoffs-ownership-gaps' || answers.q6 === 'team-dependent-on-me' || answers.q6 === 'more-chaos-as-volume-grows')
  ) {
    return { branchKey: 'C', provisional, reasons: ['operational-fragility-dominant'] };
  }

  return {
    branchKey: mixedSignal > 34 ? 'A' : 'A',
    provisional,
    reasons: ['mixed-or-unclear'],
  };
}

function scoreFinal(questions, answers) {
  const totals = emptyTotals();
  questions.forEach((question) => {
    const selected = getOption(question, answers[question.id]);
    if (selected) applyEffects(totals, selected.effects);
  });

  const breakdownSeverity = normalize(22 + totals.severity * 0.48 + totals.breadth * 0.08 + totals.urgency * 0.05);
  const communicationRisk = normalize(16 + totals.communication * 0.45 - totals.breadth * 0.12 + totals.confidence * 0.15);
  const operationalMaturity = normalize(30 + totals.maturity * 0.75 - totals.lowMaturity * 0.5 - totals.breadth * 0.06);
  const urgencyReadiness = normalize(12 + totals.urgency * 0.55 + totals.readiness * 0.55 + totals.severity * 0.06 - totals.trust * 0.1);
  const breadthScore = normalize(14 + totals.breadth * 0.62 + totals.lowMaturity * 0.22);
  const routeConfidence = normalize(
    18 +
      totals.confidence * 0.7 +
      (Math.abs(communicationRisk - breadthScore) >= 20 ? 8 : 0) +
      (urgencyReadiness >= 55 ? 8 : 0) +
      (operationalMaturity >= 34 ? 6 : 0)
  );
  const lowMaturityFlag = operationalMaturity < 26 || totals.lowMaturity >= 60;
  const trustSensitiveFlag = totals.trust >= 18;

  return {
    totals,
    breakdownSeverity,
    communicationRisk,
    operationalMaturity,
    urgencyReadiness,
    routeConfidence,
    breadthScore,
    lowMaturityFlag,
    trustSensitiveFlag,
  };
}

function classifySeverity(score, urgency) {
  if (score >= 74 || urgency >= 74) return 'Immediate';
  if (score >= 52 || urgency >= 52) return 'High';
  return 'Emerging';
}

function classifyUrgency(urgency) {
  if (urgency >= 72) return 'Immediate attention';
  if (urgency >= 50) return 'Near-term attention';
  return 'Monitor and prioritize';
}

function recommendationFromScores(scores) {
  const tracktQualified =
    scores.communicationRisk >= 68 &&
    scores.operationalMaturity >= 44 &&
    scores.breadthScore <= 48 &&
    scores.urgencyReadiness >= 48 &&
    scores.routeConfidence >= 66;

  if (
    scores.urgencyReadiness < 42 &&
    (scores.breakdownSeverity < 62 || scores.routeConfidence < 46)
  ) {
    return 'Education first';
  }

  if (scores.lowMaturityFlag) {
    return 'Cleanup first';
  }

  if (
    scores.breakdownSeverity >= 66 &&
    scores.breadthScore >= 56 &&
    scores.operationalMaturity >= 34 &&
    scores.urgencyReadiness >= 56
  ) {
    return 'Implementation first';
  }

  if (tracktQualified) {
    return 'Trackt likely first';
  }

  return 'Blueprint first';
}

function routeKeyForRecommendation(recommendation) {
  if (recommendation === 'Trackt likely first') return 'trackt';
  if (recommendation === 'Implementation first') return 'implementation';
  if (recommendation === 'Cleanup first') return 'cleanup';
  if (recommendation === 'Education first') return 'education';
  return 'blueprint';
}

const breakdownLibrary = {
  'missed-follow-up': {
    title: 'Missed follow-up is creating avoidable revenue exposure.',
    summary: 'Important next steps are slipping because the system is not surfacing them early enough.',
  },
  'buried-commitments': {
    title: 'Commitments are getting buried inside normal communication flow.',
    summary: 'The issue is less about activity volume and more about visibility into what actually matters now.',
  },
  'handoff-gaps': {
    title: 'Ownership gets blurry when work moves between people.',
    summary: 'Risk is increasing at handoff points, not just inside a single inbox.',
  },
  'ownership-ambiguity': {
    title: 'The next owner is not consistently obvious.',
    summary: 'Even when the team is trying hard, accountability is getting diluted by unclear ownership.',
  },
  'reactive-visibility': {
    title: 'Your team is reacting to problems after they surface.',
    summary: 'By the time risk is visible, trust or revenue has already started to erode.',
  },
  'memory-dependence': {
    title: 'Too much of the workflow still depends on memory.',
    summary: 'That makes any product layer fragile because the operating foundation is still manual.',
  },
  heroics: {
    title: 'Strong people are compensating for weak systems.',
    summary: 'The business is getting rescued by effort instead of being carried by a reliable process.',
  },
  'process-fragility': {
    title: 'The process itself is not stable enough yet.',
    summary: 'The sharper problem is not awareness alone. It is what happens after the team sees the issue.',
  },
  'visibility-gap': {
    title: 'The system can track activity, but not real risk.',
    summary: 'Current tools show movement. They do not show what is quietly moving toward failure.',
  },
  'broad-fragility': {
    title: 'The issue is spread across more than communication.',
    summary: 'Intake, handoffs, follow-through, and reporting are feeding the same operating leak.',
  },
  'prioritization-gap': {
    title: 'The first move is still unclear.',
    summary: 'Pain is present, but the business needs ordering before it needs another tool or workflow build.',
  },
  'trust-sensitive': {
    title: 'Any next step will need trust and boundaries to land well.',
    summary: 'The recommendation has to respect workflow sensitivity, not just technical fit.',
  },
};

function topBreakdowns(questions, answers) {
  const counts = collectBreakdownCounts(questions, answers);
  const entries = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  return entries.slice(0, 3).map(([tag]) => breakdownLibrary[tag] || { title: tag, summary: tag });
}

function diagnosisHeadline(recommendation, scores) {
  if (recommendation === 'Trackt likely first') {
    return 'Your sharpest leak looks like communication risk, not a full operating rebuild.';
  }
  if (recommendation === 'Implementation first') {
    return 'The bigger problem looks broader than missed follow-up alone.';
  }
  if (recommendation === 'Cleanup first') {
    return 'The system is still too memory-dependent for a product-first fix.';
  }
  if (recommendation === 'Education first') {
    return 'The signal is real, but the business does not look ready for a heavy intervention yet.';
  }
  if (scores.breadthScore >= 56) {
    return 'Several weak points are likely amplifying each other inside the workflow.';
  }
  return 'The pain is clear, but the first move still needs prioritization before execution.';
}

function whyCurrentSetup(scores, answers, recommendation) {
  if (recommendation === 'Trackt likely first') {
    return 'Your current setup appears able to act once risk is visible. The gap is seeing the right commitments, questions, and follow-up risk early enough.';
  }
  if (recommendation === 'Implementation first') {
    return 'Current tools may be capturing activity, but they are not solving ownership, consistency, or cross-workflow handoffs. That keeps the same leak showing up in different places.';
  }
  if (recommendation === 'Cleanup first') {
    return 'The workflow still depends too heavily on memory, patchwork, or heroics. Even better visibility would be hard to act on consistently right now.';
  }
  if (recommendation === 'Education first') {
    return 'The consequence signal is still light. The issue is visible, but it does not yet look urgent enough for a high-friction fix.';
  }
  if (answers.q9 === 'not-sure-full-scope') {
    return 'The core problem may be bigger than any one symptom, but the exact first move is still blurred by mixed signals across visibility, ownership, and process.';
  }
  return 'Right now the setup is exposing pain without clearly showing whether the first fix belongs in product, workflow repair, or sequencing.';
}

function recommendationBody(recommendation) {
  if (recommendation === 'Trackt likely first') {
    return 'Trackt looks like the best first route because the sharpest problem is earlier visibility into at-risk commitments and follow-through. This recommendation does not assume software is the answer every time. It is specific to the pattern in your answers.';
  }
  if (recommendation === 'Implementation first') {
    return 'A contained operating fix should come before a visibility layer. The leak looks broad enough that workflow repair will create more leverage than dropping a product into the middle of it.';
  }
  if (recommendation === 'Cleanup first') {
    return 'Stabilization should come first. Clean up ownership, memory dependence, and process consistency before layering in product or automation.';
  }
  if (recommendation === 'Education first') {
    return 'A lighter education-first route makes more sense right now. The issue is visible, but the business may need clearer internal alignment before a stronger move is useful.';
  }
  return 'The Full Operational Blueprint looks like the right next move because the business likely needs prioritization before it chooses product, implementation, or cleanup.';
}

function sequenceNote(recommendation, scores) {
  if (recommendation === 'Cleanup first') {
    return 'Sequence note. Stabilize the operating layer first. Then reassess whether product or implementation should come next.';
  }
  if (recommendation === 'Blueprint first' && scores.routeConfidence < 68) {
    return 'Sequence note. The first move is directionally clear, but not sharp enough yet for a product-first or implementation-first push.';
  }
  if (recommendation === 'Implementation first' && scores.communicationRisk >= 64) {
    return 'Sequence note. Once the process is tighter, a visibility layer may become the right second move.';
  }
  return '';
}

function gateDiagnosis(recommendation, scores) {
  if (recommendation === 'Trackt likely first') {
    return 'Your answers suggest the sharpest issue is communication visibility. Important commitments and follow-up risk are likely getting noticed too late, while the operating foundation looks stable enough to act once the signal is visible.';
  }
  if (recommendation === 'Implementation first') {
    return 'Your answers suggest the problem is broader than missed follow-up alone. Weak ownership, inconsistent execution, and cross-workflow friction are likely amplifying the communication breakdown.';
  }
  if (recommendation === 'Cleanup first') {
    return 'Your answers suggest the business is still relying too heavily on memory, patchwork, or heroics. That makes any tool-first move weaker until the operating footing is cleaner.';
  }
  if (recommendation === 'Education first') {
    return 'Your answers suggest the leak is still emerging. The issue is real, but the business may not be close enough to action for a heavier intervention to land well yet.';
  }
  return 'Your answers suggest the problem is real, but the first move is still mixed. Several weak points may be interacting, which is why clearer prioritization should come before a narrower solution.';
}

function previewBullets(recommendation, breakdowns, scores) {
  const primary = breakdowns[0]?.title || 'Your primary breakdown pattern';
  const why = whyCurrentSetup(scores, {}, recommendation);
  const next = recommendation === 'Blueprint first'
    ? 'The report will show why the Full Operational Blueprint should come before product or implementation.'
    : recommendation === 'Trackt likely first'
      ? 'The report will show why a visibility layer looks like the strongest first move.'
      : recommendation === 'Implementation first'
        ? 'The report will show why an operating-layer fix should come before another tool.'
        : recommendation === 'Cleanup first'
          ? 'The report will show what needs to be stabilized before product or automation.'
          : 'The report will show the lowest-friction next step to start with.';

  return [
    primary,
    why,
    next,
  ];
}

export function buildBlueprintSession(answers, identity = {}) {
  const branchSelection = selectBranchFamily(answers);
  const trustSensitiveOverride = branchSelection.provisional.trustSensitive;
  const branchQuestions = getBranchQuestions(branchSelection.branchKey, trustSensitiveOverride);
  const allQuestions = [...universalQuestions, ...branchQuestions];
  const scores = scoreFinal(allQuestions, answers);
  const recommendation = recommendationFromScores(scores);
  const breakdowns = topBreakdowns(allQuestions, answers);
  const severityCue = classifySeverity(scores.breakdownSeverity, scores.urgencyReadiness);
  const urgencyRead = classifyUrgency(scores.urgencyReadiness);
  const primaryCtaRoute = routeKeyForRecommendation(recommendation);
  const primaryCta = ctaRoutes[primaryCtaRoute];
  const headline = diagnosisHeadline(recommendation, scores);
  const whyMissed = whyCurrentSetup(scores, answers, recommendation);
  const recommendationText = recommendationBody(recommendation);
  const sequence = sequenceNote(recommendation, scores);
  const gateSentence = gateDiagnosis(recommendation, scores);
  const preview = previewBullets(recommendation, breakdowns, scores);

  const session = {
    answers,
    identity,
    branchFamily: branchSelection.branchKey,
    branchLabel: branchFamilies[branchSelection.branchKey].label,
    trustSensitiveOverride,
    scores,
    recommendation,
    primaryCtaRoute,
    primaryCta,
    severityCue,
    urgencyRead,
    headline,
    breakdowns,
    whyMissed,
    recommendationText,
    sequence,
    gateSentence,
    preview,
  };

  return session;
}

export function buildPayload(session) {
  const { answers, identity, branchFamily, scores, recommendation, primaryCtaRoute, trustSensitiveOverride } = session;
  const branchQuestions = getBranchQuestions(branchFamily, trustSensitiveOverride);

  const payload = {
    first_name: identity.firstName || '',
    email: identity.email || '',
    blueprint_role: labelFor('q1', answers.q1),
    blueprint_people_affecting_next_step: labelFor('q2', answers.q2),
    blueprint_biggest_problem: labelFor('q3', answers.q3),
    blueprint_first_impact: labelFor('q4', answers.q4),
    blueprint_current_followup_method: labelFor('q5', answers.q5),
    blueprint_90_day_risk: labelFor('q6', answers.q6),
    blueprint_branch_family: branchFamily,
    blueprint_q7_response: labelFor(branchQuestions[0].id, answers.q7, branchFamily, trustSensitiveOverride),
    blueprint_q8_response: labelFor(branchQuestions[1].id, answers.q8, branchFamily, trustSensitiveOverride),
    blueprint_q9_response: labelFor(branchQuestions[2].id, answers.q9, branchFamily, trustSensitiveOverride),
    blueprint_q10_response: labelFor(branchQuestions[3].id, answers.q10, branchFamily, trustSensitiveOverride),
    blueprint_q11_response: labelFor(branchQuestions[4].id, answers.q11, branchFamily, trustSensitiveOverride),
    blueprint_q12_response: labelFor(branchQuestions[5].id, answers.q12, branchFamily, trustSensitiveOverride),
    blueprint_q7_id: branchQuestions[0].id,
    blueprint_q8_id: branchQuestions[1].id,
    blueprint_q9_id: branchQuestions[2].id,
    blueprint_q10_id: branchQuestions[3].id,
    blueprint_q11_id: branchQuestions[4].id,
    blueprint_q12_id: branchQuestions[5].id,
    blueprint_primary_problem_class: session.headline,
    blueprint_primary_recommendation: recommendation,
    blueprint_secondary_sequence_note_optional: session.sequence || '',
    blueprint_breakdown_severity_score: scores.breakdownSeverity,
    blueprint_communication_risk_score: scores.communicationRisk,
    blueprint_operational_maturity_score: scores.operationalMaturity,
    blueprint_urgency_readiness_score: scores.urgencyReadiness,
    blueprint_route_confidence_score: scores.routeConfidence,
    blueprint_trust_sensitive_flag: scores.trustSensitiveFlag,
    blueprint_low_maturity_flag: scores.lowMaturityFlag,
    blueprint_primary_cta_route: primaryCtaRoute,
    blueprint_strategy_review_eligible: primaryCtaRoute === 'blueprint' || primaryCtaRoute === 'implementation',
    blueprint_trackt_route_eligible: primaryCtaRoute === 'trackt',
    blueprint_nurture_segment: primaryCtaRoute === 'education' ? 'education-first' : primaryCtaRoute === 'cleanup' ? 'cleanup-first' : 'high-intent',
    zoho_live_connected: false,
  };

  return payload;
}

function labelFor(questionId, answerValue, branchKey = 'A', trustSensitiveOverride = false) {
  const question = getQuestionById(questionId, branchKey, trustSensitiveOverride);
  return getOption(question, answerValue)?.label || '';
}

export function buildReport(session, payload) {
  const name = session.identity.firstName ? `${session.identity.firstName},` : 'There,';
  const breakdownTitles = session.breakdowns.map((item) => item.title);
  const report = {
    subject: `Your AARYX Blueprint Assessment: ${session.recommendation}`,
    preview: `${session.headline} ${session.recommendationText}`,
    body: [
      `Hi ${name}`,
      '',
      'Your AARYX Blueprint Assessment is ready.',
      '',
      'Your main operating risk',
      session.headline,
      '',
      'What is breaking first',
      breakdownTitles[0] || session.breakdowns[0]?.summary || session.headline,
      '',
      'Why current tools or habits are not catching it early enough',
      session.whyMissed,
      '',
      'Where the issue appears to live',
      session.recommendation === 'Trackt likely first'
        ? 'This looks mostly communication visibility driven.'
        : session.recommendation === 'Implementation first'
          ? 'This looks broader than communication visibility alone.'
          : session.recommendation === 'Cleanup first'
            ? 'This looks like low-maturity workflow risk first.'
            : 'This looks mixed enough that prioritization should come before a narrower fix.',
      '',
      'What this likely costs if ignored',
      session.severityCue === 'Immediate'
        ? 'The leak is likely already touching trust, timing, or revenue in a meaningful way.'
        : session.severityCue === 'High'
          ? 'The leak is likely compounding quietly and will become more expensive if it keeps running.'
          : 'The leak is still emerging, but it is easier to address now than after volume increases.',
      '',
      'What should come first',
      session.recommendationText,
      '',
      'Why this route was chosen',
      `Branch family selected: ${session.branchLabel}. Route confidence stayed internal, but the recommendation strengthened because the answers aligned around ${session.primaryCtaRoute}.`,
      '',
      'Your next best step',
      `${session.primaryCta.label}: ${session.primaryCta.href}`,
      session.sequence || '',
      '',
      'Trust note',
      'This recommendation is based on the pattern in your answers, not a full system audit. Trackt is only recommended when earlier visibility appears to be the sharpest problem.',
      '',
      'CRM-ready snapshot',
      JSON.stringify(payload, null, 2),
    ].filter(Boolean).join('\n'),
  };

  return report;
}

export function persistBlueprintArtifacts(session, payload, report) {
  localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session));
  localStorage.setItem(STORAGE_KEYS.payload, JSON.stringify(payload));
  localStorage.setItem(STORAGE_KEYS.report, JSON.stringify(report));
}

export function restoreBlueprintArtifacts() {
  try {
    return {
      session: JSON.parse(localStorage.getItem(STORAGE_KEYS.session) || 'null'),
      payload: JSON.parse(localStorage.getItem(STORAGE_KEYS.payload) || 'null'),
      report: JSON.parse(localStorage.getItem(STORAGE_KEYS.report) || 'null'),
    };
  } catch {
    return { session: null, payload: null, report: null };
  }
}

export function buildQuestionSequence(answers) {
  const branchSelection = selectBranchFamily(answers);
  const branchQuestions = getBranchQuestions(branchSelection.branchKey, branchSelection.provisional.trustSensitive);
  return {
    branchSelection,
    questions: [...universalQuestions, ...branchQuestions],
  };
}

export function emailServiceAvailable() {
  return false;
}

export function queueEmailReport(report) {
  if (emailServiceAvailable()) {
    return { delivered: true, message: 'Report sent through the configured email service.' };
  }
  return {
    delivered: false,
    message: 'No email delivery service is configured in this repo yet. The report draft was generated and stored locally for testing.',
    report,
  };
}

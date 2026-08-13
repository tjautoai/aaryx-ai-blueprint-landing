export const STORAGE_KEYS = {
  session: 'aaryx-blueprint-session-v1',
  payload: 'aaryx-blueprint-payload-v1',
  report: 'aaryx-blueprint-report-v1',
};

const option = (value, label, effects = {}, breakdownTags = []) => ({
  value,
  label,
  effects,
  breakdownTags,
});

const sharedTimingOptions = [
  option('immediately', 'Immediately', { urgency: 28, readiness: 26, confidence: 8 }, ['readiness-now']),
  option('next-30-days', 'In the next 30 days', { urgency: 22, readiness: 22, confidence: 6 }, ['readiness-soon']),
  option('next-quarter', 'In the next quarter', { urgency: 14, readiness: 14, confidence: 2 }, ['readiness-quarter']),
  option('later-this-year', 'Later this year', { urgency: 6, readiness: 5, confidence: -2 }, ['readiness-later']),
  option('no-real-timeline', 'No real timeline yet', { urgency: 0, readiness: 0, confidence: -8 }, ['readiness-low']),
];

const sharedReliabilityOptions = [
  option('very-reliable', 'Very reliably', { maturity: 24, confidence: 8 }, ['consistent-process']),
  option('usually-reliable', 'Usually reliably', { maturity: 18, confidence: 6 }, ['mostly-consistent']),
  option('mixed', 'It depends on the person or situation', { maturity: 10, breadth: 8, confidence: 1 }, ['inconsistent-process']),
  option('often-inconsistent', 'Often inconsistently', { maturity: 4, breadth: 14, confidence: 4 }, ['inconsistent-process', 'handoff-gaps']),
  option('person-dependent', 'Mostly person-dependent', { maturity: 0, breadth: 16, lowMaturity: 24, confidence: 6 }, ['heroics', 'memory-dependence']),
];

export const universalQuestions = [
  {
    id: 'q1',
    field: 'blueprint_role',
    stage: 'Operating Reality',
    prompt: 'What best describes your role?',
    options: [
      option('founder-owner-principal', 'Founder / Owner / Principal'),
      option('operations-management', 'Operations / Management'),
      option('sales-business-development', 'Sales / Business Development'),
      option('client-facing-professional', 'Client-facing professional'),
      option('other', 'Other'),
    ],
  },
  {
    id: 'q2',
    field: 'blueprint_people_affecting_next_step',
    stage: 'Operating Reality',
    prompt: 'How many people can directly affect whether a lead, client, or account gets a timely next step?',
    options: [
      option('just-me', 'Just me', { severity: 8, communication: 10, breadth: 4, lowMaturity: 4 }, ['solo-overload']),
      option('2-3-people', '2 to 3 people', { severity: 12, communication: 12, breadth: 8 }, ['shared-follow-through']),
      option('4-7-people', '4 to 7 people', { severity: 16, communication: 12, breadth: 16, confidence: 3 }, ['handoff-gaps']),
      option('8-15-people', '8 to 15 people', { severity: 20, communication: 10, breadth: 22, confidence: 5 }, ['multi-person-fragility']),
      option('16-plus-people', '16+ people', { severity: 22, communication: 8, breadth: 24, confidence: 6 }, ['multi-person-fragility']),
    ],
  },
  {
    id: 'q3',
    field: 'blueprint_biggest_problem',
    stage: 'Breakdown Pattern',
    prompt: 'Which problem shows up most often right now?',
    options: [
      option('missed-follow-up', 'Missed follow-up', { severity: 18, communication: 26, urgency: 12 }, ['missed-follow-up']),
      option('buried-commitments', 'Buried commitments or unanswered questions', { severity: 20, communication: 28, urgency: 12 }, ['buried-commitments', 'reactive-visibility']),
      option('handoffs-ownership-gaps', 'Handoffs or ownership gaps', { severity: 22, breadth: 26, maturity: 8, urgency: 10 }, ['handoff-gaps', 'ownership-ambiguity']),
      option('manual-checking-chasing', 'Too much manual checking and chasing', { severity: 14, communication: 10, breadth: 16, maturity: 8 }, ['manual-chasing', 'reactive-visibility']),
      option('do-not-know-what-first', 'We know we need a better system, but do not know what first', { severity: 10, breadth: 18, readiness: 6, confidence: -2 }, ['prioritization-gap']),
    ],
  },
  {
    id: 'q4',
    field: 'blueprint_first_impact',
    stage: 'Breakdown Pattern',
    prompt: 'When something important gets missed, what does it usually affect first?',
    options: [
      option('revenue-conversion', 'Revenue or conversion', { severity: 26, urgency: 24, confidence: 5 }, ['revenue-exposure']),
      option('client-trust', 'Client trust', { severity: 24, urgency: 22, communication: 10, confidence: 5 }, ['trust-exposure']),
      option('referral-partner-confidence', 'Referral or partner confidence', { severity: 22, urgency: 18, communication: 10 }, ['partner-risk']),
      option('team-time-cleanup', 'Team time and cleanup work', { severity: 16, breadth: 12, urgency: 12 }, ['cleanup-work']),
      option('personal-stress-focus', 'Personal stress and lost focus', { severity: 10, urgency: 8, readiness: 4 }, ['founder-drag']),
    ],
  },
  {
    id: 'q5',
    field: 'blueprint_current_followup_method',
    stage: 'System Pressure',
    prompt: 'How are you handling follow-up and next-step tracking today?',
    options: [
      option('memory-inbox-habits', 'Mostly memory and inbox habits', { maturity: 0, communication: 8, lowMaturity: 28, breadth: 10, trust: 4 }, ['memory-dependence', 'heroics']),
      option('crm-manual-reminders', 'CRM plus manual reminders', { maturity: 14, communication: 18, confidence: 5 }, ['visibility-gap']),
      option('task-system-manual-checking', 'Task system plus manual checking', { maturity: 12, communication: 16, breadth: 8 }, ['manual-chasing', 'visibility-gap']),
      option('sops-people-discipline', 'SOPs plus people discipline', { maturity: 22, communication: 10, confidence: 6, trust: 6 }, ['process-present']),
      option('mixed-tools-no-center', 'Mixed tools with no trusted center', { maturity: 4, communication: 12, breadth: 18, lowMaturity: 14, trust: 8 }, ['tool-chaos', 'reactive-visibility']),
    ],
  },
  {
    id: 'q6',
    field: 'blueprint_90_day_risk',
    stage: 'System Pressure',
    prompt: 'If this stays the same for the next 90 days, what is most likely to get worse first?',
    options: [
      option('deals-revenue-slip', 'Deals or revenue slipping quietly', { severity: 24, communication: 18, urgency: 28, confidence: 6 }, ['revenue-exposure', 'quiet-risk']),
      option('clients-partners-neglected', 'Clients or partners feeling neglected', { severity: 22, communication: 18, urgency: 24, confidence: 6 }, ['trust-exposure', 'quiet-risk']),
      option('team-dependent-on-me', 'The team staying dependent on me', { severity: 20, breadth: 24, urgency: 18, lowMaturity: 12 }, ['owner-dependence', 'heroics']),
      option('more-chaos-as-volume-grows', 'More chaos as volume grows', { severity: 22, breadth: 24, urgency: 20, lowMaturity: 12 }, ['scaling-fragility']),
      option('wasting-time-root-problem', 'Wasting more time without fixing the root problem', { severity: 14, breadth: 12, urgency: 10, readiness: 4 }, ['manual-chasing', 'prioritization-gap']),
    ],
  },
];

export const questionBank = {
  q7_slip: {
    id: 'q7',
    field: 'blueprint_q7_response',
    stage: 'Branch Diagnosis',
    prompt: 'What tends to slip most often?',
    options: [
      option('follow-up-promises', 'Follow-up promises', { severity: 18, communication: 20 }, ['missed-follow-up']),
      option('client-prospect-questions', 'Client or prospect questions', { severity: 16, communication: 18 }, ['unanswered-questions']),
      option('internal-handoffs', 'Internal handoffs', { severity: 18, breadth: 18, maturity: 6 }, ['handoff-gaps']),
      option('deadlines-next-steps', 'Deadlines or next steps', { severity: 16, communication: 12, breadth: 10 }, ['deadline-drift']),
      option('referral-relationship-touchpoints', 'Referral or relationship touchpoints', { severity: 14, communication: 18, urgency: 8 }, ['relationship-cooling']),
    ],
  },
  q8_risk_visibility: {
    id: 'q8',
    field: 'blueprint_q8_response',
    stage: 'Branch Diagnosis',
    prompt: 'Which of these best describes how your team currently spots risk?',
    options: [
      option('log-activity-no-risk-clarity', 'We can log activity, but not see risk clearly', { communication: 18, confidence: 6 }, ['visibility-gap']),
      option('see-risk-too-late', 'We can see some risk, but too late', { communication: 20, urgency: 10, confidence: 7 }, ['reactive-visibility']),
      option('know-due-not-what-risk', 'We know what is due, not what is truly at risk', { communication: 18, confidence: 7 }, ['visibility-gap']),
      option('react-when-someone-notices', 'We mostly react when someone notices a problem', { communication: 14, breadth: 10, lowMaturity: 10, confidence: 5 }, ['reactive-visibility', 'heroics']),
      option('almost-no-live-visibility', 'We have almost no live visibility', { communication: 22, urgency: 8, confidence: 8 }, ['reactive-visibility']),
    ],
  },
  q9_scope: {
    id: 'q9',
    field: 'blueprint_q9_response',
    stage: 'Route Clarity',
    prompt: 'Are the problems isolated to communication, or do they show up across intake, scheduling, handoffs, reporting, and follow-through?',
    options: [
      option('mostly-communication-only', 'Mostly communication only', { communication: 16, breadth: 0, confidence: 10 }, ['communication-concentration']),
      option('communication-plus-adjacent', 'Communication plus a few adjacent issues', { communication: 12, breadth: 10, confidence: 6 }, ['mixed-pattern']),
      option('several-workflows-involved', 'Several workflows are involved', { communication: 6, breadth: 22, confidence: 8 }, ['broad-fragility']),
      option('broad-operating-layer-fragility', 'It is broad operating-layer fragility', { breadth: 28, maturity: 6, confidence: 10 }, ['broad-fragility', 'process-fragility']),
      option('not-sure-full-scope', 'We are not even sure of the full scope yet', { breadth: 16, readiness: 4, confidence: 2 }, ['scope-unclear']),
    ],
  },
  q10_reliability: {
    id: 'q10',
    field: 'blueprint_q10_response',
    stage: 'Route Clarity',
    prompt: 'How reliably does follow-up happen the same way across people and situations?',
    options: sharedReliabilityOptions,
  },
  q11_route_pain: {
    id: 'q11',
    field: 'blueprint_q11_response',
    stage: 'Recommendation',
    prompt: 'Which is more painful right now: not seeing risk early enough, or not having a reliable process after you see it?',
    options: [
      option('not-seeing-risk-early', 'Not seeing risk early enough', { communication: 18, confidence: 14 }, ['visibility-gap']),
      option('not-having-process-after', 'Not having a reliable process after we see it', { breadth: 20, maturity: 8, confidence: 14 }, ['process-fragility']),
      option('both-equally', 'Both equally', { communication: 8, breadth: 12, confidence: 6 }, ['mixed-pattern']),
      option('depends-who-involved', 'It depends who is involved', { breadth: 16, confidence: 4 }, ['inconsistent-process']),
    ],
  },
  q12_timing: {
    id: 'q12',
    field: 'blueprint_q12_response',
    stage: 'Recommendation',
    prompt: 'If the right first move were clear, when would solving this start to matter operationally?',
    options: sharedTimingOptions,
  },
  b_q9_inbox_confidence: {
    id: 'q9',
    field: 'blueprint_q9_response',
    stage: 'Route Clarity',
    prompt: 'If you opened your inbox right now, how confident are you that you could instantly spot what is truly at risk?',
    options: [
      option('very-confident', 'Very confident', { communication: 2, confidence: -2 }, ['visibility-present']),
      option('mostly-confident', 'Mostly confident', { communication: 6, confidence: 1 }, ['visibility-present']),
      option('mixed-confidence', 'Mixed', { communication: 12, confidence: 5 }, ['visibility-gap']),
      option('not-very-confident', 'Not very confident', { communication: 20, confidence: 8 }, ['reactive-visibility']),
      option('not-confident-at-all', 'Not confident at all', { communication: 24, urgency: 8, confidence: 10 }, ['reactive-visibility']),
    ],
  },
  b_q11_trackt_scope: {
    id: 'q11',
    field: 'blueprint_q11_response',
    stage: 'Recommendation',
    prompt: 'If a system surfaced only the items truly at risk, would that solve the sharpest part of the problem or only part of it?',
    options: [
      option('sharpest-part', 'That is the sharpest part of the problem', { communication: 22, confidence: 14 }, ['visibility-gap']),
      option('solve-most', 'It would solve most of the problem', { communication: 18, confidence: 11 }, ['visibility-gap']),
      option('important-part-not-all', 'It would solve one important part, not all of it', { communication: 10, breadth: 10, confidence: 6 }, ['mixed-pattern']),
      option('help-but-bigger-issue-broader', 'It would help, but the bigger issue is broader', { breadth: 18, confidence: 10 }, ['broad-fragility']),
      option('not-main-issue', 'It is not the main issue', { breadth: 20, maturity: 6, confidence: 10 }, ['process-fragility']),
    ],
  },
  c_q7_handoff_owner: {
    id: 'q7',
    field: 'blueprint_q7_response',
    stage: 'Branch Diagnosis',
    prompt: 'When work moves from one person to another, how clear is the next owner?',
    options: [
      option('always-clear', 'Always clear', { maturity: 24, confidence: 6 }, ['ownership-present']),
      option('usually-clear', 'Usually clear', { maturity: 18, confidence: 4 }, ['ownership-present']),
      option('mixed', 'Mixed', { breadth: 10, confidence: 4 }, ['ownership-ambiguity']),
      option('often-unclear', 'Often unclear', { breadth: 20, maturity: 6, confidence: 8 }, ['ownership-ambiguity', 'handoff-gaps']),
      option('usually-unclear', 'Usually unclear', { breadth: 24, lowMaturity: 8, confidence: 10 }, ['ownership-ambiguity', 'handoff-gaps']),
    ],
  },
  c_q8_scope: {
    id: 'q8',
    field: 'blueprint_q8_response',
    stage: 'Branch Diagnosis',
    prompt: 'Are the problems isolated to communication, or do they show up across intake, scheduling, handoffs, reporting, and follow-through?',
    options: [
      option('mostly-communication-only', 'Mostly communication only', { communication: 16, breadth: 0, confidence: 10 }, ['communication-concentration']),
      option('communication-plus-adjacent', 'Communication plus a few adjacent issues', { communication: 12, breadth: 10, confidence: 6 }, ['mixed-pattern']),
      option('several-workflows-involved', 'Several workflows are involved', { communication: 6, breadth: 22, confidence: 8 }, ['broad-fragility']),
      option('broad-operating-layer-fragility', 'It is broad operating-layer fragility', { breadth: 28, maturity: 6, confidence: 10 }, ['broad-fragility', 'process-fragility']),
      option('not-sure-full-scope', 'We are not even sure of the full scope yet', { breadth: 16, readiness: 4, confidence: 2 }, ['scope-unclear']),
    ],
  },
  c_q9_reliability: {
    id: 'q9',
    field: 'blueprint_q9_response',
    stage: 'Route Clarity',
    prompt: 'How reliably does follow-up happen the same way across people and situations?',
    options: sharedReliabilityOptions,
  },
  c_q10_team_statement: {
    id: 'q10',
    field: 'blueprint_q10_response',
    stage: 'Route Clarity',
    prompt: 'Which statement best fits your team today?',
    options: [
      option('disciplined-team-solid-system', 'Disciplined team with a solid system', { maturity: 24, confidence: 6 }, ['process-present']),
      option('good-people-weak-system', 'Good people carrying a weak system', { breadth: 18, lowMaturity: 10, confidence: 10 }, ['heroics', 'process-fragility']),
      option('mixed-discipline-mixed-systems', 'Mixed discipline and mixed systems', { breadth: 16, maturity: 10, confidence: 6 }, ['mixed-pattern']),
      option('strong-effort-weak-consistency', 'Strong effort, weak consistency', { breadth: 20, maturity: 8, confidence: 8 }, ['inconsistent-process']),
      option('heroics-and-patchwork', 'Heroics and patchwork', { breadth: 24, lowMaturity: 22, confidence: 10 }, ['heroics', 'memory-dependence']),
    ],
  },
  d_q8_memory_dependence: {
    id: 'q8',
    field: 'blueprint_q8_response',
    stage: 'Branch Diagnosis',
    prompt: 'How many steps in your client or lead process still depend mostly on memory?',
    options: [
      option('almost-none', 'Almost none', { maturity: 24, confidence: 6 }, ['process-present']),
      option('a-few', 'A few', { maturity: 18, confidence: 4 }, ['some-manual-risk']),
      option('several', 'Several', { maturity: 10, lowMaturity: 12, confidence: 6 }, ['memory-dependence']),
      option('many', 'Many', { maturity: 4, lowMaturity: 20, confidence: 8 }, ['memory-dependence', 'heroics']),
      option('most-of-them', 'Most of them', { maturity: 0, lowMaturity: 26, confidence: 10 }, ['memory-dependence', 'heroics']),
    ],
  },
  d_q11_heroics: {
    id: 'q11',
    field: 'blueprint_q11_response',
    stage: 'Recommendation',
    prompt: 'When things go well, is it because the system is reliable or because strong people compensate for weak systems?',
    options: [
      option('reliable-system', 'Reliable system', { maturity: 24, confidence: 6 }, ['process-present']),
      option('mostly-system-some-heroics', 'Mostly system with some heroics', { maturity: 16, confidence: 4 }, ['some-manual-risk']),
      option('mixed', 'Mixed', { maturity: 10, lowMaturity: 8, confidence: 4 }, ['mixed-pattern']),
      option('mostly-strong-people', 'Mostly strong people compensating', { maturity: 4, lowMaturity: 18, confidence: 8 }, ['heroics', 'process-fragility']),
      option('almost-entirely-heroics', 'Almost entirely heroics', { maturity: 0, lowMaturity: 24, confidence: 10 }, ['heroics', 'memory-dependence']),
    ],
  },
  d_q11_trust: {
    id: 'q11',
    field: 'blueprint_q11_response',
    stage: 'Recommendation',
    prompt: 'What would you need to feel comfortable testing a system in this part of your workflow?',
    options: [
      option('light-proof-enough', 'Light proof is enough', { trust: 4, readiness: 18, confidence: 3 }, ['trust-open']),
      option('clear-walkthrough', 'I would need a clear walkthrough', { trust: 10, readiness: 14, confidence: 4 }, ['trust-cautious']),
      option('strong-proof-boundaries', 'I would need strong proof and boundaries', { trust: 18, readiness: 10, confidence: 6 }, ['trust-sensitive']),
      option('security-approval-first', 'I would need security or approval confidence first', { trust: 24, readiness: 8, confidence: 7 }, ['trust-sensitive']),
      option('major-hurdle-right-now', 'Trust would be a major hurdle right now', { trust: 28, readiness: 2, confidence: 8 }, ['trust-sensitive', 'education-needed']),
    ],
  },
};

export const branchFamilies = {
  A: {
    key: 'A',
    label: 'Default mixed-ambiguity path',
    questionIds: ['q7_slip', 'q8_risk_visibility', 'q9_scope', 'q10_reliability', 'q11_route_pain', 'q12_timing'],
  },
  B: {
    key: 'B',
    label: 'Communication-risk dominant path',
    questionIds: ['q7_slip', 'q8_risk_visibility', 'b_q9_inbox_confidence', 'q10_reliability', 'b_q11_trackt_scope', 'q12_timing'],
  },
  C: {
    key: 'C',
    label: 'Operational-fragility dominant path',
    questionIds: ['c_q7_handoff_owner', 'c_q8_scope', 'c_q9_reliability', 'c_q10_team_statement', 'q11_route_pain', 'q12_timing'],
  },
  D: {
    key: 'D',
    label: 'Low-maturity or trust-sensitive path',
    questionIds: ['q7_slip', 'd_q8_memory_dependence', 'q9_scope', 'q10_reliability', 'd_q11_heroics', 'q12_timing'],
  },
};

export function getBranchQuestions(branchKey, trustSensitiveOverride = false) {
  const family = branchFamilies[branchKey] || branchFamilies.A;
  const ids = [...family.questionIds];
  if (branchKey === 'D' && trustSensitiveOverride) {
    ids[4] = 'd_q11_trust';
  }
  return ids.map((id) => questionBank[id]);
}

export const stageOrder = [
  'Framing',
  'Operating Reality',
  'Breakdown Pattern',
  'System Pressure',
  'Branch Diagnosis',
  'Route Clarity',
  'Recommendation',
  'Blueprint Ready',
  'Results',
];

export const ctaRoutes = {
  trackt: {
    label: 'Get Early Access to Trackt',
    href: 'https://trackt-landing.vercel.app/index.html',
  },
  blueprint: {
    label: 'Review the Full Operational Blueprint',
    href: 'https://cal.com/tejasdesai/15min',
  },
  implementation: {
    label: 'Discuss the First Operating Fix',
    href: 'https://cal.com/tejasdesai/15min',
  },
  cleanup: {
    label: 'See What Needs to Be Cleaned Up First',
    href: 'mailto:hello@aaryxai.com?subject=Cleanup%20First%20Blueprint%20Follow-up',
  },
  education: {
    label: 'Start with the Follow-Through Leak Scorecard',
    href: 'mailto:hello@aaryxai.com?subject=Follow-Through%20Leak%20Scorecard',
  },
};

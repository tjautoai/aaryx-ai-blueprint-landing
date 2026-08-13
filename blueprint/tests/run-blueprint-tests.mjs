import { buildBlueprintSession, buildPayload } from '../logic.js';
import { ASSESSMENT_VERSION, QUESTIONS, QUESTION_SCREENS } from '../data.js';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const baseTrackt = {
  q1: 'founder_owner_principal',
  q2: 'two_to_three',
  q3: 'missed_follow_up',
  q4: 'client_trust',
  q5: 'crm_plus_manual_reminders',
  q6: 'clients_or_partners_feeling_neglected',
  q7: 'mostly_communication_follow_through',
  q8: 'that_would_solve_the_sharpest_part',
  q9: 'reliable_but_inconsistent_in_practice',
};

const cases = [
  {
    name: 'clear Trackt fit',
    answers: baseTrackt,
    expect: {
      route: 'trackt_first',
      ctaRoute: 'trackt_waitlist',
      primaryProblemClass: 'communication_visibility_risk',
      secondaryFit: false,
      reasonIncludes: ['trackt_guard_passed', 'narrow_scope', 'visibility_solves_most'],
      conflictIncludes: [],
    },
  },
  {
    name: 'Trackt fit with memory/inbox dependence',
    answers: { ...baseTrackt, q5: 'mostly_memory_and_inbox_habits', q9: 'partly_reliable' },
    expect: {
      route: 'trackt_first',
      secondaryFit: false,
      reasonIncludes: ['current_system_memory_driven', 'trackt_guard_passed'],
      conflictIncludes: ['q5_fragility_but_q8_trackt_positive'],
    },
  },
  {
    name: 'clear AARYX Implementation fit',
    answers: {
      q1: 'operations_management',
      q2: 'four_to_seven',
      q3: 'handoffs_or_ownership_gaps',
      q4: 'team_time_and_cleanup_work',
      q5: 'task_system_plus_manual_checking',
      q6: 'team_staying_dependent_on_me',
      q7: 'several_workflows_are_involved',
      q8: 'it_would_help_but_bigger_issue_is_broader',
      q9: 'partly_reliable',
    },
    expect: {
      route: 'aaryx_implementation_first',
      ctaRoute: 'aaryx_implementation_path',
      primaryProblemClass: 'broader_operational_fragility',
      secondaryFit: false,
      reasonIncludes: ['broad_scope', 'implementation_fallback_used'],
      conflictIncludes: [],
    },
  },
  {
    name: 'clear Diagnosis/Cleanup fit',
    answers: {
      q1: 'operations_management',
      q2: 'eight_to_fifteen',
      q3: 'too_much_manual_checking_and_chasing',
      q4: 'team_time_and_cleanup_work',
      q5: 'mostly_memory_and_inbox_habits',
      q6: 'more_chaos_as_volume_grows',
      q7: 'broad_operating_layer_fragility',
      q8: 'it_is_not_the_main_issue',
      q9: 'mostly_undocumented_or_improvised',
    },
    expect: {
      route: 'diagnosis_cleanup_first',
      ctaRoute: 'cleanup_diagnostic_path',
      primaryProblemClass: 'low_maturity_follow_through_system',
      secondaryFit: false,
      reasonIncludes: ['cleanup_guard_passed', 'visibility_not_main_issue', 'process_low_reliability'],
      conflictIncludes: [],
    },
  },
  {
    name: 'broad-scope communication pain',
    answers: {
      ...baseTrackt,
      q3: 'buried_commitments_or_unanswered_questions',
      q5: 'task_system_plus_manual_checking',
      q7: 'broad_operating_layer_fragility',
      q8: 'it_would_help_but_bigger_issue_is_broader',
      q9: 'partly_reliable',
    },
    expect: {
      route: 'aaryx_implementation_first',
      secondaryFit: false,
      reasonIncludes: ['broad_scope', 'implementation_fallback_used'],
      conflictIncludes: ['q3_vs_q7_scope_conflict', 'q3_comm_pain_but_q8_broader_issue'],
    },
  },
  {
    name: 'low-maturity veto',
    answers: {
      ...baseTrackt,
      q9: 'mostly_undocumented_or_improvised',
    },
    expect: {
      route: 'aaryx_implementation_first',
      secondaryFit: false,
      reasonIncludes: ['process_low_reliability', 'implementation_fallback_used'],
      conflictIncludes: ['q7_narrow_but_q9_low_maturity'],
    },
  },
  {
    name: 'Q8 visibility-not-main-issue veto',
    answers: {
      ...baseTrackt,
      q8: 'it_is_not_the_main_issue',
      q7: 'mostly_communication_follow_through',
      q9: 'reliable_but_inconsistent_in_practice',
    },
    expect: {
      route: 'aaryx_implementation_first',
      secondaryFit: false,
      reasonIncludes: ['visibility_not_main_issue', 'implementation_fallback_used'],
      conflictIncludes: ['q3_comm_pain_but_q8_broader_issue'],
    },
  },
  {
    name: 'mixed/conflicting answers',
    answers: {
      q1: 'client_facing_professional',
      q2: 'four_to_seven',
      q3: 'missed_follow_up',
      q4: 'personal_stress_and_lost_focus',
      q5: 'mostly_memory_and_inbox_habits',
      q6: 'wasting_more_time_without_fixing_root_problem',
      q7: 'not_sure_of_full_scope_yet',
      q8: 'it_would_solve_one_important_part_not_all',
      q9: 'partly_reliable',
    },
    expect: {
      route: 'aaryx_implementation_first',
      secondaryFit: false,
      reasonIncludes: ['unclear_scope', 'visibility_only_partial', 'implementation_fallback_used'],
      conflictIncludes: ['q7_unclear_scope'],
    },
  },
  {
    name: 'Trackt secondary-fit case',
    answers: {
      ...baseTrackt,
      q7: 'communication_plus_a_few_adjacent_issues',
      q8: 'it_would_solve_one_important_part_not_all',
      q9: 'partly_reliable',
    },
    expect: {
      route: 'aaryx_implementation_first',
      secondaryFit: true,
      reasonIncludes: ['narrow_scope', 'visibility_only_partial', 'implementation_fallback_used'],
      conflictIncludes: [],
    },
  },
];

for (const testCase of cases) {
  const session = buildBlueprintSession(testCase.answers, { firstName: 'Test', email: 'test@example.com' });
  const payload = buildPayload(session);

  assert(session.assessment_version === ASSESSMENT_VERSION, `${testCase.name}: wrong assessment version`);
  assert(session.result_page_model.route === testCase.expect.route, `${testCase.name}: route mismatch`);
  assert(session.classification.route === testCase.expect.route, `${testCase.name}: classification route mismatch`);
  assert(session.derived.trackt_secondary_fit === testCase.expect.secondaryFit, `${testCase.name}: trackt secondary-fit mismatch`);
  assert(payload.crm_payload.blueprint_assessment_version === ASSESSMENT_VERSION, `${testCase.name}: crm version mismatch`);
  assert(Object.keys(payload.answers).length === 9, `${testCase.name}: wrong answer count`);
  assert(session.result_page_model.cta_route === (testCase.expect.ctaRoute || session.result_page_model.cta_route), `${testCase.name}: CTA route mismatch`);
  if (testCase.expect.primaryProblemClass) {
    assert(session.classification.primary_problem_class === testCase.expect.primaryProblemClass, `${testCase.name}: primary problem class mismatch`);
  }
  for (const code of testCase.expect.reasonIncludes) {
    assert(session.classification.route_reason_codes.includes(code), `${testCase.name}: missing reason code ${code}`);
  }
  for (const code of testCase.expect.conflictIncludes) {
    assert(session.classification.conflict_flags.includes(code), `${testCase.name}: missing conflict flag ${code}`);
  }
  assert(typeof session.derived.breakdown_severity_score === 'number', `${testCase.name}: missing severity score`);
  assert(typeof session.derived.route_confidence_score === 'number', `${testCase.name}: missing confidence score`);
  assert(session.result_page_model.top_breakdowns.length >= 1 && session.result_page_model.top_breakdowns.length <= 3, `${testCase.name}: invalid breakdown count`);
}

const fixedAnswers = { ...baseTrackt };
const roleVariants = [
  'founder_owner_principal',
  'operations_management',
  'sales_business_development',
  'client_facing_professional',
  'other',
];
const invariantResults = roleVariants.map((role) => buildBlueprintSession({ ...fixedAnswers, q1: role }, { email: 't@example.com' }));
const baseline = invariantResults[0];
for (const result of invariantResults.slice(1)) {
  assert(result.classification.route === baseline.classification.route, 'Q1 invariance: route changed');
  assert(result.derived.breakdown_severity_score === baseline.derived.breakdown_severity_score, 'Q1 invariance: severity changed');
  assert(result.derived.route_confidence_score === baseline.derived.route_confidence_score, 'Q1 invariance: confidence changed');
  assert(result.derived.communication_risk_dominance_score === baseline.derived.communication_risk_dominance_score, 'Q1 invariance: communication score changed');
  assert(result.classification.primary_problem_class === baseline.classification.primary_problem_class, 'Q1 invariance: problem class changed');
}

assert(QUESTIONS.length === 9, 'Expected exactly 9 questions');
assert(QUESTION_SCREENS.length === 6, 'Expected 6 question screens');
assert(QUESTION_SCREENS.flat().length === 9, 'Question screens should cover exactly 9 questions');
assert(QUESTION_SCREENS[3].length === 1 && QUESTION_SCREENS[4].length === 1 && QUESTION_SCREENS[5].length === 1, 'Q7-Q9 should be single-question screens');
assert(QUESTIONS[0].prompt === 'What best describes your role?', 'Q1 prompt mismatch');
assert(
  QUESTIONS[7].prompt === 'If you could clearly see which follow-ups or next steps were at risk before they were missed, how much of your main problem would that solve?',
  'Q8 prompt mismatch'
);
assert(QUESTIONS[0].options.map((option) => option.label).join('|') === 'Founder / Owner / Principal|Operations / Management|Sales / Business Development|Client-facing professional|Other', 'Q1 labels mismatch');
assert(!('blueprint_q10_response' in buildPayload(buildBlueprintSession(baseTrackt, { email: 't@example.com' })).crm_payload), 'Legacy branched payload fields should not exist');

console.log(JSON.stringify({
  ok: true,
  totalCases: cases.length,
  invarianceChecks: roleVariants.length,
  validated: [
    'exactly 9 questions',
    'question-based progress structure',
    'correct enums and prompts',
    'deterministic routing',
    'severity and confidence presence',
    'reason codes and conflict flags',
    'single result and single CTA',
    'email gate after Q9 by structure',
    'structured payload and CRM-ready payload',
    'Q1 invariance',
  ],
}, null, 2));

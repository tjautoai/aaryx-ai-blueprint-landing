export const ASSESSMENT_VERSION = '2.0.0-locked-9q';

export const STORAGE_KEYS = {
  session: 'aaryx-blueprint-session-v2',
  payload: 'aaryx-blueprint-payload-v2',
  report: 'aaryx-blueprint-report-v2',
  draft: 'aaryx-blueprint-draft-v2',
};

const option = (value, label, meta = {}) => ({
  value,
  label,
  ...meta,
});

export const QUESTIONS = [
  {
    id: 'q1',
    question_id: 'q1_role',
    field_name: 'role_type',
    answer_set_id: 'AS_ROLE_TYPE_V1',
    question_classification: 'qualification_context_only',
    required: true,
    display_order: 1,
    stage: 'Operating Reality',
    prompt: 'What best describes your role?',
    options: [
      option('founder_owner_principal', 'Founder / Owner / Principal'),
      option('operations_management', 'Operations / Management'),
      option('sales_business_development', 'Sales / Business Development'),
      option('client_facing_professional', 'Client-facing professional'),
      option('other', 'Other'),
    ],
  },
  {
    id: 'q2',
    question_id: 'q2_people_affecting_next_step',
    field_name: 'people_affecting_next_step',
    answer_set_id: 'AS_PEOPLE_AFFECTING_NEXT_STEP_V1',
    question_classification: 'complexity_handoff_pressure',
    required: true,
    display_order: 2,
    stage: 'Operating Reality',
    prompt: 'How many people can directly affect whether a lead, client, or account gets a timely next step?',
    options: [
      option('just_me', 'Just me', { breakdownTags: ['single-thread-dependence'] }),
      option('two_to_three', '2 to 3 people', { breakdownTags: ['shared-follow-through'] }),
      option('four_to_seven', '4 to 7 people', { breakdownTags: ['handoff-pressure'] }),
      option('eight_to_fifteen', '8 to 15 people', { breakdownTags: ['handoff-pressure', 'multi-layer-fragility'] }),
      option('sixteen_plus', '16+ people', { breakdownTags: ['handoff-pressure', 'multi-layer-fragility'] }),
    ],
  },
  {
    id: 'q3',
    question_id: 'q3_biggest_problem',
    field_name: 'biggest_problem',
    answer_set_id: 'AS_BIGGEST_PROBLEM_V1',
    question_classification: 'dominant_pain_route_signal',
    required: true,
    display_order: 3,
    stage: 'Breakdown Pattern',
    prompt: 'Which problem shows up most often right now?',
    options: [
      option('missed_follow_up', 'Missed follow-up', { breakdownTags: ['missed-follow-up'] }),
      option('buried_commitments_or_unanswered_questions', 'Buried commitments or unanswered questions', { breakdownTags: ['buried-commitments', 'visibility-gap'] }),
      option('handoffs_or_ownership_gaps', 'Handoffs or ownership gaps', { breakdownTags: ['handoff-gaps', 'ownership-ambiguity'] }),
      option('too_much_manual_checking_and_chasing', 'Too much manual checking and chasing', { breakdownTags: ['manual-chasing', 'process-fragility'] }),
      option('we_need_a_better_system_but_do_not_know_what_first', 'We know we need a better system, but do not know what first', { breakdownTags: ['prioritization-gap', 'scope-unclear'] }),
    ],
  },
  {
    id: 'q4',
    question_id: 'q4_first_impact',
    field_name: 'first_impact',
    answer_set_id: 'AS_FIRST_IMPACT_V1',
    question_classification: 'consequence_severity_signal',
    required: true,
    display_order: 4,
    stage: 'Breakdown Pattern',
    prompt: 'When something important gets missed, what does it usually affect first?',
    options: [
      option('revenue_or_conversion', 'Revenue or conversion', { breakdownTags: ['revenue-risk'] }),
      option('client_trust', 'Client trust', { breakdownTags: ['trust-risk'] }),
      option('referral_or_partner_confidence', 'Referral or partner confidence', { breakdownTags: ['trust-risk', 'relationship-risk'] }),
      option('team_time_and_cleanup_work', 'Team time and cleanup work', { breakdownTags: ['cleanup-work'] }),
      option('personal_stress_and_lost_focus', 'Personal stress and lost focus', { breakdownTags: ['founder-drag'] }),
    ],
  },
  {
    id: 'q5',
    question_id: 'q5_followup_method',
    field_name: 'followup_method',
    answer_set_id: 'AS_FOLLOWUP_METHOD_V1',
    question_classification: 'current_system_reality_fragility_signal',
    required: true,
    display_order: 5,
    stage: 'System Pressure',
    prompt: 'How are you handling follow-up and next-step tracking today?',
    options: [
      option('mostly_memory_and_inbox_habits', 'Mostly memory and inbox habits', { breakdownTags: ['memory-dependence', 'heroics'] }),
      option('crm_plus_manual_reminders', 'CRM plus manual reminders', { breakdownTags: ['visibility-gap'] }),
      option('task_system_plus_manual_checking', 'Task system plus manual checking', { breakdownTags: ['manual-chasing', 'visibility-gap'] }),
      option('sops_plus_people_discipline', 'SOPs plus people discipline', { breakdownTags: ['process-present'] }),
      option('mixed_tools_with_no_trusted_center', 'Mixed tools with no trusted center', { breakdownTags: ['tool-chaos', 'process-fragility'] }),
    ],
  },
  {
    id: 'q6',
    question_id: 'q6_ninety_day_risk',
    field_name: 'ninety_day_risk',
    answer_set_id: 'AS_NINETY_DAY_RISK_V1',
    question_classification: 'future_consequence_urgency_signal',
    required: true,
    display_order: 6,
    stage: 'System Pressure',
    prompt: 'If this stays the same for the next 90 days, what is most likely to get worse first?',
    options: [
      option('deals_or_revenue_slipping_quietly', 'Deals or revenue slipping quietly', { breakdownTags: ['revenue-risk', 'quiet-risk'] }),
      option('clients_or_partners_feeling_neglected', 'Clients or partners feeling neglected', { breakdownTags: ['trust-risk', 'quiet-risk'] }),
      option('team_staying_dependent_on_me', 'The team staying dependent on me', { breakdownTags: ['owner-dependence', 'heroics'] }),
      option('more_chaos_as_volume_grows', 'More chaos as volume grows', { breakdownTags: ['scaling-fragility', 'process-fragility'] }),
      option('wasting_more_time_without_fixing_root_problem', 'Wasting more time without fixing the root problem', { breakdownTags: ['manual-chasing', 'prioritization-gap'] }),
    ],
  },
  {
    id: 'q7',
    question_id: 'q7_problem_scope',
    field_name: 'problem_scope',
    answer_set_id: 'AS_PROBLEM_SCOPE_V1',
    question_classification: 'scope_separator_route_guard',
    required: true,
    display_order: 7,
    stage: 'Route Clarity',
    prompt: 'Are the problems mostly isolated to communication follow-through, or do they show up across other parts of the workflow too?',
    options: [
      option('mostly_communication_follow_through', 'Mostly communication follow-through', { breakdownTags: ['communication-concentration'] }),
      option('communication_plus_a_few_adjacent_issues', 'Communication plus a few adjacent issues', { breakdownTags: ['mixed-pattern'] }),
      option('several_workflows_are_involved', 'Several workflows are involved', { breakdownTags: ['broad-fragility'] }),
      option('broad_operating_layer_fragility', 'Broad operating-layer fragility', { breakdownTags: ['broad-fragility', 'process-fragility'] }),
      option('not_sure_of_full_scope_yet', 'We are not even sure of the full scope yet', { breakdownTags: ['scope-unclear', 'prioritization-gap'] }),
    ],
  },
  {
    id: 'q8',
    question_id: 'q8_visibility_solution_scope',
    field_name: 'visibility_solution_scope',
    answer_set_id: 'AS_VISIBILITY_SOLUTION_SCOPE_V1',
    question_classification: 'trackt_fit_separator_visibility_sufficiency',
    required: true,
    display_order: 8,
    stage: 'Route Clarity',
    prompt: 'If you could clearly see which follow-ups or next steps were at risk before they were missed, how much of your main problem would that solve?',
    options: [
      option('that_would_solve_the_sharpest_part', 'That would solve the sharpest part of the problem', { breakdownTags: ['visibility-gap'] }),
      option('it_would_solve_most_of_it', 'It would solve most of it', { breakdownTags: ['visibility-gap'] }),
      option('it_would_solve_one_important_part_not_all', 'It would solve one important part, not all of it', { breakdownTags: ['mixed-pattern'] }),
      option('it_would_help_but_bigger_issue_is_broader', 'It would help, but the bigger issue is broader', { breakdownTags: ['broad-fragility'] }),
      option('it_is_not_the_main_issue', 'It is not the main issue', { breakdownTags: ['process-fragility'] }),
    ],
  },
  {
    id: 'q9',
    question_id: 'q9_followup_consistency',
    field_name: 'followup_consistency',
    answer_set_id: 'AS_FOLLOWUP_CONSISTENCY_V1',
    question_classification: 'execution_maturity_route_guard',
    required: true,
    display_order: 9,
    stage: 'Recommendation',
    prompt: 'How reliably does follow-up happen the same way across people and situations?',
    options: [
      option('very_reliable', 'Very reliable', { breakdownTags: ['process-present'] }),
      option('reliable_but_inconsistent_in_practice', 'Reliable, but inconsistent in practice', { breakdownTags: ['mostly-consistent'] }),
      option('partly_reliable', 'Partly reliable', { breakdownTags: ['inconsistent-process'] }),
      option('loose_and_person_dependent', 'Loose and person-dependent', { breakdownTags: ['process-fragility', 'heroics'] }),
      option('mostly_undocumented_or_improvised', 'Mostly undocumented or improvised', { breakdownTags: ['process-fragility', 'memory-dependence'] }),
    ],
  },
];

export const QUESTION_MAP = Object.fromEntries(QUESTIONS.map((question) => [question.id, question]));

export const QUESTION_SCREENS = [
  ['q1', 'q2'],
  ['q3', 'q4'],
  ['q5', 'q6'],
  ['q7'],
  ['q8'],
  ['q9'],
];

export const STAGE_LABELS = ['Framing', 'Operating Reality', 'Breakdown Pattern', 'System Pressure', 'Route Clarity', 'Recommendation', 'Blueprint Ready', 'Results'];

export const ROUTE_LABELS = {
  trackt_first: 'Trackt First',
  aaryx_implementation_first: 'AARYX Implementation First',
  diagnosis_cleanup_first: 'Diagnosis / Cleanup First',
};

export const PRIMARY_PROBLEM_CLASS_LABELS = {
  communication_visibility_risk: 'Communication visibility risk',
  broader_operational_fragility: 'Broader operational fragility',
  low_maturity_follow_through_system: 'Low-maturity follow-through system',
};

export const CTA_ROUTES = {
  trackt_waitlist: {
    label: 'Get Early Access to Trackt',
    href: 'https://www.usetrackt.app/',
  },
  aaryx_implementation_path: {
    label: 'Review the First Operating Fix',
    href: 'https://cal.com/tejasdesai/15min',
  },
  cleanup_diagnostic_path: {
    label: 'See What Needs to Be Cleaned Up First',
    href: 'https://cal.com/tejasdesai/15min',
  },
};

export const ROUTE_REASON_CODE_LABELS = {
  narrow_scope: 'The problem looks mostly communication-centered.',
  broad_scope: 'The problem appears broader than communication alone.',
  unclear_scope: 'The current answers suggest the full scope is still unclear.',
  visibility_solves_most: 'Earlier visibility would solve the sharpest part or most of the problem.',
  visibility_only_partial: 'Better visibility would help, but only as one part of the fix.',
  visibility_not_main_issue: 'Better visibility does not appear to be the main issue.',
  current_system_memory_driven: 'The current system still depends heavily on memory and inbox habits.',
  current_system_fragmented: 'The current workflow is fragmented across tools without a trusted center.',
  process_partly_reliable: 'There is enough consistency to act on surfaced risk.',
  process_low_reliability: 'Execution reliability looks too weak for a product-first route.',
  consequence_relationship_risk: 'The cost shows up first in trust or relationship confidence.',
  consequence_revenue_risk: 'The cost shows up first in revenue or conversion risk.',
  consequence_owner_dependency: 'The pattern is increasing owner dependency or operational drag.',
  trackt_guard_passed: 'The Trackt-first route guard passed cleanly.',
  cleanup_guard_passed: 'The cleanup-first guard passed before any narrower route.',
  implementation_fallback_used: 'The broader implementation path is the strongest remaining first move.',
};

export const CONFLICT_FLAG_LABELS = {
  q3_vs_q7_scope_conflict: 'The dominant symptom and the stated scope point in different directions.',
  q5_fragility_but_q8_trackt_positive: 'The current system is fragile, but visibility still appears highly valuable.',
  q7_narrow_but_q9_low_maturity: 'The scope looks narrow, but execution reliability is weak.',
  q3_comm_pain_but_q8_broader_issue: 'Communication pain is visible, but the user says the bigger issue is broader.',
  q7_unclear_scope: 'The respondent is not yet sure of the full scope of the problem.',
};

export const BREAKDOWN_LIBRARY = {
  'missed-follow-up': {
    title: 'Missed follow-up is creating avoidable exposure.',
    summary: 'The issue is not effort alone. Important next steps are slipping before they get clear attention.',
  },
  'buried-commitments': {
    title: 'Commitments and unanswered questions are getting buried inside normal communication flow.',
    summary: 'Current tools may show activity, but they are not making the highest-risk follow-ups obvious early enough.',
  },
  'handoff-gaps': {
    title: 'Ownership gets blurry as work moves between people.',
    summary: 'The leak is not confined to one inbox. It grows at handoff points where accountability diffuses.',
  },
  'ownership-ambiguity': {
    title: 'The next owner is not consistently obvious.',
    summary: 'That weakens follow-through even when the team is trying hard.',
  },
  'manual-chasing': {
    title: 'Too much of the workflow still depends on manual checking and chasing.',
    summary: 'That creates operational drag and keeps the business reactive.',
  },
  'visibility-gap': {
    title: 'Current tools show movement, not what is actually at risk.',
    summary: 'The business can log activity without reliably seeing which commitments or follow-ups matter most right now.',
  },
  'process-fragility': {
    title: 'The operating layer itself is still fragile.',
    summary: 'The sharper issue is not only awareness. It is whether the team can execute consistently after risk becomes visible.',
  },
  'memory-dependence': {
    title: 'Too much of the workflow still depends on memory.',
    summary: 'That increases fragility, but it does not by itself tell us whether the first move is visibility or deeper cleanup.',
  },
  heroics: {
    title: 'Strong people are compensating for weak systems.',
    summary: 'The business is getting rescued by effort instead of being carried by a reliable process.',
  },
  'broad-fragility': {
    title: 'The problem is spread across more than communication follow-through.',
    summary: 'Several workflow layers appear to be feeding the same leak.',
  },
  'scope-unclear': {
    title: 'The full scope still looks unclear.',
    summary: 'That makes a contained product-first recommendation less trustworthy until the operating picture is cleaner.',
  },
  'trust-risk': {
    title: 'Trust is at risk before the team fully sees the problem.',
    summary: 'Relationship damage is often the first visible cost of weak follow-through.',
  },
  'revenue-risk': {
    title: 'The leak is already close to revenue consequences.',
    summary: 'When next steps slip quietly, conversion and retention risk follow fast.',
  },
};

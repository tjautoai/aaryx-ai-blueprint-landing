import {
  ASSESSMENT_VERSION,
  BREAKDOWN_LIBRARY,
  CONFLICT_FLAG_LABELS,
  CTA_ROUTES,
  PRIMARY_PROBLEM_CLASS_LABELS,
  QUESTION_MAP,
  QUESTIONS,
  ROUTE_LABELS,
  ROUTE_REASON_CODE_LABELS,
  STORAGE_KEYS,
} from './data.js';

const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));
const round = (value) => Math.round(value);
const normalize = (value, min = 0, max = 100) => clamp(round(value), min, max);

function getQuestion(questionId) {
  return QUESTION_MAP[questionId] || null;
}

function getOption(questionId, answerValue) {
  const question = getQuestion(questionId);
  return question?.options.find((option) => option.value === answerValue) || null;
}

export function labelFor(questionId, answerValue) {
  return getOption(questionId, answerValue)?.label || '';
}

function collectBreakdownCounts(answers) {
  const counts = new Map();

  QUESTIONS.forEach((question) => {
    const option = getOption(question.id, answers[question.id]);
    if (!option) return;
    (option.breakdownTags || []).forEach((tag) => {
      counts.set(tag, (counts.get(tag) || 0) + 1);
    });
  });

  return counts;
}

function topBreakdowns(answers) {
  const counts = collectBreakdownCounts(answers);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([tag]) => BREAKDOWN_LIBRARY[tag] || { title: tag, summary: tag });
}

function q2ComplexityBonus(value) {
  return {
    just_me: 0,
    two_to_three: 2,
    four_to_seven: 4,
    eight_to_fifteen: 6,
    sixteen_plus: 8,
  }[value] ?? 0;
}

function q3SeverityBase(value) {
  return {
    missed_follow_up: 12,
    buried_commitments_or_unanswered_questions: 14,
    handoffs_or_ownership_gaps: 14,
    too_much_manual_checking_and_chasing: 10,
    we_need_a_better_system_but_do_not_know_what_first: 8,
  }[value] ?? 0;
}

function q4SeverityBase(value) {
  return {
    revenue_or_conversion: 24,
    client_trust: 22,
    referral_or_partner_confidence: 20,
    team_time_and_cleanup_work: 14,
    personal_stress_and_lost_focus: 10,
  }[value] ?? 0;
}

function q6SeverityBase(value) {
  return {
    deals_or_revenue_slipping_quietly: 26,
    clients_or_partners_feeling_neglected: 24,
    team_staying_dependent_on_me: 18,
    more_chaos_as_volume_grows: 18,
    wasting_more_time_without_fixing_root_problem: 14,
  }[value] ?? 0;
}

function q3CommunicationSignal(value) {
  return {
    missed_follow_up: 20,
    buried_commitments_or_unanswered_questions: 20,
    handoffs_or_ownership_gaps: 2,
    too_much_manual_checking_and_chasing: 8,
    we_need_a_better_system_but_do_not_know_what_first: 0,
  }[value] ?? 0;
}

function q4CommunicationSignal(value) {
  return {
    revenue_or_conversion: 10,
    client_trust: 10,
    referral_or_partner_confidence: 10,
    team_time_and_cleanup_work: 2,
    personal_stress_and_lost_focus: 0,
  }[value] ?? 0;
}

function q5CommunicationSignal(value) {
  return {
    mostly_memory_and_inbox_habits: 10,
    crm_plus_manual_reminders: 15,
    task_system_plus_manual_checking: 12,
    sops_plus_people_discipline: 2,
    mixed_tools_with_no_trusted_center: 6,
  }[value] ?? 0;
}

function q6CommunicationSignal(value) {
  return {
    deals_or_revenue_slipping_quietly: 10,
    clients_or_partners_feeling_neglected: 10,
    team_staying_dependent_on_me: 2,
    more_chaos_as_volume_grows: 2,
    wasting_more_time_without_fixing_root_problem: 2,
  }[value] ?? 0;
}

function q7CommunicationSignal(value) {
  return {
    mostly_communication_follow_through: 20,
    communication_plus_a_few_adjacent_issues: 14,
    several_workflows_are_involved: 4,
    broad_operating_layer_fragility: 0,
    not_sure_of_full_scope_yet: 2,
  }[value] ?? 0;
}

function q8CommunicationSignal(value) {
  return {
    that_would_solve_the_sharpest_part: 25,
    it_would_solve_most_of_it: 22,
    it_would_solve_one_important_part_not_all: 10,
    it_would_help_but_bigger_issue_is_broader: 0,
    it_is_not_the_main_issue: 0,
  }[value] ?? 0;
}

function q5MaturitySignal(value) {
  return {
    mostly_memory_and_inbox_habits: 8,
    crm_plus_manual_reminders: 22,
    task_system_plus_manual_checking: 20,
    sops_plus_people_discipline: 32,
    mixed_tools_with_no_trusted_center: 8,
  }[value] ?? 0;
}

function q7MaturitySignal(value) {
  return {
    mostly_communication_follow_through: 10,
    communication_plus_a_few_adjacent_issues: 8,
    several_workflows_are_involved: 6,
    broad_operating_layer_fragility: 4,
    not_sure_of_full_scope_yet: 4,
  }[value] ?? 0;
}

function q9MaturitySignal(value) {
  return {
    very_reliable: 45,
    reliable_but_inconsistent_in_practice: 38,
    partly_reliable: 26,
    loose_and_person_dependent: 10,
    mostly_undocumented_or_improvised: 0,
  }[value] ?? 0;
}

function q9LowMaturitySignal(value) {
  return {
    very_reliable: 0,
    reliable_but_inconsistent_in_practice: 6,
    partly_reliable: 16,
    loose_and_person_dependent: 30,
    mostly_undocumented_or_improvised: 42,
  }[value] ?? 0;
}

function q5LowMaturitySignal(value) {
  return {
    mostly_memory_and_inbox_habits: 24,
    crm_plus_manual_reminders: 4,
    task_system_plus_manual_checking: 8,
    sops_plus_people_discipline: 0,
    mixed_tools_with_no_trusted_center: 22,
  }[value] ?? 0;
}

function q6UrgencySignal(value) {
  return {
    deals_or_revenue_slipping_quietly: 44,
    clients_or_partners_feeling_neglected: 40,
    team_staying_dependent_on_me: 28,
    more_chaos_as_volume_grows: 32,
    wasting_more_time_without_fixing_root_problem: 20,
  }[value] ?? 0;
}

function q4UrgencySignal(value) {
  return {
    revenue_or_conversion: 30,
    client_trust: 26,
    referral_or_partner_confidence: 22,
    team_time_and_cleanup_work: 16,
    personal_stress_and_lost_focus: 12,
  }[value] ?? 0;
}

function q7BroadSignal(value) {
  return {
    mostly_communication_follow_through: 0,
    communication_plus_a_few_adjacent_issues: 10,
    several_workflows_are_involved: 22,
    broad_operating_layer_fragility: 30,
    not_sure_of_full_scope_yet: 16,
  }[value] ?? 0;
}

function q8BroadSignal(value) {
  return {
    that_would_solve_the_sharpest_part: 0,
    it_would_solve_most_of_it: 0,
    it_would_solve_one_important_part_not_all: 10,
    it_would_help_but_bigger_issue_is_broader: 22,
    it_is_not_the_main_issue: 28,
  }[value] ?? 0;
}

function q3BroadSignal(value) {
  return {
    missed_follow_up: 0,
    buried_commitments_or_unanswered_questions: 2,
    handoffs_or_ownership_gaps: 22,
    too_much_manual_checking_and_chasing: 18,
    we_need_a_better_system_but_do_not_know_what_first: 12,
  }[value] ?? 0;
}

function q6BroadSignal(value) {
  return {
    deals_or_revenue_slipping_quietly: 2,
    clients_or_partners_feeling_neglected: 2,
    team_staying_dependent_on_me: 18,
    more_chaos_as_volume_grows: 22,
    wasting_more_time_without_fixing_root_problem: 8,
  }[value] ?? 0;
}

function q4ReasonCodes(value) {
  if (value === 'revenue_or_conversion') return ['consequence_revenue_risk'];
  if (value === 'client_trust' || value === 'referral_or_partner_confidence') return ['consequence_relationship_risk'];
  return [];
}

function q6ReasonCodes(value) {
  if (value === 'team_staying_dependent_on_me' || value === 'more_chaos_as_volume_grows') return ['consequence_owner_dependency'];
  return [];
}

function confidenceBand(score) {
  if (score >= 85) return 'very_high';
  if (score >= 70) return 'high';
  if (score >= 50) return 'moderate';
  return 'low';
}

function severityBand(score) {
  if (score >= 75) return 'critical';
  if (score >= 55) return 'high';
  if (score >= 35) return 'moderate';
  return 'emerging';
}

function urgencyRead(score) {
  if (score >= 70) return 'immediate_attention';
  if (score >= 42) return 'rising_cost';
  return 'watch_now';
}

function deriveScores(answers) {
  const breakdown_severity_score = normalize(
    q3SeverityBase(answers.q3) +
      q4SeverityBase(answers.q4) +
      q6SeverityBase(answers.q6) +
      q2ComplexityBonus(answers.q2)
  );

  const communication_risk_dominance_score = normalize(
    q3CommunicationSignal(answers.q3) +
      q4CommunicationSignal(answers.q4) +
      q5CommunicationSignal(answers.q5) +
      q6CommunicationSignal(answers.q6) +
      q7CommunicationSignal(answers.q7) +
      q8CommunicationSignal(answers.q8)
  );

  const operational_maturity_score = normalize(
    q5MaturitySignal(answers.q5) + q7MaturitySignal(answers.q7) + q9MaturitySignal(answers.q9) + q2ComplexityBonus(answers.q2)
  );

  const urgency_score = normalize(
    q4UrgencySignal(answers.q4) * 0.35 + q6UrgencySignal(answers.q6) * 0.5 + q3SeverityBase(answers.q3) * 0.15
  );

  const broad_scope_score = normalize(
    q7BroadSignal(answers.q7) + q8BroadSignal(answers.q8) + q3BroadSignal(answers.q3) + q6BroadSignal(answers.q6)
  );

  const low_maturity_intensity = normalize(q5LowMaturitySignal(answers.q5) + q9LowMaturitySignal(answers.q9));

  return {
    breakdown_severity_score,
    breakdown_severity_band: severityBand(breakdown_severity_score),
    communication_risk_dominance_score,
    operational_maturity_score,
    urgency_score,
    broad_scope_score,
    low_maturity_intensity,
    trust_sensitivity_flag: false,
  };
}

function buildConflictFlags(answers) {
  const flags = [];
  const q3Comm = ['missed_follow_up', 'buried_commitments_or_unanswered_questions'].includes(answers.q3);
  const q7Broad = ['several_workflows_are_involved', 'broad_operating_layer_fragility'].includes(answers.q7);
  const q8Positive = ['that_would_solve_the_sharpest_part', 'it_would_solve_most_of_it'].includes(answers.q8);
  const q8Broader = ['it_would_help_but_bigger_issue_is_broader', 'it_is_not_the_main_issue'].includes(answers.q8);
  const q9Low = ['loose_and_person_dependent', 'mostly_undocumented_or_improvised'].includes(answers.q9);

  if (q3Comm && q7Broad) flags.push('q3_vs_q7_scope_conflict');
  if (answers.q5 === 'mostly_memory_and_inbox_habits' && q8Positive) flags.push('q5_fragility_but_q8_trackt_positive');
  if (answers.q7 === 'mostly_communication_follow_through' && q9Low) flags.push('q7_narrow_but_q9_low_maturity');
  if (q3Comm && q8Broader) flags.push('q3_comm_pain_but_q8_broader_issue');
  if (answers.q7 === 'not_sure_of_full_scope_yet') flags.push('q7_unclear_scope');

  return flags;
}

function deriveRouteConfidence(answers, conflictFlags) {
  let score = 50;

  if (['mostly_communication_follow_through', 'broad_operating_layer_fragility', 'several_workflows_are_involved'].includes(answers.q7)) score += 15;
  if (['that_would_solve_the_sharpest_part', 'it_would_solve_most_of_it', 'it_would_help_but_bigger_issue_is_broader', 'it_is_not_the_main_issue'].includes(answers.q8)) score += 15;
  if (['very_reliable', 'reliable_but_inconsistent_in_practice', 'loose_and_person_dependent', 'mostly_undocumented_or_improvised'].includes(answers.q9)) score += 10;

  const q3Comm = ['missed_follow_up', 'buried_commitments_or_unanswered_questions'].includes(answers.q3);
  const q3Broad = ['handoffs_or_ownership_gaps', 'too_much_manual_checking_and_chasing'].includes(answers.q3);
  const q7Narrow = ['mostly_communication_follow_through', 'communication_plus_a_few_adjacent_issues'].includes(answers.q7);
  const q7Broad = ['several_workflows_are_involved', 'broad_operating_layer_fragility'].includes(answers.q7);
  const q8Positive = ['that_would_solve_the_sharpest_part', 'it_would_solve_most_of_it'].includes(answers.q8);
  const q8Broader = ['it_would_help_but_bigger_issue_is_broader', 'it_is_not_the_main_issue'].includes(answers.q8);

  if ((q3Comm && q7Narrow && q8Positive) || (q3Broad && q7Broad && q8Broader)) score += 10;

  const consequenceValues = new Set([answers.q4, answers.q6]);
  const alignedConsequence =
    (['revenue_or_conversion', 'client_trust', 'referral_or_partner_confidence'].includes(answers.q4) &&
      ['deals_or_revenue_slipping_quietly', 'clients_or_partners_feeling_neglected'].includes(answers.q6)) ||
    (answers.q4 === 'team_time_and_cleanup_work' && ['team_staying_dependent_on_me', 'more_chaos_as_volume_grows'].includes(answers.q6));
  if (alignedConsequence) score += 5;

  if (conflictFlags.includes('q3_vs_q7_scope_conflict')) score -= 15;
  if ((q3Comm && q7Broad) || (q3Broad && q7Narrow)) score -= 10;
  if (answers.q5 === 'mostly_memory_and_inbox_habits' && answers.q9 === 'partly_reliable') score -= 10;
  if (answers.q7 === 'not_sure_of_full_scope_yet') score -= 10;
  if (!alignedConsequence && consequenceValues.size === 2) score -= 5;

  return normalize(score);
}

function cleanupGuardPassed(answers) {
  const lowReliability = ['loose_and_person_dependent', 'mostly_undocumented_or_improvised'].includes(answers.q9);
  const broadOrUnclearScope = ['several_workflows_are_involved', 'broad_operating_layer_fragility', 'not_sure_of_full_scope_yet'].includes(answers.q7);
  const visibilityNotEnough = ['it_would_help_but_bigger_issue_is_broader', 'it_is_not_the_main_issue'].includes(answers.q8);
  const fragilitySignals = [
    answers.q5 === 'mostly_memory_and_inbox_habits',
    answers.q5 === 'mixed_tools_with_no_trusted_center',
    answers.q3 === 'too_much_manual_checking_and_chasing',
    answers.q6 === 'team_staying_dependent_on_me',
    answers.q6 === 'more_chaos_as_volume_grows',
  ].filter(Boolean).length;

  return lowReliability && broadOrUnclearScope && visibilityNotEnough && fragilitySignals >= 1;
}

function tracktGuardPassed(answers) {
  const narrowEnough = ['mostly_communication_follow_through', 'communication_plus_a_few_adjacent_issues'].includes(answers.q7);
  const visibilityWouldSolve = ['that_would_solve_the_sharpest_part', 'it_would_solve_most_of_it'].includes(answers.q8);
  const hardVeto = answers.q8 === 'it_is_not_the_main_issue' || answers.q8 === 'it_would_help_but_bigger_issue_is_broader' || answers.q9 === 'mostly_undocumented_or_improvised';
  const handoffPenalty = answers.q3 === 'handoffs_or_ownership_gaps';
  const strongSignals = [
    answers.q3 === 'missed_follow_up',
    answers.q3 === 'buried_commitments_or_unanswered_questions',
    answers.q4 === 'client_trust',
    answers.q4 === 'referral_or_partner_confidence',
    answers.q4 === 'revenue_or_conversion',
    answers.q6 === 'deals_or_revenue_slipping_quietly',
    answers.q6 === 'clients_or_partners_feeling_neglected',
    answers.q5 === 'crm_plus_manual_reminders',
    answers.q5 === 'task_system_plus_manual_checking',
    answers.q5 === 'mostly_memory_and_inbox_habits',
  ].filter(Boolean).length;

  if (hardVeto) return false;
  if (!narrowEnough || !visibilityWouldSolve) return false;
  if (handoffPenalty && strongSignals < 4) return false;
  return strongSignals >= 2;
}

function determinePrimaryProblemClass(route, scores) {
  if (route === 'trackt_first') return 'communication_visibility_risk';
  if (route === 'diagnosis_cleanup_first') return 'low_maturity_follow_through_system';
  if (scores.low_maturity_intensity >= 56 && scores.operational_maturity_score < 28) return 'low_maturity_follow_through_system';
  return 'broader_operational_fragility';
}

function deriveRouteAndExplainability(answers, scores, route_confidence_score, conflict_flags) {
  const reasonCodes = [];

  if (['mostly_communication_follow_through', 'communication_plus_a_few_adjacent_issues'].includes(answers.q7)) reasonCodes.push('narrow_scope');
  if (['several_workflows_are_involved', 'broad_operating_layer_fragility'].includes(answers.q7)) reasonCodes.push('broad_scope');
  if (answers.q7 === 'not_sure_of_full_scope_yet') reasonCodes.push('unclear_scope');

  if (['that_would_solve_the_sharpest_part', 'it_would_solve_most_of_it'].includes(answers.q8)) reasonCodes.push('visibility_solves_most');
  if (answers.q8 === 'it_would_solve_one_important_part_not_all') reasonCodes.push('visibility_only_partial');
  if (answers.q8 === 'it_is_not_the_main_issue') reasonCodes.push('visibility_not_main_issue');

  if (answers.q5 === 'mostly_memory_and_inbox_habits') reasonCodes.push('current_system_memory_driven');
  if (answers.q5 === 'mixed_tools_with_no_trusted_center') reasonCodes.push('current_system_fragmented');

  if (['very_reliable', 'reliable_but_inconsistent_in_practice', 'partly_reliable'].includes(answers.q9)) reasonCodes.push('process_partly_reliable');
  if (['loose_and_person_dependent', 'mostly_undocumented_or_improvised'].includes(answers.q9)) reasonCodes.push('process_low_reliability');

  reasonCodes.push(...q4ReasonCodes(answers.q4));
  reasonCodes.push(...q6ReasonCodes(answers.q6));

  let route = 'aaryx_implementation_first';

  if (cleanupGuardPassed(answers) && route_confidence_score >= 65) {
    route = 'diagnosis_cleanup_first';
    reasonCodes.push('cleanup_guard_passed');
  } else if (tracktGuardPassed(answers) && route_confidence_score >= 70) {
    route = 'trackt_first';
    reasonCodes.push('trackt_guard_passed');
  } else {
    route = 'aaryx_implementation_first';
    reasonCodes.push('implementation_fallback_used');
  }

  const trackt_secondary_fit =
    route === 'aaryx_implementation_first' &&
    answers.q7 === 'communication_plus_a_few_adjacent_issues' &&
    answers.q8 === 'it_would_solve_one_important_part_not_all' &&
    ['partly_reliable', 'reliable_but_inconsistent_in_practice'].includes(answers.q9);

  const confidence_band = confidenceBand(route_confidence_score);
  const primary_problem_class = determinePrimaryProblemClass(route, scores);

  return {
    route,
    route_label: ROUTE_LABELS[route],
    route_reason_codes: [...new Set(reasonCodes)],
    conflict_flags,
    confidence_band,
    route_confidence_score,
    primary_problem_class,
    trackt_secondary_fit,
  };
}

function headlineDiagnosis(route, answers, primaryProblemClass) {
  if (route === 'trackt_first') {
    return 'The sharpest problem appears to be communication risk visibility, not a full operating rebuild.';
  }
  if (route === 'diagnosis_cleanup_first') {
    return 'The current follow-through system looks too fragile for a product-first or contained implementation-first move.';
  }
  if (primaryProblemClass === 'broader_operational_fragility') {
    return 'The bigger problem appears broader than missed follow-up alone.';
  }
  return 'Several weak points are likely amplifying each other inside the workflow.';
}

function whyCurrentSetupMissesIt(route, answers) {
  if (route === 'trackt_first') {
    return 'Your current setup may let people act once the risk is visible, but it is not surfacing the right commitments, follow-ups, and unanswered questions early enough.';
  }
  if (route === 'diagnosis_cleanup_first') {
    return 'The workflow still depends too much on memory, patchwork, or person-dependent execution. Better visibility alone would be hard to turn into consistent action right now.';
  }
  if (['several_workflows_are_involved', 'broad_operating_layer_fragility'].includes(answers.q7)) {
    return 'Current tools may be capturing activity in pieces, but they are not resolving ownership, handoffs, and cross-workflow consistency well enough to stop the same leak from reappearing.';
  }
  return 'The setup is exposing pain without clearly containing it. That is why a broader operating fix appears stronger than another narrow layer on top.';
}

function primaryRecommendation(route) {
  if (route === 'trackt_first') {
    return 'Trackt should come first because earlier visibility into at-risk follow-ups, commitments, and next steps appears to be the sharpest fix.';
  }
  if (route === 'diagnosis_cleanup_first') {
    return 'Diagnosis and cleanup should come first so ownership, consistency, and operating discipline are stable enough for later product or implementation work to hold.';
  }
  return 'AARYX Implementation should come first because the issue appears broader than visibility alone and needs a contained operating-layer fix before anything narrower.';
}

function sequenceNote(route, classification) {
  if (route === 'diagnosis_cleanup_first') {
    return 'Sequence note. Stabilize the operating layer first. Then reassess whether Trackt or a narrower implementation should come next.';
  }
  if (route === 'aaryx_implementation_first' && classification.trackt_secondary_fit) {
    return 'Sequence note. Trackt may become the right second move once the broader workflow issues are tightened.';
  }
  return '';
}

function ctaForRoute(route) {
  if (route === 'trackt_first') return { route: 'trackt_waitlist', ...CTA_ROUTES.trackt_waitlist };
  if (route === 'diagnosis_cleanup_first') return { route: 'cleanup_diagnostic_path', ...CTA_ROUTES.cleanup_diagnostic_path };
  return { route: 'aaryx_implementation_path', ...CTA_ROUTES.aaryx_implementation_path };
}

function resultBoundaryDisclaimer() {
  return 'This result is based on the pattern in your answers, not a full system audit. Trackt is only recommended when earlier visibility appears to be the sharpest problem.';
}

function gateDiagnosis(route) {
  if (route === 'trackt_first') {
    return 'Your answers suggest the sharpest issue is seeing which follow-ups or commitments are at risk before they are missed.';
  }
  if (route === 'diagnosis_cleanup_first') {
    return 'Your answers suggest the workflow is still too inconsistent or fragile for a clean product-first recommendation.';
  }
  return 'Your answers suggest the problem is broader than communication visibility alone and likely needs an operating-layer fix first.';
}

function previewBullets(headline, whyMissed, recommendation) {
  return [headline, whyMissed, recommendation];
}

export function buildBlueprintSession(answers, identity = {}) {
  const scores = deriveScores(answers);
  const conflict_flags = buildConflictFlags(answers);
  const route_confidence_score = deriveRouteConfidence(answers, conflict_flags);
  const classification = deriveRouteAndExplainability(answers, scores, route_confidence_score, conflict_flags);
  const top_breakdowns = topBreakdowns(answers);
  const headline_diagnosis = headlineDiagnosis(classification.route, answers, classification.primary_problem_class);
  const why_current_setup_misses_it = whyCurrentSetupMissesIt(classification.route, answers);
  const primary_recommendation = primaryRecommendation(classification.route);
  const sequence_note_optional = sequenceNote(classification.route, classification);
  const cta = ctaForRoute(classification.route);
  const urgency_read = urgencyRead(scores.urgency_score);

  return {
    assessment_version: ASSESSMENT_VERSION,
    identity,
    answers,
    derived: {
      ...scores,
      route_confidence_score,
      confidence_band: classification.confidence_band,
      trackt_secondary_fit: classification.trackt_secondary_fit,
    },
    classification,
    result_page_model: {
      assessment_version: ASSESSMENT_VERSION,
      respondent_first_name_optional: identity.firstName || '',
      route: classification.route,
      route_label: classification.route_label,
      confidence_band: classification.confidence_band,
      confidence_score: route_confidence_score,
      severity_band: scores.breakdown_severity_band,
      severity_score: scores.breakdown_severity_score,
      headline_diagnosis,
      urgency_read,
      primary_problem_class: classification.primary_problem_class,
      primary_problem_class_label: PRIMARY_PROBLEM_CLASS_LABELS[classification.primary_problem_class],
      top_breakdowns,
      why_current_setup_misses_it,
      primary_recommendation,
      sequence_note_optional,
      cta,
      cta_route: cta.route,
      disclaimer_line: resultBoundaryDisclaimer(),
    },
    gate_diagnosis_sentence: gateDiagnosis(classification.route),
    gate_preview_bullets: previewBullets(headline_diagnosis, why_current_setup_misses_it, primary_recommendation),
    route_reason_code_labels: ROUTE_REASON_CODE_LABELS,
    conflict_flag_labels: CONFLICT_FLAG_LABELS,
  };
}

export function buildPayload(session) {
  const { answers, identity, derived, classification, result_page_model } = session;

  const crm_payload = {
    first_name_optional: identity.firstName || '',
    email: identity.email || '',
    blueprint_role_type: answers.q1,
    blueprint_people_affecting_next_step: answers.q2,
    blueprint_biggest_problem: answers.q3,
    blueprint_first_impact: answers.q4,
    blueprint_followup_method: answers.q5,
    blueprint_ninety_day_risk: answers.q6,
    blueprint_problem_scope: answers.q7,
    blueprint_visibility_solution_scope: answers.q8,
    blueprint_followup_consistency: answers.q9,
    blueprint_breakdown_severity_score: derived.breakdown_severity_score,
    blueprint_breakdown_severity_band: derived.breakdown_severity_band,
    blueprint_communication_risk_dominance_score: derived.communication_risk_dominance_score,
    blueprint_operational_maturity_score: derived.operational_maturity_score,
    blueprint_urgency_score: derived.urgency_score,
    blueprint_route_confidence_score: derived.route_confidence_score,
    blueprint_confidence_band: derived.confidence_band,
    blueprint_primary_problem_class: classification.primary_problem_class,
    blueprint_primary_route: classification.route,
    blueprint_trackt_secondary_fit: derived.trackt_secondary_fit,
    blueprint_trust_sensitive_flag: derived.trust_sensitivity_flag,
    blueprint_headline_diagnosis: result_page_model.headline_diagnosis,
    blueprint_primary_recommendation: result_page_model.primary_recommendation,
    blueprint_cta_label: result_page_model.cta.label,
    blueprint_cta_route: result_page_model.cta_route,
    blueprint_sequence_note_optional: result_page_model.sequence_note_optional,
    blueprint_route_reason_codes_json: JSON.stringify(classification.route_reason_codes),
    blueprint_conflict_flags_json: JSON.stringify(classification.conflict_flags),
    blueprint_assessment_version: ASSESSMENT_VERSION,
  };

  return {
    assessment_id: crypto.randomUUID(),
    assessment_version: ASSESSMENT_VERSION,
    submitted_at: new Date().toISOString(),
    answers: {
      role_type: answers.q1,
      people_affecting_next_step: answers.q2,
      biggest_problem: answers.q3,
      first_impact: answers.q4,
      followup_method: answers.q5,
      ninety_day_risk: answers.q6,
      problem_scope: answers.q7,
      visibility_solution_scope: answers.q8,
      followup_consistency: answers.q9,
    },
    answer_labels: {
      q1: labelFor('q1', answers.q1),
      q2: labelFor('q2', answers.q2),
      q3: labelFor('q3', answers.q3),
      q4: labelFor('q4', answers.q4),
      q5: labelFor('q5', answers.q5),
      q6: labelFor('q6', answers.q6),
      q7: labelFor('q7', answers.q7),
      q8: labelFor('q8', answers.q8),
      q9: labelFor('q9', answers.q9),
    },
    derived_scores: derived,
    classification,
    result_page_model,
    crm_payload,
  };
}

export function buildReport(session, payload) {
  const firstName = session.identity.firstName ? `${session.identity.firstName},` : 'there,';
  const breakdownLines = session.result_page_model.top_breakdowns.map((item) => `- ${item.title}`);

  return {
    subject: `Your AARYX Blueprint Result: ${session.result_page_model.route_label}`,
    preview: session.result_page_model.headline_diagnosis,
    body: [
      `Hi ${firstName}`,
      '',
      'Your AARYX Blueprint result is ready.',
      '',
      '1. Your main operating risk',
      session.result_page_model.headline_diagnosis,
      '',
      '2. What is breaking first',
      ...breakdownLines,
      '',
      '3. Why current tools or habits are not catching it early enough',
      session.result_page_model.why_current_setup_misses_it,
      '',
      '4. Whether the issue is mostly communication visibility or broader operating fragility',
      PRIMARY_PROBLEM_CLASS_LABELS[session.classification.primary_problem_class],
      '',
      '5. What this likely costs if ignored',
      session.result_page_model.urgency_read === 'immediate_attention'
        ? 'The leak appears close to immediate trust, timing, or revenue consequences.'
        : session.result_page_model.urgency_read === 'rising_cost'
          ? 'The leak appears to be compounding quietly and getting more expensive over time.'
          : 'The leak is still emerging, but it is easier to correct now than after more volume builds.',
      '',
      '6. What should come first',
      session.result_page_model.primary_recommendation,
      '',
      '7. Why this route was chosen',
      ...session.classification.route_reason_codes.map((code) => `- ${ROUTE_REASON_CODE_LABELS[code]}`),
      ...(session.classification.conflict_flags.length
        ? ['', 'Mixed-signal notes', ...session.classification.conflict_flags.map((code) => `- ${CONFLICT_FLAG_LABELS[code]}`)]
        : []),
      '',
      '8. Your next best step',
      `${session.result_page_model.cta.label}: ${session.result_page_model.cta.href}`,
      ...(session.result_page_model.sequence_note_optional ? ['', session.result_page_model.sequence_note_optional] : []),
      '',
      'Assessment boundary',
      session.result_page_model.disclaimer_line,
      '',
      'CRM-ready payload',
      JSON.stringify(payload.crm_payload, null, 2),
    ].join('\n'),
  };
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

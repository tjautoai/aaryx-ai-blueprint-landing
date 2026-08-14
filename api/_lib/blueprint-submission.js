const EXPECTED_ASSESSMENT_VERSION = '2.0.0-locked-9q';
const LEAD_SOURCE = 'AARYX Blueprint';
const TABLE_NAME = 'blueprint_submissions';

const REQUIRED_ANSWER_FIELDS = [
  'role_type',
  'people_affecting_next_step',
  'biggest_problem',
  'first_impact',
  'followup_method',
  'ninety_day_risk',
  'problem_scope',
  'visibility_solution_scope',
  'followup_consistency',
];

const REQUIRED_IDENTITY_FIELDS = ['firstName', 'lastName', 'email'];

function isObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function cleanText(value) {
  return String(value ?? '').trim();
}

export function validateWorkEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanText(email));
}

export function expectedAssessmentVersion() {
  return EXPECTED_ASSESSMENT_VERSION;
}

export function blueprintLeadSource() {
  return LEAD_SOURCE;
}

export function validateSubmissionPayload(payload) {
  const errors = [];

  if (!isObject(payload)) {
    return { ok: false, errors: ['Submission payload must be a JSON object.'] };
  }

  const assessmentId = cleanText(payload.assessment_id);
  const submittedAt = cleanText(payload.submitted_at);
  const assessmentVersion = cleanText(payload.assessment_version);
  const identity = isObject(payload.identity) ? payload.identity : null;
  const answers = isObject(payload.answers) ? payload.answers : null;
  const resultPageModel = isObject(payload.result_page_model) ? payload.result_page_model : null;
  const classification = isObject(payload.classification) ? payload.classification : null;
  const derivedScores = isObject(payload.derived_scores) ? payload.derived_scores : null;
  const answerLabels = isObject(payload.answer_labels) ? payload.answer_labels : null;

  if (!assessmentId) errors.push('assessment_id is required.');
  if (!submittedAt) errors.push('submitted_at is required.');
  if (!assessmentVersion) errors.push('assessment_version is required.');
  if (assessmentVersion && assessmentVersion !== EXPECTED_ASSESSMENT_VERSION) {
    errors.push(`assessment_version must be ${EXPECTED_ASSESSMENT_VERSION}.`);
  }

  const parsedSubmittedAt = Date.parse(submittedAt);
  if (submittedAt && Number.isNaN(parsedSubmittedAt)) {
    errors.push('submitted_at must be a valid ISO timestamp.');
  }

  if (!identity) {
    errors.push('identity is required.');
  } else {
    for (const field of REQUIRED_IDENTITY_FIELDS) {
      if (!cleanText(identity[field])) {
        errors.push(`identity.${field} is required.`);
      }
    }
    if (cleanText(identity.lastName) !== String(identity.lastName ?? '').trim()) {
      errors.push('identity.lastName must not be synthesized or padded with whitespace.');
    }
    if (identity.email && !validateWorkEmail(identity.email)) {
      errors.push('identity.email must be a valid work email.');
    }
  }

  if (!answers) {
    errors.push('answers is required.');
  } else {
    for (const field of REQUIRED_ANSWER_FIELDS) {
      if (!cleanText(answers[field])) {
        errors.push(`answers.${field} is required.`);
      }
    }
  }

  if (!answerLabels) errors.push('answer_labels is required.');
  if (!classification) errors.push('classification is required.');
  if (!derivedScores) errors.push('derived_scores is required.');
  if (!resultPageModel) {
    errors.push('result_page_model is required.');
  } else {
    if (!cleanText(resultPageModel.route)) errors.push('result_page_model.route is required.');
    if (!cleanText(resultPageModel.headline_diagnosis)) errors.push('result_page_model.headline_diagnosis is required.');
    if (!cleanText(resultPageModel.primary_recommendation)) errors.push('result_page_model.primary_recommendation is required.');
    if (!cleanText(resultPageModel.confidence_band)) errors.push('result_page_model.confidence_band is required.');
    if (!cleanText(resultPageModel.severity_band)) errors.push('result_page_model.severity_band is required.');
  }

  return { ok: errors.length === 0, errors };
}

export function mapPayloadToSupabaseRow(payload) {
  return {
    assessment_id: cleanText(payload.assessment_id),
    submitted_at: cleanText(payload.submitted_at),
    first_name: cleanText(payload.identity?.firstName),
    last_name: cleanText(payload.identity?.lastName),
    work_email: cleanText(payload.identity?.email).toLowerCase(),
    lead_source: LEAD_SOURCE,
    blueprint_role_type: cleanText(payload.answers?.role_type),
    blueprint_people_affecting_next_step: cleanText(payload.answers?.people_affecting_next_step),
    blueprint_biggest_problem: cleanText(payload.answers?.biggest_problem),
    blueprint_first_impact: cleanText(payload.answers?.first_impact),
    blueprint_followup_method: cleanText(payload.answers?.followup_method),
    blueprint_ninety_day_risk: cleanText(payload.answers?.ninety_day_risk),
    blueprint_problem_scope: cleanText(payload.answers?.problem_scope),
    blueprint_visibility_solution_scope: cleanText(payload.answers?.visibility_solution_scope),
    blueprint_followup_consistency: cleanText(payload.answers?.followup_consistency),
    blueprint_breakdown_severity_band: cleanText(payload.derived_scores?.breakdown_severity_band),
    blueprint_primary_problem_class: cleanText(payload.classification?.primary_problem_class),
    blueprint_primary_route: cleanText(payload.result_page_model?.route || payload.classification?.route),
    blueprint_headline_diagnosis: cleanText(payload.result_page_model?.headline_diagnosis),
    blueprint_primary_recommendation: cleanText(payload.result_page_model?.primary_recommendation),
    blueprint_confidence_band: cleanText(payload.result_page_model?.confidence_band || payload.derived_scores?.confidence_band),
    blueprint_assessment_version: EXPECTED_ASSESSMENT_VERSION,
    blueprint_raw_payload_json: payload,
  };
}

export function stableStringify(value) {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  }

  if (isObject(value)) {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
      .join(',')}}`;
  }

  return JSON.stringify(value);
}

export function rowsAreEquivalent(a, b) {
  return stableStringify(a) === stableStringify(b);
}

export function buildSupabaseInsertRequest(row) {
  return {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      prefer: 'return=representation',
    },
    body: JSON.stringify(row),
  };
}

export { TABLE_NAME };

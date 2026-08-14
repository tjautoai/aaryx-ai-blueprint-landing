import assert from 'node:assert/strict';
import handler from '../blueprint-submit.js';
import { buildBlueprintSession, buildPayload } from '../../blueprint/logic.js';
import { TABLE_NAME, blueprintLeadSource, expectedAssessmentVersion, mapPayloadToSupabaseRow } from '../_lib/blueprint-submission.js';

const originalEnv = {
  url: process.env.AARYX_BLUEPRINT_SUPABASE_URL,
  key: process.env.AARYX_BLUEPRINT_SUPABASE_SERVICE_ROLE_KEY,
};

function makePayload(overrides = {}) {
  const answers = {
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

  const identity = {
    firstName: 'QA',
    lastName: 'Submission',
    email: 'qa.blueprint@example.com',
  };

  const session = buildBlueprintSession(answers, identity);
  const payload = buildPayload(session, {
    assessmentId: '11111111-1111-4111-8111-111111111111',
    submittedAt: '2026-08-14T12:34:56.000Z',
  });

  return {
    ...payload,
    ...overrides,
    identity: {
      ...payload.identity,
      ...(overrides.identity || {}),
    },
    answers: {
      ...payload.answers,
      ...(overrides.answers || {}),
    },
    classification: {
      ...payload.classification,
      ...(overrides.classification || {}),
    },
    derived_scores: {
      ...payload.derived_scores,
      ...(overrides.derived_scores || {}),
    },
    result_page_model: {
      ...payload.result_page_model,
      ...(overrides.result_page_model || {}),
    },
  };
}

function createRequest(body, method = 'POST') {
  return {
    method,
    body,
    [Symbol.asyncIterator]: async function* iterator() {
      if (typeof body === 'string') yield Buffer.from(body);
    },
  };
}

function createResponse() {
  return {
    statusCode: 200,
    headers: {},
    body: '',
    status(code) {
      this.statusCode = code;
      return this;
    },
    setHeader(name, value) {
      this.headers[name.toLowerCase()] = value;
      return this;
    },
    send(body) {
      this.body = body;
      return this;
    },
  };
}

async function invoke(body, method = 'POST') {
  const req = createRequest(body, method);
  const res = createResponse();
  await handler(req, res);
  return {
    status: res.statusCode,
    headers: res.headers,
    json: res.body ? JSON.parse(res.body) : null,
  };
}

function jsonResponse(status, payload) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async text() {
      return JSON.stringify(payload);
    },
  };
}

process.env.AARYX_BLUEPRINT_SUPABASE_URL = 'https://example.supabase.co';
process.env.AARYX_BLUEPRINT_SUPABASE_SERVICE_ROLE_KEY = 'service-role-test';

const payload = makePayload();
const mappedRow = mapPayloadToSupabaseRow(payload);
assert.equal(Object.keys(mappedRow).length, 23, 'mapped row should contain exactly 23 fields');
assert.equal(mappedRow.lead_source, blueprintLeadSource(), 'lead_source should be server-owned constant');
assert.equal(mappedRow.blueprint_assessment_version, expectedAssessmentVersion(), 'assessment version should be server-owned constant');
assert.deepEqual(mappedRow.blueprint_raw_payload_json, payload, 'raw payload should preserve the full submission object');

const fetchCalls = [];
global.fetch = async (url, options = {}) => {
  fetchCalls.push({ url, options });
  return jsonResponse(201, [mappedRow]);
};

const success = await invoke(payload);
assert.equal(success.status, 201, 'valid payload should persist successfully');
assert.equal(success.json.ok, true, 'success response should be ok');
assert.equal(fetchCalls.length, 1, 'successful insert should call Supabase once');
assert.equal(fetchCalls[0].url, `https://example.supabase.co/rest/v1/${TABLE_NAME}`);
assert.equal(JSON.parse(fetchCalls[0].options.body).first_name, 'QA', 'first name should map correctly');
assert.equal(fetchCalls[0].options.headers.apikey, 'service-role-test', 'apikey header should use the configured server secret');
assert.equal(fetchCalls[0].options.headers.authorization, 'Bearer service-role-test', 'legacy JWT-style keys should continue using bearer auth');

process.env.AARYX_BLUEPRINT_SUPABASE_SERVICE_ROLE_KEY = 'sb_secret_test_key';
const secretFetchCalls = [];
global.fetch = async (url, options = {}) => {
  secretFetchCalls.push({ url, options });
  return jsonResponse(201, [mappedRow]);
};
const secretKeySuccess = await invoke(payload);
assert.equal(secretKeySuccess.status, 201, 'sb_secret keys should persist successfully');
assert.equal(secretFetchCalls.length, 1, 'sb_secret path should call Supabase once');
assert.equal(secretFetchCalls[0].options.headers.apikey, 'sb_secret_test_key', 'sb_secret key should be sent in apikey header');
assert.equal('authorization' in secretFetchCalls[0].options.headers, false, 'sb_secret keys must not be sent as bearer authorization');
process.env.AARYX_BLUEPRINT_SUPABASE_SERVICE_ROLE_KEY = 'service-role-test';

const missingFirstName = await invoke(makePayload({ identity: { firstName: '' } }));
assert.equal(missingFirstName.status, 400, 'missing first name should be rejected');

const missingLastName = await invoke(makePayload({ identity: { lastName: '' } }));
assert.equal(missingLastName.status, 400, 'missing last name should be rejected');

const missingWorkEmail = await invoke(makePayload({ identity: { email: '' } }));
assert.equal(missingWorkEmail.status, 400, 'missing work email should be rejected');

const invalidWorkEmail = await invoke(makePayload({ identity: { email: 'not-an-email' } }));
assert.equal(invalidWorkEmail.status, 400, 'invalid work email should be rejected');

let duplicateFetchCount = 0;
global.fetch = async (url, options = {}) => {
  duplicateFetchCount += 1;
  if (duplicateFetchCount === 1) {
    return jsonResponse(409, { message: 'duplicate key value violates unique constraint on assessment_id' });
  }
  return jsonResponse(200, [mappedRow]);
};
const duplicate = await invoke(payload);
assert.equal(duplicate.status, 200, 'matching duplicate should be treated as idempotent success');
assert.equal(duplicate.json.duplicate, true, 'duplicate retry should be flagged');

let mismatchFetchCount = 0;
global.fetch = async (url, options = {}) => {
  mismatchFetchCount += 1;
  if (mismatchFetchCount === 1) {
    return jsonResponse(409, { message: 'duplicate key value violates unique constraint on assessment_id' });
  }
  return jsonResponse(200, [{ ...mappedRow, first_name: 'Different' }]);
};
const mismatchDuplicate = await invoke(payload);
assert.equal(mismatchDuplicate.status, 409, 'mismatched duplicate should not overwrite original row');
assert.equal(mismatchDuplicate.json.ok, false, 'mismatched duplicate should fail');

let transientCalls = 0;
global.fetch = async () => {
  transientCalls += 1;
  if (transientCalls < 3) {
    return jsonResponse(503, { message: 'temporary failure' });
  }
  return jsonResponse(201, [mappedRow]);
};
const transientSuccess = await invoke(payload);
assert.equal(transientSuccess.status, 201, 'transient failures should retry and then succeed');
assert.equal(transientCalls, 3, 'transient retry path should retry up to success');

let hardFailureCalls = 0;
global.fetch = async () => {
  hardFailureCalls += 1;
  return jsonResponse(500, { message: 'still broken' });
};
const hardFailure = await invoke(payload);
assert.equal(hardFailure.status, 500, 'persistent database failure should not return false success');
assert.equal(hardFailure.json.ok, false, 'persistent database failure should surface explicit error');
assert.equal(hardFailureCalls, 3, 'persistent retryable failure should exhaust bounded retries');

const wrongMethod = await invoke(payload, 'GET');
assert.equal(wrongMethod.status, 405, 'GET should not be allowed');

process.env.AARYX_BLUEPRINT_SUPABASE_URL = originalEnv.url;
process.env.AARYX_BLUEPRINT_SUPABASE_SERVICE_ROLE_KEY = originalEnv.key;

console.log(JSON.stringify({
  ok: true,
  validated: [
    '23-field mapping',
    'server-owned lead_source constant',
    'server-owned assessment version constant',
    'full raw payload preservation',
    'missing first name rejection',
    'missing last name rejection',
    'missing work email rejection',
    'invalid work email rejection',
    'idempotent duplicate acceptance when row matches',
    'duplicate mismatch rejection without overwrite',
    'bounded transient retries',
    'persistent failure path returns explicit error',
    'POST-only endpoint enforcement'
  ]
}, null, 2));

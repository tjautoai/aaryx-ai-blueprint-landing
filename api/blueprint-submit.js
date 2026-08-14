import {
  TABLE_NAME,
  buildSupabaseInsertRequest,
  expectedAssessmentVersion,
  mapPayloadToSupabaseRow,
  rowsAreEquivalent,
  stableStringify,
  validateSubmissionPayload,
} from './_lib/blueprint-submission.js';

const MAX_TRANSIENT_RETRIES = 3;
const RETRYABLE_STATUS_CODES = new Set([408, 409, 425, 429, 500, 502, 503, 504]);

function getSupabaseUrl() {
  return process.env.AARYX_BLUEPRINT_SUPABASE_URL;
}

function getSupabaseServiceRoleKey() {
  return process.env.AARYX_BLUEPRINT_SUPABASE_SERVICE_ROLE_KEY;
}

function json(response, status, body) {
  response.status(status).setHeader('content-type', 'application/json; charset=utf-8');
  response.send(JSON.stringify(body));
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function restHeaders() {
  const serviceRoleKey = getSupabaseServiceRoleKey();
  const headers = {
    apikey: serviceRoleKey,
  };

  // AARYX_BLUEPRINT_SUPABASE_SERVICE_ROLE_KEY is intentionally preserved for
  // backward compatibility, but its server-side value should now be the opaque
  // Supabase SUPABASE_SECRET_KEY when using the newer sb_secret_... format.
  if (!serviceRoleKey?.startsWith('sb_secret_')) {
    headers.authorization = `Bearer ${serviceRoleKey}`;
  }

  return headers;
}

async function parseJsonBody(request) {
  if (request.body && typeof request.body === 'object') return request.body;

  if (typeof request.body === 'string' && request.body.trim()) {
    return JSON.parse(request.body);
  }

  if (!request.body || request.method === 'GET') return null;

  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8').trim();
  if (!raw) return null;
  return JSON.parse(raw);
}

function isDuplicateConflict(status, payload) {
  if (status !== 409) return false;
  const message = stableStringify(payload).toLowerCase();
  return message.includes('duplicate key') || message.includes('already exists') || message.includes('assessment_id');
}

async function fetchExistingRow(assessmentId) {
  const supabaseUrl = getSupabaseUrl();
  const url = new URL(`${supabaseUrl}/rest/v1/${TABLE_NAME}`);
  url.searchParams.set('assessment_id', `eq.${assessmentId}`);
  url.searchParams.set('select', '*');
  url.searchParams.set('limit', '1');

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      ...restHeaders(),
      accept: 'application/json',
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(`Failed to read existing submission: ${response.status} ${text}`);
  }

  return Array.isArray(data) ? data[0] || null : null;
}

async function persistRow(row) {
  const supabaseUrl = getSupabaseUrl();
  const url = `${supabaseUrl}/rest/v1/${TABLE_NAME}`;
  const request = buildSupabaseInsertRequest(row);

  for (let attempt = 1; attempt <= MAX_TRANSIENT_RETRIES; attempt += 1) {
    try {
      const response = await fetch(url, {
        ...request,
        headers: {
          ...request.headers,
          ...restHeaders(),
        },
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : null;

      if (response.ok) {
        return { ok: true, duplicate: false, stored: Array.isArray(data) ? data[0] || row : row };
      }

      if (isDuplicateConflict(response.status, data)) {
        const existing = await fetchExistingRow(row.assessment_id);
        if (!existing) {
          return {
            ok: false,
            retryable: true,
            status: 409,
            error: 'Duplicate submission detected but existing row could not be verified.',
          };
        }

        if (rowsAreEquivalent(existing, row)) {
          return { ok: true, duplicate: true, stored: existing };
        }

        return {
          ok: false,
          retryable: false,
          status: 409,
          error: 'A submission with this assessment_id already exists and does not match this retry payload.',
        };
      }

      if (RETRYABLE_STATUS_CODES.has(response.status) && attempt < MAX_TRANSIENT_RETRIES) {
        await sleep(250 * 2 ** (attempt - 1));
        continue;
      }

      const upstreamMessage =
        (data && typeof data === 'object' && (data.error || data.message)) ||
        text ||
        'Supabase persistence failed.';

      return {
        ok: false,
        retryable: RETRYABLE_STATUS_CODES.has(response.status),
        status: response.status,
        error: `Blueprint persistence failed. ${String(upstreamMessage)}`.trim(),
      };
    } catch (error) {
      if (attempt < MAX_TRANSIENT_RETRIES) {
        await sleep(250 * 2 ** (attempt - 1));
        continue;
      }

      return {
        ok: false,
        retryable: true,
        status: 503,
        error: error instanceof Error ? error.message : 'Network failure during persistence.',
      };
    }
  }

  return { ok: false, retryable: true, status: 503, error: 'Persistence retries exhausted.' };
}

export default async function handler(request, response) {
  response.setHeader('cache-control', 'no-store');
  response.setHeader('x-aaryx-blueprint-assessment-version', expectedAssessmentVersion());

  if (request.method !== 'POST') {
    response.setHeader('allow', 'POST');
    return json(response, 405, { ok: false, error: 'Method not allowed.' });
  }

  if (!getSupabaseUrl() || !getSupabaseServiceRoleKey()) {
    return json(response, 503, {
      ok: false,
      retryable: true,
      error: 'Blueprint persistence is not configured on the server.',
    });
  }

  let payload;
  try {
    payload = await parseJsonBody(request);
  } catch (error) {
    return json(response, 400, {
      ok: false,
      error: error instanceof Error ? error.message : 'Invalid JSON body.',
    });
  }

  const validation = validateSubmissionPayload(payload);
  if (!validation.ok) {
    return json(response, 400, {
      ok: false,
      error: 'Blueprint submission payload failed validation.',
      details: validation.errors,
    });
  }

  const row = mapPayloadToSupabaseRow(payload);
  const result = await persistRow(row);

  if (!result.ok) {
    return json(response, result.status || 503, {
      ok: false,
      retryable: Boolean(result.retryable),
      error: result.error,
      assessment_id: row.assessment_id,
    });
  }

  return json(response, result.duplicate ? 200 : 201, {
    ok: true,
    duplicate: result.duplicate,
    assessment_id: row.assessment_id,
    submitted_at: row.submitted_at,
  });
}

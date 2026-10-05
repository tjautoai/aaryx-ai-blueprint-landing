// AARYX commercial lead capture endpoint
// Posts to aaryx_leads table in the existing Supabase project
// Separate from Blueprint submissions (aaryx_blueprint_submissions)

const TABLE_NAME = 'aaryx_leads';

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

function restHeaders() {
  const key = getSupabaseServiceRoleKey();
  const headers = {
    apikey: key,
    authorization: `Bearer ${key}`,
    prefer: 'return=minimal',
  };
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

function validEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (trimmed.length === 0 || trimmed.length > 254) return false;
  const atIndex = trimmed.lastIndexOf('@');
  if (atIndex <= 0 || atIndex === trimmed.length - 1) return false;
  const domain = trimmed.slice(atIndex + 1);
  if (domain.length === 0 || domain.length > 253) return false;
  if (!domain.includes('.')) return false;
  return true;
}

function validatePayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    errors.push('Request body must be a JSON object.');
    return { ok: false, errors };
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const improvement = typeof body.improvement === 'string' ? body.improvement.trim() : '';
  const source = typeof body.source === 'string' ? body.source.trim() : '';

  if (!name || name.length < 2) {
    errors.push('Name is required (minimum 2 characters).');
  }

  if (!validEmail(email)) {
    errors.push('A valid work email is required.');
  }

  // improvement is optional

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    row: {
      name,
      email,
      improvement: improvement || null,
      source: source || null,
      submitted_at: new Date().toISOString(),
    },
  };
}

async function persistRow(row) {
  const supabaseUrl = getSupabaseUrl();
  const url = `${supabaseUrl}/rest/v1/${TABLE_NAME}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      ...restHeaders(),
      'content-type': 'application/json',
    },
    body: JSON.stringify(row),
  });

  if (response.ok) {
    return { ok: true };
  }

  let errorDetail = 'Persistence failed.';
  try {
    const data = await response.json();
    if (data && (data.message || data.error)) {
      errorDetail = String(data.message || data.error);
    }
  } catch (_) {
    // use default
  }

  return {
    ok: false,
    status: response.status,
    error: errorDetail,
  };
}

export default async function handler(request, response) {
  response.setHeader('cache-control', 'no-store');

  if (request.method !== 'POST') {
    response.setHeader('allow', 'POST');
    return json(response, 405, { ok: false, error: 'Method not allowed.' });
  }

  if (!getSupabaseUrl() || !getSupabaseServiceRoleKey()) {
    return json(response, 503, {
      ok: false,
      error: 'Lead capture is not configured on the server.',
    });
  }

  let body;
  try {
    body = await parseJsonBody(request);
  } catch (error) {
    return json(response, 400, {
      ok: false,
      error: 'Invalid JSON body.',
    });
  }

  const validation = validatePayload(body);
  if (!validation.ok) {
    return json(response, 400, {
      ok: false,
      error: 'Validation failed.',
      details: validation.errors,
    });
  }

  const result = await persistRow(validation.row);

  if (!result.ok) {
    return json(response, result.status || 503, {
      ok: false,
      error: result.error,
    });
  }

  return json(response, 201, {
    ok: true,
    submitted_at: validation.row.submitted_at,
  });
}
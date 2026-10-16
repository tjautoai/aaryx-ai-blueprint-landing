import crypto from 'node:crypto';
import { GUIDE_MAP, emailHtml, safeFileName, validateFirstLookPayload } from './_lib/first-look.js';

const MAX_BODY_BYTES = 10_000;
const MAX_ATTEMPTS = 3;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 8;
const DELIVERY_BUCKET = process.env.FIRST_FIX_GUIDES_BUCKET || 'aaryx-private-guides';

function json(response, status, body) {
  response.status(status).setHeader('content-type', 'application/json; charset=utf-8');
  response.send(JSON.stringify(body));
}

function configured() {
  return Boolean(
    process.env.AARYX_FIRST_LOOK_SUPABASE_URL &&
      process.env.AARYX_FIRST_LOOK_SUPABASE_SERVICE_ROLE_KEY &&
      process.env.RESEND_API_KEY &&
      process.env.FIRST_FIX_EMAIL_FROM &&
      process.env.FIRST_FIX_EMAIL_REPLY_TO &&
      process.env.FIRST_FIX_RATE_LIMIT_SALT,
  );
}

function restHeaders(extra = {}) {
  const key = process.env.AARYX_FIRST_LOOK_SUPABASE_SERVICE_ROLE_KEY;
  const headers = { apikey: key, ...extra };
  if (!key?.startsWith('sb_secret_')) headers.authorization = `Bearer ${key}`;
  return headers;
}

async function parseBody(request) {
  const contentLength = Number(request.headers['content-length'] || 0);
  if (contentLength > MAX_BODY_BYTES) throw new Error('Request body is too large.');
  if (request.body && typeof request.body === 'object') return request.body;
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw new Error('Request body is too large.');
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf8').trim();
  return raw ? JSON.parse(raw) : null;
}

function clientIp(request) {
  const forwarded = request.headers['x-forwarded-for'];
  return String(Array.isArray(forwarded) ? forwarded[0] : forwarded || request.socket?.remoteAddress || '')
    .split(',')[0]
    .trim();
}

function hashIp(value) {
  return crypto
    .createHmac('sha256', process.env.FIRST_FIX_RATE_LIMIT_SALT)
    .update(value || 'unknown')
    .digest('hex');
}

function allowedOrigin(request) {
  const origin = request.headers.origin;
  if (!origin) return true;
  const allowed = String(process.env.FIRST_FIX_ALLOWED_ORIGINS || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  if (allowed.length) return allowed.includes(origin);
  const host = request.headers['x-forwarded-host'] || request.headers.host;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

async function supabase(path, options = {}) {
  const response = await fetch(`${process.env.AARYX_FIRST_LOOK_SUPABASE_URL}${path}`, {
    ...options,
    headers: restHeaders(options.headers),
  });
  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!response.ok) throw new Error(`Supabase request failed (${response.status}).`);
  return { data, headers: response.headers };
}

async function rateLimit(ipHash) {
  const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
  const query = new URLSearchParams({ select: 'id', request_ip_hash: `eq.${ipHash}`, created_at: `gte.${since}` });
  const { headers } = await supabase(`/rest/v1/first_look_guide_requests?${query}`, {
    headers: { prefer: 'count=exact' },
  });
  const range = headers.get('content-range') || '';
  const total = Number(range.split('/')[1] || 0);
  return total < RATE_LIMIT_MAX_REQUESTS;
}

async function findLead(email) {
  const query = new URLSearchParams({ select: 'id,first_name,marketing_consent', work_email: `eq.${email}`, limit: '1' });
  const { data } = await supabase(`/rest/v1/first_look_leads?${query}`);
  return Array.isArray(data) ? data[0] || null : null;
}

async function upsertLead({ firstName, email, marketingConsent }) {
  const existing = await findLead(email);
  const row = {
    first_name: firstName,
    work_email: email,
    marketing_consent: Boolean(existing?.marketing_consent || marketingConsent),
    updated_at: new Date().toISOString(),
  };
  if (existing) {
    const { data } = await supabase(`/rest/v1/first_look_leads?id=eq.${existing.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', prefer: 'return=representation' },
      body: JSON.stringify(row),
    });
    return Array.isArray(data) ? data[0] : existing;
  }
  const { data } = await supabase('/rest/v1/first_look_leads', {
    method: 'POST',
    headers: { 'content-type': 'application/json', prefer: 'return=representation' },
    body: JSON.stringify({ ...row, created_at: new Date().toISOString() }),
  });
  return Array.isArray(data) ? data[0] : null;
}

async function recordConsent({ leadId, consent, sourcePath }) {
  await supabase('/rest/v1/first_look_consent_events', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ lead_id: leadId, marketing_consent: consent, source_path: sourcePath }),
  });
}

async function findRequest(requestId) {
  const query = new URLSearchParams({ select: '*', request_id: `eq.${requestId}`, limit: '1' });
  const { data } = await supabase(`/rest/v1/first_look_guide_requests?${query}`);
  return Array.isArray(data) ? data[0] || null : null;
}

async function createRequest({ requestId, leadId, problemKey, guideId, sourcePath, ipHash }) {
  const { data } = await supabase('/rest/v1/first_look_guide_requests', {
    method: 'POST',
    headers: { 'content-type': 'application/json', prefer: 'return=representation' },
    body: JSON.stringify({
      request_id: requestId,
      lead_id: leadId,
      problem_key: problemKey,
      guide_id: guideId,
      source_path: sourcePath,
      request_ip_hash: ipHash,
      delivery_status: 'pending',
      delivery_attempt_count: 0,
    }),
  });
  return Array.isArray(data) ? data[0] : null;
}

async function updateRequest(id, patch) {
  await supabase(`/rest/v1/first_look_guide_requests?id=eq.${id}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ...patch, updated_at: new Date().toISOString() }),
  });
}

async function privateGuideBytes(storagePath) {
  const encodedPath = storagePath.split('/').map(encodeURIComponent).join('/');
  const response = await fetch(`${process.env.AARYX_FIRST_LOOK_SUPABASE_URL}/storage/v1/object/${DELIVERY_BUCKET}/${encodedPath}`, {
    headers: restHeaders(),
  });
  if (!response.ok) throw new Error(`Private guide storage request failed (${response.status}).`);
  return Buffer.from(await response.arrayBuffer());
}

async function sendEmail({ email, firstName, guide }) {
  const attachment = await privateGuideBytes(guide.storagePath);
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: 'Bearer ' + process.env.RESEND_API_KEY, 'content-type': 'application/json' },
    body: JSON.stringify({
      from: process.env.FIRST_FIX_EMAIL_FROM,
      reply_to: process.env.FIRST_FIX_EMAIL_REPLY_TO,
      to: [email],
      subject: `Your AARYX First-Fix Guide: ${guide.title}`,
      html: emailHtml({ firstName, guideTitle: guide.title }),
      attachments: [{ filename: safeFileName(guide.title), content: attachment.toString('base64') }],
    }),
  });
  const text = await response.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = null; }
  if (!response.ok || !body?.id) throw new Error(`Transactional provider did not accept guide delivery (${response.status}).`);
  return body.id;
}

export default async function handler(request, response) {
  response.setHeader('cache-control', 'no-store');
  response.setHeader('x-content-type-options', 'nosniff');
  response.setHeader('referrer-policy', 'same-origin');

  if (request.method !== 'POST') {
    response.setHeader('allow', 'POST');
    return json(response, 405, { ok: false, message: 'Method not allowed.' });
  }
  if (!allowedOrigin(request)) return json(response, 403, { ok: false, message: 'Request origin is not allowed.' });
  if (!configured()) return json(response, 503, { ok: false, message: 'Guide delivery is not configured yet. Please try again later.' });

  let payload;
  try { payload = await parseBody(request); } catch { return json(response, 400, { ok: false, message: 'Invalid request.' }); }
  const validation = validateFirstLookPayload(payload);
  if (!validation.ok) return json(response, 400, { ok: false, message: 'Please check the form and try again.', details: validation.errors });
  const value = validation.value;
  const ipHash = hashIp(clientIp(request));

  try {
    if (!(await rateLimit(ipHash))) return json(response, 429, { ok: false, message: 'Please wait a few minutes before requesting another guide.' });

    const existing = await findRequest(value.requestId);
    if (existing?.delivery_status === 'accepted') return json(response, 200, { ok: true, status: 'accepted', duplicate: true });
    if (existing?.delivery_status === 'pending') return json(response, 202, { ok: false, status: 'pending', message: 'Your request is still processing. Please check your inbox shortly.' });
    if (existing && existing.delivery_attempt_count >= MAX_ATTEMPTS) return json(response, 409, { ok: false, message: 'This delivery could not be completed. Please request a fresh guide.' });

    const lead = await upsertLead(value);
    if (!lead?.id) throw new Error('Lead record could not be created.');
    await recordConsent({ leadId: lead.id, consent: value.marketingConsent, sourcePath: value.sourcePath });

    let guideRequest = existing;
    if (!guideRequest) guideRequest = await createRequest({ ...value, leadId: lead.id, ipHash });
    if (!guideRequest?.id) throw new Error('Guide request could not be created.');

    const guide = GUIDE_MAP[value.problemKey];
    try {
      const providerMessageId = await sendEmail({ email: value.email, firstName: value.firstName, guide });
      await updateRequest(guideRequest.id, {
        delivery_status: 'accepted',
        delivery_provider: 'resend',
        delivery_provider_message_id: providerMessageId,
        delivery_accepted_at: new Date().toISOString(),
        delivery_attempt_count: Number(guideRequest.delivery_attempt_count || 0) + 1,
        delivery_error: null,
      });
      return json(response, 201, { ok: true, status: 'accepted', duplicate: false });
    } catch (deliveryError) {
      await updateRequest(guideRequest.id, {
        delivery_status: 'failed',
        delivery_attempt_count: Number(guideRequest.delivery_attempt_count || 0) + 1,
        delivery_error: 'Provider did not accept the delivery request.',
      });
      return json(response, 502, { ok: false, status: 'failed', message: 'We could not deliver the guide right now. Please try again.' });
    }
  } catch (error) {
    console.error('first-look-submit failed', { message: error instanceof Error ? error.message : 'unknown' });
    return json(response, 503, { ok: false, message: 'We could not process the request right now. Please try again.' });
  }
}

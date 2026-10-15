import assert from 'node:assert/strict';
import handler from '../first-look-submit.js';

function responseCapture() {
  return {
    code: null,
    headers: {},
    body: null,
    status(code) { this.code = code; return this; },
    setHeader(key, value) { this.headers[key.toLowerCase()] = value; return this; },
    send(value) { this.body = JSON.parse(value); return this; },
  };
}

for (const key of [
  'AARYX_FIRST_LOOK_SUPABASE_URL',
  'AARYX_FIRST_LOOK_SUPABASE_SERVICE_ROLE_KEY',
  'RESEND_API_KEY',
  'FIRST_FIX_EMAIL_FROM',
  'FIRST_FIX_EMAIL_REPLY_TO',
  'FIRST_FIX_RATE_LIMIT_SALT',
]) delete process.env[key];

let response = responseCapture();
await handler({ method: 'GET', headers: {} }, response);
assert.equal(response.code, 405);
assert.equal(response.body.ok, false);

response = responseCapture();
await handler({ method: 'POST', headers: { origin: 'http://localhost:4173', host: 'localhost:4173' }, body: {} }, response);
assert.equal(response.code, 503);
assert.equal(response.body.ok, false);
assert.match(response.body.message, /not configured/i);

Object.assign(process.env, {
  AARYX_FIRST_LOOK_SUPABASE_URL: 'https://example.supabase.co',
  AARYX_FIRST_LOOK_SUPABASE_SERVICE_ROLE_KEY: 'sb_secret_test_key',
  RESEND_API_KEY: 're_test_key',
  FIRST_FIX_EMAIL_FROM: 'AARYX AI <guides@aaryxai.com>',
  FIRST_FIX_RATE_LIMIT_SALT: 'test-rate-limit-salt',
});
response = responseCapture();
await handler({ method: 'POST', headers: { origin: 'http://localhost:4173', host: 'localhost:4173' }, body: {} }, response);
assert.equal(response.code, 503);
assert.match(response.body.message, /not configured/i);
delete process.env.FIRST_FIX_EMAIL_REPLY_TO;

console.log('First Look endpoint safety tests passed.');

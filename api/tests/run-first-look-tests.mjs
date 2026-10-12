import assert from 'node:assert/strict';
import { GUIDE_MAP, emailHtml, validateFirstLookPayload } from '../_lib/first-look.js';

const base = {
  requestId: '8fd5124b-c233-457a-a8d4-fd81d63e6b2a',
  firstName: 'Tejas',
  email: 'TEJAS@example.com ',
  problemKey: 'handoff',
  guideId: '01-handoff',
  marketingConsent: false,
  website: '',
  sourcePath: '/',
};

const valid = validateFirstLookPayload(base);
assert.equal(valid.ok, true);
assert.equal(valid.value.email, 'tejas@example.com');
assert.equal(valid.value.marketingConsent, false);
assert.equal(Object.keys(GUIDE_MAP).length, 4);

for (const [problemKey, guide] of Object.entries(GUIDE_MAP)) {
  const result = validateFirstLookPayload({ ...base, problemKey, guideId: guide.guideId });
  assert.equal(result.ok, true, `${problemKey} mapping must validate`);
}

assert.equal(validateFirstLookPayload({ ...base, guideId: 'wrong-guide' }).ok, false);
assert.equal(validateFirstLookPayload({ ...base, problemKey: 'other' }).ok, false);
assert.equal(validateFirstLookPayload({ ...base, website: 'spam' }).ok, false);
assert.equal(validateFirstLookPayload({ ...base, requestId: 'not-a-uuid' }).ok, false);
assert.equal(validateFirstLookPayload({ ...base, sourcePath: 'https://bad.example' }).ok, false);

const html = emailHtml({ firstName: '<Tejas>', guideTitle: 'A & B' });
assert.ok(html.includes('&lt;Tejas&gt;'));
assert.ok(html.includes('A &amp; B'));
assert.ok(html.includes('https://cal.com/tejasdesai/business-discovery'));
console.log('First Look validation and email-template tests passed.');

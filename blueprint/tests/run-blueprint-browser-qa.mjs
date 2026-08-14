import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const baseUrl = process.env.BLUEPRINT_BASE_URL || 'http://127.0.0.1:3020';
const expectSuccess = process.env.EXPECT_SUCCESS !== 'false';

const answers = [
  'Founder / Owner / Principal',
  '2 to 3 people',
  'Missed follow-up',
  'Client trust',
  'CRM plus manual reminders',
  'Clients or partners feeling neglected',
  'Mostly communication follow-through',
  'That would solve the sharpest part of the problem',
  'Reliable, but inconsistent in practice',
];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

await page.goto(`${baseUrl}/blueprint/`, { waitUntil: 'networkidle' });
await page.getByRole('button', { name: 'Begin the Assessment' }).click();

for (let index = 0; index < answers.length; index += 1) {
  await page.getByText(answers[index], { exact: true }).click();
  const isLastInScreen = [1, 3, 5, 6, 7, 8].includes(index);
  if (isLastInScreen) {
    await page.getByRole('button', { name: index === 8 ? 'Continue to Blueprint' : 'Continue' }).click();
  }
}

await page.getByRole('button', { name: 'Show My Blueprint' }).click();
const firstNameMessage = await page.locator('input[name="firstName"]').evaluate((el) => el.validationMessage);
assert.equal(firstNameMessage, 'Enter your first name.');

await page.locator('input[name="firstName"]').fill('QA');
await page.getByRole('button', { name: 'Show My Blueprint' }).click();
const lastNameMessage = await page.locator('input[name="lastName"]').evaluate((el) => el.validationMessage);
assert.equal(lastNameMessage, 'Enter your last name.');

await page.locator('input[name="lastName"]').fill('Tester');
await page.locator('input[name="email"]').fill('invalid-email');
await page.getByRole('button', { name: 'Show My Blueprint' }).click();
const emailMessage = await page.locator('input[name="email"]').evaluate((el) => el.validationMessage);
assert.equal(emailMessage, 'Enter a valid work email.');

await page.locator('input[name="email"]').fill('qa.blueprint.browser@example.com');
await page.getByRole('button', { name: 'Show My Blueprint' }).click();

if (expectSuccess) {
  await page.waitForSelector('text=Blueprint summary', { timeout: 10000 });
  const state = await page.evaluate(() => window.__AARYX_BLUEPRINT__.getState());
  assert.equal(state.step, 'results');
  assert.equal(state.identity.firstName, 'QA');
  assert.equal(state.identity.lastName, 'Tester');
  assert.equal(state.identity.email, 'qa.blueprint.browser@example.com');
  assert.equal(state.payload.assessment_version, '2.0.0-locked-9q');
  assert.equal(state.payload.identity.lastName, 'Tester');
  assert.equal(Object.keys(state.payload.answers).length, 9);
} else {
  await page.waitForTimeout(3000);
  const state = await page.evaluate(() => window.__AARYX_BLUEPRINT__.getState());
  assert.equal(state.step, 'gate');
  assert.equal(state.identity.firstName, 'QA');
  assert.equal(state.identity.lastName, 'Tester');
  assert.equal(state.identity.email, 'qa.blueprint.browser@example.com');
  assert.match(state.gateError, /Blueprint persistence|configured|failed/i);
}

await browser.close();
console.log(JSON.stringify({ ok: true, expectSuccess }, null, 2));

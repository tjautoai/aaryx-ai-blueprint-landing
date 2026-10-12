import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const root = new URL('.', import.meta.url).pathname;
const out = new URL('./qa-renders/', import.meta.url).pathname;
await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true });
const errors = [];

async function open(width, height) {
  const page = await browser.newPage({ viewport: { width, height } });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle' });
  return page;
}

let page = await open(1440, 900);
const expectedGuideTitles = {
  handoff: 'The Handoff Fix Guide',
  waiting: 'The Stalled Work Recovery Guide',
  founder: 'The Founder Bottleneck Fix Guide',
  tools: 'The Disconnected Tools Fix Guide',
};
const guideMapping = {};
for (const [key, title] of Object.entries(expectedGuideTitles)) {
  await page.locator(".choice[data-key='" + key + "']").click();
  await page.locator('#result-actions button').click();
  await page.locator('#save-panel').waitFor({ state: 'visible' });
  guideMapping[key] = await page.locator('#guide-title').textContent();
  if (guideMapping[key] !== title) throw new Error(`Incorrect guide mapping for ${key}.`);
  await page.evaluate(() => closePanel('save'));
}
await page.screenshot({ path: `${out}/01-home-1440x900.png` });
await page.locator('#start').scrollIntoViewIfNeeded();
await page.locator(".choice[data-key='handoff']").click();
await page.screenshot({ path: `${out}/02-immediate-result-1440x900.png` });
await page.locator('#result-actions button').click();
await page.locator('#save-panel').waitFor({ state: 'visible' });
await page.screenshot({ path: `${out}/03-guide-offer-handoff-1440x900.png` });
await page.locator('#first-name').fill('Test');
await page.locator('#work-email').fill('firstfix.qa@example.com');
await page.locator('#guide-submit').click();
await page.getByRole('alert').waitFor({ state: 'visible' });
await page.screenshot({ path: `${out}/04-delivery-unconfigured-1440x900.png` });
await page.close();

page = await open(1366, 768);
await page.locator('#start').scrollIntoViewIfNeeded();
await page.locator(".choice[data-key='founder']").click();
await page.locator('#result-actions button').click();
await page.locator('#save-panel').waitFor({ state: 'visible' });
await page.locator('#guide-submit').focus();
const desktopReachability = await page.evaluate(() => {
  const panel = document.querySelector('#save-panel .panel');
  const button = document.querySelector('#guide-submit').getBoundingClientRect();
  return { scrollable: panel.scrollHeight > panel.clientHeight, buttonVisible: button.top >= 0 && button.bottom <= window.innerHeight, active: document.activeElement.id };
});
await page.screenshot({ path: `${out}/05-guide-form-reachable-founder-1366x768.png` });
if (!desktopReachability.buttonVisible || desktopReachability.active !== 'guide-submit') throw new Error('Desktop guide submit control is not keyboard reachable.');
await page.close();

page = await open(390, 844);
await page.locator('#start').scrollIntoViewIfNeeded();
await page.locator(".choice[data-key='tools']").click();
await page.locator('#result-actions button').click();
await page.locator('#save-panel').waitFor({ state: 'visible' });
await page.locator('#guide-submit').focus();
await page.screenshot({ path: `${out}/06-guide-form-reachable-tools-390x844.png` });
const mobile = await page.evaluate(() => {
  const panel = document.querySelector('#save-panel .panel');
  const button = document.querySelector('#guide-submit').getBoundingClientRect();
  return {
    panelVisible: document.querySelector('#save-panel').classList.contains('show'),
    selectedGuide: document.querySelector('#guide-title').textContent,
    hasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
    buttonVisible: button.top >= 0 && button.bottom <= window.innerHeight,
    scrollable: panel.scrollHeight > panel.clientHeight,
    active: document.activeElement.id,
    calUrl: document.querySelector('[data-analytics-event]').href,
  };
});
if (!mobile.buttonVisible || mobile.active !== 'guide-submit') throw new Error('Mobile guide submit control is not keyboard reachable.');
await page.close();

await browser.close();
console.log(JSON.stringify({ errors, guideMapping, desktopReachability, mobile, screenshots: (await fs.readdir(out)).sort() }, null, 2));
if (errors.length) process.exit(1);

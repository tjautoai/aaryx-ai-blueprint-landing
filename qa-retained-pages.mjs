import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const base = process.env.QA_BASE_URL || 'http://127.0.0.1:3000';
const outputDir = process.env.QA_OUTPUT_DIR || new URL('./releases/v1.1/qa/', import.meta.url).pathname;
const paths = [
  '/', '/about.html', '/how-aaryx-works.html',
  '/proof.html', '/resources.html', '/privacy.html', '/terms.html',
  '/ai-consulting-services.html', '/ai-automation-services.html',
  '/workflow-automation-services.html', '/ai-implementation-services.html',
  '/ai-agent-development-services.html', '/pittsburgh-ai-consultant.html',
  '/pittsburgh-ai-automation-services.html', '/pittsburgh-workflow-automation-company.html',
  '/pittsburgh-ai-implementation-services.html', '/ai-automation-for-mortgage-brokers.html',
  '/ai-automation-for-insurance-agencies.html', '/ai-automation-for-recruiters.html',
  '/ai-automation-for-consultants.html', '/ai-automation-for-accountants.html',
  '/ai-automation-for-law-firms.html',
];

const browser = await chromium.launch({ headless: true });
const findings = [];
await fs.mkdir(outputDir, { recursive: true });

for (const path of paths) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const response = await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
  const desktop = await page.evaluate(() => {
    const jsonLd = [...document.querySelectorAll('script[type="application/ld+json"]')];
    const invalidJsonLd = jsonLd.map((node, index) => {
      try { JSON.parse(node.textContent); return null; } catch (error) { return { index, message: error.message }; }
    }).filter(Boolean);
    const images = [...document.images].filter(image => !image.complete || image.naturalWidth === 0).map(image => image.currentSrc || image.src);
    const anchors = [...document.querySelectorAll('a[href]')].map(anchor => anchor.href).filter(href => href.startsWith(location.origin));
    const retiredBlueprintLinks = anchors.filter(href => new URL(href).pathname === '/blueprint/' || new URL(href).pathname === '/blueprint.html');
    const analytics = [...document.querySelectorAll('[data-analytics-event]')].map(node => node.getAttribute('data-analytics-event'));
    return {
      title: document.title,
      description: document.querySelector('meta[name="description"]')?.content || '',
      canonical: document.querySelector('link[rel="canonical"]')?.href || '',
      h1Count: document.querySelectorAll('h1').length,
      gtmPresent: document.documentElement.innerHTML.includes('GTM-5SFGV55W'),
      hasFooter: Boolean(document.querySelector('footer')),
      hasSkipLink: Boolean(document.querySelector('.skip-link')),
      horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
      invalidJsonLd,
      images,
      internalAnchors: [...new Set(anchors)],
      retiredBlueprintLinks: [...new Set(retiredBlueprintLinks)],
      analytics,
    };
  });
  await page.screenshot({ path: `${outputDir}/${path === '/' ? 'home' : path.replaceAll('/', '_').replace(/^_/, '').replace('.html', '')}-desktop.png`, fullPage: false });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(75);
  const mobile = await page.evaluate(() => ({
    horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
    focusedOutlineRule: [...document.styleSheets].some(sheet => {
      try { return [...sheet.cssRules].some(rule => rule.cssText.includes(':focus-visible') || rule.cssText.includes(':focus')); } catch { return false; }
    }),
  }));
  await page.screenshot({ path: `${outputDir}/${path === '/' ? 'home' : path.replaceAll('/', '_').replace(/^_/, '').replace('.html', '')}-mobile.png`, fullPage: false });
  const linkStatuses = [];
  for (const href of desktop.internalAnchors) {
    const candidate = new URL(href);
    if (candidate.origin !== base) continue;
    const linkResponse = await page.request.get(candidate.href, { maxRedirects: 5 });
    linkStatuses.push({ href: candidate.pathname, status: linkResponse.status() });
  }
  const failedLinks = linkStatuses.filter(item => item.status >= 400);
  const failures = [];
  if (!response?.ok()) failures.push(`HTTP ${response?.status() || 'no response'}`);
  if (!desktop.title) failures.push('missing title');
  if (!desktop.description) failures.push('missing meta description');
  if (!desktop.canonical) failures.push('missing canonical');
  if (desktop.h1Count !== 1) failures.push(`expected one H1, found ${desktop.h1Count}`);
  if (!desktop.gtmPresent) failures.push('GTM missing');
  if (!desktop.hasFooter) failures.push('footer missing');
  if (!desktop.hasSkipLink) failures.push('skip link missing');
  if (desktop.horizontalOverflow || mobile.horizontalOverflow) failures.push('horizontal overflow');
  if (desktop.invalidJsonLd.length) failures.push('invalid JSON-LD');
  if (desktop.images.length) failures.push('broken image');
  if (desktop.retiredBlueprintLinks.length) failures.push('retired Blueprint internal link');
  if (errors.length) failures.push('page error');
  if (failedLinks.length) failures.push('broken internal link');
  if (desktop.analytics.some(event => /@|email|name/i.test(event))) failures.push('analytics event may contain PII');
  findings.push({
    path,
    status: failures.length ? 'FAIL' : 'PASS',
    finalPath: new URL(page.url()).pathname,
    httpStatus: response?.status() || null,
    title: desktop.title,
    canonical: desktop.canonical,
    h1Count: desktop.h1Count,
    gtmPresent: desktop.gtmPresent,
    desktopOverflow: desktop.horizontalOverflow,
    mobileOverflow: mobile.horizontalOverflow,
    invalidJsonLd: desktop.invalidJsonLd.length,
    brokenImages: desktop.images,
    retiredBlueprintLinks: desktop.retiredBlueprintLinks,
    pageErrors: errors,
    brokenInternalLinks: failedLinks,
    failures,
  });
  await page.close();
}

await browser.close();
const summary = {
  base,
  generatedAt: new Date().toISOString(),
  total: findings.length,
  passed: findings.filter(item => item.status === 'PASS').length,
  failed: findings.filter(item => item.status === 'FAIL').length,
  findings,
};
await fs.writeFile(`${outputDir}/retained-page-audit.json`, JSON.stringify(summary, null, 2));
await fs.writeFile(`${outputDir}/retained-page-audit.md`, [
  '# AARYX V1.1 Retained-Page Local QA', '',
  `Base URL: ${base}`, `Total: ${summary.total}. Passed: ${summary.passed}. Failed: ${summary.failed}.`, '',
  '| URL | Status | HTTP | H1 | GTM | Desktop overflow | Mobile overflow | JSON-LD | Broken links |',
  '|---|---:|---:|---:|---:|---:|---:|---:|---:|',
  ...findings.map(item => `| ${item.path} | ${item.status} | ${item.httpStatus} | ${item.h1Count} | ${item.gtmPresent ? 'yes' : 'no'} | ${item.desktopOverflow ? 'yes' : 'no'} | ${item.mobileOverflow ? 'yes' : 'no'} | ${item.invalidJsonLd} | ${item.brokenInternalLinks.length} |`),
  '',
  ...findings.filter(item => item.status === 'FAIL').map(item => `- ${item.path}: ${item.failures.join('; ')}`), '',
].join('\n'));
console.log(JSON.stringify(summary, null, 2));
if (summary.failed) process.exit(1);

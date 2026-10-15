import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = relativePath => fs.readFileSync(path.join(repo, relativePath), 'utf8');

const redirects = JSON.parse(read('vercel.json')).redirects;
const expectedRedirects = new Map([
  ['/blueprint/:path*', 'https://www.aaryxai.com/'],
  ['/blueprint.html', 'https://www.aaryxai.com/'],
]);

for (const [source, destination] of expectedRedirects) {
  const redirect = redirects.find(item => item.source === source);
  assert.ok(redirect, `missing redirect for ${source}`);
  assert.equal(redirect.destination, destination, `wrong redirect destination for ${source}`);
  assert.equal(redirect.permanent, true, `redirect for ${source} must be permanent`);
}

const sitemap = read('sitemap.xml');
assert.doesNotMatch(sitemap, /\/blueprint\/?/i, 'retired Blueprint route must not appear in sitemap');

const publicHtml = fs.readdirSync(repo)
  .filter(name => name.endsWith('.html'));

for (const name of publicHtml) {
  const html = read(name);
  assert.doesNotMatch(html, /href=["'][^"']*\/blueprint(?:\/|\.html)?[^"']*["']/i, `${name} contains a retired Blueprint internal link`);
}

for (const name of publicHtml.filter(name => !['blueprint.html', 'privacy.html', 'terms.html'].includes(name))) {
  const html = read(name);
  assert.doesNotMatch(html, /\bblueprint\b/i, `${name} retains public Blueprint marketing copy`);
}

const homepage = read('index.html');
assert.match(homepage, /AARYX First Look/i, 'homepage must identify First Look as the public assessment');
assert.match(homepage, /id="start"/, 'homepage must retain the First Look entry point');
assert.doesNotMatch(homepage, /\bblueprint\b/i, 'homepage must not retain Blueprint copy');

for (const preservedPath of [
  'blueprint/index.html',
  'blueprint/logic.js',
  'api/blueprint-submit.js',
  'api/_lib/blueprint-submission.js',
]) {
  assert.ok(fs.existsSync(path.join(repo, preservedPath)), `historical Blueprint artifact is missing: ${preservedPath}`);
}

console.log(JSON.stringify({
  ok: true,
  verified: [
    'permanent Blueprint redirects',
    'sitemap retirement',
    'no public Blueprint internal links',
    'First Look homepage entry point',
    'historical Blueprint code preservation',
  ],
}, null, 2));

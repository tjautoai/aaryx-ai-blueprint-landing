export const GUIDE_MAP = Object.freeze({
  handoff: {
    guideId: '01-handoff',
    title: 'The Handoff Fix Guide',
    storagePath: 'first-fix/01-the-handoff-fix-guide.pdf',
  },
  waiting: {
    guideId: '02-stalled-work-recovery',
    title: 'The Stalled Work Recovery Guide',
    storagePath: 'first-fix/02-the-stalled-work-recovery-guide.pdf',
  },
  founder: {
    guideId: '03-founder-bottleneck',
    title: 'The Founder Bottleneck Fix Guide',
    storagePath: 'first-fix/03-the-founder-bottleneck-fix-guide.pdf',
  },
  tools: {
    guideId: '04-disconnected-tools',
    title: 'The Disconnected Tools Fix Guide',
    storagePath: 'first-fix/04-the-disconnected-tools-fix-guide.pdf',
  },
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function cleanText(value, maxLength = 500) {
  return String(value ?? '').trim().replace(/\s+/g, ' ').slice(0, maxLength);
}

export function normalizeEmail(value) {
  return cleanText(value, 254).toLowerCase();
}

export function validateFirstLookPayload(payload) {
  const errors = [];
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { ok: false, errors: ['Submission payload must be a JSON object.'] };
  }

  const firstName = cleanText(payload.firstName, 80);
  const email = normalizeEmail(payload.email);
  const problemKey = cleanText(payload.problemKey, 32);
  const guideId = cleanText(payload.guideId, 64);
  const requestId = cleanText(payload.requestId, 64);
  const sourcePath = cleanText(payload.sourcePath, 200) || '/';
  const marketingConsent = payload.marketingConsent === true;
  const honeypot = cleanText(payload.website, 200);

  if (firstName.length < 2) errors.push('First name must be at least two characters.');
  if (!EMAIL_RE.test(email)) errors.push('A valid work email is required.');
  if (!Object.hasOwn(GUIDE_MAP, problemKey)) errors.push('The selected problem is invalid.');
  if (Object.hasOwn(GUIDE_MAP, problemKey) && GUIDE_MAP[problemKey].guideId !== guideId) {
    errors.push('The selected guide does not match the problem.');
  }
  if (!UUID_RE.test(requestId)) errors.push('A valid request ID is required.');
  if (!sourcePath.startsWith('/') || sourcePath.includes('://')) errors.push('Source path is invalid.');
  if (honeypot) errors.push('Submission could not be accepted.');

  return {
    ok: errors.length === 0,
    errors,
    value: {
      requestId,
      firstName,
      email,
      problemKey,
      guideId,
      sourcePath,
      marketingConsent,
    },
  };
}

export function emailHtml({ firstName, guideTitle }) {
  const safeName = escapeHtml(firstName);
  const safeGuide = escapeHtml(guideTitle);
  return `<!doctype html><html><body style="margin:0;background:#f3f1ea;color:#141a21;font-family:Arial,sans-serif"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:28px 16px;background:#f3f1ea"><tr><td align="center"><table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;background:#fff"><tr><td style="padding:28px 34px;background:#141a21;color:#fff"><div style="font-size:13px;letter-spacing:2px;font-weight:bold">AARYX AI</div><div style="color:#b9d673;margin-top:10px;font-size:13px;letter-spacing:1px">FIRST-FIX GUIDE</div></td></tr><tr><td style="padding:34px"><h1 style="margin:0 0 18px;font-family:Georgia,serif;font-size:34px;font-weight:normal;line-height:1.05">Your practical next step is attached.</h1><p style="font-size:16px;line-height:1.55">Hi ${safeName},</p><p style="font-size:16px;line-height:1.55">Your <strong>${safeGuide}</strong> is attached. It expands on the operational pattern you selected with a focused check, a practical template, and a small implementation checklist.</p><p style="font-size:16px;line-height:1.55">Start with one live example from your business. The value is not in reading the guide. It is in making one currently invisible part of the workflow visible.</p><p style="font-size:16px;line-height:1.55">If you want to discuss whether a separately paid AARYX First-Fix Review is the right next step, you can book a free introductory business conversation.</p><p style="margin:26px 0"><a href="https://cal.com/tejasdesai/business-discovery" style="display:inline-block;background:#3b6af5;color:#fff;padding:14px 18px;text-decoration:none;font-weight:bold">Book a Business Discovery Call</a></p><p style="font-size:13px;line-height:1.5;color:#56615f">You requested this guide from AARYX. This is transactional delivery, not a marketing subscription. Privacy: <a href="https://www.aaryxai.com/privacy.html">aaryxai.com/privacy.html</a></p></td></tr></table></td></tr></table></body></html>`;
}

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

export function safeFileName(title) {
  return title.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() + '.pdf';
}

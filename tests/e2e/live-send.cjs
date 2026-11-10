/**
 * Live-Versand im Browser gegen einen simulierten Endpunkt.
 * Voraussetzung: Build mit PUBLIC_ENQUIRY_MODE=live PUBLIC_ENQUIRY_ENDPOINT=/api/enquiry, Preview auf 4321, Playwright.
 *   PUBLIC_ENQUIRY_MODE=live PUBLIC_ENQUIRY_ENDPOINT=/api/enquiry npm run build && npm run preview
 *   node tests/e2e/live-send.cjs
 */
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const base = process.argv[2] || 'http://localhost:4321';
(async () => {
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
  const errors = []; page.on('pageerror', (e) => errors.push(e.message));
  let mode = 'fail'; const received = [];
  await page.route('**/api/enquiry', async (route) => {
    received.push(JSON.parse(route.request().postData()));
    if (mode === 'fail') return route.fulfill({ status: 502, contentType: 'application/json', body: JSON.stringify({ message: 'Der E-Mail-Dienst ist nicht erreichbar.' }) });
    return route.fulfill({ status: 202, contentType: 'application/json', body: JSON.stringify({ reference: 'SFP-20261110-TEST0001' }) });
  });
  await page.goto(base + '/kontakt/', { waitUntil: 'networkidle' });
  await page.click('[data-panel]:not([hidden]) [data-next]');
  await page.fill('#description', 'Beispielanfrage');
  await page.click('[data-panel]:not([hidden]) [data-next]');
  await page.fill('#name', 'Beispiel Person'); await page.fill('#email', 'person@example.test');
  await page.click('button[type=submit]');
  await page.waitForSelector('#review:not([hidden])');

  await page.click('#send-enquiry');
  assert.equal(received.length, 0);
  assert.match(await page.textContent('#form-status'), /Fehler:.*Einwilligung/);
  console.log('PASS ohne Einwilligung wird nichts übertragen');

  await page.check('#consent');
  await page.click('#send-enquiry');
  await page.waitForFunction(() => document.querySelector('#form-status').dataset.kind === 'error');
  assert.match(await page.textContent('#form-status'), /nicht erreichbar/);
  assert.doesNotMatch(await page.textContent('#form-status'), /eingegangen/);
  assert.equal(await page.isDisabled('#send-enquiry'), false);
  console.log('PASS Fehler des Endpunkts wird als Fehler gezeigt, keine Bestätigung');

  mode = 'ok';
  await page.click('#send-enquiry');
  await page.waitForFunction(() => document.querySelector('#form-status').dataset.kind === 'success');
  assert.match(await page.textContent('#form-status'), /Erfolg:.*eingegangen.*SFP-20261110-TEST0001/);
  assert.equal(await page.isDisabled('#send-enquiry'), true);
  const sent = received.at(-1);
  assert.equal(sent.schemaVersion, 1);
  assert.equal(sent.contact.email, 'person@example.test');
  assert.equal(sent.project.description, 'Beispielanfrage');
  assert.ok(sent.brief.includes('Beispielanfrage'));
  assert.equal(sent.website, '');
  console.log('PASS Annahme mit Referenz, Knopf gesperrt, Payload vollständig');
  assert.deepEqual(errors, []);
  await browser.close();
})().catch((e) => { console.error('FAIL', e); process.exit(1); });

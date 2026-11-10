/**
 * Prüfpfad aus der Rückgabecheckliste im echten Browser:
 * Home → Modell → Optionen konfigurieren → hinzufügen → im Planer bearbeiten →
 * Sprache wechseln → eigene Anforderungen → Brief prüfen → Anfrage senden (Endpunkt simuliert).
 *
 * Voraussetzung: `npm run build && npm run preview` läuft (Port 4321) und
 * Playwright ist verfügbar (nicht Teil der Projektabhängigkeiten).
 *   node tests/e2e/enquiry-flow.cjs [http://localhost:4321]
 */
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const base = process.argv[2] || 'http://localhost:4321';

(async () => {
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('dialog', (d) => d.accept());
  const step = (name) => console.log('PASS ' + name);

  await page.goto(base + '/', { waitUntil: 'networkidle' });
  assert.equal(await page.locator('h1').count(), 1);
  step('Startseite lädt mit genau einer H1');

  // Modellseite: abhängige Option (Folienfarbe nur bei Folienprägung) und Sondermaß
  await page.goto(base + '/produkte/modelle/menu-hamburg/', { waitUntil: 'networkidle' });
  await page.waitForSelector('#cfg-format option[value="a5"]', { state: 'attached' });
  const foil = page.locator('#cfg-option-foil-colour');
  assert.equal(await foil.isVisible(), false);
  await page.selectOption('#cfg-option-lederpragung', 'folienpragung');
  assert.equal(await foil.isVisible(), true);
  await foil.fill('Gold matt');
  await page.selectOption('#cfg-option-lederpragung', 'blindpragung');
  assert.equal(await foil.isVisible(), false);
  step('abhängige Option erscheint und verschwindet');

  await page.selectOption('#cfg-format', 'custom');
  await page.fill('#cfg-width', '210');
  await page.selectOption('#cfg-format', 'a5');
  assert.equal(await page.locator('#cfg-custom').isVisible(), false);
  await page.fill('#cfg-quantity', '-1');
  await page.click('#cfg-add-item');
  assert.equal(await page.getAttribute('#cfg-quantity', 'aria-invalid'), 'true');
  assert.equal(await page.textContent('#cfg-count'), '0');
  step('ungültige Menge wird abgelehnt, Fehler steht am Feld');

  await page.fill('#cfg-quantity', '25');
  await page.click('label[for="cfg-material-buffalo"]');
  await page.selectOption('#cfg-stitch', 'tonal');
  await page.click('#cfg-add-item');
  assert.equal(await page.textContent('#cfg-count'), '1');
  let stored = await page.evaluate(() => JSON.parse(sessionStorage.getItem('sfp-enquiry-v9')));
  assert.deepEqual(stored[0].values, { format: 'a5', quantity: '25', material: 'buffalo', stitch: 'tonal', 'option:lederpragung': 'blindpragung' });
  assert.equal(await page.textContent('[data-enquiry-count]'), '1');
  step('Artikel hinzugefügt; Sondermaß und abgewählte Folienfarbe nicht gespeichert');

  // Projektplaner: bearbeiten, duplizieren, entfernen
  await page.click('#cfg-open-planner');
  await page.waitForSelector('.cfg-item');
  await page.click('.cfg-item__actions button >> nth=0');
  assert.equal(await page.inputValue('#cfg-quantity'), '25');
  await page.fill('#cfg-quantity', '40');
  await page.click('#cfg-add-item');
  stored = await page.evaluate(() => JSON.parse(sessionStorage.getItem('sfp-enquiry-v9')));
  assert.equal(stored.length, 1);
  assert.equal(stored[0].values.quantity, '40');
  step('Bearbeiten ersetzt denselben Artikel');
  await page.click('.cfg-item__actions button >> nth=1');
  assert.equal(await page.locator('.cfg-item').count(), 2);
  await page.click('.cfg-item >> nth=1 >> .cfg-item__actions button >> nth=2');
  assert.equal(await page.locator('.cfg-item').count(), 1);
  step('Duplizieren und Entfernen');

  await page.fill('#cfg-search', 'zzzzzz');
  assert.equal(await page.isDisabled('#cfg-add-item'), true);
  assert.match(await page.textContent('#cfg-products'), /Kein passender Artikel/);
  await page.fill('#cfg-search', '');
  step('Suche ohne Treffer zeigt Leerzustand');

  // Anfrage
  await page.click('#cfg-continue');
  await page.waitForURL(/\/kontakt\/#selection=1/);
  await page.waitForFunction(() => !document.querySelector('[data-selection]').hidden);
  await page.selectOption('#scenario', 'restaurants');
  await page.click('[data-panel]:not([hidden]) [data-next]');
  assert.match(await page.textContent('[data-selection-text]'), /Speisekarte Hamburg[\s\S]*Stückzahl: 40/);
  await page.fill('#description', 'Bitte genau diesen Satz erhalten.');
  await page.fill('#delivery', 'März');
  step('Auswahl im Projektbrief übernommen');

  // Sprachwechsel verliert nichts
  await page.click('[data-lang-link][hreflang="en"]');
  await page.waitForURL(/\/en\/contact\//);
  await page.waitForFunction(() => document.querySelector('#description').value !== '');
  assert.equal(await page.inputValue('#description'), 'Bitte genau diesen Satz erhalten.');
  assert.equal(await page.inputValue('#scenario'), 'restaurants');
  assert.match(await page.textContent('[data-selection-text]'), /Hamburg Menu Cover[\s\S]*Quantity: 40/);
  step('Sprachwechsel erhält Freitext, Auswahl und Schritt');

  // Feldfehler, dann Brief und Versand (Endpunkt simuliert)
  let endpoint = 'down';
  const received = [];
  await page.route('**/api/enquiry', async (route) => {
    received.push(JSON.parse(route.request().postData()));
    if (endpoint === 'down') return route.fulfill({ status: 502, contentType: 'application/json', body: JSON.stringify({ message: 'The mail service could not be reached.' }) });
    return route.fulfill({ status: 202, contentType: 'application/json', body: JSON.stringify({ reference: 'SFP-20261110-TEST0001' }) });
  });
  await page.click('[data-panel]:not([hidden]) [data-next]');
  await page.click('button[type=submit]');
  assert.equal(await page.getAttribute('#name', 'aria-invalid'), 'true');
  await page.fill('#name', 'Test Person');
  await page.fill('#email', 'keine-mail');
  await page.click('button[type=submit]');
  assert.equal(await page.getAttribute('#email', 'aria-invalid'), 'true');
  await page.fill('#email', 'test@example.test');
  await page.click('button[type=submit]');
  await page.waitForSelector('#review:not([hidden])');
  const brief = await page.textContent('#summary');
  assert.ok(brief.includes('Bitte genau diesen Satz erhalten.') && brief.includes('Hamburg Menu Cover') && brief.includes('test@example.test'));
  assert.equal(await page.locator('#review .btn').count(), 1); // nur „Anfrage senden“
  assert.equal(await page.locator('#email-link, #copy-brief, #download-brief').count(), 0);
  step('Feldfehler und Projektbrief; genau ein Sendeknopf');

  await page.click('#send-enquiry');
  await page.waitForFunction(() => document.querySelector('#form-status').dataset.kind === 'error');
  assert.doesNotMatch(await page.textContent('#form-status'), /received|eingegangen/i);
  const fallback = await page.getAttribute('#form-status a', 'href');
  assert.ok(fallback.startsWith('mailto:mail@sfp-berlin.com?subject='));
  assert.equal(new URL(fallback).searchParams.get('body'), brief);
  assert.equal(await page.isDisabled('#send-enquiry'), false);
  step('Versandfehler: keine Bestätigung, Ausweg per E-Mail-Entwurf');

  endpoint = 'up';
  await page.click('#send-enquiry');
  await page.waitForFunction(() => document.querySelector('#form-status').dataset.kind === 'success');
  assert.match(await page.textContent('#form-status'), /SFP-20261110-TEST0001/);
  assert.equal(await page.isDisabled('#send-enquiry'), true);
  const sent = received.at(-1);
  assert.equal(sent.contact.email, 'test@example.test');
  assert.equal(sent.items[0].product, 'menu-hamburg');
  assert.equal(sent.brief, brief);
  assert.equal(sent.website, '');
  step('Versand: Bestätigung nur mit Referenz, Knopf gesperrt, Payload vollständig');

  await page.click('#enquiry-reset');
  assert.equal(await page.inputValue('#description'), '');
  assert.equal(await page.evaluate(() => JSON.parse(sessionStorage.getItem('sfp-enquiry-v9')).length), 0);
  step('bestätigtes Zurücksetzen leert Entwurf und Auswahl');

  // Katalog und Speisekartenfilter
  await page.goto(base + '/produkte/', { waitUntil: 'networkidle' });
  await page.fill('#catalog-search', 'tissue');
  assert.match(await page.textContent('[data-catalog-status]'), /^\d+ Artikel gefunden$/);
  await page.fill('#catalog-search', 'zzzz');
  assert.equal(await page.locator('[data-catalog-empty]').isVisible(), true);
  await page.click('[data-catalog-empty] [data-catalog-reset]');
  assert.equal(await page.locator('[data-catalog-empty]').isVisible(), false);
  await page.goto(base + '/produkte/speisekarten/', { waitUntil: 'networkidle' });
  await page.selectOption('select[name=binding]', 'ring');
  assert.match(await page.textContent('[data-menu-status]'), /^\d+ von 13 Modellen$/);
  step('Katalogsuche, Leerzustand, Zurücksetzen, Speisekartenfilter');

  // Navigation per Tastatur
  await page.goto(base + '/', { waitUntil: 'networkidle' });
  await page.focus('[data-nav-trigger] >> nth=0');
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('#nav-panel-0').isVisible(), true);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#nav-panel-0').isVisible(), false);
  step('Navigation: Enter öffnet, Escape schließt');

  assert.deepEqual(errors, []);
  await browser.close();
  console.log('\nKompletter Anfrageweg geprüft, keine Skriptfehler.');
})().catch((e) => { console.error('FAIL', e); process.exit(1); });

/**
 * Erzeugt die Orientierungs-Screenshots in screenshots/ (Desktop 1440, Mobil 390).
 * Enthält nur Beispieldaten (example.test), keine echten persönlichen Eingaben.
 *   node tests/e2e/screenshots.cjs   (Preview auf Port 4321, Playwright nötig)
 */
const { chromium } = require('playwright');
const fs = require('node:fs');
const base = process.argv[2] || 'http://localhost:4321';
const items = [
  { product: 'menu-hamburg', values: { format: 'a5', quantity: '40', material: 'buffalo', stitch: 'tonal', 'option:lederpragung': 'blindpragung' } },
  { product: 'trays', values: { format: 'custom', width: '320', depth: '220', height: '35', quantity: '120' } },
];
const draft = { version: 1, step: 2, items, legacyBrief: '', fields: { scenario: 'hotels', collection: 'dining', quantity: 'ca. 160 Stück', delivery: 'Frühjahr', description: 'Beispieltext: Ausstattung für Restaurant und Zimmer.', name: 'Beispiel Person', company: 'Beispiel GmbH', email: 'beispiel@example.test', phone: '' } };
const pages = [
  ['/', 'home'], ['/produkte/', 'katalog'], ['/produkte/modelle/menu-hamburg/', 'modell'], ['/produkte/speisekarten/', 'produktfamilie'],
  ['/projektplaner/', 'projektplaner'], ['/kontakt/', 'anfrage-projektbrief'], ['/materialien/', 'materialien'], ['/journal/blindpraegung-folienpraegung/', 'journalbeitrag'],
  ['/en/', 'home-en'],
];
(async () => {
  fs.mkdirSync('screenshots', { recursive: true });
  const browser = await chromium.launch();
  for (const [width, label, scale] of [[1440, 'desktop', 1], [390, 'mobil', 1]]) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: scale, reducedMotion: 'reduce' });
    await ctx.addInitScript(([i, d]) => { sessionStorage.setItem('sfp-enquiry-v9', JSON.stringify(i)); sessionStorage.setItem('sfp-contact-draft-v31', JSON.stringify(d)); }, [items, draft]);
    const page = await ctx.newPage();
    for (const [url, name] of pages) {
      await page.goto(base + url, { waitUntil: 'networkidle' });
      if (name === 'anfrage-projektbrief') await page.click('button[type=submit]');
      if (name === 'materialien') await page.fill('#studio-mark', 'SFP Berlin').catch(() => {});
      await page.evaluate(async () => {
        document.querySelectorAll('img[loading=lazy]').forEach((i) => (i.loading = 'eager'));
        for (let y = 0; y < document.body.scrollHeight; y += 700) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 50)); }
        scrollTo(0, 0);
        await Promise.all([...document.images].map((i) => (i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; setTimeout(r, 4000); }))));
      });
      await page.waitForTimeout(400);
      await page.screenshot({ path: `screenshots/${name}-${label}.jpg`, type: 'jpeg', quality: 62, fullPage: true });
    }
    if (width === 390) {
      await page.goto(base + '/', { waitUntil: 'networkidle' });
      await page.click('[data-nav-toggle]'); await page.click('[data-nav-trigger] >> nth=2'); await page.waitForTimeout(500);
      await page.screenshot({ path: 'screenshots/navigation-mobil.jpg', type: 'jpeg', quality: 62 });
    } else {
      await page.goto(base + '/', { waitUntil: 'networkidle' });
      await page.click('[data-nav-trigger] >> nth=2'); await page.waitForTimeout(800);
      await page.screenshot({ path: 'screenshots/navigation-desktop.jpg', type: 'jpeg', quality: 62 });
    }
    await ctx.close();
  }
  await browser.close();
  console.log(fs.readdirSync('screenshots').length + ' Screenshots');
})();

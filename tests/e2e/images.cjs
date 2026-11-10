/**
 * Prüft unter normalen Bedingungen (Lazy-Loading aktiv, Animationen an), ob jedes Bild im Sichtbereich
 * geladen UND sichtbar ist, während man wie ein Mensch durch die Seite scrollt.
 *   node tests/e2e/images.cjs [http://localhost:4321]   (Preview muss laufen, Playwright nötig)
 */
const { chromium } = require('playwright');
const base = process.argv[2] || 'http://localhost:4321';
const pages = ['/', '/produkte/', '/produkte/modelle/menu-hamburg/', '/produkte/speisekarten/', '/materialien/', '/prozess/', '/kollektionen/', '/projekte/', '/unternehmen/', '/journal/', '/en/'];
(async () => {
  const browser = await chromium.launch();
  let bad = 0, checked = 0, slowest = 0;
  for (const width of [1440, 390]) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await ctx.newPage();
    for (const url of pages) {
      await page.goto(base + url, { waitUntil: 'load' });
      const height = await page.evaluate(() => document.body.scrollHeight);
      for (let y = 0; y < height; y += 700) {
        await page.evaluate((v) => scrollTo(0, v), y);
        const t0 = Date.now();
        let problems = [];
        // bis zu 1,2 s Zeit geben: danach muss alles im Sichtbereich geladen und sichtbar sein
        for (let i = 0; i < 12; i++) {
          await page.waitForTimeout(100);
          problems = await page.evaluate(() => [...document.images].filter((img) => {
            const r = img.getBoundingClientRect();
            if (img.closest('.gallery__thumb') || img.classList.contains('stamp-logo-source')) return false; // bewusst gedämpft bzw. nur Maske
            if (r.bottom < 40 || r.top > innerHeight - 40 || r.right < 0 || r.left > innerWidth || !r.width || !img.offsetParent) return false;
            let alpha = 1, clipped = false;
            for (let e = img; e && e !== document.body; e = e.parentElement) {
              const cs = getComputedStyle(e);
              if (e.hidden || e.getAttribute('aria-hidden') === 'true' && cs.opacity === '0') return false; // inaktive Szene
              alpha *= Number(cs.opacity);
              const m = /inset\(([\d.]+)(px|%)? ([\d.]+)(px|%)? ([\d.]+)(px|%)?/.exec(cs.clipPath);
              if (m && parseFloat(m[5]) > 20) clipped = true;
            }
            return !(img.complete && img.naturalWidth > 0) || alpha < 0.9 || clipped;
          }).map((img) => img.getAttribute('src')));
          if (!problems.length) break;
        }
        slowest = Math.max(slowest, Date.now() - t0);
        checked++;
        if (problems.length) { bad++; console.log(`${width}px ${url} @${y}: nach 1,2 s nicht geladen/sichtbar: ${[...new Set(problems)].slice(0, 4).join(', ')}`); }
      }
    }
    await ctx.close();
  }
  await browser.close();
  console.log(`${checked} Scrollpositionen geprüft, ${bad} mit fehlenden oder unsichtbaren Bildern; längste Wartezeit ${slowest} ms.`);
  process.exit(bad ? 1 : 0);
})();

/**
 * Misst horizontalen Überlauf je Template bei 320, 390, 768 und 1440 px.
 *   node tests/e2e/overflow.cjs [http://localhost:4321]   (Preview muss laufen, Playwright nötig)
 */
const { chromium } = require('playwright');
const routes = require('../../content/routes.json');
const base = process.argv[2] || 'http://localhost:4321';
(async () => {
  // je Template und Sprache zwei Routen, plus 404
  const picked = [];
  const seen = {};
  for (const r of routes) {
    const k = r.template + r.language;
    seen[k] = (seen[k] || 0) + 1;
    if (seen[k] <= 2) picked.push(r.url);
  }
  picked.push('/404.html');
  const browser = await chromium.launch();
  let bad = 0, checked = 0;
  for (const width of [320, 390, 768, 1440]) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    for (const url of picked) {
      await page.goto(base + url, { waitUntil: 'load' });
      await page.waitForTimeout(150);
      const o = await page.evaluate(() => {
        const w = document.documentElement.clientWidth;
        const over = document.documentElement.scrollWidth - w;
        const culprits = over > 0 ? [...document.querySelectorAll('body *')].filter((e) => e.getBoundingClientRect().right > w + 1 && !e.closest('.cards--rail .cards__list')).slice(0, 3).map((e) => e.tagName + '.' + e.className) : [];
        return { over, culprits };
      });
      checked++;
      if (o.over > 0 || errors.length) { bad++; console.log(`${width}px ${url}: Überlauf ${o.over}px ${o.culprits.join(', ')} ${errors.splice(0).join(' | ')}`); }
    }
    await ctx.close();
  }
  await browser.close();
  console.log(`${checked} Ansichten geprüft (${picked.length} Routen × 4 Breiten), ${bad} mit Überlauf oder Skriptfehler.`);
  process.exit(bad ? 1 : 0);
})();

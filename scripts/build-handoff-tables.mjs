#!/usr/bin/env node
/**
 * Erzeugt ROUTE_MAP.csv und ASSET_USAGE.csv aus dem tatsächlichen Build (dist/).
 *   npm run build && node scripts/build-handoff-tables.mjs /pfad/zum/Uebergabepaket
 */
import fs from 'node:fs';
import path from 'node:path';

const SRC = process.argv[2];
const routes = JSON.parse(fs.readFileSync('content/routes.json', 'utf8'));
const csv = (rows) => '﻿' + rows.map((r) => r.map((c) => (/[",;\n]/.test(String(c)) ? `"${String(c).replace(/"/g, '""')}"` : c)).join(',')).join('\n') + '\n';

// ---------------------------------------------------------------- Routen
// Einzeln im Browser gesichtete Seiten (Desktop und/oder Mobil) – siehe STATE_CHECKLIST.md
const reviewed = new Set(['/', '/en/', '/produkte/', '/produkte/modelle/menu-hamburg/', '/projektplaner/', '/en/project-planner/', '/kontakt/', '/produkte/speisekarten/',
  '/journal/blindpraegung-folienpraegung/', '/materialien/', '/prozess/', '/kollektionen/', '/projekte/bmw-group-classic/', '/unternehmen/', '/leistungen/']);
const templateName = { home: 'home', model: 'model (ModelPage + Configurator)', family: 'family (Hero/Galerie + Blöcke)', scenario: 'scenario (Blöcke)', collection: 'collection (Blöcke)',
  project: 'project (Hero + Facts + Blöcke)', article: 'article (ProseBlock)', legal: 'legal (ProseBlock)', catalog: 'catalog (Catalog)', contact: 'contact (ContactForm)',
  planner: 'planner (Configurator)', materials: 'materials (MaterialStudio + Blöcke)', page: 'page (Blöcke)' };
const rows = [['old_url', 'new_url', 'key', 'language', 'template', 'implementation_status', 'note']];
for (const r of routes) {
  const built = fs.existsSync(path.join('dist', r.url, 'index.html'));
  rows.push([r.url, r.url, r.key, r.language, templateName[r.template], !built ? 'noch offen' : reviewed.has(r.url) ? 'umgesetzt' : 'Template vorhanden',
    !built ? 'nicht gebaut' : reviewed.has(r.url) ? 'mit echtem Inhalt gebaut und im Browser gesichtet' : 'mit echtem Inhalt gebaut; automatisch geprüft (Links, H1, Überlauf je Template), nicht einzeln gesichtet']);
}
for (const line of fs.readFileSync('public/_redirects', 'utf8').split('\n').filter((l) => l.trim())) {
  const [from, to, code] = line.trim().split(/\s+/);
  rows.push([from, to, 'alias', '', `redirect ${code}`, 'Template vorhanden', 'Regel unverändert in public/_redirects übernommen; Wirkung hängt vom Hosting ab, hier nicht geprüft']);
}
rows.push(['(404)', '/404.html', '404', 'de+en', '404', 'umgesetzt', 'zweisprachige Fehlerseite']);
fs.writeFileSync('ROUTE_MAP.csv', csv(rows));

// ---------------------------------------------------------------- Assets
const usage = new Map();
const add = (file, where) => { if (!usage.has(file)) usage.set(file, new Set()); usage.get(file).add(where); };
for (const r of routes) {
  const html = fs.readFileSync(path.join('dist', r.url, 'index.html'), 'utf8');
  for (const m of html.matchAll(/\/(assets|brand)\/[^"'\s,)]+/g)) add(m[0], r.url);
}
for (const lang of ['de', 'en']) {
  const data = fs.readFileSync(`dist/data/catalog.${lang}.json`, 'utf8');
  for (const m of data.matchAll(/\/assets\/[^"]+/g)) add(m[0], `Konfigurator (${lang})`);
}
const out = [['original_path', 'new_path', 'page_or_component', 'status']];
const summarize = (set) => { const list = [...set].sort(); return list.length > 12 ? `${list.slice(0, 12).join('; ')}; … (${list.length} Stellen)` : list.join('; '); };
let used = 0, unused = 0;
if (SRC) {
  const template = fs.readFileSync(path.join(SRC, '06_RETURN_HANDOFF/ASSET_USAGE_TEMPLATE.csv'), 'utf8').replace(/^﻿/, '').split('\n').slice(1).filter(Boolean);
  for (const line of template) {
    const original = line.split(',')[0];
    const name = original.replace('03_ASSETS/site/', '');
    const pub = `/assets/${name}`;
    const exists = fs.existsSync(path.join('public/assets', name));
    if (exists && usage.has(pub)) { out.push([original, `public/assets/${name}`, summarize(usage.get(pub)), 'übernommen, Dateiname unverändert']); used++; }
    else if (exists) { out.push([original, `public/assets/${name}`, '', 'kopiert, im Build nicht referenziert']); unused++; }
    else { out.push([original, '', '', /\.(js|css)$/.test(name) ? 'nicht übernommen: Logik/Stil neu umgesetzt (src/)' : /\.(woff2?|txt)$/.test(name) || name.startsWith('licenses') ? 'nicht übernommen: alte Schrift, ersetzt durch Old Copper' : /^(wordmark|favicon)/.test(name) ? 'nicht übernommen: altes Logo, ersetzt durch 04_BRAND' : 'nicht verwendet (nicht im Bestand referenziert oder Größenvariante)']); unused++; }
  }
}
for (const dir of ['logos', 'fonts']) for (const f of fs.readdirSync(`public/brand/${dir}`).sort()) {
  const pub = `/brand/${dir}/${f}`;
  const original = dir === 'logos' ? `04_BRAND/assets/generated/Logos/${f.match(/_(charcoal|paper|forest|copper)\.svg$/)?.[1]}/${f}` : `04_BRAND/assets/generated/assets/fonts/${f}`;
  out.push([original, `public/brand/${dir}/${f}`, usage.has(pub) || dir === 'fonts' ? (dir === 'fonts' ? 'alle Seiten (src/styles/tokens.css) bzw. Lizenztext' : summarize(new Set(['alle Seiten (Header/Footer/Favicon)']))) : '', usage.has(pub) || dir === 'fonts' ? 'übernommen, unverändert' : 'bereitgelegt, derzeit nicht eingebunden']);
}
fs.writeFileSync('ASSET_USAGE.csv', csv(out));
console.log(`ROUTE_MAP.csv: ${rows.length - 1} Zeilen · ASSET_USAGE.csv: ${out.length - 1} Zeilen (${used} übernommen, ${unused} nicht verwendet)`);

#!/usr/bin/env node
/**
 * Importiert den Inhaltsbestand aus dem Übergabepaket
 * (SFP_Claude_Design_Handoff_2026-11-10) in layoutneutrale JSON-Dateien.
 *
 *   node scripts/import-content.mjs /pfad/zu/SFP_Claude_Design_Handoff_2026-11-10
 *
 * Ergebnis:
 *   content/pages/{de,en}/{key}.json   Abschnitte je Seite (Text, Bilder, Links)
 *   content/routes.json                Alle 218 Routen mit Sprachpendant und Template
 *   content/catalog/*.json             Unveränderte Planerdaten (stabile IDs)
 *   public/assets/*                    Verwendete Originaldateien, Dateinamen unverändert
 *
 * Das Skript verändert keine Texte. Es entfernt nur das alte Layout-Markup.
 */
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'node-html-parser';

const SRC = process.argv[2] || process.env.SFP_HANDOFF;
if (!SRC || !fs.existsSync(path.join(SRC, '02_CONTENT/pages.json'))) {
  console.error('Pfad zum entpackten Übergabepaket angeben (Ordner mit 02_CONTENT).');
  process.exit(1);
}
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(ROOT, 'content');
const PUB = path.join(ROOT, 'public/assets');
const read = (p) => fs.readFileSync(path.join(SRC, p), 'utf8');
const json = (p) => JSON.parse(read(p).replace(/^﻿/, ''));

const LAYOUT_CLASSES = new Set([
  'wrap', 'section', 'identity-section', 'identity-shade', 'identity-dark-boundary',
  'complete-grid', 'complete-pairs', 'complete-rows', 'with-image',
]);
const INLINE = new Set(['a', 'em', 'strong', 'b', 'i', 'br', 'span', 'sup', 'sub', 'small', 'abbr', 'code']);
const usedAssets = new Set();

const cls = (el) => (el.getAttribute?.('class') || '').split(/\s+/).filter(Boolean);
const tag = (el) => (el.rawTagName || '').toLowerCase();
const kids = (el) => el.childNodes.filter((n) => n.nodeType === 1 && tag(n) !== 'svg');
const text = (el) => el.text.replace(/\s+/g, ' ').trim();

function asset(src) {
  if (!src) return src;
  const clean = src.split('?')[0];
  if (clean.startsWith('/assets/')) usedAssets.add(clean.slice('/assets/'.length));
  return clean;
}
function esc(s) {
  return s.replace(/&(?!#?\w+;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
/** Inline-HTML: nur a/em/strong/br bleiben erhalten, Klassen und Icons entfallen. */
function inline(el) {
  let out = '';
  for (const n of el.childNodes) {
    if (n.nodeType === 3) out += esc(n.rawText);
    else if (n.nodeType === 1) {
      const t = tag(n);
      if (t === 'svg') continue;
      if (t === 'br') out += '<br>';
      else if (t === 'a') out += `<a href="${n.getAttribute('href') || '#'}">${inline(n)}</a>`;
      else if (t === 'em' || t === 'i') out += `<em>${inline(n)}</em>`;
      else if (t === 'strong' || t === 'b') out += `<strong>${inline(n)}</strong>`;
      else out += inline(n);
    }
  }
  return out.replace(/\s+/g, ' ').trim();
}
function image(el) {
  const c = cls(el);
  return {
    src: asset(el.getAttribute('src')),
    alt: el.getAttribute('alt') || '',
    width: Number(el.getAttribute('width')) || null,
    height: Number(el.getAttribute('height')) || null,
    // context-photo = inszenierte Aufnahme/Studie, technical-photo = Produktaufnahme
    kind: c.includes('technical-photo') ? 'technical' : c.includes('material-swatch') ? 'swatch' : 'context',
  };
}
function link(el) {
  const c = cls(el);
  return {
    href: el.getAttribute('href') || '#',
    label: text(el),
    style: c.includes('btn') ? (c.includes('outline') ? 'outline' : 'button') : 'text',
  };
}
function dataAttrs(el) {
  const out = {};
  for (const [k, v] of Object.entries(el.attributes || {})) {
    if (k.startsWith('data-') && !['data-layout-count'].includes(k)) out[k.slice(5)] = v;
  }
  return Object.keys(out).length ? out : undefined;
}
const isPlainLink = (el) => !kids(el).some((k) => !INLINE.has(tag(k)));
const hasDirectHeading = (el, tags = ['h3', 'h4']) => kids(el).some((k) => tags.includes(tag(k)));

function blank() {
  return {
    title: null, body: [], media: [], actions: [], items: [], specs: [], faq: [],
    crumbs: [], tabs: [], groups: [], filter: null,
  };
}

/** Ein wiederholtes Element (Karte, Zeile, Notiz) als strukturierter Eintrag. */
function item(el) {
  const a = blank();
  const out = { role: cls(el).filter((c) => !LAYOUT_CLASSES.has(c))[0] || null };
  if (tag(el) === 'a') out.href = el.getAttribute('href');
  if (el.getAttribute('id')) out.id = el.getAttribute('id');
  const d = dataAttrs(el);
  if (d) out.data = d;
  if (el.getAttribute('hidden') !== undefined && el.getAttribute('hidden') !== null) out.hidden = true;
  walk(el, a, { inItem: true });
  if (a.title) out.title = a.title.html;
  if (a.body.length) out.body = a.body;
  if (a.media.length) out.media = a.media;
  if (a.actions.length) out.actions = a.actions;
  if (a.specs.length) out.specs = a.specs;
  if (a.items.length) out.items = a.items;
  if (a.faq.length) out.faq = a.faq;
  if (a.tabs.length) out.tabs = a.tabs;
  if (!out.href) {
    const photo = el.querySelector('a.catalog-photo, a.atlas-photo, a.project-media, a.theatre-image');
    if (photo) out.href = photo.getAttribute('href');
    else if (a.actions.length === 1 && a.actions[0].style === 'text') out.href = a.actions[0].href;
  }
  return out;
}

function walk(el, a, ctx = {}) {
  for (const c of kids(el)) {
    const t = tag(c);
    const k = cls(c);
    if (t === 'h1' || t === 'h2' || t === 'h3' || t === 'h4') {
      if (!a.title) a.title = { level: t, html: inline(c) };
      else a.body.push({ type: 'h', level: t, html: inline(c) });
    } else if (t === 'p') {
      const html = inline(c);
      if (html) a.body.push({ type: 'p', html, ...(k[0] ? { role: k[0] } : {}) });
    } else if (t === 'ul' || t === 'ol') {
      const lis = kids(c).filter((n) => tag(n) === 'li');
      if (k.includes('progress')) continue; // Formularfortschritt entsteht im neuen Formular
      if (lis.some((li) => kids(li).some((n) => !INLINE.has(tag(n))))) lis.forEach((li) => a.items.push(item(li)));
      else a.body.push({ type: t, items: lis.map(inline), ...(k[0] ? { role: k[0] } : {}) });
    } else if (t === 'dl') {
      const rows = c.querySelectorAll('dt').map((dt) => {
        let dd = dt.nextElementSibling;
        return { k: text(dt), v: dd && tag(dd) === 'dd' ? inline(dd) : '' };
      });
      a.specs.push(...rows);
    } else if (t === 'img') {
      a.media.push(image(c));
    } else if (t === 'figure') {
      const img = c.querySelector('img');
      if (img) a.media.push({ ...image(img), role: k[0] || null });
    } else if (t === 'a') {
      if (isPlainLink(c)) a.actions.push(link(c));
      else if (c.querySelector('h2,h3,h4')) a.items.push(item(c));
      else {
        // verlinktes Bild oder Logo
        const img = c.querySelector('img');
        if (img) a.media.push({ ...image(img), href: c.getAttribute('href'), role: k[0] || null });
      }
    } else if (t === 'article') {
      if (k.includes('editorial') || k.includes('legal')) a.prose = prose(c);
      else if (k.includes('company-story-article')) walk(c, a, ctx);
      else a.items.push(item(c));
    } else if (t === 'details') {
      const s = c.querySelector('summary');
      const pos = s?.querySelector('.process-position');
      const h = s?.querySelector('h3');
      const rest = kids(c).filter((n) => tag(n) !== 'summary');
      const inner = blank();
      rest.forEach((n) => (tag(n) === 'p' ? inner.body.push({ type: 'p', html: inline(n), ...(cls(n)[0] ? { role: cls(n)[0] } : {}) }) : walk(n, inner, ctx)));
      a.faq.push({
        q: h ? inline(h) : inline(s).replace(/^\d+\s*/, ''),
        ...(pos ? { no: text(pos) } : {}),
        a: inner.body,
        ...(c.getAttribute('open') !== undefined && c.getAttribute('open') !== null ? { open: true } : {}),
      });
    } else if (t === 'nav') {
      if (k.includes('breadcrumb')) a.crumbs = c.querySelectorAll('a').map(link);
      else if (k.includes('article-contents')) continue;
      else a.actions.push(...c.querySelectorAll('a').map((x) => ({ ...link(x), nav: k[0] || true })));
    } else if (t === 'button') {
      const label = text(c);
      if (label) a.tabs.push({ label, ...(dataAttrs(c) ? { data: dataAttrs(c) } : {}) });
    } else if (t === 'section') {
      const g = blank();
      walk(c, g, ctx);
      a.groups.push({ id: c.getAttribute('id') || null, kind: kindOf(c), ...compact(g) });
    } else if (t === 'form' && k.includes('menu-filter-form')) {
      a.filter = {
        label: c.getAttribute('aria-label') || '',
        fields: c.querySelectorAll('select').map((sel) => ({
          name: sel.getAttribute('name'),
          label: text(c.querySelector(`label[for="${sel.getAttribute('id')}"]`)),
          options: sel.querySelectorAll('option').map((o) => ({ value: o.getAttribute('value') || '', label: text(o) })),
        })),
        reset: text(c.querySelector('button[type=reset]')),
      };
    } else if (t === 'form' || t === 'noscript' || t === 'canvas' || t === 'datalist' || t === 'select' || t === 'input' || t === 'label' || t === 'textarea') {
      continue; // Formulare werden im neuen Frontend neu aufgebaut (Texte in src/i18n)
    } else if (t === 'blockquote') {
      a.body.push({ type: 'quote', html: inline(c) });
    } else if (t === 'table') {
      a.body.push({ type: 'table', rows: c.querySelectorAll('tr').map((tr) => tr.querySelectorAll('th,td').map(inline)) });
    } else if (t === 'div' || t === 'header' || t === 'aside' || t === 'span' || t === 'li') {
      if (k.includes('menu-filter-empty')) continue; // Leerzustand kommt aus src/i18n
      const direct = kids(c);
      if (!direct.length) {
        const html = inline(c);
        if (html && t !== 'span') a.body.push({ type: 'p', html, ...(k[0] ? { role: k[0] } : {}) });
        else if (html && t === 'span' && ctx.inItem && !k.includes('round-action') && !k.includes('textlink')) a.body.push({ type: 'p', html, role: k[0] || 'label' });
        continue;
      }
      // Ein Container mit eigener Zwischenüberschrift ist ein Eintrag (Notiz, Karte, Szene).
      const repeated = ['signature-scene', 'studio-scene', 'gallery-slide'].some((x) => k.includes(x));
      if ((hasDirectHeading(c) && a.title) || repeated || c.getAttribute('data-palette-description') != null) a.items.push(item(c));
      else if (direct.every((n) => INLINE.has(tag(n))) && !c.querySelector('a.textlink, a.btn, img')) {
        const html = inline(c);
        if (html) a.body.push({ type: 'p', html, ...(k[0] ? { role: k[0] } : {}) });
      } else walk(c, a, ctx);
    }
  }
}

/** Langtext (Journal, Rechtstexte): Kapitel mit Fließtext. */
function prose(el) {
  const chapters = [];
  let cur = null;
  const push = (b) => {
    if (!cur) { cur = { id: null, title: null, blocks: [] }; chapters.push(cur); }
    cur.blocks.push(b);
  };
  const out = { chapters, summary: null, nav: [] };
  const eat = (node) => {
    for (const c of kids(node)) {
      const t = tag(c), k = cls(c);
      if (t === 'nav') continue;
      if (t === 'a') { push({ type: 'links', links: [link(c)] }); continue; }
      if (t === 'section') { cur = { id: c.getAttribute('id') || null, title: null, blocks: [] }; chapters.push(cur); eat(c); cur = null; continue; }
      if (k.includes('article-summary')) { out.summary = inline(c); continue; }
      if (k.includes('article-nav')) { out.nav = c.querySelectorAll('a').map(link); continue; }
      if (t === 'h2') {
        if (cur && !cur.title && !cur.blocks.length) cur.title = inline(c);
        else { cur = { id: c.getAttribute('id') || null, title: inline(c), blocks: [] }; chapters.push(cur); }
      } else if (t === 'h3' || t === 'h4') push({ type: 'h', level: t, html: inline(c) });
      else if (t === 'strong') push({ type: 'h', level: 'h4', html: inline(c) });
      else if (t === 'p') { const h = inline(c); if (h) push({ type: 'p', html: h }); }
      else if (t === 'ul' || t === 'ol') push({ type: t, items: kids(c).map(inline) });
      else if (t === 'blockquote') push({ type: 'quote', html: inline(c) });
      else if (t === 'img') push({ type: 'img', ...image(c) });
      else if (t === 'figure') { const i = c.querySelector('img'); if (i) push({ type: 'img', ...image(i) }); }
      else if (t === 'details') { const s = c.querySelector('summary'); push({ type: 'faq', q: inline(s), a: kids(c).filter((n) => tag(n) !== 'summary').map(inline).join(' ') }); }
      else if (t === 'table') push({ type: 'table', rows: c.querySelectorAll('tr').map((tr) => tr.querySelectorAll('th,td').map(inline)) });
      else if (t === 'div' || t === 'aside' || t === 'header') {
        if (kids(c).length) eat(c); else { const h = inline(c); if (h) push({ type: 'p', html: h, ...(k[0] ? { role: k[0] } : {}) }); }
      }
    }
  };
  eat(el);
  return out;
}

function kindOf(el) {
  const k = cls(el).filter((c) => !LAYOUT_CLASSES.has(c));
  return k[0] || (tag(el) === 'dl' ? 'facts' : 'generic');
}
function compact(a) {
  const out = {};
  for (const [k, v] of Object.entries(a)) {
    if (v === null || (Array.isArray(v) && !v.length)) continue;
    out[k] = v;
  }
  return out;
}

function templateOf(key) {
  if (key === 'home') return 'home';
  if (key.startsWith('item:')) return 'model';
  if (key.startsWith('product:')) return 'family';
  if (key.startsWith('scenario:')) return 'scenario';
  if (key.startsWith('collection:')) return 'collection';
  if (key.startsWith('case:')) return 'project';
  if (key.startsWith('article:')) return 'article';
  if (['catalog', 'contact', 'planner', 'materials'].includes(key)) return key;
  if (['legal', 'privacy'].includes(key)) return 'legal';
  return 'page';
}

// ---------------------------------------------------------------- Seiten
const pages = json('02_CONTENT/pages.json');
const byKey = {};
for (const p of pages) (byKey[p.key] ||= {})[p.language] = p.url;

fs.rmSync(path.join(OUT, 'pages'), { recursive: true, force: true });
const routes = [];
for (const p of pages) {
  const root = parse(read(p.html));
  const main = root.querySelector('main') || root;
  const sections = [];
  for (const el of kids(main)) {
    const a = blank();
    const t = tag(el);
    if (t === 'noscript') continue;
    if (t === 'dl') {
      el.querySelectorAll('dt').forEach((dt) => a.specs.push({ k: text(dt), v: inline(dt.nextElementSibling) }));
    } else walk(el, a);
    const section = {
      kind: kindOf(el),
      ...(el.getAttribute('id') ? { id: el.getAttribute('id') } : {}),
      ...(cls(el).includes('identity-shade') ? { shade: true } : {}),
      ...(dataAttrs(el) ? { data: dataAttrs(el) } : {}),
      ...compact(a),
    };
    if (Object.keys(section).length > 1) sections.push(section);
  }
  const page = {
    language: p.language,
    key: p.key,
    slug: p.key.replace(':', '--'),
    url: p.url,
    template: templateOf(p.key),
    title: p.title,
    description: p.description,
    alternate: byKey[p.key],
    datasets: p.datasets?.length ? p.datasets : undefined,
    sections,
  };
  const file = path.join(OUT, 'pages', p.language, p.key.replace(':', '--') + '.json');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(page, null, 1) + '\n');
  routes.push({ language: p.language, key: p.key, slug: p.key.replace(':', '--'), url: p.url, template: page.template, title: p.title, alternate: byKey[p.key] });
}
fs.writeFileSync(path.join(OUT, 'routes.json'), JSON.stringify(routes, null, 1) + '\n');

// ---------------------------------------------------------------- Katalogdaten
fs.mkdirSync(path.join(OUT, 'catalog'), { recursive: true });
for (const lang of ['de', 'en']) {
  const raw = read(`02_CONTENT/data/planner-catalog.${lang}.json`);
  fs.writeFileSync(path.join(OUT, 'catalog', `planner-catalog.${lang}.json`), raw);
  JSON.stringify(JSON.parse(raw), (k, v) => (typeof v === 'string' && v.startsWith('/assets/') ? asset(v) : v));
}
fs.copyFileSync(path.join(SRC, '02_CONTENT/current-redirects.txt'), path.join(OUT, 'redirects.reference.txt'));
fs.copyFileSync(path.join(SRC, '02_CONTENT/navigation-and-footer.json'), path.join(OUT, 'navigation-and-footer.reference.json'));

// ---------------------------------------------------------------- Navigation / Footer
function mdLinks(s) {
  return [...s.matchAll(/(?<!!)\[([^\]]+)\]\(([^)]+)\)/g)].map((m) => ({ label: m[1], href: m[2] }));
}
function mdImage(s) {
  const m = s.match(/!\[([^\]]*)\]\(([^)]+)\)/);
  return m ? { alt: m[1], src: asset(m[2]) } : null;
}
const navRef = json('02_CONTENT/navigation-and-footer.json');
fs.mkdirSync(path.join(OUT, 'site'), { recursive: true });
for (const lang of ['de', 'en']) {
  const blocks = navRef[lang].header.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  const groups = [];
  for (let i = 0; i < blocks.length; i++) {
    if (blocks[i].startsWith('## ')) {
      const g = { label: blocks[i - 1], title: blocks[i].slice(3), tagline: blocks[i + 1], links: mdLinks(blocks[i + 2]), image: null };
      const img = blocks[i + 3] && mdImage(blocks[i + 3]);
      if (img) g.image = img;
      groups.push(g);
    }
  }
  const tail = blocks.slice(-4).join('\n');
  const cta = mdLinks(tail).find((l) => !['DE', 'EN'].includes(l.label));
  const f = navRef[lang].footer.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  const columns = [];
  f.forEach((b, i) => { if (b.startsWith('### ')) columns.push({ title: b.slice(4), links: mdLinks(f[i + 1]) }); });
  const copyIdx = f.findIndex((b) => b.startsWith('©'));
  const firstCol = f.findIndex((b) => b.startsWith('### '));
  const intro = f.slice(2, firstCol).map((b) => b.replace(/\s*\n\s*/g, ' ').replace(/ {2,}/g, ' '));
  const addressIdx = f.findIndex((b) => /\d{5}/.test(b) && !b.startsWith('['));
  const nav = {
    home: lang === 'de' ? '/' : '/en/',
    groups,
    cta,
    menuLabel: blocks[blocks.length - 1],
    footer: {
      claim: intro[0], origin: intro[1], scope: intro[2],
      columns,
      address: f[addressIdx].split(/\s*\n\s*/).map((x) => x.trim()),
      copyright: f[copyIdx],
      legal: mdLinks(f[copyIdx + 1]),
    },
  };
  fs.writeFileSync(path.join(OUT, 'site', `navigation.${lang}.json`), JSON.stringify(nav, null, 1) + '\n');
}

// ---------------------------------------------------------------- Brand (Old Copper 1.2)
const BRAND = path.join(ROOT, 'public/brand');
fs.mkdirSync(path.join(BRAND, 'fonts'), { recursive: true });
fs.mkdirSync(path.join(BRAND, 'logos'), { recursive: true });
for (const f of ['Montserrat.woff2', 'Montserrat-OFL.txt', 'Newsreader.woff2', 'Newsreader-OFL.txt'])
  fs.copyFileSync(path.join(SRC, '04_BRAND/assets/generated/assets/fonts', f), path.join(BRAND, 'fonts', f));
for (const colour of ['charcoal', 'paper', 'forest', 'copper']) {
  const dir = path.join(SRC, '04_BRAND/assets/generated/Logos', colour);
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.svg'))) fs.copyFileSync(path.join(dir, f), path.join(BRAND, 'logos', f));
}
for (const f of ['SFP_Design_Tokens.css', 'SFP_Farben.json', 'SFP_Logo_Masse.json', 'SFP_CD_Master_Guide.md'])
  fs.copyFileSync(path.join(SRC, '04_BRAND/assets/generated', f), path.join(ROOT, 'docs/brand-reference', f));
fs.copyFileSync(path.join(SRC, '05_REFERENCE_SOURCE/public/_redirects'), path.join(ROOT, 'public/_redirects'));

// ---------------------------------------------------------------- Assets
fs.mkdirSync(PUB, { recursive: true });
let copied = 0;
const missing = [];
for (const name of [...usedAssets].sort()) {
  // Altes Logo und die Vorlage der früheren Wildleder-Interaktion werden nicht übernommen.
  if (/^(wordmark|v19-suede)/.test(name)) continue;
  const from = path.join(SRC, '03_ASSETS/site', name);
  if (!fs.existsSync(from)) { missing.push(name); continue; }
  fs.copyFileSync(from, path.join(PUB, name));
  copied++;
  // 640er-Variante für srcset mitnehmen, wenn vorhanden
  const m = name.match(/^(.*)\.(webp|jpg|png)$/);
  if (m) {
    const small = `${m[1]}-640.${m[2]}`;
    if (fs.existsSync(path.join(SRC, '03_ASSETS/site', small))) { fs.copyFileSync(path.join(SRC, '03_ASSETS/site', small), path.join(PUB, small)); copied++; }
  }
}
fs.writeFileSync(path.join(OUT, 'assets-used.json'), JSON.stringify([...usedAssets].sort(), null, 1) + '\n');
console.log(`${routes.length} Seiten, ${copied} Assetdateien kopiert, fehlend: ${missing.length ? missing.join(', ') : 'keine'}`);

#!/usr/bin/env node
/**
 * Prüft den statischen Build: alle 218 Routen vorhanden, lokale Links, Anker,
 * Bilder und Skripte auflösbar, je Seite genau eine H1, Sprache und hreflang gesetzt.
 *   npm run build && npm run check:dist
 */
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'node-html-parser';

const dist = path.resolve('dist');
const routes = JSON.parse(fs.readFileSync('content/routes.json', 'utf8'));
const redirects = fs.existsSync('public/_redirects')
  ? fs.readFileSync('public/_redirects', 'utf8').split('\n').map((l) => l.trim().split(/\s+/)[0]).filter(Boolean)
  : [];
const problems = [];
const fileFor = (url) => path.join(dist, decodeURI(url.split(/[?#]/)[0]), url.split(/[?#]/)[0].endsWith('/') ? 'index.html' : '');
const cache = new Map();
const load = (file) => cache.get(file) ?? (cache.set(file, parse(fs.readFileSync(file, 'utf8'))), cache.get(file));
let links = 0, images = 0;

for (const r of routes) {
  const file = fileFor(r.url);
  if (!fs.existsSync(file)) { problems.push(`fehlt: ${r.url}`); continue; }
  const doc = load(file);
  const html = doc.querySelector('html');
  if (html.getAttribute('lang') !== r.language) problems.push(`lang: ${r.url}`);
  if (doc.querySelectorAll('h1').length !== 1) problems.push(`H1-Anzahl ${doc.querySelectorAll('h1').length}: ${r.url}`);
  if (!doc.querySelector('title')?.text.trim()) problems.push(`title: ${r.url}`);
  const other = r.language === 'de' ? 'en' : 'de';
  if (doc.querySelector(`link[hreflang="${other}"]`)?.getAttribute('href') !== r.alternate[other]) problems.push(`hreflang: ${r.url}`);
  for (const img of doc.querySelectorAll('img')) {
    images++;
    if (img.getAttribute('alt') === undefined) problems.push(`alt fehlt: ${r.url} ${img.getAttribute('src')}`);
    const sources = [img.getAttribute('src'), ...(img.getAttribute('srcset') || '').split(',').map((s) => s.trim().split(' ')[0])].filter(Boolean);
    for (const src of sources) if (src.startsWith('/') && !fs.existsSync(path.join(dist, src))) problems.push(`Bild fehlt: ${r.url} ${src}`);
  }
  for (const el of doc.querySelectorAll('script[src], link[rel=stylesheet], link[rel=preload], link[rel=icon]')) {
    const src = el.getAttribute('src') || el.getAttribute('href');
    if (src?.startsWith('/') && !fs.existsSync(path.join(dist, src))) problems.push(`Datei fehlt: ${r.url} ${src}`);
  }
  for (const a of doc.querySelectorAll('a[href]')) {
    const href = a.getAttribute('href');
    if (/^(mailto:|tel:|https?:)/.test(href)) continue;
    links++;
    const [target, hash] = href.split('#');
    const targetPath = target.split('?')[0];
    const targetFile = targetPath ? fileFor(targetPath) : file;
    if (!fs.existsSync(targetFile)) {
      if (!redirects.includes(targetPath)) problems.push(`Link: ${r.url} → ${href}`);
      continue;
    }
    if (hash && !/^(selection|topic|collection|quantity)/.test(hash) && !load(targetFile).querySelector(`[id="${hash}"]`)) problems.push(`Anker: ${r.url} → ${href}`);
  }
}
for (const f of ['404.html', 'data/catalog.de.json', 'data/catalog.en.json', '_redirects'])
  if (!fs.existsSync(path.join(dist, f))) problems.push(`fehlt: ${f}`);

console.log(`${routes.length} Routen, ${links} lokale Links, ${images} Bilder geprüft.`);
if (problems.length) {
  console.error(`${problems.length} Probleme:`);
  for (const p of problems.slice(0, 60)) console.error('  ' + p);
  process.exit(1);
}
console.log('Keine Probleme gefunden.');

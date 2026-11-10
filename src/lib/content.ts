import fs from 'node:fs';
import path from 'node:path';
import type { Lang, Page, Product, Route } from './types';
import routesJson from '../../content/routes.json';
import navDe from '../../content/site/navigation.de.json';
import navEn from '../../content/site/navigation.en.json';
import catalogDe from '../../content/catalog/planner-catalog.de.json';
import catalogEn from '../../content/catalog/planner-catalog.en.json';

export const routes = routesJson as Route[];
export const navigation = { de: navDe, en: navEn };
export type Navigation = typeof navDe;

const pageFiles = import.meta.glob<{ default: Page }>('../../content/pages/*/*.json', { eager: true });
export function loadPage(lang: Lang, slug: string): Page {
  const hit = Object.entries(pageFiles).find(([file]) => file.endsWith(`/${lang}/${slug}.json`));
  if (!hit) throw new Error(`Seite fehlt: ${lang}/${slug}`);
  return hit[1].default;
}

/** Katalog für den Browser: stabile IDs unverändert, Herkunftsangaben der Farbkarten entfallen. */
export function catalog(lang: Lang): Product[] {
  const raw = (lang === 'en' ? catalogEn : catalogDe) as any[];
  return raw.map((p) => ({
    ...p,
    materials: p.materials.map((m: any) => ({
      id: m.id, name: m.name, kind: m.kind, image: m.image, note: m.note, availability: m.availability,
      colours: (m.colours || []).map((c: any) => ({ id: c.id, name: c.name, code: c.code, availability: c.availability })),
    })),
  }));
}
export const product = (lang: Lang, id: string) => catalog(lang).find((p) => p.id === id);

export const strip = (html = '') => html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
/** Überschriften: Verlinkungen entfernen, <br>/<em> behalten. */
export const heading = (html = '') => html.replace(/<\/?a[^>]*>/g, '');

const assetDir = path.resolve('public/assets');
/** Liefert srcset, wenn die 640-px-Variante der Originaldatei vorhanden ist. */
export function srcset(src: string, width: number | null): string | undefined {
  const m = src.match(/^\/assets\/(.*)\.(webp|jpg|png)$/);
  if (!m || !width || width <= 640) return undefined;
  const small = `${m[1]}-640.${m[2]}`;
  return fs.existsSync(path.join(assetDir, small)) ? `/assets/${small} 640w, ${src} ${width}w` : undefined;
}

/** Kleinste vorhandene Variante einer Datei (für Vorschaubilder). */
export function thumb(src: string): string {
  const m = src.match(/^\/assets\/(.*)\.(webp|jpg|png)$/);
  if (!m) return src;
  const small = `${m[1]}-640.${m[2]}`;
  return fs.existsSync(path.join(assetDir, small)) ? `/assets/${small}` : src;
}
export const pad = (n: number) => String(n).padStart(2, '0');

/**
 * DOM-unabhängige Regeln für Artikelauswahl und Projektbrief.
 * Port von 03_ASSETS/site/enquiry-model.js (Sites v31). Schlüssel, IDs und
 * Speicherformat sind unverändert, damit bestehende Entwürfe lesbar bleiben.
 */
import type { CatalogOption, Lang, Product } from './types';

export const ITEM_KEY = 'sfp-enquiry-v9';
export const TRANSFER_KEY = 'sfp-enquiry-transfer-v9';
export const DRAFT_KEY = 'sfp-contact-draft-v31';
export const MAX_ITEMS = 100;

export const FIXED = [
  'format', 'quantity', 'width', 'depth', 'height', 'dimension-note',
  'material', 'colour', 'stitch', 'stitch-colour', 'notes',
] as const;
export type FixedKey = (typeof FIXED)[number];
export const DIMENSION_KEYS = ['width', 'depth', 'height', 'dimension-note'] as const;

export type Values = Record<string, string | string[]>;
export interface Selection { product: string; values: Values }

const t = (lang: Lang, de: string, en: string) => (lang === 'en' ? en : de);

export function fieldLabels(lang: Lang): Record<FixedKey, string> {
  return {
    format: t(lang, 'Format', 'Format'),
    quantity: t(lang, 'Stückzahl', 'Quantity'),
    width: t(lang, 'Breite (mm)', 'Width (mm)'),
    depth: t(lang, 'Tiefe / Länge (mm)', 'Depth / length (mm)'),
    height: t(lang, 'Höhe (mm)', 'Height (mm)'),
    'dimension-note': t(lang, 'Maße / Form', 'Dimensions / shape'),
    material: t(lang, 'Material', 'Material'),
    colour: t(lang, 'Farbe', 'Colour'),
    stitch: t(lang, 'Naht', 'Stitching'),
    'stitch-colour': t(lang, 'Garnfarbe', 'Thread colour'),
    notes: t(lang, 'Weitere Wünsche', 'Additional requirements'),
  };
}
export function stitchLabels(lang: Lang): Record<string, string> {
  return {
    undecided: t(lang, 'Nicht entschieden', 'Not yet decided'),
    none: t(lang, 'Keine Naht', 'No stitching'),
    tonal: t(lang, 'Naht ton-in-ton', 'Tone-on-tone stitching'),
    contrast: t(lang, 'Kontrastnaht', 'Contrast stitching'),
    specific: t(lang, 'Naht in spezieller Farbe', 'Stitching in a specific colour'),
  };
}
export const customFormatLabel = (lang: Lang) => t(lang, 'Maße nach Wunsch', 'Custom dimensions');

/** Eine Option mit `when` gilt nur bei passender übergeordneter Auswahl. */
export function applicable(option: CatalogOption, values: Values): boolean {
  return !option.when || option.when.values.includes(values['option:' + option.when.option] as string);
}

/** Frühere Produkt-IDs (v8) auf die stabilen IDs abbilden. */
export function canonicalProductId(id: string): string {
  return id === 'bottle-coaster-office' ? 'coaster' : id.replace(/-office$/, '');
}

/**
 * Bereinigt gespeicherte oder übertragene Auswahlen:
 * unbekannte Artikel entfallen, Sondermaße erzwingen `format = custom`,
 * nicht mehr anwendbare abhängige Optionen und Nahtangaben werden entfernt.
 */
export function normalizeItems(saved: unknown, products: Product[]): Selection[] {
  if (!Array.isArray(saved)) return [];
  return saved.slice(0, MAX_ITEMS).flatMap((item: any) => {
    if (!item || typeof item.product !== 'string' || !item.values || Array.isArray(item.values) || typeof item.values !== 'object') return [];
    const id = canonicalProductId(item.product);
    const product = products.find((p) => p.id === id);
    if (!product) return [];
    const values: Values = {};
    for (const key of FIXED) {
      const value = item.values[key];
      if (typeof value === 'string' || typeof value === 'number') values[key] = String(value).slice(0, 2000);
    }
    if (DIMENSION_KEYS.some((key) => values[key])) values.format = 'custom';
    if (values.format && values.format !== 'custom' && !product.formats.some((f) => f.id === values.format)) {
      const legacy = product.legacyFormats?.find((f) => f.id === values.format);
      const exact = legacy && product.formats.find((f) => f.label === legacy.label);
      if (exact) values.format = exact.id;
      // Mehrdeutige ältere Auswahl bleibt unter ursprünglicher ID und Bezeichnung erhalten.
    }
    for (const option of product.options) {
      const value = item.values['option:' + option.id];
      if (Array.isArray(value)) values['option:' + option.id] = value.filter((v: unknown) => typeof v === 'string').slice(0, 100);
      else if (typeof value === 'string') values['option:' + option.id] = value.slice(0, 2000);
    }
    for (const option of product.options) if (!applicable(option, values)) delete values['option:' + option.id];
    if (!product.stitching) { delete values.stitch; delete values['stitch-colour']; }
    if (!['contrast', 'specific'].includes(values.stitch as string)) delete values['stitch-colour'];
    return [{ product: id, values }];
  });
}

/**
 * Regeln während der Bearbeitung: eine normale Formatauswahl entfernt alte
 * Sondermaßwerte; leere Werte werden nicht gespeichert.
 */
export function cleanValues(product: Product, input: Values): Values {
  const values: Values = {};
  for (const [key, value] of Object.entries(input)) {
    if (Array.isArray(value)) { if (value.length) values[key] = value; }
    else if (typeof value === 'string' && value.trim()) values[key] = value.trim();
  }
  if (values.format !== 'custom') for (const key of DIMENSION_KEYS) delete values[key];
  if (values.stitch === 'undecided' && !product.stitching) delete values.stitch;
  return normalizeItems([{ product: product.id, values }], [product])[0]?.values ?? {};
}

/** Zeilen einer Ausführung als [Bezeichnung, Wert] in der aktuellen Sprache. */
export function rows(item: Selection, products: Product[], lang: Lang): [string, string][] {
  const clean = normalizeItems([item], products)[0];
  if (!clean) return [];
  const product = products.find((p) => p.id === clean.product)!;
  const labels = fieldLabels(lang);
  const stitches = stitchLabels(lang);
  const output: [string, string][] = [];
  for (const key of FIXED) {
    const value = clean.values[key] as string | undefined;
    if (!value || (key === 'stitch' && value === 'undecided')) continue;
    let label = value;
    if (key === 'format')
      label = value === 'custom'
        ? customFormatLabel(lang)
        : [...product.formats, ...(product.legacyFormats || [])].find((f) => f.id === value)?.label || value;
    if (key === 'material') label = product.materials.find((m) => m.id === value)?.name || value;
    if (key === 'stitch') label = stitches[value] || value;
    output.push([labels[key], String(label)]);
  }
  for (const option of product.options) {
    const value = clean.values['option:' + option.id];
    if (!value || (Array.isArray(value) && !value.length)) continue;
    output.push([
      option.label,
      (Array.isArray(value) ? value : [value]).map((v) => option.values.find((x) => x.id === v)?.label || v).join(', '),
    ]);
  }
  return output;
}

/** Textfassung der Artikelauswahl für den Projektbrief. */
export function brief(items: unknown, products: Product[], lang: Lang): string {
  const clean = normalizeItems(items, products);
  if (!clean.length) return '';
  const lines = [t(lang, 'Meine Produktauswahl', 'My selected accessories'), ''];
  clean.forEach((item, index) =>
    lines.push(
      `${index + 1}. ${products.find((p) => p.id === item.product)!.name}`,
      ...rows(item, products, lang).map(([label, value]) => `${label}: ${value}`),
      '',
    ),
  );
  return lines.join('\n');
}

export interface DraftFields {
  scenario?: string; collection?: string; quantity?: string; delivery?: string; description?: string;
  name?: string; company?: string; email?: string; phone?: string;
}
export const DRAFT_FIELDS = ['scenario', 'collection', 'quantity', 'delivery', 'description', 'name', 'company', 'email', 'phone'] as const;
export interface DraftState { version: 1; fields: DraftFields; items: Selection[]; legacyBrief: string; step: number; transferId?: string | null }

export function emptyDraft(): DraftState {
  return { version: 1, fields: {}, items: [], legacyBrief: '', step: 0 };
}
/** Liest einen gespeicherten Entwurf tolerant ein (auch ältere oder beschädigte Stände). */
export function restoreDraft(saved: any, products: Product[]): DraftState {
  const state: DraftState = saved?.version === 1 && saved.fields && typeof saved.fields === 'object' ? { ...emptyDraft(), ...saved } : emptyDraft();
  state.items = normalizeItems(state.items, products);
  state.legacyBrief = typeof state.legacyBrief === 'string' ? state.legacyBrief : '';
  state.step = Number.isInteger(state.step) ? state.step : 0;
  return state;
}
/** Übernimmt eine Auswahl aus dem Projektplaner genau einmal je Transfer-ID. */
export function applyTransfer(state: DraftState, transfer: any, products: Product[], storedItems: unknown): DraftState {
  if (!transfer || typeof transfer !== 'object') return state;
  const transferId = transfer.id || JSON.stringify(transfer);
  if (state.transferId === transferId) return state;
  if (Array.isArray(transfer.items)) {
    state.items = normalizeItems(transfer.items, products);
    state.legacyBrief = '';
  } else if (typeof transfer.brief === 'string') {
    const oldItems = normalizeItems(storedItems, products);
    state.items = oldItems.length === transfer.count ? oldItems : [];
    state.legacyBrief = state.items.length ? '' : transfer.brief;
  }
  state.transferId = transferId;
  return state;
}

export interface SummaryInput {
  lang: Lang; fields: DraftFields; scenarioLabel: string; collectionLabel: string; productBrief: string;
}
/** Vollständiger Projektbrief als Klartext (E-Mail-Entwurf, Kopie, Download). */
export function summary({ lang, fields: f, scenarioLabel, collectionLabel, productBrief }: SummaryInput): string {
  return [
    t(lang, 'SFP Projektanfrage', 'SFP project enquiry'),
    '',
    t(lang, 'Projektart: ', 'Project type: ') + (scenarioLabel || '—'),
    t(lang, 'Kollektion: ', 'Collection: ') + (collectionLabel || '—'),
    t(lang, 'Menge: ', 'Quantity: ') + (f.quantity || '—'),
    t(lang, 'Wunschlieferung: ', 'Required delivery: ') + (f.delivery || '—'),
    t(lang, 'Projekt: ', 'Project: ') + (f.description || '—'),
    '',
    productBrief,
    '',
    t(lang, 'Name: ', 'Name: ') + (f.name || ''),
    t(lang, 'Firma: ', 'Company: ') + (f.company || '—'),
    t(lang, 'E-Mail: ', 'Email: ') + (f.email || ''),
    t(lang, 'Telefon: ', 'Phone: ') + (f.phone || '—'),
  ].join('\n');
}

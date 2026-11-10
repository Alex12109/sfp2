/**
 * Regeln der Artikelauswahl gegen die echten Katalogdaten (beide Sprachen).
 * Entspricht den Regressionsgruppen des Bestands (tests/regression.cjs, Sites v31).
 */
import { describe, expect, it } from 'vitest';
import de from '../content/catalog/planner-catalog.de.json';
import en from '../content/catalog/planner-catalog.en.json';
import * as M from '../src/lib/enquiry-model';
import type { Lang, Product } from '../src/lib/types';

const catalogs: Record<Lang, Product[]> = { de: de as Product[], en: en as Product[] };

describe('Katalogdaten', () => {
  it('enthält 45 Modelle mit identischen IDs, Format- und Optionsschlüsseln in beiden Sprachen', () => {
    expect(catalogs.de).toHaveLength(45);
    const keys = (list: Product[]) => list.map((p) => [p.id, p.formats.map((f) => f.id), p.materials.map((m) => m.id), p.options.map((o) => [o.id, o.values.map((v) => v.id), o.when])]);
    expect(keys(catalogs.en)).toEqual(keys(catalogs.de));
    expect(catalogs.de.filter((p) => p.id.startsWith('menu-'))).toHaveLength(13);
  });
});

for (const lang of ['de', 'en'] as Lang[]) {
  const products = catalogs[lang];
  const find = (id: string) => products.find((p) => p.id === id)!;

  describe(`Auswahlregeln (${lang})`, () => {
    it('jedes Format jedes Artikels übersteht Bereinigen und Normalisieren', () => {
      for (const p of products)
        for (const f of p.formats) {
          const values = M.cleanValues(p, { format: f.id });
          expect(values.format, p.id).toBe(f.id);
          expect(M.normalizeItems([{ product: p.id, values }], products)[0].values.format).toBe(f.id);
        }
    });

    it('ältere gruppierte Formate bleiben ausdrücklich, eindeutige wandern auf die neue ID', () => {
      const normalized = M.normalizeItems(
        [
          { product: 'menu-clipboard', values: { format: 'format-0' } },
          { product: 'menu-hamburg', values: { format: 'format-1' } },
          { product: 'menu-passepartout', values: { format: 'format-0' } },
        ],
        products,
      );
      expect(normalized[0].values.format).toBe('format-0');
      expect(M.brief(normalized, products, lang)).toMatch(/DIN A3, DIN A4/);
      expect(normalized[1].values.format).toBe('a5');
      expect(normalized[2].values.format).toBe('a3');
    });

    it('abhängige Optionen gelten nur bei passender übergeordneter Auswahl', () => {
      let checked = 0;
      for (const p of products)
        for (const spec of p.options.filter((o) => o.when)) {
          const parent = 'option:' + spec.when!.option;
          const own = 'option:' + spec.id;
          expect(M.cleanValues(p, { [parent]: spec.when!.values[0], [own]: 'Review colour' })[own]).toBe('Review colour');
          expect(M.cleanValues(p, { [parent]: '', [own]: 'STALE' })[own]).toBeUndefined();
          expect(M.brief([{ product: p.id, values: { [parent]: '', [own]: 'STALE' } }], products, lang)).not.toContain('STALE');
          checked++;
        }
      expect(checked).toBe(59);
    });

    it('eine normale Formatauswahl entfernt alte Sondermaßwerte', () => {
      const p = find('menu-hamburg');
      const custom = M.cleanValues(p, { format: 'custom', width: '210', 'dimension-note': 'Ø 120' });
      expect(custom).toMatchObject({ format: 'custom', width: '210', 'dimension-note': 'Ø 120' });
      expect(M.cleanValues(p, { format: 'a5', width: '210', depth: '10', height: '3', 'dimension-note': 'x' })).toEqual({ format: 'a5' });
      // Gespeicherte Maße ohne Format gelten als Sondermaß
      expect(M.normalizeItems([{ product: p.id, values: { width: '200' } }], products)[0].values.format).toBe('custom');
    });

    it('Nahtangaben: Garnfarbe nur bei Kontrast-/Sondernaht, keine Naht bei Artikeln ohne Naht', () => {
      const withStitch = products.find((p) => p.stitching)!;
      expect(M.cleanValues(withStitch, { stitch: 'tonal', 'stitch-colour': 'Rot' })).toEqual({ stitch: 'tonal' });
      expect(M.cleanValues(withStitch, { stitch: 'none', 'stitch-colour': 'Rot' })).toEqual({ stitch: 'none' });
      expect(M.cleanValues(withStitch, { stitch: 'contrast', 'stitch-colour': 'Rot' })).toEqual({ stitch: 'contrast', 'stitch-colour': 'Rot' });
      const without = products.find((p) => !p.stitching);
      if (without) expect(M.cleanValues(without, { stitch: 'tonal', 'stitch-colour': 'Rot' })).toEqual({});
      const labels = M.stitchLabels(lang);
      expect(new Set(Object.values(labels)).size).toBe(5); // „Keine Naht“ und „ton-in-ton“ bleiben getrennt
    });

    it('frühere Produkt-IDs, unbekannte Artikel und beschädigte Daten bleiben unschädlich', () => {
      expect(M.normalizeItems([{ product: 'bottle-coaster-office', values: {} }], products)[0].product).toBe('coaster');
      expect(M.normalizeItems([{ product: 'trays-office', values: {} }], products)[0].product).toBe('trays');
      expect(M.normalizeItems([{ product: 'gibt-es-nicht', values: {} }, null, 'x', { product: 'trays' }, { product: 'trays', values: [] }], products)).toEqual([]);
      expect(M.normalizeItems('kaputt', products)).toEqual([]);
      expect(M.normalizeItems(Array.from({ length: 150 }, () => ({ product: 'trays', values: {} })), products)).toHaveLength(100);
    });

    it('Mehrfachauswahl und Brieftext in der jeweiligen Sprache', () => {
      const item = { product: 'menu-vintage', values: { 'option:holzoberflache': ['gebeizt', 'lackiert'], quantity: '12' } };
      const text = M.brief([item], products, lang);
      expect(text).toContain(find('menu-vintage').name);
      expect(text).toMatch(lang === 'de' ? /Stückzahl: 12/ : /Quantity: 12/);
      expect(text).toMatch(lang === 'de' ? /Gebeizt, Lackiert/ : /, /);
    });

    it('Entwurf: Übernahme genau einmal je Transfer, Freitext bleibt getrennt', () => {
      const state = M.restoreDraft({ version: 1, fields: { description: 'Keep this exact sentence.' }, items: [], step: 1 }, products);
      M.applyTransfer(state, { version: 1, id: 't1', items: [{ product: 'menu-hamburg', values: { format: 'a5-square', quantity: '25' } }] }, products, []);
      expect(state.items).toHaveLength(1);
      state.items = [];
      M.applyTransfer(state, { version: 1, id: 't1', items: [{ product: 'menu-hamburg', values: {} }] }, products, []);
      expect(state.items).toHaveLength(0); // derselbe Transfer wird nicht erneut angewendet
      M.applyTransfer(state, { version: 1, id: 't2', items: [{ product: 'menu-hamburg', values: { format: 'a3', quantity: '50' } }] }, products, []);
      expect(state.items[0].values.quantity).toBe('50');
      expect(state.fields.description).toBe('Keep this exact sentence.');
      const legacy = M.applyTransfer(M.emptyDraft(), { brief: 'Original legacy wording', count: 2 }, products, []);
      expect(legacy.legacyBrief).toBe('Original legacy wording');
      expect(M.restoreDraft({ version: 7, kaputt: true }, products)).toMatchObject({ version: 1, items: [], step: 0 });
    });

    it('Projektbrief enthält Freitext, Auswahl und Kontakt', () => {
      const productBrief = M.brief([{ product: 'menu-hamburg', values: { quantity: '50' } }], products, lang);
      const text = M.summary({
        lang, scenarioLabel: 'Hotels', collectionLabel: 'Dining', productBrief,
        fields: { description: 'Keep this exact sentence.', delivery: 'October review', name: 'Review User', email: 'review@example.test' },
      });
      expect(text).toContain('Keep this exact sentence.');
      expect(text).toContain('October review');
      expect(text).toContain(productBrief);
      expect(text).toContain('review@example.test');
    });
  });
}

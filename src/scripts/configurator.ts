/**
 * Verhalten des Artikelkonfigurators. Die fachlichen Regeln (abhängige Optionen,
 * Sondermaße, Naht, Normalisierung) liegen in ../lib/enquiry-model.ts.
 */
import { t } from '../i18n/ui';
import * as M from '../lib/enquiry-model';
import type { Selection, Values } from '../lib/enquiry-model';
import { read, write } from '../lib/storage';
import { clearErrors, validatePanel } from '../lib/validate';
import type { CatalogMaterial, Lang, Product } from '../lib/types';
import { setStatus, type StatusKind } from '../lib/status';

type P = Product & { thumb?: string };
const el = <K extends keyof HTMLElementTagNameMap>(tag: K, props: Partial<HTMLElementTagNameMap[K]> & Record<string, any> = {}, ...children: (Node | string)[]) => {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === 'dataset') Object.assign(node.dataset, v);
    else if (k.startsWith('aria-') || k === 'role' || k === 'for') node.setAttribute(k, String(v));
    else (node as any)[k] = v;
  }
  node.append(...children);
  return node;
};
const reduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initConfigurator(root: HTMLElement, products: P[]) {
  const lang = (root.dataset.lang === 'en' ? 'en' : 'de') as Lang;
  const ui = t(lang).cfg;
  const mode = root.dataset.mode === 'model' ? 'model' : 'planner';
  const fixedId = root.dataset.fixed || '';
  const categories: Record<string, string> = JSON.parse(root.dataset.categories || '{}');
  const form = root.querySelector<HTMLFormElement>('#item-config')!;
  const $ = <T extends HTMLElement = HTMLElement>(id: string) => root.querySelector<T>('#cfg-' + id)!;
  const input = (id: string) => $<HTMLInputElement>(id);

  let items: Selection[] = M.normalizeItems(read(M.ITEM_KEY, []), products);
  let editing: number | null = null;
  let currentId = products.some((p) => p.id === fixedId) ? fixedId : products[0].id;
  const current = () => products.find((p) => p.id === currentId) || products[0];
  const status = (text: string, kind: StatusKind = 'note') => setStatus($('status'), lang, text, kind);

  function persist() {
    if (!write(M.ITEM_KEY, items)) status(ui.storage, 'error');
    document.dispatchEvent(new CustomEvent('sfp:enquiry-change', { detail: { count: items.length } }));
  }

  // ---------------------------------------------------------- Artikelwahl
  function renderProducts() {
    const term = input('search').value.trim().toLocaleLowerCase();
    const matches = products.filter((p) => (p.name + ' ' + (p.description || '')).toLocaleLowerCase().includes(term));
    const list = $('products');
    list.replaceChildren();
    $('search-status').textContent = ui.found(matches.length);
    const add = $<HTMLButtonElement>('add-item');
    if (!matches.length) {
      list.append(el('p', { className: 'picker__empty', textContent: ui.noMatch }));
      add.disabled = true;
      return;
    }
    add.disabled = false;
    const byCategory = new Map<string, P[]>();
    for (const p of matches) byCategory.set(p.category || '', [...(byCategory.get(p.category || '') || []), p]);
    for (const [cat, group] of byCategory) {
      const label = categories['category-' + cat];
      if (label) list.append(el('p', { className: 'picker__group', textContent: label }));
      for (const p of group) {
        const radio = el('input', { type: 'radio', name: 'cfg-product', value: p.id, id: 'cfg-product-' + p.id, checked: p.id === currentId });
        const img = p.thumb || p.image ? el('img', { src: p.thumb || p.image!, alt: '', width: 96, height: 72, loading: 'lazy', decoding: 'async' }) : '';
        list.append(el('label', { className: 'picker__item', for: radio.id }, radio, img, el('span', { textContent: p.name })));
      }
    }
    if (!matches.some((p) => p.id === currentId) && editing === null) {
      currentId = matches[0].id;
      list.querySelector<HTMLInputElement>('input')!.checked = true;
      chooseProduct();
    }
  }

  // ---------------------------------------------------------- Ausführung
  function option(value: string, label: string) {
    return el('option', { value, textContent: label });
  }
  function materialTile(m: CatalogMaterial | null) {
    const id = 'cfg-material-' + (m?.id || 'open');
    const radio = el('input', { type: 'radio', name: 'cfg-material', value: m?.id || '', id, checked: !m });
    const swatch = m?.image
      ? el('img', { src: m.image, alt: '', width: 120, height: 120, loading: 'lazy', decoding: 'async' })
      : el('span', { className: 'swatch-tile__blank', 'aria-hidden': 'true' });
    const name = m ? m.name.split(' · ').slice(1).join(' · ') || m.name : ui.undecided;
    return el('label', { className: 'swatch-tile', for: id }, radio, swatch, el('span', { textContent: name }));
  }
  function renderMaterials(p: P) {
    const wrap = $('materials');
    wrap.replaceChildren();
    const groups = new Map<string, CatalogMaterial[]>();
    for (const m of p.materials) groups.set(m.kind, [...(groups.get(m.kind) || []), m]);
    const open = el('div', { className: 'swatches__group' }, el('div', { className: 'swatches__row' }, materialTile(null)));
    wrap.append(open);
    for (const [kind, list] of groups)
      wrap.append(el('div', { className: 'swatches__group' }, el('p', { className: 'swatches__kind', textContent: kind }), el('div', { className: 'swatches__row' }, ...list.map(materialTile))));
  }
  const materialValue = () => root.querySelector<HTMLInputElement>('input[name="cfg-material"]:checked')?.value || '';
  function setMaterial(value: string) {
    const radios = [...root.querySelectorAll<HTMLInputElement>('input[name="cfg-material"]')];
    (radios.find((r) => r.value === value) || radios[0]).checked = true;
  }

  function renderOptions(p: P) {
    const options = $('product-options');
    options.replaceChildren();
    for (const o of p.options) {
      const box = el('div', { className: 'field cfg-option', dataset: { optionGroup: o.id } });
      const id = 'cfg-option-' + o.id;
      let control: HTMLElement;
      let label: HTMLElement;
      if (o.type === 'multi' && o.values.length) {
        label = el('p', { className: 'cfg__sub', textContent: o.label, id: id + '-label' });
        control = el('div', { className: 'checks', role: 'group', 'aria-labelledby': id + '-label', id });
        for (const v of o.values) {
          const cid = id + '-' + v.id;
          control.append(el('label', { for: cid }, el('input', { type: 'checkbox', value: v.id, id: cid, dataset: { option: o.id } }), v.label));
        }
      } else if (o.values.length) {
        label = el('label', { textContent: o.label, for: id });
        control = el('select', { id, dataset: { option: o.id } }, option('', ui.undecided), ...o.values.map((v) => option(v.id, v.label)));
      } else {
        label = el('label', { textContent: o.label, for: id });
        control = el('input', { type: 'text', id, maxLength: 250, placeholder: ui.optionPlaceholder, dataset: { option: o.id } });
      }
      box.append(label, control);
      if (o.help) box.append(el('p', { className: 'note', textContent: o.help }));
      options.append(box);
    }
  }

  function chooseProduct(values: Values | null = null) {
    const p = current();
    clearErrors(form);
    const photo = $<HTMLImageElement>('photo');
    photo.parentElement!.hidden = !p.image;
    if (p.image) photo.src = p.thumb || p.image;
    photo.alt = p.name;
    $('description').textContent = p.description || '';
    $<HTMLAnchorElement>('detail').href = p.url || '#';
    const format = $<HTMLSelectElement>('format');
    format.replaceChildren(option('', ui.undecided), ...p.formats.map((x) => option(x.id, x.label)), option('custom', ui.custom));
    if (values?.format && values.format !== 'custom' && !p.formats.some((f) => f.id === values.format)) {
      const label = p.legacyFormats?.find((f) => f.id === values.format)?.label || String(values.format);
      format.insertBefore(option(String(values.format), ui.previous + label), format.lastChild);
    }
    renderMaterials(p);
    renderOptions(p);
    for (const k of M.FIXED) if (k !== 'material') input(k).value = k === 'stitch' ? 'undecided' : '';
    if (values) {
      for (const k of M.FIXED) {
        if (values[k] == null) continue;
        if (k === 'material') setMaterial(String(values[k]));
        else input(k).value = String(values[k]);
      }
      for (const c of $('product-options').querySelectorAll<HTMLInputElement>('[data-option]')) {
        const v = values['option:' + c.dataset.option];
        if (c.type === 'checkbox') c.checked = Array.isArray(v) && v.includes(c.value);
        else if (v != null) c.value = String(v);
      }
    }
    updateDimensions();
    updateDetails();
    updateOptions();
  }

  /** Eine normale Formatauswahl entfernt alte Sondermaßwerte. */
  function updateDimensions() {
    const custom = input('format').value === 'custom';
    $('custom').hidden = !custom;
    for (const k of M.DIMENSION_KEYS) {
      input(k).disabled = !custom;
      if (!custom) input(k).value = '';
    }
  }
  function updateDetails() {
    const p = current();
    $('stitch-wrap').hidden = !p.stitching;
    input('stitch').disabled = !p.stitching;
    const needsColour = p.stitching && ['contrast', 'specific'].includes(input('stitch').value);
    $('stitch-colour-wrap').hidden = !needsColour;
    input('stitch-colour').disabled = !needsColour;
    const m = p.materials.find((x) => x.id === materialValue());
    const colours = (m?.colours || []).filter((c) => c.availability === 'available');
    $('colour-wrap').hidden = !colours.length;
    $('colour-choices').replaceChildren(
      ...colours.map((c) => {
        const label = (typeof c.name === 'object' ? c.name[lang] : c.name) + (c.code ? ' · ' + c.code : '');
        const chip = el('button', { type: 'button', className: 'chip', textContent: label });
        chip.setAttribute('aria-pressed', String(input('colour').value === label));
        chip.addEventListener('click', () => {
          input('colour').value = label;
          updateDetails();
        });
        return chip;
      }),
    );
  }
  /** Abhängige Optionen erscheinen nur bei passender übergeordneter Auswahl. */
  function updateOptions() {
    const values: Values = {};
    for (const field of $('product-options').querySelectorAll<HTMLInputElement>('[data-option]'))
      if (field.type !== 'checkbox') values['option:' + field.dataset.option] = field.value;
    for (const spec of current().options) {
      const box = [...$('product-options').children].find((b) => (b as HTMLElement).dataset.optionGroup === spec.id) as HTMLElement;
      const active = M.applicable(spec, values);
      box.hidden = !active;
      box.querySelectorAll<HTMLInputElement>('input,select').forEach((f) => (f.disabled = !active));
    }
  }

  function capture(): Selection {
    const values: Values = {};
    for (const k of M.FIXED) {
      if (k === 'material') { if (materialValue()) values.material = materialValue(); continue; }
      const f = input(k);
      if (!f.disabled && f.value.trim()) values[k] = f.value.trim();
    }
    for (const f of $('product-options').querySelectorAll<HTMLInputElement>('[data-option]')) {
      if (f.disabled) continue;
      const key = 'option:' + f.dataset.option;
      if (f.type === 'checkbox') { if (f.checked) ((values[key] ??= []) as string[]).push(f.value); }
      else if (f.value.trim()) values[key] = f.value.trim();
    }
    return { product: current().id, values: M.cleanValues(current(), values) };
  }

  // ---------------------------------------------------------- Auswahl
  function resetEdit() {
    editing = null;
    $('add-item').querySelector('[data-label]')!.textContent = ui.add;
    $('cancel-edit').hidden = true;
  }
  function startEdit(i: number) {
    const item = items[i];
    if (mode === 'model' && item.product !== fixedId) {
      location.assign(root.dataset.planner + '?edit=' + i);
      return;
    }
    input('search').value = '';
    resetEdit();
    currentId = item.product;
    renderProducts();
    chooseProduct(item.values);
    editing = i;
    $('add-item').querySelector('[data-label]')!.textContent = ui.save;
    $('cancel-edit').hidden = false;
    (mode === 'planner' ? root.querySelector<HTMLElement>('input[name="cfg-product"]:checked') : input('format'))?.focus({ preventScroll: true });
    form.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
  }
  function renderItems() {
    const list = $('items');
    list.replaceChildren();
    $('empty').hidden = items.length > 0;
    $<HTMLButtonElement>('continue').disabled = !items.length;
    $('count').textContent = String(items.length);
    const mobile = $('mobile-list');
    mobile.hidden = !items.length;
    mobile.textContent = ui.viewSelection + ' · ' + items.length;
    const planner = root.querySelector<HTMLElement>('#cfg-open-planner');
    if (planner) planner.hidden = !items.length;
    items.forEach((item, i) => {
      const p = products.find((x) => x.id === item.product)!;
      const head = el('div', { className: 'cfg-item__head' });
      if (p.image) head.append(el('img', { src: p.thumb || p.image, alt: '', width: 96, height: 72, loading: 'lazy' }));
      head.append(el('h3', { textContent: `${i + 1}. ${p.name}` }));
      const details = el('details', {}, el('summary', { textContent: ui.viewSpec }));
      const rows = M.rows(item, products, lang);
      if (rows.length) details.append(el('dl', {}, ...rows.map(([k, v]) => el('div', {}, el('dt', { textContent: k }), el('dd', { textContent: v })))));
      else details.append(el('p', { textContent: ui.toBeAgreed }));
      const actions = el('div', { className: 'cfg-item__actions' });
      const button = (label: string, run: () => void) => {
        const b = el('button', { type: 'button', textContent: label });
        b.setAttribute('aria-label', `${label} · ${p.name} · ${i + 1}`);
        b.addEventListener('click', run);
        actions.append(b);
      };
      button(ui.edit, () => startEdit(i));
      button(ui.duplicate, () => {
        if (items.length >= M.MAX_ITEMS) return status(ui.limit);
        items.splice(i + 1, 0, JSON.parse(JSON.stringify(item)));
        if (editing !== null && editing > i) editing++;
        persist();
        renderItems();
        list.children[i + 1]?.querySelector('button')?.focus();
        status(ui.duplicated, 'success');
      });
      button(ui.remove, () => {
        items.splice(i, 1);
        if (editing === i) { resetEdit(); chooseProduct(); }
        else if (editing !== null && editing > i) editing--;
        persist();
        renderItems();
        (list.children[Math.min(i, items.length - 1)]?.querySelector('button') || form.querySelector<HTMLElement>('select,input'))?.focus();
        status(ui.removed, 'success');
      });
      list.append(el('li', { className: 'cfg-item' }, head, details, actions));
    });
  }

  // ---------------------------------------------------------- Ereignisse
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validatePanel(form, lang)) return;
    if (!products.some((p) => p.id === currentId) || $<HTMLButtonElement>('add-item').disabled) return;
    const item = capture();
    if (editing !== null) {
      items[editing] = item;
      resetEdit();
      status(ui.updated, 'success');
    } else {
      if (items.length >= M.MAX_ITEMS) return status(ui.limit);
      items.push(item);
      status(ui.added, 'success');
    }
    persist();
    renderItems();
  });
  input('search').addEventListener('input', () => { resetEdit(); renderProducts(); });
  $('products').addEventListener('change', (e) => {
    const target = e.target as HTMLInputElement;
    if (target.name !== 'cfg-product') return;
    resetEdit();
    currentId = target.value;
    chooseProduct();
  });
  $('product-options').addEventListener('change', updateOptions);
  $('materials').addEventListener('change', () => { input('colour').value = ''; updateDetails(); });
  input('colour').addEventListener('input', updateDetails);
  input('stitch').addEventListener('change', updateDetails);
  input('format').addEventListener('change', updateDimensions);
  $('cancel-edit').addEventListener('click', () => { resetEdit(); chooseProduct(); });
  $('continue').addEventListener('click', () => {
    if (editing !== null) {
      status(ui.finishEdit);
      $('add-item').focus();
      return;
    }
    const transfer = {
      version: 1,
      id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Date.now()),
      items: M.normalizeItems(items, products),
    };
    if (write(M.TRANSFER_KEY, transfer)) location.assign(root.dataset.contact + '#selection=1');
    else location.assign(root.dataset.contact + '#' + new URLSearchParams({ 'selection-data': JSON.stringify(transfer) }).toString());
  });
  const mobile = $('mobile-list');
  if ('IntersectionObserver' in window)
    new IntersectionObserver((entries) => mobile.classList.toggle('is-list-visible', entries[0].isIntersecting), { threshold: 0.02 }).observe($('selection'));
  mobile.addEventListener('click', () => {
    $('selection').scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
    $('continue').focus({ preventScroll: true });
  });

  // ---------------------------------------------------------- Start
  const query = new URLSearchParams(location.search);
  const requested = M.canonicalProductId(query.get('item') || '');
  const model = query.get('model');
  const legacy = query.get('product');
  let chosen = products.find((p) => p.id === requested);
  if (!chosen && model) chosen = products.find((p) => p.name.toLowerCase().includes(model.toLowerCase()));
  if (!chosen && legacy) chosen = products.find((p) => p.group === legacy);
  if (chosen && mode === 'planner') currentId = chosen.id;
  renderProducts();
  chooseProduct();
  renderItems();
  const edit = Number(query.get('edit'));
  if (mode === 'planner' && query.has('edit') && Number.isInteger(edit) && items[edit]) startEdit(edit);

  return { getItems: () => items };
}

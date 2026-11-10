/**
 * Anfrageformular. Der Entwurf gehört dem Nutzertext; Artikelspezifikationen bleiben
 * strukturiert (Port aus contact.js). Es wird nichts versendet.
 */
import { t } from '../i18n/ui';
import * as M from '../lib/enquiry-model';
import { read, write } from '../lib/storage';
import { clearErrors, validatePanel } from '../lib/validate';
import type { Lang, Product } from '../lib/types';
import { enquiryService, type EnquiryDraft } from '../services/enquiry-service';
import { setStatus, type StatusKind } from '../lib/status';

export function initContact(root: HTMLElement, products: Product[]) {
  const lang = (root.dataset.lang === 'en' ? 'en' : 'de') as Lang;
  const ui = t(lang).form;
  const form = root.querySelector<HTMLFormElement>('#inquiry')!;
  const panels = [...form.querySelectorAll<HTMLFieldSetElement>('[data-panel]')];
  const progress = [...root.querySelectorAll<HTMLLIElement>('.steps li')];
  const statusEl = root.querySelector<HTMLElement>('#form-status')!;
  const review = root.querySelector<HTMLElement>('#review')!;
  const selection = root.querySelector<HTMLDetailsElement>('[data-selection]')!;
  const selectionText = root.querySelector<HTMLElement>('[data-selection-text]')!;
  const field = (name: string) => form.elements.namedItem(name) as HTMLInputElement & HTMLSelectElement;
  const status = (text: string, kind: StatusKind = 'note') => setStatus(statusEl, lang, text, kind);

  const state = M.restoreDraft(read(M.DRAFT_KEY), products);
  let step = 0;

  // Übernahme aus dem Projektplaner (Sitzungsspeicher oder, falls blockiert, aus dem Link)
  const params = new URLSearchParams(location.hash.slice(1));
  const query = new URLSearchParams(location.search);
  let transfer: any = params.get('selection') === '1' ? read(M.TRANSFER_KEY) : null;
  if (params.has('selection-data')) {
    try { transfer = JSON.parse(params.get('selection-data')!); } catch { /* fehlerhafte Links ignorieren */ }
  }
  M.applyTransfer(state, transfer, products, read(M.ITEM_KEY, []));
  // Ohne ausdrückliche Übergabe: vorhandene Planer-Auswahl derselben Sitzung übernehmen.
  if (!transfer && !state.items.length && !state.legacyBrief) state.items = M.normalizeItems(read(M.ITEM_KEY, []), products);

  for (const name of M.DRAFT_FIELDS) if (typeof state.fields[name] === 'string') field(name).value = state.fields[name]!;
  {
    const topic = params.get('topic') || query.get('topic');
    if (topic && !field('description').value) field('description').value = topic;
    const quantity = params.get('quantity');
    if (quantity && /^\d{1,7}$/.test(quantity) && !field('quantity').value) field('quantity').value = quantity;
    const collection = params.get('collection');
    const option = [...field('collection').options].find(
      (o) => o.value === collection || o.textContent === collection || JSON.parse(o.dataset.aliases || '[]').includes(collection),
    );
    if (option && !state.fields.collection) field('collection').value = option.value;
  }

  const productBrief = () => M.brief(state.items, products, lang) || state.legacyBrief;
  function renderSelection() {
    const text = productBrief();
    selectionText.textContent = text;
    selection.hidden = !text;
    field('description').required = !text;
    const label = form.querySelector<HTMLElement>('label[for="description"]')!;
    label.textContent = label.dataset.label + (text ? '' : ' *');
    root.querySelector('#description-help')!.textContent = text ? ui.descriptionHelpSelection : ui.descriptionHelp;
  }
  function persist() {
    state.fields = Object.fromEntries(M.DRAFT_FIELDS.map((name) => [name, field(name).value]));
    state.step = step;
    if (!write(M.DRAFT_KEY, state)) status(ui.storage, 'error');
  }
  function show(next: number, focus = true) {
    step = Math.max(0, Math.min(next, panels.length - 1));
    panels.forEach((panel, index) => { panel.hidden = index !== step; });
    progress.forEach((item, index) => {
      item.classList.toggle('is-active', index <= step);
      if (index === step) item.setAttribute('aria-current', 'step');
      else item.removeAttribute('aria-current');
      item.querySelector('button')!.disabled = index > step;
    });
    if (focus) panels[step].querySelector<HTMLElement>('legend')!.focus();
    persist();
  }
  const selectedLabel = (name: string) => field(name).selectedOptions[0]?.textContent || '—';
  const fields = () => Object.fromEntries(M.DRAFT_FIELDS.map((name) => [name, field(name).value])) as M.DraftFields;
  const summary = () =>
    M.summary({ lang, fields: fields(), scenarioLabel: selectedLabel('scenario'), collectionLabel: selectedLabel('collection'), productBrief: productBrief() });

  progress.forEach((item, index) => item.querySelector('button')!.addEventListener('click', () => show(index)));
  form.querySelectorAll('[data-next]').forEach((b) => b.addEventListener('click', () => { if (validatePanel(panels[step], lang)) show(step + 1); }));
  form.querySelectorAll('[data-back]').forEach((b) => b.addEventListener('click', () => show(step - 1)));
  function changed() {
    review.hidden = true;
    status('');
    persist();
    if (panels[step].querySelector('[aria-invalid]')) validatePanel(panels[step], lang, false);
  }
  form.addEventListener('input', changed);
  form.addEventListener('change', changed);
  // Sprachwechsel und Rücksprung in den Planer dürfen nichts verlieren.
  document.querySelectorAll('[data-lang-link]').forEach((link) => link.addEventListener('click', persist));
  root.querySelector('[data-edit-selection]')!.addEventListener('click', persist);
  window.addEventListener('pagehide', persist);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!validatePanel(panels[step], lang)) return;
    if (step < panels.length - 1) return show(step + 1);
    for (let index = 0; index < panels.length; index++) {
      if (!validatePanel(panels[index], lang, false)) {
        show(index);
        validatePanel(panels[index], lang);
        return;
      }
    }
    persist();
    const brief = summary();
    root.querySelector('#summary')!.textContent = brief;
    root.querySelector<HTMLAnchorElement>('#email-link')!.href =
      'mailto:mail@sfp-berlin.com?subject=' + encodeURIComponent(ui.subject) + '&body=' + encodeURIComponent(brief);
    review.hidden = false;
    review.focus({ preventScroll: true });
    review.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
    status(brief.length > 7000 ? ui.readyLong : ui.ready);
  });
  root.querySelector('#copy-brief')!.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(summary());
      status(ui.copied, 'success');
    } catch {
      status(ui.copyFailed, 'error');
    }
  });
  root.querySelector('#download-brief')!.addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([summary()], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = ui.downloadName;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  // Nur im Demo-/Live-Modus vorhanden. Eine Bestätigung erscheint ausschließlich bei echter Annahme.
  root.querySelector('#demo-send')?.addEventListener('click', async () => {
    if (!enquiryService) return;
    const f = fields();
    const draft: EnquiryDraft = {
      schemaVersion: 1,
      locale: lang,
      items: state.items,
      project: { scenario: f.scenario, collection: f.collection, quantity: f.quantity, delivery: f.delivery, description: f.description || '' },
      contact: { name: f.name || '', company: f.company, email: f.email || '', phone: f.phone },
    };
    const result = await enquiryService.submit(draft);
    status(result.status === 'accepted' ? result.reference : result.message, result.status === 'accepted' ? 'success' : result.status === 'failed' ? 'error' : 'note');
  });
  root.querySelector('#enquiry-reset')!.addEventListener('click', () => {
    if (!window.confirm(ui.resetConfirm)) return;
    form.reset();
    state.items = [];
    state.legacyBrief = '';
    state.transferId = null;
    write(M.ITEM_KEY, []);
    write(M.TRANSFER_KEY, null);
    document.dispatchEvent(new CustomEvent('sfp:enquiry-change', { detail: { count: 0 } }));
    history.replaceState(null, '', location.pathname);
    clearErrors(form);
    renderSelection();
    review.hidden = true;
    show(0);
    status(ui.resetDone, 'success');
  });
  renderSelection();
  show(state.step, false);
  return { state, summary };
}

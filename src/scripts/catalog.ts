/** Katalogsuche und Bereichsfilter mit Trefferzahl, Leerzustand und Zurücksetzen. */
import { t } from '../i18n/ui';

const root = document.querySelector<HTMLElement>('[data-catalog]');
if (root) {
  const ui = t(document.documentElement.lang === 'en' ? 'en' : 'de');
  const form = root.querySelector<HTMLFormElement>('[data-catalog-form]')!;
  const search = root.querySelector<HTMLInputElement>('#catalog-search')!;
  const chips = [...root.querySelectorAll<HTMLButtonElement>('[data-category]')];
  const groups = [...root.querySelectorAll<HTMLElement>('[data-catalog-group]')];
  const status = root.querySelector<HTMLElement>('[data-catalog-status]')!;
  const empty = root.querySelector<HTMLElement>('[data-catalog-empty]')!;
  const resets = [...root.querySelectorAll<HTMLButtonElement>('[data-catalog-reset]')];
  let category = '';

  function update() {
    const term = search.value.trim().toLocaleLowerCase();
    let count = 0;
    for (const group of groups) {
      let inGroup = 0;
      const allowed = !category || group.id === category;
      for (const card of group.querySelectorAll<HTMLElement>('[data-catalog-card]')) {
        const match = allowed && (!term || card.dataset.search!.includes(term));
        card.hidden = !match;
        if (match) inGroup++;
      }
      group.hidden = inGroup === 0;
      group.querySelector('[data-group-count]')!.textContent = String(inGroup);
      count += inGroup;
    }
    status.textContent = ui.catalogCount(count);
    empty.hidden = count !== 0;
    resets[0].disabled = !term && !category;
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.category === category)));
  }
  function reset() {
    search.value = '';
    category = '';
    update();
    search.focus({ preventScroll: true });
  }
  form.addEventListener('submit', (e) => e.preventDefault());
  search.addEventListener('input', update);
  chips.forEach((c) => c.addEventListener('click', () => { category = c.dataset.category || ''; update(); }));
  resets.forEach((r) => r.addEventListener('click', (e) => { e.preventDefault(); reset(); }));
  // Direkter Aufruf mit Anker (#category-…) zeigt den Bereich gefiltert.
  if (location.hash && groups.some((g) => '#' + g.id === location.hash)) category = location.hash.slice(1);
  update();
}

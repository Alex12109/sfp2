/** Seitenweites Verhalten: Navigation, Kopfzeile, Einblendungen, Umschalter, Galerie, Filter. */
import { ITEM_KEY } from '../lib/enquiry-model';
import { read } from '../lib/storage';
import { t } from '../i18n/ui';

const lang = document.documentElement.lang === 'en' ? 'en' : 'de';
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ------------------------------------------------------------ Navigation
(() => {
  const header = document.querySelector<HTMLElement>('[data-header]');
  const nav = document.querySelector<HTMLElement>('[data-nav]');
  const toggle = document.querySelector<HTMLButtonElement>('[data-nav-toggle]');
  if (!header || !nav || !toggle) return;
  const triggers = [...nav.querySelectorAll<HTMLButtonElement>('[data-nav-trigger]')];
  const label = toggle.querySelector<HTMLElement>('.burger__label')!;
  const desktop = matchMedia('(min-width: 1100px)');
  const panelOf = (trigger: HTMLButtonElement) => document.getElementById(trigger.getAttribute('aria-controls')!)!;

  function closePanels(except?: HTMLButtonElement) {
    for (const trigger of triggers) {
      if (trigger === except) continue;
      trigger.setAttribute('aria-expanded', 'false');
      panelOf(trigger).hidden = true;
    }
    if (!except) header!.classList.remove('has-panel');
  }
  function setMenu(open: boolean) {
    toggle!.setAttribute('aria-expanded', String(open));
    header!.classList.toggle('is-menu-open', open);
    document.documentElement.classList.toggle('no-scroll', open);
    label.textContent = open ? label.dataset.closeLabel! : label.dataset.openLabel!;
    if (!open) closePanels();
  }
  triggers.forEach((trigger) =>
    trigger.addEventListener('click', () => {
      const open = trigger.getAttribute('aria-expanded') !== 'true';
      closePanels(trigger);
      trigger.setAttribute('aria-expanded', String(open));
      panelOf(trigger).hidden = !open;
      header.classList.toggle('has-panel', open && desktop.matches);
    }),
  );
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const open = triggers.find((x) => x.getAttribute('aria-expanded') === 'true');
    if (open) { closePanels(); open.focus(); }
    else if (toggle.getAttribute('aria-expanded') === 'true') { setMenu(false); toggle.focus(); }
  });
  document.addEventListener('click', (e) => { if (desktop.matches && !header.contains(e.target as Node)) closePanels(); });
  nav.addEventListener('focusout', (e) => {
    if (desktop.matches && e.relatedTarget && !nav.contains(e.relatedTarget as Node)) closePanels();
  });
  desktop.addEventListener('change', () => setMenu(false));

  // Kopfzeile: beim Abwärtsscrollen ausblenden, beim Aufwärtsscrollen zeigen.
  let last = scrollY, frame = 0;
  addEventListener('scroll', () => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      const y = scrollY;
      header.classList.toggle('is-scrolled', y > 8);
      const menuOpen = header.classList.contains('is-menu-open') || header.classList.contains('has-panel');
      if (!menuOpen && Math.abs(y - last) > 6) header.classList.toggle('is-hidden', y > last && y > 240);
      last = y;
    });
  }, { passive: true });
  header.addEventListener('focusin', () => header.classList.remove('is-hidden'));
})();

// ------------------------------------------------------------ Anfrage-Zähler
(() => {
  const tray = document.querySelector<HTMLElement>('[data-enquiry-tray]');
  if (!tray) return;
  const paint = (count: number) => {
    tray.hidden = count === 0;
    tray.querySelector('[data-enquiry-count]')!.textContent = String(count);
  };
  const stored = read<unknown[]>(ITEM_KEY, []);
  paint(Array.isArray(stored) ? stored.length : 0);
  document.addEventListener('sfp:enquiry-change', (e) => paint((e as CustomEvent).detail.count));
})();

// ------------------------------------------------------------ Einblendungen
(() => {
  const nodes = document.querySelectorAll<HTMLElement>('[data-reveal]');
  if (!document.documentElement.classList.contains('motion')) return;
  const io = new IntersectionObserver(
    (entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('is-in'); io.unobserve(entry.target); } }),
    // früh auslösen: Inhalt soll da sein, bevor er die Bildschirmmitte erreicht
    { rootMargin: '0px 0px 12% 0px', threshold: 0 },
  );
  nodes.forEach((n) => io.observe(n));
})();

// ------------------------------------------------------------ Umschalter (Szenen, Projekte, Paletten, Galerie)
function pressGroup(buttons: HTMLElement[], active: number) {
  buttons.forEach((b, i) => b.setAttribute('aria-pressed', String(i === active)));
}
document.querySelectorAll<HTMLElement>('[data-scenes]').forEach((root) => {
  const scenes = [...root.querySelectorAll<HTMLElement>('[data-scene]')];
  const buttons = [...root.querySelectorAll<HTMLElement>('[data-scene-choice]')];
  const show = (i: number) => {
    scenes.forEach((s, n) => { s.toggleAttribute('data-active', n === i); if (n === i) s.removeAttribute('aria-hidden'); else s.setAttribute('aria-hidden', 'true'); });
    pressGroup(buttons, i);
  };
  buttons.forEach((b, i) => b.addEventListener('click', () => show(i)));
});
document.querySelectorAll<HTMLElement>('[data-tabs]').forEach((root) => {
  const buttons = [...root.querySelectorAll<HTMLElement>('[data-tab-choice]')];
  const panels = [...root.querySelectorAll<HTMLElement>('[data-tab-panel]')];
  buttons.forEach((b, i) => b.addEventListener('click', () => { panels.forEach((p, n) => (p.hidden = n !== i)); pressGroup(buttons, i); }));
});
document.querySelectorAll<HTMLElement>('[data-gallery]').forEach((root) => {
  const slides = [...root.querySelectorAll<HTMLElement>('[data-gallery-slide]')];
  const buttons = [...root.querySelectorAll<HTMLElement>('[data-gallery-choice]')];
  const counter = root.querySelector('[data-gallery-index]');
  const show = (i: number) => { slides.forEach((s, n) => (s.hidden = n !== i)); pressGroup(buttons, i); if (counter) counter.textContent = String(i + 1); };
  buttons.forEach((b, i) => b.addEventListener('click', () => show(i)));
  root.addEventListener('keydown', (e) => {
    const cur = buttons.findIndex((b) => b.getAttribute('aria-pressed') === 'true');
    if (e.key === 'ArrowRight') { const n = (cur + 1) % buttons.length; show(n); buttons[n].focus(); }
    if (e.key === 'ArrowLeft') { const n = (cur - 1 + buttons.length) % buttons.length; show(n); buttons[n].focus(); }
  });
});

// ------------------------------------------------------------ Materialstudie
document.querySelectorAll<HTMLElement>('[data-studio]').forEach((root) => {
  const scenes = [...root.querySelectorAll<HTMLElement>('[data-studio-scene]')];
  const palettes = [...root.querySelectorAll<HTMLElement>('[data-palette]')];
  const descriptions = [...root.querySelectorAll<HTMLElement>('[data-palette-description]')];
  palettes.forEach((b, i) => b.addEventListener('click', () => {
    scenes.forEach((s, n) => { s.toggleAttribute('data-active', n === i); if (n === i) s.removeAttribute('aria-hidden'); else s.setAttribute('aria-hidden', 'true'); });
    descriptions.forEach((d, n) => (d.hidden = n !== i));
    pressGroup(palettes, i);
  }));
  // Prägestudie: Lederfarbe, Veredelung, Folienfarbe. Flor und Schrift steuert src/scripts/suede.ts.
  const study = root.querySelector<HTMLElement>('[data-stamp-study]');
  if (!study) return;
  const foil = root.querySelector<HTMLSelectElement>('#studio-foil')!;
  const foilField = root.querySelector<HTMLElement>('#studio-foil-field')!;
  const status = root.querySelector<HTMLElement>('[data-studio-status]')!;
  const leathers = [...root.querySelectorAll<HTMLElement>('[data-leather-choice]')];
  const finishes = [...root.querySelectorAll<HTMLElement>('[data-finish-choice]')];
  const refresh = (announce = true) => {
    foil.disabled = study.dataset.finish !== 'foil';
    foilField.dataset.disabled = String(foil.disabled);
    study.dataset.foil = foil.value;
    study.dispatchEvent(new CustomEvent('stampchange'));
    if (!announce) return;
    const finish = finishes.find((f) => f.getAttribute('aria-pressed') === 'true')?.textContent?.trim();
    const leather = leathers.find((f) => f.getAttribute('aria-pressed') === 'true')?.textContent?.trim();
    status.textContent = `${leather} · ${finish}${foil.disabled ? '' : ' · ' + foil.selectedOptions[0].textContent}`;
  };
  leathers.forEach((b, i) => b.addEventListener('click', () => { study.dataset.leather = b.dataset.leatherChoice; pressGroup(leathers, i); refresh(); }));
  finishes.forEach((b, i) => b.addEventListener('click', () => { study.dataset.finish = b.dataset.finishChoice; pressGroup(finishes, i); refresh(); }));
  foil.addEventListener('change', () => refresh());
  refresh(false);
});

// ------------------------------------------------------------ Speisekartenfilter (Port aus menu-filter.js)
document.querySelectorAll<HTMLElement>('[data-menu-finder]').forEach((finder) => {
  const form = finder.querySelector<HTMLFormElement>('[data-menu-controls]')!;
  const cards = [...finder.querySelectorAll<HTMLElement>('[data-menu-model]')];
  const status = finder.querySelector<HTMLElement>('[data-menu-status]')!;
  const empty = finder.querySelector<HTMLElement>('[data-menu-empty]')!;
  const reset = form.querySelector<HTMLButtonElement>('[type="reset"]')!;
  const ui = t(lang);
  const includes = (values = '', selected?: string) => !selected || values.split(' ').includes(selected);
  function update() {
    const { binding, pages, formats, materials } = Object.fromEntries(new FormData(form)) as Record<string, string>;
    let count = 0;
    for (const card of cards) {
      const d = card.dataset;
      const pageMatch = !pages || (d.pagesMin !== '' && d.pagesMax !== '' && Number(pages) >= Number(d.pagesMin) && Number(pages) <= Number(d.pagesMax));
      card.hidden = !(includes(d.binding, binding) && pageMatch && includes(d.formats, formats) && includes(d.materials, materials));
      if (!card.hidden) count += 1;
    }
    status.textContent = ui.menuCount(count, cards.length);
    reset.disabled = !(binding || pages || formats || materials);
    empty.hidden = count !== 0;
  }
  form.addEventListener('submit', (event) => event.preventDefault());
  form.addEventListener('change', update);
  form.addEventListener('reset', () => setTimeout(() => { update(); (form.elements.namedItem('binding') as HTMLElement).focus({ preventScroll: true }); }, 0));
  finder.querySelector('[data-menu-reset]')!.addEventListener('click', () => form.reset());
  update();
  form.hidden = false;
});

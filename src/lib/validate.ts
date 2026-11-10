/** Feldprüfung für beide geführten Formulare; Fehler stehen direkt am Feld (Port aus validation.js). */
import type { Lang } from './types';
import { t } from '../i18n/ui';
import { statusWord } from './status';

export function validatePanel(panel: Element, lang: Lang, focus = true): boolean {
  const e = t(lang).errors;
  let first: HTMLElement | null = null;
  for (const field of panel.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input,select,textarea')) {
    if (field.disabled || field.type === 'radio' || field.type === 'checkbox' || !field.id) continue;
    const id = field.id + '-error';
    let error = document.getElementById(id);
    const described = (field.getAttribute('aria-describedby') || '').split(' ').filter(Boolean);
    if (field.validity.valid) {
      field.removeAttribute('aria-invalid');
      error?.remove();
      const ids = described.filter((x) => x !== id);
      if (ids.length) field.setAttribute('aria-describedby', ids.join(' '));
      else field.removeAttribute('aria-describedby');
      continue;
    }
    field.setAttribute('aria-invalid', 'true');
    if (!error) {
      error = document.createElement('p');
      error.id = id;
      error.className = 'field-error';
      field.after(error);
    }
    // Design System: Fehlertext beginnt mit dem Statuswort, der Rahmen allein trägt keine Information.
    error.textContent = statusWord(lang, 'error') + ' ' + (field.validity.valueMissing ? e.missing : field.validity.typeMismatch ? e.email : e.range);
    field.setAttribute('aria-describedby', [...new Set(described.concat(id))].join(' '));
    first ||= field;
  }
  if (first) {
    const details = first.closest('details');
    if (details) details.open = true;
    if (focus) first.focus();
    return false;
  }
  return true;
}

export function clearErrors(root: Element) {
  root.querySelectorAll('[aria-invalid]').forEach((el) => el.removeAttribute('aria-invalid'));
  root.querySelectorAll('.field-error').forEach((el) => el.remove());
}

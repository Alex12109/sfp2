/**
 * Statusmeldung nach Regel E6 des SFP Design Systems: Statuswort + Text + Symbol.
 * Das Symbol zeichnet das CSS (forms.css) anhand von data-kind; Farbe unterstützt nur.
 */
import type { Lang } from './types';

export type StatusKind = 'success' | 'note' | 'error';
const words: Record<Lang, Record<StatusKind, string>> = {
  de: { success: 'Erfolg:', note: 'Hinweis:', error: 'Fehler:' },
  en: { success: 'Success:', note: 'Note:', error: 'Error:' },
};

export function setStatus(el: HTMLElement, lang: Lang, text: string, kind: StatusKind = 'note') {
  el.replaceChildren();
  if (!text) { delete el.dataset.kind; return; }
  el.dataset.kind = kind;
  const word = document.createElement('strong');
  word.textContent = words[lang][kind];
  const body = document.createElement('span');
  body.append(word, ' ', text);
  el.append(body);
}
export const statusWord = (lang: Lang, kind: StatusKind) => words[lang][kind];

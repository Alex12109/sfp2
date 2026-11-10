/**
 * Anfrage-Adapter.
 *
 * PUBLIC_ENQUIRY_MODE steuert das Verhalten (Standard: "live"):
 *   live  – ein Knopf „Anfrage senden“: POST (JSON) an PUBLIC_ENQUIRY_ENDPOINT (Standard /api/enquiry).
 *           Erfolg nur bei 200/202 mit `reference`. Schlägt der Versand fehl, bietet die Fehlermeldung
 *           einen E-Mail-Entwurf als Ausweg an.
 *   draft – früherer Bestandsweg: E-Mail-Entwurf, Kopie, Textdownload. Kein Versand.
 *   demo  – sichtbar als Demo gekennzeichneter Sendeknopf (Mock), kein Versand.
 *
 * Der Endpunkt selbst gehört nicht zum Frontend. Eine Referenz liegt in server/enquiry-worker.mjs
 * (Cloudflare Worker, Zustellung per E-Mail-API). Ohne gesetzten Endpunkt schlägt "live" bewusst fehl.
 *
 * Vertrag gemäß 06_RETURN_HANDOFF/enquiry-adapter.example.ts (Vorschlag).
 */
import type { Lang } from '../lib/types';
import type { Selection } from '../lib/enquiry-model';

export type EnquiryMode = 'draft' | 'demo' | 'live';
export const ENQUIRY_MODE: EnquiryMode = (['draft', 'demo', 'live'] as const).includes(import.meta.env.PUBLIC_ENQUIRY_MODE)
  ? import.meta.env.PUBLIC_ENQUIRY_MODE
  : 'live';

export interface EnquiryDraft {
  schemaVersion: 1;
  locale: Lang;
  items: Selection[];
  project: { scenario?: string; collection?: string; quantity?: string; delivery?: string; description: string };
  contact: { name: string; company?: string; email: string; phone?: string };
  /** Lesbare Textfassung des gesamten Projektbriefs (für die E-Mail an SFP). */
  brief?: string;
  /** Honeypot: bleibt bei Menschen leer. */
  website?: string;
}
export type EnquiryResult =
  | { mode: 'demo'; status: 'preview-only'; message: string }
  | { mode: 'live'; status: 'accepted'; reference: string }
  | { mode: 'live'; status: 'failed'; message: string; fieldErrors?: Record<string, string> };
export interface EnquiryService { submit(draft: EnquiryDraft): Promise<EnquiryResult> }

export const demoEnquiryService: EnquiryService = {
  async submit(draft) {
    return {
      mode: 'demo',
      status: 'preview-only',
      message: draft.locale === 'en' ? 'Demo: the enquiry has not been sent.' : 'Demo: Anfrage wurde nicht versendet.',
    };
  },
};

export const ENQUIRY_ENDPOINT: string = import.meta.env.PUBLIC_ENQUIRY_ENDPOINT || '/api/enquiry';

/** Echter Versand: ein 200/202 mit `reference` bedeutet Annahme durch den Endpunkt, alles andere ist ein Fehler. */
export function createLiveService(endpoint: string, fetchImpl: typeof fetch = fetch): EnquiryService {
  return {
    async submit(draft) {
      const en = draft.locale === 'en';
      const failed = (message: string, fieldErrors?: Record<string, string>): EnquiryResult => ({ mode: 'live', status: 'failed', message, fieldErrors });
      if (!endpoint) return failed(en ? 'No enquiry backend is connected yet.' : 'Es ist noch kein Anfrage-Backend verbunden.');
      try {
        const response = await fetchImpl(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(draft),
          signal: typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal ? AbortSignal.timeout(20000) : undefined,
        });
        const data: any = await response.json().catch(() => null);
        if ((response.status === 200 || response.status === 202) && typeof data?.reference === 'string' && data.reference)
          return { mode: 'live', status: 'accepted', reference: data.reference };
        return failed(
          typeof data?.message === 'string' && data.message ? data.message : en ? 'The enquiry could not be transmitted.' : 'Die Anfrage konnte nicht übertragen werden.',
          data?.fieldErrors && typeof data.fieldErrors === 'object' ? data.fieldErrors : undefined,
        );
      } catch {
        return failed(en ? 'The connection failed. Your enquiry has not been sent.' : 'Die Verbindung ist fehlgeschlagen. Ihre Anfrage wurde nicht gesendet.');
      }
    },
  };
}
export const liveEnquiryService: EnquiryService = createLiveService(ENQUIRY_ENDPOINT);

export const enquiryService: EnquiryService | null =
  ENQUIRY_MODE === 'demo' ? demoEnquiryService : ENQUIRY_MODE === 'live' ? liveEnquiryService : null;

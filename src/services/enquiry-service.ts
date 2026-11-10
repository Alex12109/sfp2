/**
 * Anfrage-Adapter. Es existiert noch KEIN produktiver Endpunkt.
 *
 * PUBLIC_ENQUIRY_MODE steuert das Verhalten (Standard: "draft"):
 *   draft – Bestandsweg: E-Mail-Entwurf, Kopie, Textdownload. Kein Versand.
 *   demo  – zusätzlich ein sichtbar als Demo gekennzeichneter Sendeknopf (Mock).
 *   live  – für Codex: echten Adapter in `liveEnquiryService` implementieren.
 *
 * Vertrag gemäß 06_RETURN_HANDOFF/enquiry-adapter.example.ts (Vorschlag).
 */
import type { Lang } from '../lib/types';
import type { Selection } from '../lib/enquiry-model';

export type EnquiryMode = 'draft' | 'demo' | 'live';
export const ENQUIRY_MODE: EnquiryMode = (['draft', 'demo', 'live'] as const).includes(import.meta.env.PUBLIC_ENQUIRY_MODE)
  ? import.meta.env.PUBLIC_ENQUIRY_MODE
  : 'draft';

export interface EnquiryDraft {
  schemaVersion: 1;
  locale: Lang;
  items: Selection[];
  project: { scenario?: string; collection?: string; quantity?: string; delivery?: string; description: string };
  contact: { name: string; company?: string; email: string; phone?: string };
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

/** Platzhalter: ein 200/202 muss echte Annahme bedeuten. Bis dahin schlägt "live" bewusst fehl. */
export const liveEnquiryService: EnquiryService = {
  async submit(draft) {
    return {
      mode: 'live',
      status: 'failed',
      message: draft.locale === 'en' ? 'No enquiry backend is connected yet.' : 'Es ist noch kein Anfrage-Backend verbunden.',
    };
  },
};

export const enquiryService: EnquiryService | null =
  ENQUIRY_MODE === 'demo' ? demoEnquiryService : ENQUIRY_MODE === 'live' ? liveEnquiryService : null;

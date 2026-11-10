/** Live-Versand: Frontend-Adapter und Referenz-Endpunkt gegeneinander, ohne echtes Netz. */
import { describe, expect, it } from 'vitest';
import { createLiveService, type EnquiryDraft } from '../src/services/enquiry-service';
// @ts-expect-error Referenz-Worker ist reines JavaScript
import { handleEnquiry } from '../server/enquiry-worker.mjs';

const env = { RESEND_API_KEY: 'test-key', ENQUIRY_TO: 'to@example.test', ENQUIRY_FROM: 'from@example.test', ALLOWED_ORIGINS: 'https://example.test' };
const draft = (over: Partial<EnquiryDraft> = {}): EnquiryDraft => ({
  schemaVersion: 1, locale: 'de', items: [{ product: 'menu-hamburg', values: { quantity: '40' } }],
  project: { description: 'Beispiel' }, contact: { name: 'Beispiel Person', email: 'person@example.test' }, brief: 'SFP Projektanfrage …', ...over,
});
/** Verbindet den Adapter direkt mit dem Worker; `mail` ersetzt den E-Mail-Dienst. */
function wire(mail: (url: string, init: any) => Promise<Response>, workerEnv: any = env) {
  const sent: any[] = [];
  const service = createLiveService('https://example.test/api/enquiry', (async (url: any, init: any) =>
    handleEnquiry(new Request(url, { ...init, headers: { ...init.headers, Origin: 'https://example.test' } }), workerEnv, async (u: string, i: any) => { sent.push(JSON.parse(i.body)); return mail(u, i); })) as any);
  return { service, sent };
}
const ok = async () => new Response('{"id":"x"}', { status: 200 });

describe('Live-Versand', () => {
  it('meldet Annahme nur mit Referenz, nachdem der E-Mail-Dienst angenommen hat', async () => {
    const { service, sent } = wire(ok);
    const result = await service.submit(draft());
    expect(result).toMatchObject({ mode: 'live', status: 'accepted' });
    expect((result as any).reference).toMatch(/^SFP-\d{8}-[0-9A-F]{8}$/);
    expect(sent).toHaveLength(1);
    expect(sent[0]).toMatchObject({ to: ['to@example.test'], from: 'from@example.test', reply_to: 'person@example.test' });
    expect(sent[0].text).toContain('SFP Projektanfrage');
  });
  it('meldet einen Fehler, wenn der E-Mail-Dienst ablehnt oder nicht erreichbar ist', async () => {
    expect((await wire(async () => new Response('no', { status: 500 })).service.submit(draft())).status).toBe('failed');
    expect((await wire(async () => { throw new Error('net'); }).service.submit(draft())).status).toBe('failed');
  });
  it('meldet einen Fehler ohne Zustellkonfiguration und ohne Endpunkt', async () => {
    expect((await wire(ok, { ALLOWED_ORIGINS: 'https://example.test' }).service.submit(draft())).status).toBe('failed');
    expect((await createLiveService('').submit(draft())).status).toBe('failed');
    expect((await createLiveService('https://x.test', (async () => { throw new Error('offline'); }) as any).submit(draft())).status).toBe('failed');
  });
  it('gibt Feldfehler zurück und stellt nichts zu', async () => {
    const { service, sent } = wire(ok);
    const result: any = await service.submit(draft({ contact: { name: '', email: 'keine-mail' } }));
    expect(result.status).toBe('failed');
    expect(Object.keys(result.fieldErrors)).toEqual(['name', 'email']);
    expect(sent).toHaveLength(0);
  });
  it('stellt bei gefülltem Honeypot nichts zu', async () => {
    const { service, sent } = wire(ok);
    await service.submit(draft({ website: 'http://spam.test' }));
    expect(sent).toHaveLength(0);
  });
  it('weist fremde Origins, falsche Methoden und zu große Anfragen ab', async () => {
    const post = (headers: any, body = JSON.stringify(draft())) => handleEnquiry(new Request('https://example.test/api/enquiry', { method: 'POST', headers, body }), env, ok);
    expect((await post({ 'Content-Type': 'application/json', Origin: 'https://fremd.test' })).status).toBe(403);
    expect((await post({ 'Content-Type': 'text/plain' })).status).toBe(415);
    expect((await post({ 'Content-Type': 'application/json' }, 'x'.repeat(70000))).status).toBe(413);
    expect((await handleEnquiry(new Request('https://example.test/api/enquiry'), env, ok)).status).toBe(405);
  });
  it('eine 200-Antwort ohne Referenz gilt nicht als Annahme', async () => {
    const service = createLiveService('https://x.test', (async () => new Response('{}', { status: 200 })) as any);
    expect((await service.submit(draft())).status).toBe('failed');
  });
});

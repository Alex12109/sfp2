/**
 * Referenz-Endpunkt für den Live-Versand der Projektanfrage (Cloudflare Worker, ES-Modul).
 *
 * STATUS: Vorlage. Die Prüf- und Antwortlogik ist getestet (tests/enquiry-worker.test.ts),
 * die Zustellung über einen echten E-Mail-Dienst wurde NICHT ausgeführt und ist nicht bestätigt.
 *
 * Erwartet POST JSON gemäß EnquiryDraft (src/services/enquiry-service.ts).
 * Antwort 202 { reference } nur, wenn der E-Mail-Dienst die Nachricht angenommen hat.
 *
 * Laufzeitkonfiguration (Secrets/Variablen des Workers, nie im Repository):
 *   RESEND_API_KEY   API-Schlüssel des E-Mail-Dienstes (Vorlage nutzt die REST-API von Resend)
 *   ENQUIRY_TO       Empfänger, z. B. mail@sfp-berlin.com
 *   ENQUIRY_FROM     verifizierter Absender, z. B. "SFP Website <anfrage@sfp-berlin.com>"
 *   ALLOWED_ORIGINS  kommagetrennte erlaubte Origins, z. B. https://sfp-berlin.com
 */
const MAX_BYTES = 64 * 1024;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const text = (v, max = 4000) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

function cors(request, env) {
  const origin = request.headers.get('Origin') || '';
  const allowed = String(env.ALLOWED_ORIGINS || '').split(',').map((o) => o.trim()).filter(Boolean);
  const ok = !origin || allowed.includes(origin);
  return { ok, headers: { ...(origin && ok ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' } : {}), 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Accept' } };
}
const json = (status, body, headers = {}) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers } });

export function reference(now = new Date(), random = crypto.getRandomValues(new Uint8Array(4))) {
  const day = now.toISOString().slice(0, 10).replace(/-/g, '');
  return `SFP-${day}-${[...random].map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase()}`;
}

export async function handleEnquiry(request, env, fetchImpl = fetch) {
  const { ok, headers } = cors(request, env);
  if (request.method === 'OPTIONS') return new Response(null, { status: ok ? 204 : 403, headers });
  if (!ok) return json(403, { message: 'Origin not allowed.' }, headers);
  if (request.method !== 'POST') return json(405, { message: 'Method not allowed.' }, { ...headers, Allow: 'POST, OPTIONS' });
  if (!String(request.headers.get('Content-Type') || '').includes('application/json')) return json(415, { message: 'JSON expected.' }, headers);

  const raw = await request.text();
  if (raw.length > MAX_BYTES) return json(413, { message: 'Enquiry too large.' }, headers);
  let draft;
  try { draft = JSON.parse(raw); } catch { return json(400, { message: 'Invalid JSON.' }, headers); }
  if (!draft || draft.schemaVersion !== 1) return json(400, { message: 'Unsupported schema.' }, headers);

  const en = draft.locale === 'en';
  const contact = draft.contact || {};
  const project = draft.project || {};
  const items = Array.isArray(draft.items) ? draft.items.slice(0, 100) : [];
  const fieldErrors = {};
  if (!text(contact.name, 200)) fieldErrors.name = en ? 'Please enter your name.' : 'Bitte nennen Sie Ihren Namen.';
  if (!EMAIL.test(text(contact.email, 320))) fieldErrors.email = en ? 'Please enter a valid email address.' : 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
  if (!text(project.description) && !items.length) fieldErrors.description = en ? 'Please describe your project or select accessories.' : 'Bitte beschreiben Sie Ihr Projekt oder wählen Sie Artikel aus.';
  if (Object.keys(fieldErrors).length) return json(422, { message: en ? 'Please check your details.' : 'Bitte prüfen Sie Ihre Angaben.', fieldErrors }, headers);

  const ref = reference();
  // Honeypot gefüllt: nichts zustellen, aber auch keinen Hinweis geben.
  if (text(draft.website, 200)) return json(202, { reference: ref }, headers);

  if (!env.RESEND_API_KEY || !env.ENQUIRY_TO || !env.ENQUIRY_FROM) return json(503, { message: en ? 'Delivery is not configured.' : 'Die Zustellung ist nicht eingerichtet.' }, headers);

  const body = text(draft.brief, 60000) || JSON.stringify({ project, contact, items }, null, 2);
  let delivery;
  try {
    delivery = await fetchImpl('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: env.ENQUIRY_FROM,
        to: [env.ENQUIRY_TO],
        reply_to: text(contact.email, 320),
        subject: `${en ? 'Project enquiry' : 'Projektanfrage'} ${ref} – ${text(contact.company, 120) || text(contact.name, 120)}`,
        text: `${en ? 'Reference' : 'Referenz'}: ${ref}\n\n${body}`,
      }),
    });
  } catch {
    return json(502, { message: en ? 'The mail service could not be reached.' : 'Der E-Mail-Dienst ist nicht erreichbar.' }, headers);
  }
  if (!delivery.ok) return json(502, { message: en ? 'The mail service rejected the message.' : 'Der E-Mail-Dienst hat die Nachricht abgelehnt.' }, headers);
  return json(202, { reference: ref }, headers);
}

export default { fetch: (request, env) => handleEnquiry(request, env) };

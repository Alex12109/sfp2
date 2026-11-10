# Anfragen tatsächlich absenden – Optionen

Stand: Das Frontend sendet standardmäßig an `/api/enquiry`, es fehlt der Empfänger. Bis dahin sehen Nutzer eine Fehlermeldung mit E-Mail-Ausweg. Offen ist nur, **wohin** gesendet wird.
Alle Varianten nutzen denselben Adapter (`src/services/enquiry-service.ts`) und dieselbe Nutzlast (`EnquiryDraft`).

| | Variante | Aufwand | Daten liegen bei | Eignung |
|---|---|---|---|---|
| A | **Eigener Endpunkt auf dem bestehenden Hosting** (Cloudflare Worker) + E-Mail-API (z. B. Resend, Postmark, Brevo, Mailjet) | mittel: Worker deployen, Absenderdomain verifizieren (SPF/DKIM), 4 Variablen setzen | SFP + E-Mail-Dienst | Empfehlung. Volle Kontrolle, eine Vorlage liegt in `server/enquiry-worker.mjs`. |
| B | **Formulardienst** (z. B. Formspree, Basin, Web3Forms, Getform) | gering: Konto anlegen, Endpunkt-URL eintragen; ggf. kleiner Adapter für deren Feldformat | Dienstleister (oft USA) | schnellster Weg; AV-Vertrag und Drittlandtransfer prüfen |
| C | **CRM-Formular** (z. B. HubSpot Forms API, Pipedrive Web Forms) | mittel: Felder abbilden, Adapter schreiben | CRM-Anbieter | sinnvoll, wenn Anfragen ohnehin im CRM landen sollen |
| D | **Eigener Server / SMTP** (PHP- oder Node-Skript beim Webhoster) | mittel bis hoch, eigener Betrieb | SFP | nur, wenn ohnehin ein Server betrieben wird |
| E | **E-Mail-Entwurf wie bisher** (`draft`) | keiner | Nutzer | als eigener Modus weiter vorhanden; im Sendemodus nur noch Ausweg im Fehlerfall |

## Was jede Variante braucht
1. **Zustellbarkeit:** verifizierte Absenderadresse der eigenen Domain; Antwortadresse = Anfragende Person.
2. **Spamschutz:** Honeypot ist eingebaut. Bei Bedarf zusätzlich Ratenbegrenzung oder Cloudflare Turnstile.
3. **Datenschutz:** Hinweistext am Sendeknopf prüfen, Datenschutzerklärung um Dienst und Zweck ergänzen, AV-Vertrag mit dem Dienstleister.
4. **Bestätigung an die anfragende Person** (optional): zweite E-Mail aus dem Endpunkt.
5. **Dateianhänge** (optional, derzeit nicht vorhanden): brauchen Speicher (z. B. R2) und eine Größen-/Typprüfung.
6. **Test mit echten Postfächern**, bevor `live` öffentlich geschaltet wird.

## Was geprüft ist und was nicht
Geprüft: Adapter und Vorlage gegeneinander (Annahme nur mit Referenz, Ablehnung des Maildienstes, fehlende Konfiguration,
Feldfehler, Honeypot, fremde Origin, Methode, Größe) und der Ablauf im Browser gegen einen simulierten Endpunkt
(`tests/enquiry-send.test.ts`, `tests/e2e/enquiry-flow.cjs`).
Nicht geprüft: Deployment des Workers, die Schnittstelle des E-Mail-Dienstes im Echtbetrieb, tatsächliche Zustellung.

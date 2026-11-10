# Handoff to Codex — SFP Frontend

## Stand
Datum: 10. November 2026
Projekt-/Exportname: sfp-frontend (Repository `sfp2`, Branch `claude/frontend-aesthetics-q2dfpi`)
Ausgangspaket: SFP_Claude_Design_Handoff_2026-11-10 / Sites v31
Framework / Version: Astro 7.4.8 (Vite 8.3.7), TypeScript 7.0.2, statischer Build, kein UI-Framework zur Laufzeit
Paketmanager / Version: npm 10.9 (Lockfile: `package-lock.json`)
Benötigte Laufzeit: keine. `dist/` ist reines HTML/CSS/JS. Build braucht Node ≥ 20.3.

Warum Astro statt React-SPA: Das Briefing zieht vorgerendertes HTML für Inhaltsseiten vor, und die Bestandssite ist
statisches HTML mit Vanilla-JS. Astro erzeugt genau das (218 HTML-Dateien, direkter Aufruf jeder Tiefe funktioniert),
nutzt Vite und TypeScript und braucht keinen Adapter. Die Interaktionen sind schlanke TypeScript-Module.

## Start und Build
Installationsbefehl: `npm ci`
Entwicklungsstart: `npm run dev`
Build: `npm run build`
Ausgabeverzeichnis: `dist/`
Erforderliche Umgebungsvariablen (nur Namen; keine Werte/Secrets): `PUBLIC_ENQUIRY_MODE` (optional; draft | demo | live, Standard draft)

## Umsetzung
Ausgearbeitete Routen: Alle 218 Inhaltsrouten werden mit echtem Inhalt gebaut. Einzeln im Browser gesichtet wurden 15
(Start DE/EN, Katalog, Modell „Speisekarte Hamburg“, Produktfamilie Speisekarten, Projektplaner DE/EN, Kontakt, Materialien,
Prozess, Kollektionen, Unternehmen, Leistungen, Projekt BMW Group Classic, ein Journalbeitrag). Eigene Templates haben:
Startseite, Katalog, Modellseite (45 je Sprache), Projektplaner, Kontakt/Projektbrief, Materialien (Materialstudie), 404.
Nur als Template vorhandene Routen: die übrigen 203 Routen. Sie entstehen aus denselben Bausteinen und denselben Daten,
wurden automatisch geprüft (Links, Anker, Bilder, genau eine H1, Sprachpendant; Überlauf je Template), aber nicht einzeln
gesichtet. Status je Route: `ROUTE_MAP.csv`.
Noch fehlende Routen: keine der 218. Die 28 Alias-HTML-Dateien des Bestands werden nicht als HTML erzeugt; stattdessen liegt
die Regeldatei `public/_redirects` (40 Regeln, unverändert) bei.
Veränderte URLs und Redirect-Bedarf: keine URL geändert. Neu sind nur `/data/catalog.de.json`, `/data/catalog.en.json`
und der Anker `#konfigurator` auf Modellseiten. `?item=`, `?product=`, `?model=`, `#selection=1`, `#selection-data=`,
`?topic=` funktionieren wie im Bestand; neu ist `?edit=N` im Projektplaner.
Zentrale Komponenten: siehe `docs/DESIGN_SYSTEM.md` (Bausteine, Zustände, Zuordnung alt → neu in `src/components/Block.astro`).
Design-Tokens / Fontdateien: `src/styles/tokens.css`; `public/brand/fonts/Montserrat.woff2`, `Newsreader.woff2` (+ OFL-Texte).

## Inhalte und Bilder
Ort der Texte und Produktdaten: `content/pages/{de,en}/*.json`, `content/site/navigation.*.json`,
`content/catalog/planner-catalog.*.json` (unverändert), Bedientexte in `src/i18n/ui.ts`.
Redaktionelle Änderungen: Kein Inhaltstext wurde umgeschrieben. Neue Bedientexte und strukturelle Abweichungen: `CONTENT_CHANGES.md`.
Bildersetzungen / neue Assets / jeweilige Herkunft: keine neuen Bilder, keine Bearbeitung. Dateinamen unverändert unter
`/assets/`. Logos und Schriften aus `04_BRAND`. Alte Wortmarke, alte Schriften und alte Favicons werden nicht verwendet. Details: `ASSET_USAGE.csv`.
Offene Angaben: Favicon (siehe Known Issues), sichtbare Kennzeichnung inszenierter Motive, Domain/Canonical, Rechtstexte.

## Verhalten und Backend
Tatsächlich funktionierende Interaktionen: Navigation mit vier Bereichen (Klick/Enter, Escape, Fokus, aktiver Pfad), Mobilmenü,
DE/EN-Pendant je Seite, Katalogsuche und Bereichsfilter, Speisekartenfilter (Bindung, Seiten, Format, Material), Bildfolgen,
Projekt- und Szenenumschalter, Materialstudie (Farbwelten, Prägung), Konfigurator (45 Artikel, Formate, Sondermaß, Material als
Musterkacheln, Farbvorschläge, Naht, abhängige Optionen), Auswahl (hinzufügen, bearbeiten, duplizieren, entfernen),
Sitzungsspeicher, dreistufiger Projektbrief mit Feldfehlern, Vorschau, Kopie, Textdownload, `mailto:`-Entwurf, bestätigtes Zurücksetzen.
Mock-Funktionen und sichtbare Demo-Zustände: nur bei `PUBLIC_ENQUIRY_MODE=demo`: Hinweis „Demo-Modus“ und Knopf
„Senden (Demo – ohne Versand)“, Ergebnis „Demo: Anfrage wurde nicht versendet.“ Im Standard gibt es keinen Sendeknopf.
Geplanter Service-Adapter und Payload: `src/services/enquiry-service.ts`, Typen wie im Vorschlag
`06_RETURN_HANDOFF/enquiry-adapter.example.ts` (`EnquiryDraft`, `EnquiryResult`). `liveEnquiryService` ist ein Platzhalter, der fehlschlägt.
Sitzungsspeicher / Entwurfsmigration: unveränderte Schlüssel `sfp-enquiry-v9`, `sfp-enquiry-transfer-v9`,
`sfp-contact-draft-v31`; gleiche Normalisierung wie der Bestand (alte Produkt-IDs, Legacy-Formate, Legacy-Brieftext).
Bestehende Entwürfe bleiben lesbar. Blockierter Speicher führt zu einem Hinweis, nicht zu einem Fehler.
Noch anzubindende Services: Anfrageannahme/Zustellung, ggf. Uploads, CMS/Produktpflege, CRM.

## Prüfung
Build: `npm run build`, 10.11.2026, erfolgreich (219 Seiten inkl. 404, 2 JSON-Endpunkte).
`npm test`: 19/19 bestanden (Katalog-IDs DE=EN, alle Formate aller 45 Artikel, alle 59 abhängigen Optionen, Sondermaß, Naht, Legacy-Daten, Entwurf, Brief).
`npm run check:dist`: 218 Routen, 13.884 lokale Links, 2.994 Bilder, keine Probleme.
Breiten / Browser: Chromium (Playwright, headless). Überlauf gemessen bei 320, 390, 768, 1440 px auf 43 Routen
(je Template und Sprache zwei, plus 404): 172 Ansichten, 0 mit Überlauf, 0 Skriptfehler.
Navigation / Tastatur: Enter öffnet, Escape schließt und setzt Fokus zurück (automatisiert geprüft). Tab-Reihenfolge nicht systematisch durchgegangen.
DE/EN und direkte Routenaufrufe: alle 218 Routen als eigene `index.html`; Sprachpendant je Seite geprüft.
Konfigurator / abhängige Optionen: Unit-Tests plus Browserlauf (`tests/e2e/enquiry-flow.cjs`, 13/13 Schritte).
Anfrage / Fehler / Leerzustand: im Browserlauf geprüft (ungültige Menge, Pflichtfelder, ungültige E-Mail, leere Suche, Zurücksetzen, Sprachwechsel mit Freitext).
Bekannte Fehler: keine bekannten Funktionsfehler; Einschränkungen in `KNOWN_ISSUES.md`.
Nicht geprüft: Firefox, Safari, echte Mobilgeräte, Screenreader, Kontrastmessung aller Kombinationen, `mailto:` in echten
E-Mail-Programmen, Zwischenablage ohne HTTPS, Druck, Ladezeiten, Wirkung von `_redirects` auf dem Zielhosting,
203 Routen im Einzelbild, die bestehende Sites-Integration selbst.

## Hinweise für die Übernahme
Bestehende SFP-Site weiterverwenden. Hostingkonfiguration und Geheimnisse verwaltet Codex.
- `dist/` kann direkt als statische Ausgabe dienen. `noindex, nofollow` ist wie im Bestand gesetzt (`src/layouts/Base.astro`).
- `canonical` und `hreflang` sind relative Pfade, weil die Zieldomain nicht feststeht. Vor Indexierung absolut setzen (`site` in `astro.config.mjs`).
- Wer das Python-Bausystem behalten will: `content/pages/*.json` ist layoutneutral und lässt sich von dort ebenso rendern; CSS und Skripte sind frameworkunabhängig.
Weitere Entscheidungen von Alex: siehe Abschnitt „Entscheidungen“ in `KNOWN_ISSUES.md`.

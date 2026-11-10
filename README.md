# SFP Hospitality – Frontend (Old Copper)

Statisches, zweisprachiges Frontend für die neue SFP-Website. Grundlage ist das Übergabepaket
`SFP_Claude_Design_Handoff_2026-11-10` (Sites v31) und das Corporate Design „SFP // Old Copper“, Final 1.2.

Dies ist ein Frontend-Entwurf mit vollständigem Inhaltsbestand, **keine fertige Integration**:
Es gibt kein Backend, keinen Versand und keine Veröffentlichung. Stand und offene Punkte stehen in
`HANDOFF_TO_CODEX.md`, `KNOWN_ISSUES.md` und `STATE_CHECKLIST.md`.

## Voraussetzungen

- Node.js ≥ 20.3 (entwickelt mit 22.23), npm ≥ 10
- Kein Server im Betrieb nötig: der Build erzeugt statische Dateien in `dist/`

## Befehle

| Zweck | Befehl |
|---|---|
| Abhängigkeiten installieren | `npm ci` |
| Entwicklung (http://localhost:4321) | `npm run dev` |
| Statischer Build nach `dist/` | `npm run build` |
| Build lokal ansehen | `npm run preview` |
| Regeln des Konfigurators testen | `npm test` |
| Build prüfen (Routen, Links, Bilder, H1) | `npm run check:dist` |

Optional, mit vorhandenem Playwright und laufendem `npm run preview`:
`node tests/e2e/enquiry-flow.cjs` (kompletter Anfrageweg), `node tests/e2e/overflow.cjs`
(Überlauf bei 320/390/768/1440 px), `node tests/e2e/screenshots.cjs`.

## Aufbau

```
content/              Inhalte, getrennt vom Layout (aus dem Übergabepaket importiert)
  pages/{de,en}/*.json    218 Seiten als strukturierte Abschnitte (Text, Bilder, Links)
  routes.json             alle Routen mit Sprachpendant und Template
  catalog/                Planerdaten, unverändert (stabile Produkt-/Options-IDs)
  site/                   Navigation und Footer je Sprache
public/
  assets/                 Bilder und Kundenlogos, Dateinamen wie im Bestand (/assets/DATEI)
  brand/                  Old-Copper-Logos (SVG-Pfade) und Schriften mit OFL-Lizenzen
  _redirects              40 Alias-Regeln des Bestands (unverändert)
src/
  styles/tokens.css       Design-Tokens (Farben, Schrift, Raum, Bewegung)
  styles/*.css            Grundlagen, Kopf/Fuß, Bausteine, Formulare
  layouts/Base.astro      HTML-Gerüst, Meta, Sprache, hreflang
  components/             Bausteine (Hero, Split, CardGrid, Configurator, ContactForm …)
  pages/[...path].astro   erzeugt alle Inhaltsrouten aus content/routes.json
  pages/data/…json.ts     Katalogdaten für den Browser (/data/catalog.{de,en}.json)
  lib/enquiry-model.ts    Regeln für Auswahl und Projektbrief (ohne DOM, getestet)
  services/enquiry-service.ts   Anfrage-Adapter mit Feature-Flag (draft | demo | live)
  styles/motion.css       Bewegung, Mouseover- und Scroll-Effekte
  scripts/                Verhalten im Browser (Navigation, Konfigurator, Anfrage, Filter)
  i18n/ui.ts              Bedientexte DE/EN
server/               Referenz-Endpunkt für den Live-Versand (nicht Teil des Builds)
scripts/              Import, Build-Prüfung, Tabellen für die Übergabe
tests/                Unit-Tests (Vitest) und optionale Browser-Prüfungen
screenshots/          Orientierung Desktop/Mobil – maßgeblich ist der Code
docs/                 Designsystem, Komponenten und Zustände, Brand-Referenz
```

## Inhalte neu importieren

```
node scripts/import-content.mjs /pfad/zu/SFP_Claude_Design_Handoff_2026-11-10
```

Das Skript liest die drei entpackten ZIP-Teile (gemeinsamer Ordner), entfernt das alte Layout-Markup,
verändert keine Texte und kopiert nur referenzierte Originaldateien. Danach `npm run build`.

## Anfrageweg

Standard ist `PUBLIC_ENQUIRY_MODE=draft`: Die Seite versendet nichts. Sie erstellt einen E-Mail-Entwurf
(`mailto:`), eine Kopie oder einen Textdownload – wie der Bestand. `demo` blendet zusätzlich einen als Demo
gekennzeichneten Sendeknopf ein, der nur den Mock aus `src/services/enquiry-service.ts` aufruft.

`live` sendet den Projektbrief per `POST` (JSON) an `PUBLIC_ENQUIRY_ENDPOINT`:

```
PUBLIC_ENQUIRY_MODE=live PUBLIC_ENQUIRY_ENDPOINT=/api/enquiry npm run build
```

Dann erscheinen Einwilligung und „Anfrage senden“. Eine Bestätigung zeigt die Seite nur, wenn der Endpunkt mit
200/202 und einer `reference` antwortet; jeder andere Fall ist eine Fehlermeldung, der E-Mail-Entwurf bleibt als Ausweg.
Der Endpunkt gehört nicht zum Frontend. `server/enquiry-worker.mjs` ist eine Referenz für einen Cloudflare Worker
(Prüfung, Honeypot, Origin-Liste, Zustellung über eine E-Mail-API). Seine Logik ist getestet, eine echte Zustellung nicht.
Ohne gesetzten Endpunkt schlägt `live` bewusst fehl. Die Optionen stehen in `docs/ENQUIRY_DELIVERY.md`.

## Lizenzen

Montserrat und Newsreader: SIL Open Font License (Texte in `public/brand/fonts/`). Bilder, Kundenlogos und
Texte stammen aus dem Übergabepaket; dieses Projekt erteilt keine neue Rechtefreigabe.

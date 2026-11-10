# Zustands- und Prüfliste

Stand 10.11.2026. „gemessen“ = automatisiert geprüft, „gesichtet“ = im Screenshot beurteilt, „offen“ = nicht geprüft.

## Zustände je Bereich
| Bereich | Zustand | Wo | Status |
|---|---|---|---|
| Navigation | geschlossen / Bereich offen (Klick, Enter) | Kopfzeile, alle Seiten | gemessen + gesichtet |
| Navigation | Escape schließt, Fokus zurück auf Auslöser | `src/scripts/site.ts` | gemessen |
| Navigation | aktiver Bereich (Copper-Unterstrich), aktuelle Seite (`aria-current`) | Kopfzeile | gesichtet |
| Navigation | Mobilmenü offen/geschlossen, Bereiche als Akkordeon | < 1100 px | gesichtet (390 px) |
| Navigation | sichtbarer Fokus | global `:focus-visible`, 3 px | Regel vorhanden, nicht einzeln gesichtet |
| Sprache | DE/EN-Pendant je Seite, aktuelle Sprache markiert | Kopfzeile | gemessen (218 Routen) |
| Katalog | Treffer, Bereichsfilter, keine Treffer, Zurücksetzen | `/produkte/` | gemessen |
| Speisekarten | Filter Bindung/Seiten/Format/Material, Zähler, Leerzustand | `/produkte/speisekarten/` | gemessen (Filter + Zähler), Leerzustand nicht gesichtet |
| Konfigurator | Vorauswahl über `?item=`, `?product=`, `?model=` | Projektplaner | Logik portiert, `?item=` nicht eigens gemessen |
| Konfigurator | Sondermaß ein/aus; normales Format löscht Sondermaße | Planer, Modellseite | gemessen |
| Konfigurator | abhängige Optionen (59 Fälle), entfernte Werte | Planer, Modellseite | gemessen (alle 59 je Sprache) |
| Konfigurator | ungültige Menge, Fehler am Feld | Planer, Modellseite | gemessen |
| Konfigurator | Material gewählt / nicht entschieden, Farbvorschläge | Musterkacheln | gesichtet; Farbvorschläge nicht gemessen |
| Konfigurator | Suche ohne Treffer | Planer | gemessen |
| Konfigurator | Katalogdaten laden / Ladefehler | Planer, Modellseite | Ladefehler nicht gemessen |
| Auswahl | leer, ein Artikel, mehrere, bearbeiten, duplizieren, entfernen | Planer | gemessen + gesichtet |
| Auswahl | Zähler in der Kopfzeile | alle Seiten | gemessen |
| Entwurf | Sitzungsspeicher, alter Entwurf, alte Produkt-IDs, Legacy-Formate | `enquiry-model.ts` | gemessen (Unit-Tests) |
| Entwurf | Speicher nicht verfügbar → Hinweis | Planer, Kontakt | Code vorhanden, **nicht gemessen** |
| Entwurf | Sprachwechsel erhält Auswahl, Freitext, Schritt | Kontakt | gemessen |
| Entwurf | bestätigtes Zurücksetzen | Kontakt | gemessen |
| Projektbrief | Schritte 1–3, Zurück/Weiter, Fortschritt | Kontakt | gemessen + gesichtet |
| Projektbrief | Pflichtfeld leer, E-Mail ungültig | Kontakt | gemessen |
| Projektbrief | Vorschau, genau ein Knopf „Anfrage senden“ | Kontakt | gemessen |
| Projektbrief | Versand fehlgeschlagen: Fehlermeldung, `mailto:`-Ausweg mit vollständigem Text, keine Bestätigung | Kontakt | gemessen (simulierter Endpunkt) |
| Projektbrief | Versand angenommen: Referenz, Knopf gesperrt, Payload vollständig | Kontakt | gemessen (simulierter Endpunkt); echte Zustellung **offen** |
| Projektbrief | Kopieren, Download | nur `PUBLIC_ENQUIRY_MODE=draft` | Code vorhanden, **nicht gemessen** |
| Materialstudie | Flor streichen, Text prägen, Lederfarbe, Folie, Zurücksetzen | `/materialien/` | mit Maus gesichtet und Canvas gemessen; Touch und Tastatur offen |
| Projektbrief | Demo-Modus sichtbar gekennzeichnet | `PUBLIC_ENQUIRY_MODE=demo` | **nicht gemessen** |
| Bewegung | Seitenaufbau, Einblenden, Hover, Scroll-Effekte | `motion.css` | gesichtet in Chromium (Zwischenzustände); andere Browser offen |
| Ohne JavaScript | Inhalte sichtbar, Formulare zeigen Hinweis mit E-Mail-Adresse | alle Seiten | nicht gemessen |
| Reduzierte Bewegung | Animationen und Einblendungen aus | global | Screenshots laufen in diesem Modus; sonst nicht gemessen |

## Gemessen
| Prüfung | Befehl | Ergebnis |
|---|---|---|
| Build | `npm run build` | 219 Seiten + 2 JSON, ohne Fehler |
| Regeln und Live-Adapter | `npm test` | 26/26 |
| Build-Integrität | `npm run check:dist` | 218 Routen, 13.884 Links, 2.994 Bilder, 0 Probleme |
| Anfrageweg im Browser inkl. Versand (simulierter Endpunkt) | `node tests/e2e/enquiry-flow.cjs` | 15/15 Schritte, 0 Skriptfehler |
| Überlauf 320/390/768/1440 | `node tests/e2e/overflow.cjs` | 172 Ansichten (43 Routen), 0 Überlauf |
| Textabgleich mit Bestand | einmalig beim Import | 9.692 Textknoten, 32 fehlend (nur Bedienelemente) |

## Offen
Firefox, Safari, echte Geräte, Screenreader, vollständige Tastaturreise, Kontrastmessung, Druck, Ladezeit/Core Web Vitals,
`mailto:` in E-Mail-Programmen, Verhalten von `_redirects`, Einzelansicht von 203 Routen.

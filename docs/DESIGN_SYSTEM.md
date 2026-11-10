# Designsystem „Musterbuch“ (SFP // Old Copper 1.2)

## Grundlage
Verbindlich ist das SFP Design System „SFP Old Copper – Corporate Design 1.2“ (Claude-Artifact, identisch mit `04_BRAND`
des Übergabepakets). Dieses Frontend übernimmt dessen Tokens und Komponentenregeln und ergänzt nur, was eine Website
zusätzlich braucht. Übernommen und im Code nachprüfbar:

| Regel des Design Systems | Umsetzung |
|---|---|
| Sieben feste Farben, semantische Tokens (`sfp-surface`, `sfp-text`, `sfp-link`, `sfp-button-bg` …) | `src/styles/tokens.css`, gleiche Namen (`--sfp-paper` = Ivory) |
| Keine Verläufe, Glows, Schatten, Rundungen | keine `border-radius`, keine Verläufe, keine Schlagschatten im CSS; Linien statt Schatten |
| Newsreader 400 (H1) und 600 (H2), Zeilenabstand 1,12 | `h1` 400, `h2` 600, `line-height: 1.12`; H1 = `clamp(2.25rem, 5vw, 4rem)` |
| Montserrat 400/600, 1–1,125 rem, Zeilenabstand 1,5 | `--sfp-body`, `line-height: 1.5` |
| Button: Forest, Ivory-Text, 2-px-Rahmen, 600 / 1 rem, Hover Charcoal, deaktiviert Sand, auf Dunkel Ivory-Rahmen | `.btn` |
| Feld: sichtbares Label, Charcoal-Haarlinie, Fehler mit 2-px-Bronze-Rahmen und Text „Fehler: …“ | `.field`, `src/lib/validate.ts` |
| Status (E6): Statuswort + Text + gezeichnetes Symbol auf Ivory, Forest- bzw. Bronze-Rahmen | `.status`, `src/lib/status.ts` |
| Fokus 3 px in Textfarbe, 4 px Abstand; Ziele mindestens 44 px | `:focus-visible`, `--sfp-touch-min` |
| Links unterstrichen, Hover 3 px | `a:hover`, `.link:hover` |
| Copper nur dekorativ und nur auf Ivory, Forest, Charcoal; Bronze nur auf Ivory ab 24 px | `.tone-parchment`/`.tone-sand` setzen Akzent auf Forest; Bronze nur in H1/H2-Hervorhebung auf Ivory |
| Logo als fertige Datei, Schutzraum unangetastet, 08 für Kopfzeilen | Header 08 Charcoal, Footer 06 hell, keine negativen Ränder |

**Stand 10.11.2026: Verläufe, Schatten, Glows und Rundungen sind im Design System ausdrücklich erlaubt und gewünscht**
(Entscheidung Alex). Die Zeilen „Keine Verläufe, Glows, Schatten, Rundungen“ und „Copper nur auf Ivory, Forest,
Charcoal“ der Tabelle sind damit aufgehoben; die Logos selbst bleiben ohne Effekte. `src/styles/luxe.css`
legt darüber: runde Schaltflächen mit Verlauf, Lichtkante und Schein, weiche Schatten, abgerundete Bilder und Flächen,
Kupferschein (Glow) an aktiven Elementen. Große Flächen sind einfarbig; großflächige Verläufe, Lichtflecken und
Verlaufsschrift wurden wieder entfernt, weil sie in Chrome unter Windows streifig wirkten. Unverändert bleiben Farben, Schriften, Schriftgewichte, Logo-Regeln, Fokus und Mindestgrößen.

Weitere Ergänzungen: Schnittmarken, Maßband, Abschnittsnummern, eine Display-Schriftstufe über H1
(bis 5,5 rem), fluide Abstände, Bewegung (`motion.css`), Wildleder-Studie (`scripts/suede.ts`).

## Idee
Die Site liest sich wie ein Musterbuch aus dem Atelier: ruhige Ivory-Fläche, große Newsreader-Zeilen, Forest als
Struktur, Copper nur als Markierung. Zwei Motive stammen aus dem Zuschnitt: **Schnittmarken** an den Ecken wichtiger
Bilder (`.frame`) und ein **Maßband** als Abschluss des Seitenkopfs (`.ruler`).

### Feinschliff vom 10.11.2026
Geprüft gegen die Kriterien der Skills `frontend-design` und `design-critique` sowie gegen die öffentliche
Regelliste von Impeccable (dessen Prüfprogramm durfte in der Sitzung nicht ausgeführt werden; die Regeln wurden als
Text gelesen und von Hand angewendet). Geändert:

| Befund | Änderung |
|---|---|
| Abschnittsnummern „N° 01“ an Inhalten, die keine Abfolge sind | entfernt; Ziffern nur noch an Prozessschritten und den Schritten des Projektbriefs |
| Gesperrte Versalien-Labels und Zeilen über Überschriften (Eyebrows) | entfernt bzw. in normale Schreibweise gesetzt |
| Einzelwort in Überschriften farbig hervorgehoben | entfällt; Überschriften tragen ihr Gewicht selbst |
| Einblendung an jedem Abschnitt | entfernt; ein einziger inszenierter Moment beim Seitenaufbau |
| Gleichförmige Kästen mit Schatten für Textspalten | wieder Linien-Spalten; Schatten nur für Flächen, die über der Seite liegen (Menü, Formular, Auswahl, Kopfbild) |
| Eine Rundung für alles | abgestuft: 4 px Bilder und Felder, 16 px schwebende Flächen, voll rund nur Schaltflächen und Chips |
| Pfeil an jedem Link | nur noch an der Hauptaktion |
| Farbige Seitenkante an Hinweisen, Schriftzeichen als Symbole | entfernt bzw. durch gezeichnete Symbole ersetzt |
| Platzhaltertext 4,1:1 auf Ivory (gerechnet) | auf rund 5,6:1 angehoben |
| Copper auf Parchment (Guide) | dort wieder Forest |

Die eine auffällige Stelle ist die Schaltfläche (Verlauf, Lichtkante, Kupferschein). Alles andere bleibt ruhig.

## Tokens (`src/styles/tokens.css`)
| Rolle | Token | Wert |
|---|---|---|
| Hauptfläche | `--sfp-ivory` | #F5F1E9 |
| Alternative Flächen | `--sfp-parchment`, `--sfp-sand` | #EEE3D4, #D6C8B6 |
| Struktur, Schaltflächen, dunkle Fläche | `--sfp-forest` | #253F3B |
| Text, Fußzeile | `--sfp-charcoal` | #252725 |
| Akzent (Linien, Marken, große Ziffern) | `--sfp-copper` | #B77550 |
| Tiefer Akzent (nur H1/H2-Hervorhebung, Fehlerrahmen) | `--sfp-bronze` | #80563D |
| Überschriften | `--font-display` | Newsreader 400 (H1, H3) und 600 (H2) |
| Text, Navigation, Bedienung | `--font-ui` | Montserrat 400/600 |
| Schriftgrade | `--t-hero … --t-label` | fluid per `clamp()`, 320–1600 px |
| Raum | `--gutter`, `--section`, `--gap`, `--maxw` | fluid |
| Bewegung | `--ease`, `--dur` | cubic-bezier(.2,.7,.1,1) |

Flächen setzen ihre Rollen selbst: `.tone-ivory`, `.tone-parchment`, `.tone-sand`, `.tone-forest`, `.tone-charcoal`
definieren `--bg`, `--fg`, `--rule`, `--accent`, `--btn-*`. Bausteine verwenden nur diese Rollen.
Abgeleitete Werte (Linien, gedämpfter Text) sind `color-mix()` aus den sieben Markenfarben.
Ausnahme: die Material- und Folienchips der Materialstudie (Bildschirmwerte des Bestands).

## Typografie
- H1 nach System (`clamp(2.25rem, 5vw, 4rem)`), Display-Stufe bis 5,5 rem; H2 Semibold um 2 rem; Fließtext 16–18 px / 1,5.
- Label: Montserrat 600, 12 px, Versalien, Laufweite 0,18 em, mit Copper-Strich davor.
- Betonung in Überschriften: Bronze statt Kursive, nur auf Ivory (auf Parchment Forest, auf Dunkel keine Farbe).

## Bewegung
Datei `src/styles/motion.css`. Nach Rückmeldung vom 10.11.2026 (Bilder erschienen zu spät oder gar nicht, Effekte
wirkten überladen) bewusst sparsam und einheitlich getaktet:

| Tempo | Dauer | Einsatz |
|---|---|---|
| `--m-fast` | 0,2 s | Rückmeldung auf Berührung: Farbe, Linie, Fläche, Schatten |
| `--m` | 0,4 s | Einblenden von Textblöcken, Aufklappen, Flächenwechsel, Schaltflächen-Füllung |
| `--m-slow` | 0,6 s | nur der erste Seitenaufbau im Kopfbereich |

- **Bilder werden nie versteckt oder maskiert.** Sie stehen, sobald sie geladen sind. Beim Scrollen blenden nur Textblöcke ein (0,4 s, 12 px Weg).
- Schaltflächen: Füllung wischt durch, Pfeil fliegt einmal, Lichtkante zieht einmal über die Fläche.
- Karten: Bild fährt um 3 % heran, Karte hebt sich um 3 px.
- Entfernt: scrollgebundene Effekte, Seitenübergänge, Endlosschleifen (Pulsieren, schwebende Lichtflecken, automatischer Szenenwechsel), Masken-Animationen für Überschriften und Bilder, Flächenkörnung, Verlaufsschrift, Glas-Unschärfe.
- Ohne JavaScript oder bei `prefers-reduced-motion` ist alles sofort sichtbar.

## Bausteine (`src/components/`)
| Baustein | Zweck | Varianten / Zustände |
|---|---|---|
| `Header` | Wortmarke, 4 Bereiche, Sprache, Auswahlzähler, Anfrageknopf | Panel offen, aktiver Bereich, Mobilmenü, ausgeblendet beim Scrollen |
| `Footer` | Logo, Claim, Linkspalten, Kontakt, Rechtliches | – |
| `PageTop` | Seitenkopf ohne Bild | mit/ohne Einleitung |
| `Hero` | Seitenkopf mit Bild | ein Bild, Bildfolge mit Vorschau, Kundenlogo, nur Text |
| `HomeHero` | Startseite | 3 Szenen, Umschalter, automatischer Wechsel |
| `Split` | Titel links, Text rechts | mit Bild(ern), Datenliste, Randnotiz, Linkverzeichnis; wechselt die Seite |
| `CardGrid` | Bildkarten | 1/2/3 Spalten, Leiste (`rail`), mit Filter (Speisekarten) |
| `NoteGrid` | nummerierte Textspalten | 1–4 Spalten |
| `FaqBlock` | Fragen oder Prozessschritte | offen/geschlossen, mit Bild |
| `Timeline` | Prozess mit Bild | wechselnde Bildseite |
| `Atlas` | Kollektionsübersicht | wechselnde Bildseite |
| `Theatre` | Projekte auf Forest | Auswahl links, Projekt rechts |
| `Logos` | Kundenlogos mit Projektlink | 6/3/2 Spalten |
| `Facts` | Projektdaten | – |
| `Jumps` | Sprungmarken | – |
| `ProseBlock` | Journal, Rechtstexte | mit Inhaltsverzeichnis, Titelbild |
| `MaterialStudio` | Farbwelten, Wildleder-Studie | Palette, Flor streichen (Maus, Touch, Pfeiltasten), Lederfarbe, Blind/Folie, Folienfarbe, eigener Text |
| `Catalog` | Artikelkatalog | Suche, Bereich, Treffer, leer |
| `ModelPage` | Modellseite | Bild, Merkmale, Spezifikation, Musterwand, Galerie, Konfigurator |
| `Configurator` | Artikel konfigurieren | Modus `planner` / `model`; siehe `STATE_CHECKLIST.md` |
| `ContactForm` | Projektbrief | 3 Schritte, Auswahl, Fehler, Vorschau, Senden (läuft, angenommen, fehlgeschlagen mit E-Mail-Ausweg) |
| `Band` | Abschluss mit Anfrage | – |
| `Picture`, `Rich`, `Actions`, `Crumbs`, `Arrow` | Grundelemente | Bild mit `srcset`, Schnittmarken, Aufdecken |

## Zuordnung alt → neu
`src/components/Block.astro` ordnet jeden importierten Abschnitt zu: zuerst nach Bedeutung (`kind`, aus der alten Klasse),
dann nach Form (Einträge mit Bild → Karten, ohne Bild → Textspalten, Fragen → Akkordeon, sonst zweispaltiger Text).
Neue Abschnittsarten brauchen deshalb meist keinen neuen Baustein.

## Formulare
Felder mit sichtbarem Label, 52 px Mindesthöhe, Charcoal-Haarlinie. Fehler: 2-px-Bronze-Rahmen, Symbol und Text „Fehler: …“ am Feld,
`aria-invalid`, `aria-describedby`. Status über `role="status"`. Auswahlkacheln sind echte Radio-Felder.

## Marke
Logos ausschließlich als gelieferte SVG-Pfade aus `public/brand/logos/`, nie nachgesetzt. Kopfzeile: 08 Charcoal,
Fußzeile: 06 hell. Referenzdateien des Guides liegen in `docs/brand-reference/`.

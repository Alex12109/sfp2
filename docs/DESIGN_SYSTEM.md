# Designsystem „Musterbuch“ (SFP // Old Copper 1.2)

## Idee
Die Site liest sich wie ein Musterbuch aus dem Atelier: ruhige Ivory-Fläche mit feiner Körnung, große Newsreader-Zeilen,
Forest als Struktur, Copper nur als Markierung. Zwei wiederkehrende Motive stammen aus dem Zuschnitt:
**Schnittmarken** an den Ecken wichtiger Bilder (`.frame`) und ein **Maßband** als Abschnittsgrenze (`.ruler`).
Abschnitte sind wie Musterkarten nummeriert (`N° 01`).

## Tokens (`src/styles/tokens.css`)
| Rolle | Token | Wert |
|---|---|---|
| Hauptfläche | `--sfp-ivory` | #F5F1E9 |
| Alternative Flächen | `--sfp-parchment`, `--sfp-sand` | #EEE3D4, #D6C8B6 |
| Struktur, Schaltflächen, dunkle Fläche | `--sfp-forest` | #253F3B |
| Text, Fußzeile | `--sfp-charcoal` | #252725 |
| Akzent (Linien, Marken, große Ziffern) | `--sfp-copper` | #B77550 |
| Tiefer Akzent (nur H1/H2-Hervorhebung, Fehlerrahmen) | `--sfp-bronze` | #80563D |
| Überschriften | `--font-display` | Newsreader 400 (600 nicht benötigt) |
| Text, Navigation, Bedienung | `--font-ui` | Montserrat 400/600 |
| Schriftgrade | `--t-hero … --t-label` | fluid per `clamp()`, 320–1600 px |
| Raum | `--gutter`, `--section`, `--gap`, `--maxw` | fluid |
| Bewegung | `--ease`, `--dur` | cubic-bezier(.2,.7,.1,1) |

Flächen setzen ihre Rollen selbst: `.tone-ivory`, `.tone-parchment`, `.tone-sand`, `.tone-forest`, `.tone-charcoal`
definieren `--bg`, `--fg`, `--rule`, `--accent`, `--btn-*`. Bausteine verwenden nur diese Rollen.
Abgeleitete Werte (Linien, gedämpfter Text) sind `color-mix()` aus den sieben Markenfarben.
Ausnahme: die Material- und Folienchips der Materialstudie (Bildschirmwerte des Bestands).

## Typografie
- H1 bis 7,25 rem, Zeilenhöhe 0,95–1,02, negative Laufweite; H2 bis 3,4 rem; Fließtext 17 px / 1,62.
- Label: Montserrat 600, 12 px, Versalien, Laufweite 0,18 em, mit Copper-Strich davor.
- Betonung in Überschriften: Bronze statt Kursive (kein kursiver Schnitt im Brand-Paket).

## Bewegung
- Seitenaufbau: Zeilen der H1 steigen gestaffelt auf (`.anim-rise`, `--i`), Bild wird aufgedeckt (`.anim-unveil`), Maßband zeichnet sich (`.anim-draw`). Nur CSS.
- Scrollen: `[data-reveal]` blendet ein, Bilder mit `data-reveal="clip"` werden aufgedeckt (IntersectionObserver).
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
| `MaterialStudio` | Farbwelten, Prägestudie | Palette, Lederfarbe, Blind/Folie, Folienfarbe |
| `Catalog` | Artikelkatalog | Suche, Bereich, Treffer, leer |
| `ModelPage` | Modellseite | Bild, Merkmale, Spezifikation, Musterwand, Galerie, Konfigurator |
| `Configurator` | Artikel konfigurieren | Modus `planner` / `model`; siehe `STATE_CHECKLIST.md` |
| `ContactForm` | Projektbrief | 3 Schritte, Auswahl, Fehler, Vorschau, Demo |
| `Band` | Abschluss mit Anfrage | – |
| `Picture`, `Rich`, `Actions`, `Crumbs`, `Arrow` | Grundelemente | Bild mit `srcset`, Schnittmarken, Aufdecken |

## Zuordnung alt → neu
`src/components/Block.astro` ordnet jeden importierten Abschnitt zu: zuerst nach Bedeutung (`kind`, aus der alten Klasse),
dann nach Form (Einträge mit Bild → Karten, ohne Bild → Textspalten, Fragen → Akkordeon, sonst zweispaltiger Text).
Neue Abschnittsarten brauchen deshalb meist keinen neuen Baustein.

## Formulare
Felder mit sichtbarem Label, 52 px Mindesthöhe, Rahmen in Forest. Fehler: 2-px-Rahmen, Symbol „!“ und Text am Feld,
`aria-invalid`, `aria-describedby`. Status über `role="status"`. Auswahlkacheln sind echte Radio-Felder.

## Marke
Logos ausschließlich als gelieferte SVG-Pfade aus `public/brand/logos/`, nie nachgesetzt. Kopfzeile: 08 Charcoal,
Fußzeile: 06 hell. Referenzdateien des Guides liegen in `docs/brand-reference/`.

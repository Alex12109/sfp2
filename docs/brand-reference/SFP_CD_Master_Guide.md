# SFP Corporate Design / Final 1.2

**SFP Old Copper · Supply for Professionals · 28.10.2026**

## Logo

Das bestehende Lederhaut-Signet bleibt erhalten. SFP steht in Großbuchstaben, darunter BERLIN in Montserrat. Für vertikale Anordnungen 01, 03 und 04 sind zwei feste Signet-Breiten freigegeben: **100 %** und **61,8 %** der sichtbaren SFP-Breite. Zentriert, proportional skaliert; Wortmarke, BERLIN und Abstand bleiben unverändert. Keine Zwischenwerte benutzen. 61,8 % ist der Standard. 100 % für bewusst präsente Cover, Verpackungen und Großflächen. Innerhalb einer Anwendung konsequent eine Ausführung wählen.

- 01: repräsentatives Hauptlogo; 03: quadratische Zeichenfläche; 04: kompakter Stapel.
- 02: horizontal; Signet-Höhe = SFP + BERLIN einschließlich Zwischenraum.
- 06: horizontal; Signet-Höhe = SFP allein.
- 05: SFP + BERLIN; 07: Signet; 08: SFP.
- BERLIN: Höhe 1/7 von SFP; Breite 96 %, links bündig, optischer rechter Einzug.
- Schutzraum rundum H/4; bereits in den Dateien enthalten.
- Bildschirm: BERLIN mindestens 14 CSS-px sichtbare Höhe. Sonst Version ohne BERLIN.
- Druck: BERLIN ab 2,5 mm sichtbarer Höhe bemustern. Individuelle Mindestbreiten in SFP_Logo_Masse.json.

## Eine gemeinsame Farbpalette

| Farbe | HEX | RGB | CMYK % (mathematisch, gerundet) |
|---|---|---|---|
| Sand | #D6C8B6 | 214 / 200 / 182 | 0.00 / 6.54 / 14.95 / 16.08 |
| Forest | #253F3B | 37 / 63 / 59 | 41.27 / 0.00 / 6.35 / 75.29 |
| Copper | #B77550 | 183 / 117 / 80 | 0.00 / 36.07 / 56.28 / 28.24 |
| Ivory | #F5F1E9 | 245 / 241 / 233 | 0.00 / 1.63 / 4.90 / 3.92 |
| Charcoal | #252725 | 37 / 39 / 37 | 5.13 / 0.00 / 5.13 / 84.71 |
| Parchment | #EEE3D4 | 238 / 227 / 212 | 0.00 / 4.62 / 10.92 / 6.67 |
| Bronze | #80563D | 128 / 86 / 61 | 0.00 / 32.81 / 52.34 / 49.80 |

HEX/RGB beziehen sich auf sRGB. CMYK ist eine unprofilierte Max-Black-Umrechnung, keine Druckseparation. Exakte Brüche stehen in SFP_Farben.json. Pantone für alle Farben physisch bemustern; keine universell exakte HEX-Entsprechung. Copper ist eine flache Digitalfarbe, keine Metallfolie.

## Typografie

SFP: Bodoni Moda 500, optische Größe 24, als Pfade. BERLIN: Montserrat 450, in der hellen Logo-Ausführung für dunkle Flächen 500. Überschriften: Newsreader 400/600. Fließtext: Montserrat 400/600. Fonts mit OFL-Lizenzen liegen bei. Für Windows/macOS installieren, im Web auf allen Plattformen selbst hosten. E-Mail-Fallback: Arial und Georgia. Logo immer als fertige Grafik verwenden. Newsreader Regulär (400) oder Semibold (600). Statische Desktop-Schnitte in guide_assets/fonts; Variable-Font-Zwischengewichte sind nicht in jeder Office-App auswählbar.

## Anwendungen und Lesbarkeit

Ivory als helle Fläche, Charcoal für Text, Forest für Struktur. Sand und Parchment als ergänzende Flächen; Copper und Bronze als gezielte Akzente. Dunkel: Ivory auf Forest oder Charcoal. AAA-Ziel für normale Texte mindestens 7:1, für große Texte 4,5:1 (ab 24 CSS-px normal bzw. 18,67 px fett). Die freigegebenen Paare und Kontraste stehen in der PDF und JSON. Copper nicht für kleine Informationsschrift auf hellem Grund. Keine Glows, Verläufe oder Verzerrungen an Logos.

## Dateien

36 aktive Ausführungen: 33 in Charcoal/Forest/Ivory und 3 in Copper. Jeweils SVG und transparentes PNG (3.200 px) = 72 Logo-Dateien. Copper nur 06/07/08 auf Ivory, Forest oder Charcoal. 16 frühere Copper-Dateien liegen separat unter legacy_nicht_verwenden. Ordner generated/Logos/{charcoal,forest,paper,copper}/. paper bedeutet Ivory. v100 und v0618 kennzeichnen die vertikalen Varianten.

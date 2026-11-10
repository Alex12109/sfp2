# Bekannte Einschränkungen und offene Punkte

## Nicht verbunden (bewusst)
- **Kein Backend, kein Versand.** Der Projektbrief entsteht im Browser. Ergebnis: `mailto:`-Entwurf, Kopie oder Textdownload. `live` in `src/services/enquiry-service.ts` ist ein Platzhalter.
- **Keine Uploads, kein CMS, kein CRM, keine Analyse-Skripte.**
- **Keine Veröffentlichung.** Kein Hosting, keine Domain eingerichtet. `noindex, nofollow` ist gesetzt wie im Bestand.

## Umfang
- Alle 218 Routen werden gebaut. 15 davon wurden einzeln im Browser gesichtet, die übrigen 203 nur automatisch geprüft (`ROUTE_MAP.csv`). Layoutfehler auf nicht gesichteten Seiten sind möglich, vor allem bei ungewöhnlich langen Überschriften oder Listen.
- Die 28 Alias-HTML-Seiten des Bestands werden nicht erzeugt. `public/_redirects` enthält die 40 Regeln des Bestands unverändert; ob das Zielhosting die Datei auswertet, wurde nicht geprüft.
- 404 ist eine gemeinsame zweisprachige Seite (`/404.html`), keine je Sprache.

## Abweichungen vom Bestand
- **Materialstudie vereinfacht:** Der Wildleder-Canvas mit Streicheffekt (`suede-v19.js`) und die animierte Schrift (`branding-motion-v20.js`) wurden nicht portiert. Geblieben sind Farbwelten-Umschalter und eine Prägestudie in CSS. Die Lederfläche ist eine Farbfläche, kein Foto.
- **Farbchips der Materialstudie** (Paletten, Lederfarben, Folienfarben) nutzen die Bildschirmwerte des Bestands. Sie liegen außerhalb der Old-Copper-Palette, weil sie Material darstellen, nicht die Marke.
- **Scrollfortschritt und mobiler Anfrage-Kurzbefehl** des Bestands (`site.js`) entfallen. Ersatz: Kopfzeile blendet beim Abwärtsscrollen aus, Anfrageknopf im Mobilmenü, Auswahlzähler in der Kopfzeile.
- **Kollektionsleiste der Startseite** ist nativ horizontal scrollbar (Touch, Tastatur, Scrollrad); die Pfeilknöpfe des Bestands entfallen.

## Marke
- **Kopfzeile:** Wortmarke 08 Charcoal, 220 px (Desktop) und 190 px (ab 350 px Breite) wie im Guide. **Unter 350 px Breite wird sie proportional auf 150 px verkleinert**, damit Sprachwahl und Menü erreichbar bleiben. Das weicht vom Startwert ab und braucht eine Entscheidung (Alternative: Signet 07).
- **Fußzeile:** Logo 06 (Signet + SFP) in der hellen Ausführung auf Charcoal, ohne BERLIN, damit die Mindesthöhe für BERLIN nicht unterschritten wird.
- **Favicon:** vorläufig Signet 07 als SVG. Die Digitalicons im Brand-Paket sind Entwürfe und nicht freigegeben; es gibt deshalb kein PNG/ICO-Set und kein Touch-Icon.
- **Kursive:** Im Brand-Paket liegt Newsreader nur aufrecht vor. Hervorhebungen in Überschriften erscheinen deshalb farbig statt kursiv.
- **Kontrast:** Fließtext ist Charcoal auf Ivory/Parchment bzw. Ivory auf Forest/Charcoal. Copper wird nur für Linien, Schnittmarken und große Ziffern verwendet, Bronze nur für Hervorhebungen in H1/H2 (ab 30 px). Kleine Zählziffern sind Forest. Eine vollständige Kontrastmessung aller Kombinationen wurde **nicht** durchgeführt; es wird kein Barrierefreiheitsstandard behauptet.

## Bilder
- Bilder werden nicht verändert oder neu kodiert. Ausschnitte entstehen per `object-fit: cover`; Produktaufnahmen (`technical`) werden vollständig gezeigt (`contain`).
- **Inszenierte Motive sind nicht sichtbar gekennzeichnet.** Der Hinweis steckt wie im Bestand im Alt-Text („Gestaltungsstudie“, „Produktaufnahme in ergänzter Umgebung“). Sichtbare Bildunterschriften waren ausdrücklich nicht gewünscht; ob bei Projektseiten eine sichtbare Kennzeichnung nötig ist, ist offen.
- Es gibt nur die Varianten des Bestands (Original und 640 px). Größere Originale (bis ~1,5 MB) werden auf Desktop voll geladen; AVIF oder weitere Größen wurden nicht erzeugt.
- Ungeprüft: Bildrechte. Das Paket ist keine neue Lizenzfreigabe.

## Technik
- `canonical` und `hreflang` sind relative Pfade, da die Domain offen ist. Keine `sitemap.xml`, keine `robots.txt`.
- Konfigurator und Projektbrief laden `/data/catalog.{lang}.json` per `fetch`. Ohne JavaScript erscheint der Hinweis mit der E-Mail-Adresse; vom Dateisystem (`file://`) funktioniert der Abruf nicht.
- Schriften sind variable WOFF2-Dateien (je ~215 KB) ohne Subsetting.
- Bewegung: Seitenaufbau und Einblendungen laufen nur mit JavaScript und ohne `prefers-reduced-motion`. Der Szenenwechsel der Startseite läuft automatisch (6,5 s) und endet bei der ersten Interaktion; einen eigenen Pause-Knopf gibt es nicht.
- Geprüft wurde nur in Chromium (headless). Details in `STATE_CHECKLIST.md`.

## Entscheidungen für Alex
1. Wortmarke unter 350 px: 150 px akzeptieren oder auf das Signet wechseln?
2. Favicon: Welcher Entwurf wird freigegeben?
3. Sollen inszenierte Motive sichtbar gekennzeichnet werden, zumindest auf Projektseiten?
4. Materialstudie: Reicht die vereinfachte Fassung, oder soll die Wildleder-Interaktion zurück?
5. Konfigurator direkt auf der Modellseite: so behalten, oder wie bisher nur im Projektplaner?
6. EN-Footer “Individual objects.”: an die Artikel/Produkt-Regel angleichen?
7. Hervorhebungen in Überschriften: farbig lassen, oder einen kursiven Newsreader-Schnitt in den Guide aufnehmen?

# Bekannte Einschränkungen und offene Punkte

## Nicht verbunden (bewusst)
- **Senden ist der Standard, aber es gibt noch keinen Empfänger.** Der Projektbrief hat nur noch den Knopf „Anfrage senden“ und schickt an `/api/enquiry`. Dort antwortet derzeit nichts, deshalb endet jeder Versuch in einer Fehlermeldung mit dem Ausweg „Stattdessen per E-Mail senden“. `server/enquiry-worker.mjs` ist eine Vorlage: Logik getestet, **keine echte E-Mail wurde je zugestellt**. Vor einer Veröffentlichung muss der Endpunkt stehen (`docs/ENQUIRY_DELIVERY.md`).
- **Datenschutzhinweis am Sendeknopf** ist ein Entwurf ohne rechtliche Prüfung. Er ersetzt die frühere Einwilligungs-Checkbox durch einen Hinweis (Bearbeitung der Anfrage als Zweck). Die Datenschutzerklärung nennt den Versandweg und den E-Mail-Dienst noch nicht.
- **Keine Uploads, kein CMS, kein CRM, keine Analyse-Skripte.**
- **Keine Veröffentlichung.** Kein Hosting, keine Domain eingerichtet. `noindex, nofollow` ist gesetzt wie im Bestand.

## Umfang
- Alle 218 Routen werden gebaut. 15 davon wurden einzeln im Browser gesichtet, die übrigen 203 nur automatisch geprüft (`ROUTE_MAP.csv`). Layoutfehler auf nicht gesichteten Seiten sind möglich, vor allem bei ungewöhnlich langen Überschriften oder Listen.
- Die 28 Alias-HTML-Seiten des Bestands werden nicht erzeugt. `public/_redirects` enthält die 40 Regeln des Bestands unverändert; ob das Zielhosting die Datei auswertet, wurde nicht geprüft.
- 404 ist eine gemeinsame zweisprachige Seite (`/404.html`), keine je Sprache.

## Abweichungen vom Bestand
- **Wildleder-Studie:** aus dem Bestand übernommen (`src/scripts/suede.ts`, Logik unverändert), mit zwei Abweichungen: Die Prägeschrift ist Newsreader statt der alten Western-Schrift, das eingeprägte Logo ist die Old-Copper-Wortmarke 08. Geprüft per Maus in headless Chromium; Touch und Tastatur nicht gemessen.
- **Farbchips der Materialstudie** (Paletten, Lederfarben, Folienfarben) nutzen die Bildschirmwerte des Bestands. Sie liegen außerhalb der Old-Copper-Palette, weil sie Material darstellen, nicht die Marke.
- **Scrollfortschritt und mobiler Anfrage-Kurzbefehl** des Bestands (`site.js`) entfallen. Ersatz: Kopfzeile blendet beim Abwärtsscrollen aus, Anfrageknopf im Mobilmenü, Auswahlzähler in der Kopfzeile.
- **Kollektionsleiste der Startseite** ist nativ horizontal scrollbar (Touch, Tastatur, Scrollrad); die Pfeilknöpfe des Bestands entfallen.

## Marke und Design System
- **Verläufe, Schatten, Glows und Rundungen sind im Design System ausdrücklich erlaubt und gewünscht** (Entscheidung Alex, 10.11.2026). Die Fassung Final 1.2 schloss sie noch aus; das Artefakt „SFP Old Copper – Corporate Design 1.2“ selbst ist noch nicht angepasst. Umsetzung in `src/styles/luxe.css`: runde Schaltflächen mit Verlauf und Lichtkante, weiche Schatten, abgerundete Bilder und Flächen, Kupferschein an aktiven Elementen. Große Flächen und die Fußzeile sind einfarbig. Farben, Schriften und Logos sind unverändert Old Copper; Logos erhalten keine Effekte.
- Folge: Copper liegt wieder auf Parchment-Flächen (Linien, Ziffern mit Verlauf) und Bronze/Copper erscheinen als Verlauf in großen Überschriften. Das weicht von Einzelregeln der Fassung 1.2 ab und ist von dieser Entscheidung gedeckt. Die Logos selbst erhalten weiterhin keine Effekte.
- Weitere Ergänzungen außerhalb des Systems: Schnittmarken, Maßband, Abschnittsnummern, Display-Schriftstufe über H1, fluide Abstände, Bewegung.
- **Kopfzeile:** Wortmarke 08 Charcoal, 220 px (Desktop) und 190 px (ab 350 px Breite) wie im Guide, Schutzraum der Datei unverändert. **Unter 350 px Breite wird sie proportional auf 150 px verkleinert**, damit Sprachwahl und Menü erreichbar bleiben. Das weicht vom Startwert ab und braucht eine Entscheidung (Alternative: Signet 07).
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
- Bewegung (`src/styles/motion.css`): auf drei Tempi (0,2 / 0,4 / 0,6 s) reduziert. Scrollgebundene Effekte, Seitenübergänge und Endlosschleifen sind entfernt. Weiches Aufklappen läuft nur in Chromium-Browsern, sonst klappt es sofort auf.
- **Fehler im vorherigen Stand (behoben):** Bilder lagen hinter einer Aufroll-Maske, die erst beim Einblenden öffnete. Zusammen mit Lazy-Loading erschienen sie spät oder gar nicht (nachgestellt: 74 von 339 Scrollpositionen). Jetzt: 0 von 324, längste Wartezeit 0,43 s (`tests/e2e/images.cjs`). **Nachgestellt in headless Chromium unter Linux, nicht in Chrome unter Windows und nicht auf einem iPhone.**
- Der Startseiten-Kopf wechselt die Szene nicht mehr automatisch, nur noch per Klick.
- Seitenaufbau und Einblendungen laufen nur mit JavaScript und ohne `prefers-reduced-motion`. 
- Geprüft wurde nur in Chromium (headless). Details in `STATE_CHECKLIST.md`.

## Entscheidungen für Alex
1. Wortmarke unter 350 px: 150 px akzeptieren oder auf das Signet wechseln?
2. Favicon: Welcher Entwurf wird freigegeben?
3. Sollen inszenierte Motive sichtbar gekennzeichnet werden, zumindest auf Projektseiten?
4. Versand: Welche Variante aus `docs/ENQUIRY_DELIVERY.md`, und wer prüft den Datenschutzhinweis?
5. Konfigurator direkt auf der Modellseite: so behalten, oder wie bisher nur im Projektplaner?
6. EN-Footer “Individual objects.”: an die Artikel/Produkt-Regel angleichen?
7. Hervorhebungen in Überschriften: farbig lassen, oder einen kursiven Newsreader-Schnitt in den Guide aufnehmen?

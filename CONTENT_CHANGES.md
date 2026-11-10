# Inhaltliche Änderungen gegenüber dem Bestand (Sites v31)

## Grundsatz
Kein Seitentext wurde umformuliert, gekürzt oder ergänzt. Alle Überschriften, Absätze, Listen, Spezifikationen, Alt-Texte
und Links stammen wörtlich aus `02_CONTENT/html/`. Abgleich nach dem Import: 9.692 Textknoten des Bestands, davon 32 nicht
im importierten JSON. Diese 32 sind keine Inhalte, sondern Bedienelemente, die neu aufgebaut wurden:
Bildzähler „1 / 3“ der Produktgalerien (24), versteckte Formularlabels der Materialstudie (4) sowie Zurücksetzen-Knopf und
Leerzustand des Speisekartenfilters (4; die Texte stehen jetzt in `src/i18n/ui.ts`).
Fakten wurden nicht verändert. Nichts wurde erfunden (keine Preise, Mengen, Fristen, Kundenstimmen, Zertifikate).

## Strukturelle Abweichungen (Text unverändert, Darstellung anders)
| Stelle | Bestand | Neu | Grund |
|---|---|---|---|
| Hervorhebungen in Überschriften (`<em>`) | kursiv | aufrecht, in Bronze (auf Dunkel: Copper) | Newsreader liegt nur aufrecht bei; eine errechnete Kursive wäre typografisch falsch. Bronze nur in großen Graden. |
| Modellseite, Knopf „Diesen Artikel konfigurieren“ | Link zu `/projektplaner/?item=ID` | springt zum Konfigurator auf derselben Seite (`#konfigurator`); zusätzlich Link „Auswahl im Projektplaner öffnen“ mit `?item=ID` | Weg „auswählen → konfigurieren → hinzufügen“ ohne Seitenwechsel |
| Modellseite, Abschnitt Konfigurator | nicht vorhanden | Überschrift = Knopftext, Einleitung = Katalogbeschreibung des Artikels (`description`, unverändert) | siehe oben |
| Modellseite, Bereichsname über dem Titel | nicht vorhanden | Kategorie aus dem Katalog („Gastronomie / F&B“ usw.) | Orientierung |
| Materialauswahl im Konfigurator | Auswahlliste + aufklappbare Materialkarte | Musterkacheln, gruppiert nach Art; Farben der Materialkarte als anklickbare Vorschläge | Material soll die Auswahl tragen. Werte/IDs unverändert. |
| Artikelauswahl im Projektplaner | Auswahlliste | Liste mit Vorschaubild, gruppiert nach Katalogbereich | wie oben |
| Kontakt ohne Übergabe aus dem Planer | Auswahl nur über „Gemeinsam anfragen“ | vorhandene Planer-Auswahl derselben Sitzung wird auch bei direktem Aufruf übernommen | weniger Sackgassen; Zurücksetzen leert weiterhin beides |
| Katalog | Sprungmarken zu vier Bereichen | Suchfeld + Bereichsfilter + Trefferzahl + Leerzustand | im Briefing gefordert („Such-/Filterauswahl“) |
| Materialstudie | Wildleder-Canvas mit Streicheffekt, animierte Buchstaben | Farbwelten-Umschalter und Prägestudie (Lederfarbe, Blind-/Folienprägung, Text) ohne Canvas | bewusst vereinfacht, siehe `KNOWN_ISSUES.md` |
| Startseite, Zeile über der H1 | nicht vorhanden | „Berlin · European craftsmanship“ (Footer-Zeile des Bestands) | Einordnung ohne neuen Text |
| Abschnittsnummern „N° 01“ | nicht vorhanden | laufende Nummer je Abschnitt | Orientierung, kein Inhalt |
| Smiley-Platzhalter „:-)“ im Prägefeld | animierter Platzhalter | Platzhalter „SFP“ | Vereinfachung |

## Neue Bedientexte (in `src/i18n/ui.ts` mit `NEU` markiert)
DE / EN:
- Statuswörter vor jeder Meldung nach Regel E6 des Design Systems: „Erfolg:“, „Hinweis:“, „Fehler:“ / “Success:”, “Note:”, “Error:” (`src/lib/status.ts`). Der Meldungstext dahinter ist unverändert.
- „Zum Inhalt springen“ / “Skip to content”
- „Hauptnavigation“, „Schließen“, „Sprache“, „Startseite“ / “Main navigation”, “Close”, “Language”, “Home”
- „Auswahl“ (Zähler in der Kopfzeile) / “Selection”
- „Alle Bereiche“ / “All areas”; „Details ansehen“ / “View details”
- „Vorheriges Bild“, „Nächstes Bild“ / “Previous image”, “Next image”
- „Farben der Materialkarte“ / “Colours on the material chart”
- „Ihre Anfrage ist noch leer.“ (Modellseite, gekürzt aus dem Bestandssatz) / “Your enquiry is empty.”
- „Auswahl im Projektplaner öffnen“ / “Open selection in the project planner”
- „Artikeldaten werden geladen …“ und Fehlermeldung dazu / “Loading product data …”
- „Diese Seite versendet nichts. Der Brief verlässt Ihren Browser erst, wenn Sie die E-Mail selbst absenden.“ / “This page sends nothing. …”
- „Senden (Demo – ohne Versand)“, „Demo-Modus: Es ist kein Versand angebunden.“ (nur im Demo-Modus)
- „Fortschritt“ / “Progress”; „Materialstudie“ / “Material study”; „Projektbrief“ (Zeile über der Kontakt-H1)
- 404: „Diese Seite gibt es nicht.“ samt Erklärung und zwei Links / “This page does not exist.”
- Englische Fassungen des Speisekarten-Leerzustands und der Folienfarben wurden aus dem EN-Bestand übernommen, soweit vorhanden; sonst sinngleich übersetzt.

Alle übrigen Formular- und Statustexte sind wörtlich aus dem Bestand (HTML und JavaScript) übernommen.

## Offene Fakten (nicht entschieden, nicht verändert)
- Konditionen („4–6 Wochen“, Express, Vorkasse) stehen wie im Bestand auf vielen Seiten. Keine neue Freigabe.
- Projekt- und Kundenangaben, Kundenlogos: unverändert im bestehenden Projektkontext.
- Impressum und Datenschutz: Bestandstext, keine rechtliche Prüfung.
- EN-Footer nennt “Individual objects.” – im Deutschen gilt die Regel „Artikel/Produkt statt Objekt“. Der englische Bestandstext wurde nicht angefasst; zur Entscheidung vorgemerkt.

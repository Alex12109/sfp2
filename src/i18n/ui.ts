/**
 * Bedientexte. "Bestand" = wörtlich aus Sites v31 (HTML/JS) übernommen.
 * Neue Texte dieses Entwurfs sind mit NEU markiert und in CONTENT_CHANGES.md gelistet.
 */
import type { Lang } from '../lib/types';

const de = {
  skip: 'Zum Inhalt springen', // NEU
  mainNav: 'Hauptnavigation', // NEU
  menu: 'Menü',
  close: 'Schließen', // NEU
  language: 'Sprache', // NEU
  selection: 'Auswahl', // NEU (Kurzform von „Ihre Auswahl“)
  selectionAria: 'Artikel in Ihrer Anfrage', // NEU
  breadcrumb: 'Brotkrumennavigation',
  home: 'Startseite', // NEU
  contactUrl: '/kontakt/',
  plannerUrl: '/projektplaner/',
  catalogUrl: '/produkte/',
  privacyUrl: '/datenschutz/',
  studyNote: 'Gestaltungsstudie', // NEU – Kennzeichnung inszenierter Motive
  inThisArticle: 'In diesem Beitrag',
  // Katalog
  catalogSearch: 'Artikel suchen',
  catalogSearchPlaceholder: 'z. B. Speisekarte, Tray, Tissue',
  catalogAll: 'Alle Bereiche', // NEU
  catalogCount: (n: number) => `${n} Artikel gefunden`,
  catalogEmptyTitle: 'Kein passender Artikel gefunden.', // Bestand (gekürzt)
  catalogEmptyText: 'Bitte ändern Sie den Suchbegriff.',
  filterReset: 'Filter zurücksetzen',
  menuCount: (n: number, total: number) => `${n} von ${total} Modellen`,
  menuEmptyTitle: 'Keine Karte passt zu dieser Auswahl.',
  menuEmptyText: 'Ändern Sie einen Filter oder setzen Sie die Auswahl zurück.',
  configureItem: 'Individuell konfigurieren',
  details: 'Details ansehen', // NEU
  // Galerie
  previous: 'Vorheriges Bild', // NEU
  next: 'Nächstes Bild', // NEU
  // Konfigurator (Bestand)
  cfg: {
    step1: '1 · Artikel auswählen',
    step2: '2 · Ausführung gestalten',
    search: 'Artikel suchen',
    searchPlaceholder: 'z. B. Speisekarte, Tray, Tissue',
    product: 'Produkt / Modell',
    found: (n: number) => `${n} Artikel gefunden`,
    noMatch: 'Kein passender Artikel gefunden. Bitte ändern Sie den Suchbegriff.',
    allInfo: 'Alle Produktinformationen',
    format: 'Format',
    quantity: 'Stückzahl',
    quantityPlaceholder: 'Noch offen',
    undecided: 'Nicht entschieden',
    custom: 'Maße nach Wunsch',
    previous: 'Bisherige Auswahl: ',
    customTitle: 'Ihre Wunschmaße',
    width: 'Breite (mm)',
    depth: 'Tiefe / Länge (mm)',
    height: 'Höhe (mm)',
    dimensionNote: 'Weitere Maßangaben / Form',
    dimensionNotePlaceholder: 'z. B. Ø 120 mm, Innenmaß oder Sonderform',
    material: 'Material',
    colour: 'Farbe / Materialreferenz',
    colourPlaceholder: 'Farbname, Nummer oder Wunschfarbe',
    colourSuggestions: 'Farben der Materialkarte', // NEU
    swatchNote: 'Farbe oder Nummer aus der Materialkarte bitte im Farbfeld angeben. Bildschirmfarben sind unverbindlich; die Freigabe erfolgt am Muster.',
    stitch: 'Naht',
    stitchColour: 'Gewünschte Garnfarbe',
    stitchColourPlaceholder: 'Farbname oder Referenz',
    optionPlaceholder: 'Wunsch angeben oder offen lassen',
    notes: 'Weitere Wünsche',
    notesPlaceholder: 'Logoposition, Verpackung, Nutzung oder besondere Anforderungen',
    modelNote: 'Materialien und Ausstattungsmerkmale richten sich nach dem jeweiligen Modell. Wir bestätigen Ihre Wunschkombination vor der Fertigung.',
    add: 'Zur Anfrage hinzufügen',
    save: 'Änderungen übernehmen',
    cancel: 'Bearbeitung abbrechen',
    yourSelection: 'Ihre Auswahl',
    empty: 'Ihre Anfrage ist noch leer. Fügen Sie links den ersten Artikel hinzu.',
    emptyModel: 'Ihre Anfrage ist noch leer.', // NEU (Modellseite)
    continue: 'Gemeinsam anfragen',
    sessionNote: 'Die Auswahl bleibt für diese Sitzung in Ihrem Browser erhalten. Jeder Artikel kann separat bearbeitet oder als weitere Ausführung dupliziert werden.',
    explore: 'Alle Artikel entdecken',
    viewSelection: 'Auswahl ansehen',
    openPlanner: 'Auswahl im Projektplaner öffnen', // NEU
    viewSpec: 'Ausführung ansehen',
    toBeAgreed: 'Details werden gemeinsam abgestimmt.',
    edit: 'Bearbeiten',
    duplicate: 'Duplizieren',
    remove: 'Entfernen',
    added: 'Artikel hinzugefügt. Wählen Sie einen weiteren Artikel oder fragen Sie Ihre Auswahl gemeinsam an.',
    updated: 'Die Ausführung wurde aktualisiert.',
    duplicated: 'Ausführung dupliziert. Über „Bearbeiten“ können Sie sie anpassen.',
    removed: 'Artikel aus der Anfrage entfernt.',
    limit: 'Bitte senden Sie diese Auswahl zuerst ab.',
    finishEdit: 'Bitte übernehmen Sie zuerst Ihre Änderungen oder brechen Sie die Bearbeitung ab.',
    storage: 'Die Auswahl kann in diesem Browser nicht zwischengespeichert werden. Sie können sie trotzdem jetzt anfragen.',
    noscript: 'Bitte nennen Sie Ihre Artikel und Wünsche direkt per E-Mail an mail@sfp-berlin.com.',
    configureHere: 'Diesen Artikel konfigurieren',
    loading: 'Artikeldaten werden geladen …', // NEU
    loadError: 'Die Artikeldaten konnten nicht geladen werden. Bitte laden Sie die Seite neu oder schreiben Sie uns an mail@sfp-berlin.com.', // NEU
  },
  // Anfrage (Bestand)
  form: {
    steps: ['Projekt', 'Details', 'Kontakt'],
    legend1: 'Was möchten Sie gestalten?',
    legend2: 'Was ist Ihnen wichtig?',
    legend3: 'Wie erreichen wir Sie?',
    scenario: 'Einsatzbereich',
    collection: 'Produktfamilie',
    quantity: 'Ungefähre Menge',
    quantityPlaceholder: 'z. B. 50 Stück',
    delivery: 'Gewünschte Lieferung',
    deliveryPlaceholder: 'Termin oder Zeitraum',
    description: 'Ihre Idee / Anforderungen',
    descriptionHelp: 'Ein kurzer Satz zu Einsatz und Idee reicht für den Einstieg.',
    descriptionHelpSelection: 'Ihre Produktauswahl ist übernommen. Ergänzen Sie bei Bedarf Ihre Anforderungen.',
    name: 'Name',
    company: 'Firma',
    email: 'E-Mail',
    phone: 'Telefon (optional)',
    required: '* Pflichtangaben für Ihren Projektbrief. Ihre Angaben werden erst beim Versand aus Ihrem E-Mail-Programm an SFP übermittelt.',
    privacy: 'Datenschutz',
    next: 'Weiter',
    back: 'Zurück',
    prepare: 'Projektbrief vorbereiten',
    reviewTitle: 'Ihr Projektbrief',
    openEmail: 'E-Mail-Entwurf öffnen',
    copy: 'Kopieren',
    download: 'Herunterladen',
    downloadName: 'SFP-Projektbrief.txt',
    subject: 'Projektanfrage über SFP',
    selectionTitle: 'Ihre Produktauswahl',
    editSelection: 'Produktauswahl bearbeiten',
    ready: 'Ihr Projektbrief ist vorbereitet. Öffnen Sie den E-Mail-Entwurf und senden Sie ihn aus Ihrem E-Mail-Programm.',
    readyLong: 'Ihr ausführlicher Projektbrief ist bereit. Kopieren oder laden Sie ihn herunter und fügen Sie ihn Ihrer E-Mail bei, damit alle Angaben erhalten bleiben.',
    copied: 'Projektbrief kopiert.',
    copyFailed: 'Bitte markieren und kopieren Sie den Projektbrief oben.',
    storage: 'Dieser Browser kann den Entwurf nicht zwischenspeichern. Bleiben Sie bis zum Kopieren oder Herunterladen auf dieser Seite.',
    reset: 'Neue Anfrage beginnen',
    resetConfirm: 'Diesen Entwurf und die Produktauswahl löschen und neu beginnen?',
    resetDone: 'Ihre neue Anfrage ist bereit.',
    noscript: 'Bitte schreiben Sie uns direkt an mail@sfp-berlin.com oder rufen Sie uns an.',
    notSent: 'Diese Seite versendet nichts. Der Brief verlässt Ihren Browser erst, wenn Sie die E-Mail selbst absenden.', // NEU
    requiredLive: '* Pflichtangaben.', // NEU
    review: 'Projektbrief prüfen', // NEU (ersetzt im Sendemodus „Projektbrief vorbereiten“)
    asideNote: 'Mit dem Absenden geht Ihr Projektbrief direkt an SFP in Berlin.', // NEU (ersetzt im Sendemodus den Hinweis auf den E-Mail-Entwurf)
    readyToSend: 'Bitte prüfen Sie Ihren Projektbrief und senden Sie ihn ab.', // NEU
    byEmail: 'Stattdessen per E-Mail senden', // NEU (nur in der Fehlermeldung)
    send: 'Anfrage senden', // NEU (nur Live-Modus)
    sending: 'Ihre Anfrage wird übertragen …', // NEU
    sent: (reference: string) => `Ihre Anfrage ist bei SFP eingegangen. Referenz: ${reference}`, // NEU
    sendFailed: 'Bitte versuchen Sie es erneut.', // NEU
    // NEU – Datenschutzhinweis am Sendeknopf. Entwurf, Wortlaut rechtlich prüfen.
    sendNotice: 'Mit dem Absenden übermitteln Sie Ihre Angaben an die SFP Hospitality GmbH. Wir verwenden sie ausschließlich, um Ihre Anfrage zu bearbeiten und Sie dazu zu kontaktieren. Einzelheiten und Ihre Rechte finden Sie in der',
    sendNoticeLink: 'Datenschutzerklärung', // NEU
    honeypot: 'Dieses Feld bitte leer lassen', // NEU
    demoSend: 'Senden (Demo – ohne Versand)', // NEU
    demoBadge: 'Demo-Modus: Es ist kein Versand angebunden.', // NEU
    progress: 'Fortschritt', // NEU
  },
  errors: {
    missing: 'Bitte füllen Sie dieses Feld aus.',
    email: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
    range: 'Bitte prüfen Sie diese Angabe und den zulässigen Wertebereich.',
  },
  notFound: {
    title: 'Diese Seite gibt es nicht.', // NEU
    text: 'Der Link ist veraltet oder die Adresse wurde verändert. Über die Übersicht aller Artikel oder die Startseite finden Sie zurück.', // NEU
    home: 'Zur Startseite', // NEU
    catalog: 'Alle Artikel', // NEU
  },
};

const en: typeof de = {
  skip: 'Skip to content',
  mainNav: 'Main navigation',
  menu: 'Menu',
  close: 'Close',
  language: 'Language',
  selection: 'Selection',
  selectionAria: 'items in your enquiry',
  breadcrumb: 'Breadcrumb',
  home: 'Home',
  contactUrl: '/en/contact/',
  plannerUrl: '/en/project-planner/',
  catalogUrl: '/en/products/',
  privacyUrl: '/en/privacy/',
  studyNote: 'Design study',
  inThisArticle: 'In this article',
  catalogSearch: 'Search accessories',
  catalogSearchPlaceholder: 'e.g. menu cover, tray, tissue',
  catalogAll: 'All areas',
  catalogCount: (n) => `${n} accessories found`,
  catalogEmptyTitle: 'No matching accessory found.',
  catalogEmptyText: 'Please change your search.',
  filterReset: 'Reset filters',
  menuCount: (n, total) => `${n} of ${total} models`,
  menuEmptyTitle: 'No menu cover matches this selection.',
  menuEmptyText: 'Change a filter or reset your selection.',
  configureItem: 'Configure your design',
  details: 'View details',
  previous: 'Previous image',
  next: 'Next image',
  cfg: {
    step1: '1 · Choose an accessory',
    step2: '2 · Specify your design',
    search: 'Search accessories',
    searchPlaceholder: 'e.g. menu cover, tray, tissue',
    product: 'Accessory / model',
    found: (n) => `${n} accessories found`,
    noMatch: 'No matching accessory found. Please change your search.',
    allInfo: 'Full product details',
    format: 'Format',
    quantity: 'Quantity',
    quantityPlaceholder: 'Not yet decided',
    undecided: 'Not yet decided',
    custom: 'Custom dimensions',
    previous: 'Previous choice: ',
    customTitle: 'Your custom dimensions',
    width: 'Width (mm)',
    depth: 'Depth / length (mm)',
    height: 'Height (mm)',
    dimensionNote: 'Other dimensions / shape',
    dimensionNotePlaceholder: 'e.g. Ø 120 mm, internal dimensions or custom shape',
    material: 'Material',
    colour: 'Colour / material reference',
    colourPlaceholder: 'Colour name, number or preferred shade',
    colourSuggestions: 'Colours on the material chart',
    swatchNote: 'Enter the colour or number from the material chart in the colour field. Screen colours are indicative; approval is based on samples.',
    stitch: 'Stitching',
    stitchColour: 'Preferred thread colour',
    stitchColourPlaceholder: 'Colour name or reference',
    optionPlaceholder: 'State your preference or leave open',
    notes: 'Additional requirements',
    notesPlaceholder: 'Logo position, packaging, use or special requirements',
    modelNote: 'Materials and features depend on the model. We confirm your requested combination before production.',
    add: 'Add to enquiry',
    save: 'Save changes',
    cancel: 'Cancel editing',
    yourSelection: 'Your selection',
    empty: 'Your enquiry is empty. Add your first accessory from the form.',
    emptyModel: 'Your enquiry is empty.',
    continue: 'Enquire about all items',
    sessionNote: 'Your selection is kept in your browser for this session. Each item can be edited separately or duplicated for another specification.',
    explore: 'Explore all accessories',
    viewSelection: 'View selection',
    openPlanner: 'Open selection in the project planner',
    viewSpec: 'View specification',
    toBeAgreed: 'Details to be agreed together.',
    edit: 'Edit',
    duplicate: 'Duplicate',
    remove: 'Remove',
    added: 'Accessory added. Choose another item or enquire about your complete selection.',
    updated: 'Your specification has been updated.',
    duplicated: 'Specification duplicated. Choose “Edit” to customise it.',
    removed: 'Accessory removed from the enquiry.',
    limit: 'Please send this selection before adding further items.',
    finishEdit: 'Please save or cancel your current changes first.',
    storage: 'This browser cannot keep your selection between pages. You can still enquire now.',
    noscript: 'Please email your selected accessories and requirements to mail@sfp-berlin.com.',
    configureHere: 'Configure this accessory',
    loading: 'Loading product data …',
    loadError: 'The product data could not be loaded. Please reload the page or email mail@sfp-berlin.com.',
  },
  form: {
    steps: ['Project', 'Details', 'Contact'],
    legend1: 'What would you like to create?',
    legend2: 'What matters to your project?',
    legend3: 'How can we reach you?',
    scenario: 'Application',
    collection: 'Product family',
    quantity: 'Approximate quantity',
    quantityPlaceholder: 'e.g. 50 pieces',
    delivery: 'Required delivery',
    deliveryPlaceholder: 'Date or time frame',
    description: 'Your idea / requirements',
    descriptionHelp: 'A short sentence about the use and your idea is enough to begin.',
    descriptionHelpSelection: 'Your product selection is included. Add any other requirements below.',
    name: 'Name',
    company: 'Company',
    email: 'Email',
    phone: 'Phone (optional)',
    required: '* Required for your project brief. Your details are sent to SFP only when you send the email from your email app.',
    privacy: 'Privacy',
    next: 'Continue',
    back: 'Back',
    prepare: 'Prepare project brief',
    reviewTitle: 'Your project brief',
    openEmail: 'Open email draft',
    copy: 'Copy',
    download: 'Download',
    downloadName: 'SFP-project-brief.txt',
    subject: 'Project enquiry via SFP',
    selectionTitle: 'Your product selection',
    editSelection: 'Edit product selection',
    ready: 'Your brief is ready. Open the email draft and send it from your email app.',
    readyLong: 'Your detailed brief is ready. Copy or download it and attach it to your email so every specification is preserved.',
    copied: 'Project brief copied.',
    copyFailed: 'Please select and copy the brief above.',
    storage: 'This browser cannot keep your draft between pages. Stay on this page until you copy or download it.',
    reset: 'Start a new enquiry',
    resetConfirm: 'Clear this draft and product selection and start again?',
    resetDone: 'Your new enquiry is ready.',
    noscript: 'Please email mail@sfp-berlin.com directly or call us.',
    notSent: 'This page sends nothing. The brief only leaves your browser when you send the email yourself.',
    requiredLive: '* Required.',
    review: 'Review project brief',
    asideNote: 'When you send it, your project brief goes directly to SFP in Berlin.',
    readyToSend: 'Please review your project brief and send it.',
    byEmail: 'Send by email instead',
    send: 'Send enquiry',
    sending: 'Your enquiry is being transmitted …',
    sent: (reference) => `SFP has received your enquiry. Reference: ${reference}`,
    sendFailed: 'Please try again.',
    sendNotice: 'By sending, you transmit your details to SFP Hospitality GmbH. We use them solely to handle your enquiry and to contact you about it. Details and your rights are set out in the',
    sendNoticeLink: 'privacy policy',
    honeypot: 'Please leave this field empty',
    demoSend: 'Send (demo – nothing is sent)',
    demoBadge: 'Demo mode: no delivery is connected.',
    progress: 'Progress',
  },
  errors: {
    missing: 'Please complete this field.',
    email: 'Please enter a valid email address.',
    range: 'Please check this value and the permitted range.',
  },
  notFound: {
    title: 'This page does not exist.',
    text: 'The link is out of date or the address has changed. The overview of all accessories or the home page will take you back.',
    home: 'Go to the home page',
    catalog: 'All accessories',
  },
};

export const ui = { de, en };
export type UI = typeof de;
export const t = (lang: Lang): UI => ui[lang];

/** Auswahllisten der Anfrage: Werte sind sprachübergreifende Schlüssel (Bestand). */
export const scenarios: { value: string; de: string; en: string }[] = [
  { value: '', de: 'Noch offen', en: 'Not yet decided' },
  { value: 'hotels', de: 'Hotels & Resorts', en: 'Hotels & resorts' },
  { value: 'restaurants', de: 'Restaurants & Bars', en: 'Restaurants & bars' },
  { value: 'interior-design', de: 'Interior Design & Architektur', en: 'Interior design & architecture' },
  { value: 'corporate-gifts', de: 'Corporate Gifts & Events', en: 'Corporate gifts & events' },
  { value: 'clubs', de: 'Golfclubs & Private Clubs', en: 'Golf clubs & private members’ clubs' },
  { value: 'yachts', de: 'Yachten & Marine Interiors', en: 'Yachts & marine interiors' },
  { value: 'private-aviation', de: 'Private Aviation', en: 'Private aviation' },
  { value: 'executive-offices', de: 'Executive Offices & Institutionen', en: 'Executive offices & institutions' },
];
export const collections: { value: string; de: string; en: string }[] = [
  { value: '', de: 'Individuelle Idee / noch offen', en: 'Bespoke idea / not yet decided' },
  { value: 'writing', de: 'Schreibkultur & Konferenz', en: 'Desk & conference' },
  { value: 'trays', de: 'Trays & Ablage', en: 'Trays & organisers' },
  { value: 'room', de: 'Raumaccessoires', en: 'Room accessories' },
  { value: 'gifts', de: 'Travel & Gifts', en: 'Travel & gifts' },
  { value: 'dining', de: 'Speisekarten & Dining', en: 'Menu covers & dining' },
  { value: 'other', de: 'Boxen & besondere Artikel', en: 'Boxes & bespoke accessories' },
];

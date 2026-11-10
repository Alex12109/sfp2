/** Layoutneutrale Inhaltsstruktur, erzeugt von scripts/import-content.mjs. */
export type Lang = 'de' | 'en';
export interface Img { src: string; alt: string; width: number | null; height: number | null; kind?: 'context' | 'technical' | 'swatch'; href?: string; role?: string | null }
export interface LinkRef { href: string; label: string; style?: 'button' | 'outline' | 'text'; nav?: string | boolean }
export type BodyBlock =
  | { type: 'p'; html: string; role?: string }
  | { type: 'h'; level: string; html: string }
  | { type: 'ul' | 'ol'; items: string[]; role?: string }
  | { type: 'quote'; html: string }
  | { type: 'table'; rows: string[][] }
  | { type: 'img'; src: string; alt: string; width: number | null; height: number | null; kind?: string }
  | { type: 'faq'; q: string; a: string }
  | { type: 'links'; links: LinkRef[] };
export interface Faq { q: string; no?: string; a: BodyBlock[]; open?: boolean }
export interface Item {
  role?: string | null; href?: string; id?: string; hidden?: boolean; data?: Record<string, string>;
  title?: string; body?: BodyBlock[]; media?: Img[]; actions?: LinkRef[]; specs?: { k: string; v: string }[];
  items?: Item[]; faq?: Faq[]; tabs?: { label: string; data?: Record<string, string> }[];
}
export interface Prose { chapters: { id: string | null; title: string | null; blocks: BodyBlock[] }[]; summary: string | null; nav: LinkRef[] }
export interface Section {
  kind: string; id?: string; shade?: boolean; data?: Record<string, string>;
  title?: { level: string; html: string }; body?: BodyBlock[]; media?: Img[]; actions?: LinkRef[];
  items?: Item[]; specs?: { k: string; v: string }[]; faq?: Faq[]; crumbs?: LinkRef[];
  tabs?: { label: string; data?: Record<string, string> }[]; groups?: Section[]; prose?: Prose;
  filter?: { label: string; fields: { name: string; label: string; options: { value: string; label: string }[] }[]; reset: string };
}
export interface Page {
  language: Lang; key: string; slug: string; url: string; template: string; title: string; description: string;
  alternate: Record<Lang, string>; sections: Section[];
}
export interface Route { language: Lang; key: string; slug: string; url: string; template: string; title: string; alternate: Record<Lang, string> }

export interface CatalogColour { id: string; name: string | Record<Lang, string>; code?: string; availability: string }
export interface CatalogMaterial { id: string; name: string; kind: string; image: string; colours: CatalogColour[]; note?: string; availability: string }
export interface CatalogOption { id: string; label: string; type: 'single' | 'multi' | 'text'; values: { id: string; label: string }[]; when: { option: string; values: string[] } | null; help?: string }
export interface Product {
  id: string; group?: string; category?: string; family?: string | null; name: string; description?: string; image?: string; url?: string;
  formats: { id: string; label: string }[]; legacyFormats?: { id: string; label: string }[];
  materials: CatalogMaterial[]; options: CatalogOption[]; stitching: boolean; features?: string[];
}

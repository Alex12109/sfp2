// Katalogdaten für Konfigurator und Anfrage (statisch erzeugt, IDs unverändert).
import type { APIRoute } from 'astro';
import { catalog, thumb } from '../../lib/content';
import type { Lang } from '../../lib/types';

export function getStaticPaths() {
  return [{ params: { lang: 'de' } }, { params: { lang: 'en' } }];
}
export const GET: APIRoute = ({ params }) => {
  const products = catalog(params.lang as Lang).map((p) => ({ ...p, thumb: p.image ? thumb(p.image) : '' }));
  return new Response(JSON.stringify(products), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};

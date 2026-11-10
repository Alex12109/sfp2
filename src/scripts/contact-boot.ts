import { initContact } from './contact';

const root = document.querySelector<HTMLElement>('[data-enquiry]');
if (root) {
  // Auch ohne Katalogdaten bleibt das Formular nutzbar (dann ohne Artikelübernahme).
  fetch(root.dataset.catalog!)
    .then((r) => (r.ok ? r.json() : []))
    .catch(() => [])
    .then((products) => initContact(root, products));
}

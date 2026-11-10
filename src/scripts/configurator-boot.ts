import { initConfigurator } from './configurator';
import { t } from '../i18n/ui';

const root = document.querySelector<HTMLElement>('[data-configurator]');
if (root) {
  const loading = root.querySelector<HTMLElement>('[data-cfg-loading]')!;
  fetch(root.dataset.catalog!)
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
    .then((products) => {
      root.querySelector<HTMLElement>('[data-cfg-workspace]')!.hidden = false;
      loading.hidden = true;
      initConfigurator(root, products);
    })
    .catch(() => {
      loading.textContent = t(root.dataset.lang === 'en' ? 'en' : 'de').cfg.loadError;
      loading.classList.add('status--error');
    });
}

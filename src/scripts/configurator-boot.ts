import { initConfigurator } from './configurator';
import { t } from '../i18n/ui';
import { setStatus } from '../lib/status';

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
      const lang = root.dataset.lang === 'en' ? 'en' : 'de';
      loading.classList.add('status');
      setStatus(loading, lang, t(lang).cfg.loadError, 'error');
    });
}

import { defineConfig } from 'astro/config';

// Statischer Build: jede Route wird als eigenes HTML nach dist/ geschrieben.
export default defineConfig({
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory', assets: '_app' },
  compressHTML: true,
  devToolbar: { enabled: false },
  server: { host: true },
});

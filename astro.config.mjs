import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

// canonical / OGP / sitemap 用。本番ドメインに合わせて変更するか、SITE 環境変数で指定してください。
const site = process.env.SITE || 'https://example.com';

export default defineConfig({
  site,
  output: 'static',
  integrations: [sitemap()],
  build: {
    inlineStylesheets: 'auto',
  },
});

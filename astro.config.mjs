// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Deployed to GitHub Pages as a user site (AsifShaikDS.github.io), so `base` is '/'.
// If this ever moves to a project repo, set `base: '/<repo-name>'` here and nowhere else —
// every internal link on the site goes through `src/lib/url.ts`.
export default defineConfig({
  site: 'https://asifshaikds.github.io',
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      wrap: true,
    },
  },
});

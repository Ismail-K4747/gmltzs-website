import { defineConfig } from 'astro/config';

// GM Group website — Astro config
// Site is built to static HTML for deployment to Cloudflare Pages (or GitHub Pages).
export default defineConfig({
  site: 'https://gmltzs.com',
  output: 'static',
  trailingSlash: 'ignore',
  build: {
    format: 'file', // emit /about.html instead of /about/index.html — preserves current URLs
    assets: '_astro',
  },
  compressHTML: true,
});

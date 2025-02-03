// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';

import sitemap from '@astrojs/sitemap';

import netlify from '@astrojs/netlify';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  site: 'https://binaural.be',

  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [react(), sitemap()],
  adapter: netlify()
});
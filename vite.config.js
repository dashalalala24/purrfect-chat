import { defineConfig } from 'vite';
import handlebars from 'vite-plugin-handlebars';

export default defineConfig({
  server: {
    port: 3000,
  },
  build: {
    outDir: './dist',
  },
  base: './',
  root: '.',
  plugins: [handlebars()],
  css: {
    postcss: './postcss.config.js',
  },
});

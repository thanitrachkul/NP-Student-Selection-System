import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      // When deploying to GitHub Pages, assets must be served from the repository subpath.
      // Setting `base` ensures that Vite generates correct relative URLs when building
      // the project. Without this, assets such as CSS and JS are requested from
      // the domain root (e.g. https://username.github.io/) instead of
      // https://username.github.io/NP-Student-Selection-System/, causing 404 errors.
      base: '/NP-Student-Selection-System/',
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});

/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Served at amanahdigital.co.uk/games/spy/ (the main site's Worker proxies GitHub Pages).
export default defineConfig({
  base: '/games/spy/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['icon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Spy – Pass the phone',
        short_name: 'Spy',
        description: 'A pass-the-phone party game of secret words and hidden spies.',
        id: '/games/spy/',
        start_url: '/games/spy/',
        scope: '/games/spy/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#070a07',
        theme_color: '#070a07',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Everything the game needs is precached, so it plays with no connection.
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: '/games/spy/index.html',
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
  },
});

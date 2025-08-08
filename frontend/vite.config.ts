// ✅ FILE: vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';
import { fileURLToPath } from 'url';

// 🔁 Compatibilidad __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  base: '/',

  // ✅ Plugins
  plugins: [
    react(),

    // ✅ Progressive Web App (PWA)
    VitePWA({
      strategies: 'injectManifest',
      injectManifest: {
        swSrc: path.resolve(__dirname, 'src/service-worker/sw.base.js'),
      },
      filename: 'custom-sw.js',
      injectRegister: null,
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.ico',
        'apple-touch-icon.png',
        'logo192.png',
        'logo512.png',
        'offline.html'
      ],
      manifest: {
        short_name: 'MundoIAanime',
        name: 'MundoIAanime Ecom',
        description: 'MundoIAanime — Cursos para crear anime con IA.',
        id: '/',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#000000',
        lang: 'es-VE',
        dir: 'ltr',
        prefer_related_applications: false,
        icons: [
          {
            src: 'favicon.ico',
            sizes: '16x16 24x24 32x32 64x64',
            type: 'image/x-icon'
          },
          {
            src: 'apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png'
          },
          {
            src: 'logo192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'logo512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: '/index.html'
      }
    })
  ],

  // ✅ Resolución de alias
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    }
  },

  // ✅ Configuración de build
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },

  // ✅ Dev server (solo afecta desarrollo local)
  server: {
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  },

  // ✅ Optimización de dependencias
  optimizeDeps: {
    include: ['jwt-decode']
  }
});

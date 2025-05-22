import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/moonylander/', // Set base for GitHub Pages deployment
  plugins: [
    react(),
    tailwindcss(),    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['moonlander-icon.svg'],
      manifest: {
        name: 'MoonLander',
        short_name: 'MoonLander',
        description: 'Moon Lander Game - Control your spacecraft and land safely on the lunar surface',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        start_url: '/moonlander/',
        icons: [
          {
            src: 'moonlander-icon.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
          },
          {
            src: 'moonlander-icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
          },
        ],
      },
    }),
  ],
})

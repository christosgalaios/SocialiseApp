import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // VITE_BASE_URL is set per workflow:
  //   production  → /SocialiseApp/prod/
  //   development → /SocialiseApp/dev/
  // Falls back to '/' for local dev.
  base: process.env.VITE_BASE_URL || '/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-motion': ['framer-motion'],
          'vendor-maps': ['@react-google-maps/api', 'use-places-autocomplete'],
        },
      },
    },
  },
})

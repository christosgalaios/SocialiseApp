import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // VITE_BASE_URL is set per workflow:
  //   master  → /SocialiseApp/
  //   develop → /SocialiseApp/dev/
  // Falls back to '/' for local dev.
  base: process.env.VITE_BASE_URL || '/',
})

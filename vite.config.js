import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    fs: {
      // Allow Vite to serve files from the project root AND public folder
      allow: [
        'C:/Projects/SafetyApp/frontend',
        'C:/Projects/SafetyApp/frontend/public'
      ]
    }
  }
})
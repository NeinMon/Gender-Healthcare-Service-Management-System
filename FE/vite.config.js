import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Thiết lập proxy cho API
      '/api': {
        target: 'http://localhost:8080', // Địa chỉ của backend Spring Boot
        changeOrigin: true,
        secure: false
      }
    }
  }
})

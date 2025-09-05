import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // 외부 접근 허용 (ngrok 등)
    allowedHosts: ['6222-27-116-192-153.ngrok-free.app'], // ngrok 주소 추가
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})

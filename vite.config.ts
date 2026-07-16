import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/symphony_simrs_v2.0_cr201/',
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    host: '0.0.0.0', // Bisa diakses dari IP jaringan lokal
    watch: {
      // Baris ini wajib ditambahin biar Vite gak ngawasin folder server!
      ignored: ['**/server/**'] 
    },
    proxy: {
      // Semua request ke /api akan di-forward ke backend Express di port 5000
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
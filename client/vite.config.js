import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // הגדרות שרת פיתוח
  server: {
    port: 5173,
    // Proxy לבקשות API בפיתוח
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },

  // הגדרות Build
  build: {
    outDir: 'dist',
    sourcemap: false,
    // אופטימיזציות
    minify: 'esbuild',
    target: 'es2015',
  },

  // תמיכה ב-CSS
  css: {
    devSourcemap: true,
  },
})

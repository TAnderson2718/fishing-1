import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages 部署配置
  base: '/fishing-1/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // 确保静态资源正确处理
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom']
        }
      }
    }
  },
  // 开发服务器配置
  server: {
    port: 5176,
    host: true
  },
  // 预览服务器配置
  preview: {
    port: 4173,
    host: true
  }
})

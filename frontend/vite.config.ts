import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// 从环境变量获取后端地址，默认使用 5001 端口
const BACKEND_URL = process.env.VITE_BACKEND_URL || 'http://localhost:5001'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: BACKEND_URL,
        changeOrigin: true,
      },
    },
  },
})


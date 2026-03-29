import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      // Use core source directly (monorepo) so app can consume new domain APIs
      '@biogas-simulator/core': path.resolve(__dirname, '../../packages/core/src')
    }
  },
  optimizeDeps: {
    exclude: ['@biogas-simulator/ui']
  }
})

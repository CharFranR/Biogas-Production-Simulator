import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  define: {
    // Some deps (e.g. xlsx) may reference process.env in browser builds
    'process.env': {}
  },
  resolve: {
    alias: {
      // Use core source directly (monorepo) so app can consume new domain APIs
      '@biogas-simulator/core': path.resolve(__dirname, '../../packages/core/src'),
      // Use advisor source directly (monorepo) for TS + bundling
      '@biogas-simulator/advisor': path.resolve(__dirname, '../../packages/advisor/src'),
      buffer: 'buffer'
    }
  },
  optimizeDeps: {
    exclude: ['@biogas-simulator/ui']
  }
})

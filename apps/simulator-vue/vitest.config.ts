import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  // Vitest bundles its own Vite types; casting avoids mismatched Vite type versions.
  plugins: [vue() as any],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.ts']
  }
})

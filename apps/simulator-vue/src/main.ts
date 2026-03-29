import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import { router } from './router'

// Polyfill Buffer for browser bundles (xlsx expects it in some code paths)
import { Buffer } from 'buffer'

;(globalThis as unknown as { Buffer?: typeof Buffer }).Buffer = Buffer

createApp(App).use(router).mount('#app')

<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { Header } from '@biogas-simulator/ui'

const navItems = [
  { to: '/', label: 'Simulación' },
  { to: '/params/basic', label: 'Básicos' },
  { to: '/params/environment', label: 'Ambientales' },
  { to: '/params/physical', label: 'Físicos' },
  { to: '/params/biological', label: 'Biológicos' }
]
</script>

<template>
  <Header />

  <div class="flex min-h-[calc(100vh-88px)]">
    <aside class="w-56 border-r border-gray-100 bg-white p-4 hidden md:block">
      <nav class="flex flex-col gap-2">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="px-3 py-2 rounded-md text-sm text-[#4180ab] hover:bg-[#4180ab]/10"
          active-class="bg-[#4180ab]/15 font-semibold"
        >
          {{ item.label }}
        </RouterLink>
      </nav>
    </aside>

    <main class="flex-1 px-4 py-6">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { Header } from '@biogas-simulator/ui'
import SimulationDashboard from '../views/SimulationDashboard.vue'
</script>

<template>
  <div class="min-h-dvh flex flex-col">
    <Header />

    <main class="flex-1 overflow-hidden px-4 py-6">
      <SimulationDashboard />
    </main>
  </div>
</template>

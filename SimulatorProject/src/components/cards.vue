<script setup>
import { ref } from 'vue'

const titulo = ref('Componente con Tailwind')
</script>

<template>
  <div class="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-lg flex items-center space-x-4">
    <div class="shrink-0">
      <div class="h-12 w-12 bg-indigo-500 rounded-full"></div>
    </div>
    <div>
      <div class="text-xl font-medium text-black">{{ titulo }}</div>
      <p class="text-slate-500">¡Tailwind está funcionando!</p>
    </div>
  </div>
</template>

<style scoped></style>
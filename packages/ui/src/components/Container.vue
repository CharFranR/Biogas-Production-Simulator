<script setup lang="ts">
defineProps<{
  label?: string
  maxSize?: string
}>()
</script>

<template>
  <div :class="['flex flex-col shadow-sm p-4 rounded-md border border-gray-100 bg-white', maxSize]">
    <h2 v-if="label" class="text-[#4180ab]/70 font-medium text-lg mb-3">
      {{ label }}
    </h2>

    <slot />
  </div>
</template>

<script setup>

defineProps({
  label: String,
  value: String,
  unit: String,
  iconPath: String
})


</script>

<template>
  <div class="flex items-center gap-4 p-5 bg-white border border-gray-100 rounded-2xl shadow-sm w-full max-w-xs m-4">
    
    <div class="shrink-0 flex items-center justify-center w-12 h-12 bg-[#4180ab]/10 rounded-xl">
      <svg class="w-6 h-6 text-[#4180ab]" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" :d="iconPath" />
      </svg>
    </div>

    <div class="flex-1">
      <p class="text-sm font-medium text-[#4180ab]/70">{{ label }}</p>
      
      <h3 class="text-2xl font-semibold text-[#4180ab] tracking-tight">
        {{ value }} <span class="text-base align-top ml-0.5 font-bold">{{ unit }}</span>
      </h3>
    </div>

  </div>
</template>
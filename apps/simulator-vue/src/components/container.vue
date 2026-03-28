<script setup >
    defineProps ( {
        label: String,
        maxSize: { type: String, default: "" },
    })
</script>


<template>
  <div :class="['flex flex-col shadow-sm m-4 p-4 rounded-md', maxSize]">
    <h2 class="text-[#4180ab]/70">
      {{ label }}
    </h2>

    <slot />
  </div>
</template>
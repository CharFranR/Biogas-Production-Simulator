<script setup>
const props = defineProps({
    buttonName: String,
    iconPath: String
})

const emit = defineEmits(['click'])
</script>

<template>

<div @click="$emit('click')" class="flex items-center justify-center shadow-sm w-full max-w-2xs  bg-[#4180ab]/80 rounded-2xl cursor-pointer">
    
    <div class="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl">
      <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" :d="iconPath" />
      </svg>
    </div>

    <div class="flex text-white ">
        {{buttonName}}
    </div>
</div>

</template>

<style scoped></style>
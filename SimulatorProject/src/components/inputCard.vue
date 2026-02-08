<script setup>
    defineProps ( {
        label: String
    })
</script>


<template>

<div class="flex flex-col gap-1 justify-center max-w-2xs m-4 ">
    <h4 class="text-[#4180ab] text-sm">{{label}}</h4>
    <input type="number" class="flex w-full border-1 border-solid  border-[#4180ab]/50 p-1 rounded-md ">
</div>

</template>
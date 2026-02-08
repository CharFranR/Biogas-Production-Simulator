<script setup >
    defineProps ( {
        label: String
    })
</script>


<template>
    <div class="flex flex-col max-w-xs shadow-sm m-4 p-4 rounded-md ">

        <h2 class="text-[#4180ab]/70">
            {{ label }}
        </h2>

        <slot />
    </div>
</template>
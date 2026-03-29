<script setup lang="ts">
const props = defineProps({
    label: String,
    modelValue: { type: [String, Number], default: '' },
    type: { type: String, default: 'number' }
})

const emit = defineEmits(['update:modelValue'])

function onInput(e: Event) {
    const target = e.target as HTMLInputElement
    if (props.type === 'number') {
        const val = target.valueAsNumber
        emit('update:modelValue', Number.isNaN(val) ? null : val)
    } else {
        emit('update:modelValue', target.value)
    }
}
</script>


<template>

<div class="flex flex-col gap-1 justify-center max-w-2xs mt-2 ">
        <h4 class="text-[#4180ab] text-sm">{{label}}</h4>
        <input :type="type" :value="modelValue" @input="onInput" class="flex w-full border-1 border-solid  border-[#4180ab]/50 p-1 rounded-md ">
</div>

</template>
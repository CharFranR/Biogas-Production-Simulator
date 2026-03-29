<script setup lang="ts">
const props = defineProps({
    label: String,
    modelValue: { type: [String, Number, null], default: '' },
    type: { type: String, default: 'number' },
    disabled: { type: Boolean, default: false },
    min: { type: Number, required: false },
    max: { type: Number, required: false },
    step: { type: Number, required: false },
    placeholder: { type: String, required: false }
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
 
<div class="flex flex-col gap-1 justify-center">
        <h4 class="text-[#4180ab] text-sm">{{label}}</h4>
        <input
            :type="type"
            :value="modelValue ?? ''"
            :disabled="disabled"
            :min="min"
            :max="max"
            :step="step"
            :placeholder="placeholder"
            @input="onInput"
            class="flex w-full border-1 border-solid  border-[#4180ab]/50 p-1 rounded-md disabled:opacity-60 disabled:cursor-not-allowed"
        >
</div>
 
</template>

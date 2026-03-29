<script setup lang="ts">
import type { AdvisorMatch } from '@biogas-simulator/advisor'

const props = defineProps<{ matches: AdvisorMatch[] }>()

function severityLabel(severity?: AdvisorMatch['action']['severity']) {
  if (severity === 'critical') return 'Crítico'
  if (severity === 'warn') return 'Advertencia'
  return 'Info'
}

function severityClasses(severity?: AdvisorMatch['action']['severity']) {
  switch (severity) {
    case 'critical':
      return 'border-red-200 bg-red-50 text-red-700'
    case 'warn':
      return 'border-amber-200 bg-amber-50 text-amber-700'
    default:
      return 'border-blue-200 bg-blue-50 text-blue-700'
  }
}
</script>

<template>
  <div class="space-y-3">
    <h3 class="text-lg font-semibold text-[#4180ab]">Recomendaciones del asesor</h3>

    <div v-if="props.matches.length === 0" class="text-sm text-gray-500">
      Ejecutá una simulación para ver recomendaciones.
    </div>

    <div v-else class="space-y-3">
      <article
        v-for="match in props.matches"
        :key="match.ruleId"
        class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
      >
        <header class="flex flex-wrap items-center gap-2">
          <span class="text-sm font-semibold text-gray-900">{{ match.title }}</span>
          <span
            class="rounded-full border px-2 py-0.5 text-xs font-semibold"
            :class="severityClasses(match.action.severity)"
          >
            {{ severityLabel(match.action.severity) }}
          </span>
        </header>
        <p class="mt-2 text-sm text-gray-700">{{ match.action.message }}</p>

        <div class="mt-3 rounded-md border border-gray-100 bg-gray-50 p-3 text-xs text-gray-600">
          <p class="font-semibold">Evidencia</p>
          <p class="mt-1">
            {{ match.evidence.pdf }} · pág. {{ match.evidence.page }}
          </p>
          <p class="mt-1 italic">“{{ match.evidence.quote }}”</p>
        </div>
      </article>
    </div>
  </div>
</template>

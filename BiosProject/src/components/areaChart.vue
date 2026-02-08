<script setup>
import { computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'

const props = defineProps({
  seriesA: { type: Array, default: () => [] }, // seriesAccum
  seriesB: { type: Array, default: () => [] }, // seriesDaily
  nameA: { type: String, default: 'Serie A' },
  nameB: { type: String, default: 'Serie B' },
  colorA: { type: String, default: '#5470c6' },
  colorB: { type: String, default: '#91cc75' },
  title: { type: String, default: '' }
})

const chartSeries = computed(() => [
  {
    name: props.nameB,
    type: 'area',
    data: props.seriesB.map((val, i) => ({ x: i + 1, y: val }))
  },
  {
    name: props.nameA,
    type: 'line',
    data: props.seriesA.map((val, i) => ({ x: i + 1, y: val }))
  }
])

const chartOptions = computed(() => ({
  chart: {
    type: 'line',
    toolbar: { show: false },
    zoom: { enabled: false },
  },
  colors: [props.colorB, props.colorA],
  stroke: {
    curve: 'smooth',
    width: [2, 4]
  },
  fill: {
    type: ['gradient', 'solid'],
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.4,
      opacityTo: 0.1,
      stops: [0, 90, 100]
    }
  },
  xaxis: {
    type: 'numeric',
    title: { text: 'Día de Simulación' },
    labels: { 
      style: { colors: '#94a3b8' },
      // Opcional: Asegurar que el eje X no tenga decimales ya que son días
      formatter: (val) => Math.floor(val) 
    }
  },
  yaxis: [
    {
      // Eje Izquierdo: Producción Diaria
      title: { text: props.nameB, style: { color: props.colorB } },
      labels: { 
        style: { colors: props.colorB },
        formatter: (val) => val.toFixed(2) // <--- LIMITAR A 2 DECIMALES
      },
    },
    {
      // Eje Derecho: Producción Acumulada
      opposite: true,
      title: { text: props.nameA, style: { color: props.colorA } },
      labels: { 
        style: { colors: props.colorA },
        formatter: (val) => val.toFixed(2) // <--- LIMITAR A 2 DECIMALES
      },
    }
  ],
  tooltip: {
    shared: true,
    intersect: false,
    x: { formatter: (val) => `Día ${val}` },
    y: {
      // Formateador para los valores dentro del tooltip
      formatter: (val) => val.toFixed(2) + " m³" // <--- LIMITAR A 2 DECIMALES
    }
  },
  legend: { position: 'top', horizontalAlign: 'right' },
  grid: { borderColor: '#f1f5f9' },
  markers: { size: 0 }
}))
</script>

<template>
  <div class="w-full bg-white rounded-lg p-2">
    <h3 v-if="title" class="text-lg font-bold mb-4 text-slate-700">{{ title }}</h3>
    
    <div v-if="seriesA.length > 0" class="h-[350px]">
      <VueApexCharts
        width="100%"
        height="100%"
        :options="chartOptions"
        :series="chartSeries"
      />
    </div>

    <div v-else class="h-[350px] flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-xl bg-slate-50">
      <div class="p-3 bg-white rounded-full shadow-sm mb-3">
        <svg class="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      </div>
      <p class="text-slate-500 font-medium">Esperando datos de simulación</p>
      <p class="text-slate-400 text-xs">Modifica los parámetros y pulsa el botón "Ejecutar"</p>
    </div>
  </div>
</template>
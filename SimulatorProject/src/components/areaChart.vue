<template>
  <div ref="chart" class="area-chart"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  seriesA: { type: Array, default: () => [] }, // p.ej. [{x: '2026-01-01', y: 10}, ...] o [10,20,...]
  seriesB: { type: Array, default: () => [] },
  nameA: { type: String, default: 'Serie A' },
  nameB: { type: String, default: 'Serie B' },
  colorA: { type: String, default: '#5470c6' },
  colorB: { type: String, default: '#91cc75' },
  title: { type: String, default: '' }
})

const chart = ref(null)
let instance = null

function normalize(series) {
  // acepta objetos tipo { label: value, ... }, arrays de objetos [{x,y}, ...], o arrays de valores [y, y, ...]
  if (series && typeof series === 'object' && !Array.isArray(series)) {
    const keys = Object.keys(series)
    return {
      xs: keys,
      ys: keys.map(k => Number(series[k] ?? 0))
    }
  }

  if (!Array.isArray(series)) return { xs: [], ys: [] }
  if (series.length === 0) return { xs: [], ys: [] }
  if (typeof series[0] === 'object' && series[0] !== null && ('x' in series[0] || 'y' in series[0])) {
    return {
      xs: series.map(p => p.x ?? ''),
      ys: series.map(p => p.y ?? 0)
    }
  }

  // array de valores
  return {
    xs: series.map((_, i) => String(i)),
    ys: series.map(v => Number(v ?? 0))
  }
}

function buildOptions() {
  const a = normalize(props.seriesA)
  const b = normalize(props.seriesB)

  // intentar tomar eje X de la serie A si existe, si no usar B, si no índices
  const xs = (a.xs.length ? a.xs : (b.xs.length ? b.xs : a.ys.map((_, i) => String(i))))

  return {
    title: { text: props.title, left: 'center' },
    tooltip: { trigger: 'axis' },
    legend: { data: [props.nameA, props.nameB], top: 30 },
    grid: { left: 16, right: 16, bottom: 40, containLabel: true },
    xAxis: {
      type: 'category',
      data: xs,
      boundaryGap: false,
      axisLine: { lineStyle: { color: '#ccc' } },
      axisLabel: { color: '#666' }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#eee' } },
      axisLabel: { color: '#666' }
    },
    series: [
      {
        name: props.nameA,
        type: 'line',
        smooth: true, // <-- suavizado
        showSymbol: false,
        sampling: 'lttb',
        areaStyle: { color: props.colorA, opacity: 0.12 },
        lineStyle: { color: props.colorA, width: 2 },
        emphasis: { focus: 'series' },
        data: a.ys
      },
      {
        name: props.nameB,
        type: 'line',
        smooth: true, // <-- suavizado
        showSymbol: false,
        sampling: 'lttb',
        areaStyle: { color: props.colorB, opacity: 0.12 },
        lineStyle: { color: props.colorB, width: 2, type: 'dashed' },
        emphasis: { focus: 'series' },
        data: b.ys
      }
    ],
    animation: true,
    animationEasing: 'cubicOut'
  }
}

function resize() { instance && instance.resize() }

onMounted(async () => {
  await nextTick()
  if (!chart.value) {
    console.error('areaChart: chart ref is null')
    return
  }

  try {
    console.log('areaChart: props', {
      seriesA: props.seriesA?.length ?? 0,
      seriesB: props.seriesB?.length ?? 0,
      title: props.title
    })

    instance = echarts.init(chart.value)
    instance.setOption(buildOptions())
    window.addEventListener('resize', resize)
  } catch (err) {
    console.error('areaChart: echarts init/setOption fallo', err)
    // fallback: mostrar mensaje simple
    try {
      chart.value.innerHTML = '<div class="no-data">Sin datos o error al dibujar la gráfica</div>'
    } catch (e) {
      /* ignore */
    }
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
  instance && instance.dispose()
})

watch([
  () => props.seriesA,
  () => props.seriesB,
  () => props.title,
  () => props.colorA,
  () => props.colorB,
  () => props.nameA,
  () => props.nameB
], () => {
  if (instance) {
    try {
      instance.setOption(buildOptions(), { notMerge: false })
      instance.resize()
    } catch (err) {
      console.error('areaChart: error updating chart', err)
    }
  } else {
    // si no hay instancia aún, intentar inicializar de nuevo
    try {
      if (chart.value) {
        instance = echarts.init(chart.value)
        instance.setOption(buildOptions())
      }
    } catch (err) {
      console.error('areaChart: error inicializando en watch', err)
    }
  }
}, { deep: true })
</script>

<style scoped>
.area-chart {
  width: 100%;
  height: 320px; /* ajusta según necesites */
}
.no-data {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 14px;
}
</style>
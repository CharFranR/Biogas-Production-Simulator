<template>
  <div ref="chart" class="area-chart"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  seriesA: { type: Array, default: () => [] }, // p.ej. [{x: '2026-01-01', y: 10}, ...] o [10,20,...]
  seriesB: { type: Array, default: () => [] },
  seriesC: { type: [Array, Object], default: () => [] },
  nameA: { type: String, default: 'Serie A' },
  nameB: { type: String, default: 'Serie B' },
  nameC: { type: String, default: 'Serie C' },
  colorA: { type: String, default: '#5470c6' },
  colorB: { type: String, default: '#91cc75' },
  colorC: { type: String, default: '#fac858' },
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

function formatNumber(value, decimals = 2) {
  const num = Number(value)
  if (!Number.isFinite(num)) return '-'
  const fixed = num.toFixed(decimals)
  return fixed.replace(/\.?0+$/, '')
}

function unitForSeries(seriesName) {
  if (seriesName === props.nameA) return 'm³'
  if (seriesName === props.nameB) return 'm³/d'
  if (seriesName === props.nameC) return '%'
  return ''
}

function formatValue(value, seriesName) {
  const unit = unitForSeries(seriesName)
  const decimals = unit === '%' ? 2 : 2
  const formatted = formatNumber(value, decimals)
  return unit ? `${formatted} ${unit}` : formatted
}

function buildOptions() {
  const a = normalize(props.seriesA)
  const b = normalize(props.seriesB)
  const c = normalize(props.seriesC)
  const hasC = c.ys.length > 0

  // intentar tomar eje X de la serie A si existe, si no usar B, si no índices
  const fallbackLength = a.ys.length || b.ys.length || c.ys.length || 0
  const xs = (
    a.xs.length
      ? a.xs
      : b.xs.length
          ? b.xs
          : c.xs.length
              ? c.xs
              : Array.from({ length: fallbackLength }, (_, i) => String(i))
  )

  const legendData = [props.nameA, props.nameB]
  if (hasC) legendData.push(props.nameC)

  const yAxis = [
    {
      type: 'value',
      name: 'm³',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#eee' } },
      axisLabel: { color: '#666', formatter: value => `${formatNumber(value, 2)}` }
    },
    {
      type: 'value',
      name: 'm³/d',
      position: 'right',
      axisLine: { show: false },
      splitLine: { show: false },
      axisLabel: { color: '#666', formatter: value => `${formatNumber(value, 2)}` }
    }
  ]

  if (hasC) {
    yAxis.push({
      type: 'value',
      name: '%',
      position: 'right',
      offset: 44,
      min: 0,
      max: 100,
      axisLine: { show: false },
      splitLine: { show: false },
      axisLabel: { color: '#666', formatter: value => `${formatNumber(value, 2)}` }
    })
  }

  const series = [
    {
      name: props.nameA,
      type: 'line',
      smooth: true, // <-- suavizado
      showSymbol: false,
      sampling: 'lttb',
      yAxisIndex: 0,
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
      yAxisIndex: 1,
      areaStyle: { color: props.colorB, opacity: 0.12 },
      lineStyle: { color: props.colorB, width: 2, type: 'dashed' },
      emphasis: { focus: 'series' },
      data: b.ys
    }
  ]

  if (hasC) {
    series.push({
      name: props.nameC,
      type: 'line',
      smooth: true,
      showSymbol: false,
      sampling: 'lttb',
      yAxisIndex: 2,
      areaStyle: { color: props.colorC, opacity: 0.08 },
      lineStyle: { color: props.colorC, width: 2, type: 'dotted' },
      emphasis: { focus: 'series' },
      data: c.ys
    })
  }

  return {
    title: { text: props.title, left: 'center' },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      formatter: params => {
        if (!Array.isArray(params) || params.length === 0) return ''
        const axisLabel = params[0].axisValueLabel ?? params[0].axisValue ?? ''
        const lines = [axisLabel]

        params.forEach(param => {
          const raw = Array.isArray(param.value) ? param.value[1] : (param.value ?? param.data)
          lines.push(`${param.marker}${param.seriesName}: ${formatValue(raw, param.seriesName)}`)
        })

        return lines.join('<br/>')
      }
    },
    legend: { data: legendData, top: 30 },
    grid: { left: 16, right: hasC ? 72 : 48, bottom: 40, top: 56, containLabel: true },
    xAxis: {
      type: 'category',
      data: xs,
      boundaryGap: false,
      axisLine: { lineStyle: { color: '#ccc' } },
      axisLabel: { color: '#666' }
    },
    yAxis,
    series,
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
  () => props.seriesC,
  () => props.title,
  () => props.colorA,
  () => props.colorB,
  () => props.colorC,
  () => props.nameA,
  () => props.nameB,
  () => props.nameC
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

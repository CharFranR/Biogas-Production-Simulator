<script setup>
import { ref, computed } from 'vue';
import VueApexCharts from 'vue3-apexcharts';

const props = defineProps({
  // Se esperan diccionarios con formato { "YYYY-MM-DD": valor }
  desktopData: {
    type: Object,
    required: true,
    default: () => ({})
  },
  mobileData: {
    type: Object,
    required: true,
    default: () => ({})
  }
});

const timeRange = ref('90d');

// 1. Normalización y Unión de datos
const combinedData = computed(() => {
  const dates = Object.keys({ ...props.desktopData, ...props.mobileData }).sort();
  
  return dates.map(date => ({
    date,
    desktop: props.desktopData[date] || 0,
    mobile: props.mobileData[date] || 0
  }));
});

// 2. Filtrado por rango de tiempo
const filteredData = computed(() => {
  const referenceDate = new Date("2024-06-30"); // Fecha de referencia igual al original
  let daysToSubtract = 90;
  
  if (timeRange.value === "30d") daysToSubtract = 30;
  if (timeRange.value === "7d") daysToSubtract = 7;

  const startDate = new Date(referenceDate);
  startDate.setDate(startDate.getDate() - daysToSubtract);

  return combinedData.value.filter(item => new Date(item.date) >= startDate);
});

// 3. Configuración de ApexCharts (Estilos Shadcn)
const chartOptions = computed(() => ({
  chart: {
    type: 'area',
    toolbar: { show: false },
    zoom: { enabled: false },
    fontFamily: 'Inter, sans-serif',
  },
  dataLabels: { enabled: false },
  stroke: {
    curve: 'smooth',
    width: 2,
    colors: ['#2563eb', '#60a5fa'] // Colores var(--chart-1) y var(--chart-2)
  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.45,
      opacityTo: 0.05,
      stops: [20, 100]
    }
  },
  grid: {
    borderColor: '#e2e8f0',
    strokeDashArray: 4,
    xaxis: { lines: { show: false } },
    yaxis: { lines: { show: true } },
  },
  xaxis: {
    type: 'datetime',
    categories: filteredData.value.map(d => d.date),
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: {
      style: { colors: '#64748b' },
      formatter: (val) => {
        return new Date(val).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      }
    }
  },
  yaxis: { show: false },
  tooltip: {
    shared: true,
    intersect: false,
    x: {
      formatter: (val) => new Date(val).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    }
  },
  legend: {
    position: 'bottom',
    horizontalAlign: 'center',
  },
  colors: ['#2563eb', '#60a5fa']
}));

const series = computed(() => [
  {
    name: 'Desktop',
    data: filteredData.value.map(d => d.desktop)
  },
  {
    name: 'Mobile',
    data: filteredData.value.map(d => d.mobile)
  }
]);
</script>

<template>
  <div class="w-full max-w-4xl mx-auto p-4">
    <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-6 border-b border-slate-100">
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-slate-900">Area Chart - Interactive</h3>
          <p class="text-sm text-slate-500">Showing total visitors for the last {{ timeRange === '90d' ? '3 months' : timeRange }}</p>
        </div>

        <div class="relative w-full sm:w-[160px]">
          <select 
            v-model="timeRange"
            class="w-full appearance-none bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
          >
            <option value="90d">Last 3 months</option>
            <option value="30d">Last 30 days</option>
            <option value="7d">Last 7 days</option>
          </select>
          <div class="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
      </div>

      <div class="p-4 sm:p-6">
        <div class="h-[250px] w-full">
          <VueApexCharts
            type="area"
            height="100%"
            :options="chartOptions"
            :series="series"
          />
        </div>
      </div>

    </div>
  </div>
</template>
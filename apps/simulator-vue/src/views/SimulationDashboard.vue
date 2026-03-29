<script setup lang="ts">
import { ResultCard, Button, InputCard, Container, AreaChart } from '@biogas-simulator/ui'
import { useSimulation } from '../utilities/useSimulation'
import { exportToExcel, exportToCSV, createDownloadBlob, downloadFile, type SimulationData } from '@biogas-simulator/core'

const iconTrending = "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
const iconMonitoing = "M22 12h-4l-3 9L9 3l-3 9H2"
const iconMoinsture = "M12 2s6 7 6 11a6 6 0 1 1-12 0c0-4 6-11 6-11z"
const iconWind = "M17.7 7.7A7.1 7.1 0 1 1 5 13.1M18 13.1h-8M6 13.1H2M14.5 17.5A3.5 3.5 0 0 1 11 21H2M10.5 8.5A3.5 3.5 0 1 1 14 5H2"
const iconPlay = "M5 3l14 9-14 9V3z"
const iconExcel = "M6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm0 2v16h12V10h-6V4H6zm8 0v4h4l-4-4z"
const iconCSV = "M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 2h5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2z"

const {
  config,
  resolvedMaterial,
  moistureDefault,
  moistureModel,
  moistureManuallyOverridden,
  runSimulation,
  seriesAccum,
  seriesDaily,
  outputs,
  formattedOutputs
} = useSimulation()

function deriveAccumPct(accum: number[]) {
  if (!Array.isArray(accum) || accum.length === 0) return []
  const lastValue = accum[accum.length - 1]
  const maxValue = Math.max(...accum.filter(value => Number.isFinite(value)))
  const totalCandidate = Number.isFinite(lastValue) ? lastValue : maxValue
  const total = Number.isFinite(totalCandidate) ? totalCandidate : 0
  if (total <= 0) return accum.map(() => 0)

  return accum.map(value => {
    if (!Number.isFinite(value)) return 0
    return Number(((value / total) * 100).toFixed(2))
  })
}

function setMaterialMode(mode: 'preset' | 'custom') {
  if (mode === 'preset') {
    ;(config.basic as unknown as { material: unknown }).material = { mode: 'preset', presetId: 'bovino' }
    return
  }

  // Initialize custom values from current resolved material (useful when switching from preset)
  const current = resolvedMaterial.value
  ;(config.basic as unknown as { material: unknown }).material = {
    mode: 'custom',
    custom: {
      name: 'Personalizado',
      totalSolidsFraction: Number(current.totalSolidsFraction),
      volatileSolidsFraction: Number(current.volatileSolidsFraction),
      potentialBiogas: Number(current.potentialBiogas)
    }
  }
}

function setPresetId(presetId: 'bovino') {
  ;(config.basic as unknown as { material: unknown }).material = { mode: 'preset', presetId }
}

function resetMoistureToDefault() {
  moistureModel.value = null
}

function exportToExcelFile() {
  if (seriesAccum.value.length === 0) {
    alert('Primero ejecuta una simulación para exportar datos')
    return
  }

  const simulationData: SimulationData = {
    inputs: config,
    outputs: {
      monod: outputs.monod,
      potentialProduction: outputs.potentialProduction,
      TotalSolids: outputs.TotalSolids,
      VolatileSolids: outputs.VolatileSolids
    },
    timeSeries: {
      time: Array.from({ length: seriesAccum.value.length }, (_, i) => i + 1),
      accumulated: seriesAccum.value,
      daily: seriesDaily.value
    },
    metadata: {
      simulationName: resolvedMaterial.value.name || 'Simulación Biogás',
      createdAt: new Date().toISOString(),
      version: '1.0'
    }
  }

  try {
    const excelData = exportToExcel(simulationData)
    const blob = createDownloadBlob(excelData, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    downloadFile(blob, `simulacion_biogas_${new Date().toISOString().split('T')[0]}.xlsx`)
  } catch (error) {
    console.error('Error exportando a Excel:', error)
    alert('Error al exportar a Excel. Revisa la consola para más detalles.')
  }
}

function exportToCSVFile() {
  if (seriesAccum.value.length === 0) {
    alert('Primero ejecuta una simulación para exportar datos')
    return
  }

  const simulationData: SimulationData = {
    inputs: config,
    outputs: {
      monod: outputs.monod,
      potentialProduction: outputs.potentialProduction,
      TotalSolids: outputs.TotalSolids,
      VolatileSolids: outputs.VolatileSolids
    },
    timeSeries: {
      time: Array.from({ length: seriesAccum.value.length }, (_, i) => i + 1),
      accumulated: seriesAccum.value,
      daily: seriesDaily.value
    },
    metadata: {
      simulationName: resolvedMaterial.value.name || 'Simulación Biogás',
      createdAt: new Date().toISOString(),
      version: '1.0'
    }
  }

  try {
    const csvData = exportToCSV(simulationData)
    const blob = createDownloadBlob(csvData, 'text/csv')
    downloadFile(blob, `simulacion_biogas_${new Date().toISOString().split('T')[0]}.csv`)
  } catch (error) {
    console.error('Error exportando a CSV:', error)
    alert('Error al exportar a CSV. Revisa la consola para más detalles.')
  }
}

</script>


<template>
  <div class="grid grid-cols-12 gap-6 h-full">

      <!-- Left column: inputs -->
      <div class="col-span-12 lg:col-span-4 h-full overflow-hidden">
        <div class="h-full overflow-y-auto">
          <Container label="Parámetros de Simulación">
            <div class="mt-2">
            <h4 class="text-[#4180ab] text-sm">Material</h4>

            <div class="mt-2 flex gap-2">
              <button
                type="button"
                class="px-3 py-1 rounded-md text-sm border border-[#4180ab]/40"
                :class="(config.basic as any).material?.mode === 'preset' ? 'bg-[#4180ab]/15 font-semibold' : 'bg-white'"
                @click="setMaterialMode('preset')"
              >
                Preset
              </button>
              <button
                type="button"
                class="px-3 py-1 rounded-md text-sm border border-[#4180ab]/40"
                :class="(config.basic as any).material?.mode === 'custom' ? 'bg-[#4180ab]/15 font-semibold' : 'bg-white'"
                @click="setMaterialMode('custom')"
              >
                Custom
              </button>
            </div>

            <div v-if="(config.basic as any).material?.mode === 'preset'" class="mt-3">
              <label class="text-sm text-gray-700">Preset</label>
              <select
                class="mt-1 w-full border border-[#4180ab]/50 p-2 rounded-md"
                :value="(config.basic as any).material?.presetId"
                @change="setPresetId(($event.target as HTMLSelectElement).value as 'bovino')"
              >
                <option value="bovino">Bovino</option>
              </select>
            </div>

            <div v-if="(config.basic as any).material?.mode === 'custom'" class="mt-3">
              <InputCard
                label="Nombre (custom)"
                type="text"
                :model-value="(config.basic as any).material.custom.name"
                @update:model-value="v => ((config.basic as any).material.mode === 'custom' ? ((config.basic as any).material.custom.name = String(v ?? '')) : null)"
              />
            </div>
          </div>

          <div class="mt-3 space-y-3">
            <InputCard
              label="Fracción Sólidos Totales (0-1)"
              :disabled="(config.basic as any).material?.mode === 'preset'"
              :min="0"
              :max="1"
              :step="0.01"
              :model-value="resolvedMaterial.totalSolidsFraction"
              @update:model-value="v => {
                if ((config.basic as any).material.mode === 'custom') (config.basic as any).material.custom.totalSolidsFraction = Number(v)
              }"
            />
            <InputCard
              label="Fracción VS/TS (0-1)"
              :disabled="(config.basic as any).material?.mode === 'preset'"
              :min="0"
              :max="1"
              :step="0.01"
              :model-value="resolvedMaterial.volatileSolidsFraction"
              @update:model-value="v => {
                if ((config.basic as any).material.mode === 'custom') (config.basic as any).material.custom.volatileSolidsFraction = Number(v)
              }"
            />
            <InputCard
              label="Potencial (m³/kg SV)"
              :disabled="(config.basic as any).material?.mode === 'preset'"
              :step="0.0001"
              :model-value="resolvedMaterial.potentialBiogas"
              @update:model-value="v => {
                if ((config.basic as any).material.mode === 'custom') (config.basic as any).material.custom.potentialBiogas = Number(v)
              }"
            />

            <InputCard label="Densidad Aprox. (kg/m³)" v-model="config.physical.approxDensity" />
            <InputCard label="Temperatura (°C)" v-model="config.environmental.temperature" />
            <InputCard label="Tiempo de Retardo (días)" v-model="config.biological.lagTime" />
            <InputCard label="Masa de Llenado (kg)" v-model="config.basic.fillingMass" />
          </div>

          <div class="mt-4">
            <InputCard
              label="Humedad del Llenado (%)"
              :min="0"
              :max="100"
              :step="0.1"
              v-model="moistureModel"
              :placeholder="String(moistureDefault)"
            />
            <p class="mt-1 text-xs text-gray-600">
              Default por TS: {{ moistureDefault }}%. <span v-if="moistureManuallyOverridden">(override manual)</span>
            </p>
            <button
              v-if="moistureManuallyOverridden"
              type="button"
              class="mt-2 text-sm text-[#4180ab] underline"
              @click="resetMoistureToDefault"
            >
              Volver al default
            </button>
          </div>

          <div class="mt-3">
            <InputCard label="Agua Agregada (kg)" v-model="config.physical.addedWater" />
          </div>

            <div class="mt-6 space-y-2">
              <Button @click="runSimulation" buttonName="Ejecutar Simulación" :iconPath="iconPlay"></Button>
              <div class="grid grid-cols-2 gap-2">
                <Button @click="exportToExcelFile" buttonName="Exportar Excel" :iconPath="iconExcel"></Button>
                <Button @click="exportToCSVFile" buttonName="Exportar CSV" :iconPath="iconCSV"></Button>
              </div>
            </div>
          </Container>
        </div>
      </div>

      <!-- Right column: chart above, cards below -->
      <div class="col-span-12 lg:col-span-8 h-full overflow-hidden">
        <div class="h-full overflow-y-auto space-y-6">
          <div class="sticky top-0 z-10 bg-white">
            <Container>
              <AreaChart
                :series-a="seriesAccum"
                :series-b="seriesDaily"
                :series-c="deriveAccumPct(seriesAccum)"
                name-a="Producción acumulada"
                name-b="Producción diaria"
                name-c="Acumulada (%)"
                color-a="#5470c6"
                color-b="#91cc75"
                color-c="#fac858"
                title=""
              />
            </Container>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ResultCard label="Producción Potencial" :value="formattedOutputs.potentialProduction" unit="m³" :iconPath="iconTrending"></ResultCard>
            <ResultCard label="Crecimiento Monod" :value="formattedOutputs.monod" unit="día⁻¹" :iconPath="iconMonitoing"></ResultCard>
            <ResultCard label="Sólidos Totales" :value="formattedOutputs.TotalSolids" :iconPath="iconMoinsture"></ResultCard>
            <ResultCard label="Sólidos Volátiles" :value="formattedOutputs.VolatileSolids" :iconPath="iconWind"></ResultCard>
          </div>
        </div>
      </div>

    </div>
</template>

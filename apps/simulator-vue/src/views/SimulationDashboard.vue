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

const { inputs, runSimulation, seriesAccum, seriesDaily, outputs, formattedOutputs } = useSimulation()

function exportToExcelFile() {
  if (seriesAccum.value.length === 0) {
    alert('Primero ejecuta una simulación para exportar datos')
    return
  }

  const simulationData: SimulationData = {
    inputs: {
      name: inputs.name,
      approxDensity: inputs.approxDensity,
      temperature: inputs.temperature,
      lagTime: inputs.lagTime,
      fillingMass: inputs.fillingMass,
      moistureFilling: inputs.moistureFilling,
      addedWater: inputs.addedWater,
      totalSolidsPercent: inputs.totalSolidsPercent,
      volatileSolidsPercent: inputs.volatileSolidsPercent,
      potentialBiogas: inputs.potentialBiogas
    },
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
      simulationName: inputs.name || 'Simulación Biogás',
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
    inputs: {
      name: inputs.name,
      approxDensity: inputs.approxDensity,
      temperature: inputs.temperature,
      lagTime: inputs.lagTime,
      fillingMass: inputs.fillingMass,
      moistureFilling: inputs.moistureFilling,
      addedWater: inputs.addedWater,
      totalSolidsPercent: inputs.totalSolidsPercent,
      volatileSolidsPercent: inputs.volatileSolidsPercent,
      potentialBiogas: inputs.potentialBiogas
    },
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
      simulationName: inputs.name || 'Simulación Biogás',
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
  <div class="flex flex-col lg:flex-row gap-6">

      <!-- Left column: inputs -->
      <div class="w-full lg:w-1/3">
        <Container label="Parámetros de Simulación" maxSize="max-w-xs">
          <InputCard label="Nombre" type="text" v-model="inputs.name"/>
          <InputCard label="Densidad Aprox. (kg/L)" v-model="inputs.approxDensity"/>
          <InputCard label="Temperatura (°C)" v-model="inputs.temperature"/>
          <InputCard label="Tiempo de Retardo (días)" v-model="inputs.lagTime"/>
          <InputCard label="Masa de Llenado (kg)" v-model="inputs.fillingMass"/>
          <InputCard label="Humedad del Llenado (%)" v-model="inputs.moistureFilling"/>
          <InputCard label="Agua Agregada (kg)" v-model="inputs.addedWater"/>
          <InputCard label="Sólidos Totales " v-model="inputs.totalSolidsPercent"/>
          <InputCard label="Sólidos Volátiles " v-model="inputs.volatileSolidsPercent"/>
          <InputCard label="Producción Potencial de Biogás (m³/kg SV)" v-model="inputs.potentialBiogas"/>

          <div class="mt-4 space-y-2">
            <Button @click="runSimulation" buttonName="Ejecutar Simulación" :iconPath="iconPlay"></Button>
            <div class="grid grid-cols-2 gap-2">
              <Button @click="exportToExcelFile" buttonName="Exportar Excel" :iconPath="iconExcel"></Button>
              <Button @click="exportToCSVFile" buttonName="Exportar CSV" :iconPath="iconCSV"></Button>
            </div>
          </div>
        </Container>
      </div>

      <!-- Right column: chart above, cards below -->
       <div class="w-full lg:w-2/3 flex flex-col ">
        <Container maxSize="w-2xl">
          <AreaChart
            :series-a="seriesAccum"
            :series-b="seriesDaily"
            name-a="Producción acumulada"
            name-b="Producción diaria"
            color-a="#5470c6"
            color-b="#91cc75"
            title=""
          />
        </Container>

        <div class="grid grid-cols-1 sm:grid-cols-2">
          <ResultCard label="Producción Potencial" :value="formattedOutputs.potentialProduction" unit="m³" :iconPath="iconTrending"></ResultCard>
          <ResultCard label="Crecimiento Monod" :value="formattedOutputs.monod" unit="día⁻¹" :iconPath="iconMonitoing"></ResultCard>
          <ResultCard label="Sólidos Totales" :value="formattedOutputs.TotalSolids" :iconPath="iconMoinsture"></ResultCard>
          <ResultCard label="Sólidos Volátiles" :value="formattedOutputs.VolatileSolids" :iconPath="iconWind"></ResultCard>
        </div>
      </div>

    </div>
</template>

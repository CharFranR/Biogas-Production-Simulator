<script setup>

import Cards from '../components/cards.vue'
import Button from '../components/button.vue'
import InputCard from '../components/inputCard.vue'
import Container from '../components/container.vue'
import AreaChart from "../components/areaChart.vue"
import Header from "../components/header.vue"
import { useSimulation } from '../utilities/useSimulation'

const iconTrending = "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
const iconMonitoing = "M22 12h-4l-3 9L9 3l-3 9H2"
const iconMoinsture = "M12 2s6 7 6 11a6 6 0 1 1-12 0c0-4 6-11 6-11z"
const iconWind = "M17.7 7.7A7.1 7.1 0 1 1 5 13.1M18 13.1h-8M6 13.1H2M14.5 17.5A3.5 3.5 0 0 1 11 21H2M10.5 8.5A3.5 3.5 0 1 1 14 5H2"
const iconPlay = "M5 3l14 9-14 9V3z"

const { inputs, runSimulation, seriesAccum, seriesDaily, formattedOutputs } = useSimulation()



</script>


<template>
  <Header></Header>

  <main class="px-4 py-6">
    <div class="flex flex-col lg:flex-row gap-2 justify-start items-start max-w-7xl mx-auto">

      <div class="w-full lg:w-1/3">
        <Container label="Parámetros de Simulación">
          <InputCard label="Nombre" type="text" v-model="inputs.name"/>
          <InputCard label="Densidad Aprox. (kg/L)" v-model="inputs.approxDensity"/>
          <InputCard label="Temperatura (°C)" v-model="inputs.temperature"/>
          <InputCard label="Tiempo de Retardo (días)" v-model="inputs.lagTime"/>
          <InputCard label="Masa de Llenado (kg)" v-model="inputs.fillingMass"/>
          <InputCard label="Humedad del Llenado (%)" v-model="inputs.moistureFilling"/>
          <InputCard label="Agua Agregada (kg)" v-model="inputs.addedWater"/>
          <InputCard label="Sólidos Totales " v-model="inputs.totalSolidsPercent"/>
          <InputCard label="Sólidos Volátiles " v-model="inputs.volatileSolidsPercent"/>
          <InputCard label="Producción Potencial (m³/kg SV)" v-model="inputs.potentialBiogas"/>

          <div class="mt-4">
            <Button @click="runSimulation" buttonName="Ejecutar Simulación" :iconPath="iconPlay"></Button>
          </div>
        </Container>
      </div>

      <div class="w-full lg:w-2/3 flex flex-col max-w-2xl">
        <Container>
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

        <div class="grid grid-cols-1 sm:grid-cols-2 mt-2 max-w-2xl">
          <Cards label="Producción Potencial" :value="formattedOutputs.potentialProduction" unit="m³" :iconPath="iconTrending"></Cards>
          <Cards label="Crecimiento Monod" :value="formattedOutputs.monod" unit="día⁻¹" :iconPath="iconMonitoing"></Cards>
          <Cards label="Sólidos Totales" :value="formattedOutputs.TotalSolids" :iconPath="iconMoinsture"></Cards>
          <Cards label="Sólidos Volátiles" :value="formattedOutputs.VolatileSolids" :iconPath="iconWind"></Cards>
        </div>
      </div>

    </div>
  </main>
</template>
<style scoped> 
</style>
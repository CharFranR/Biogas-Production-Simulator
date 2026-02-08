<script setup lang="ts">
import Cards from './components/cards.vue'
import Button from './components/Button.vue'
import InputCard from './components/inputCard.vue'
import Container from './components/container.vue'
import AreaChart from "./components/AreaChart.vue"

// SVG icons
const iconTrending = "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
const iconMonitoing = "M22 12h-4l-3 9L9 3l-3 9H2"
const iconMoinsture = "M12 2s6 7 6 11a6 6 0 1 1-12 0c0-4 6-11 6-11z"
const iconWind = "M17.7 7.7A7.1 7.1 0 1 1 5 13.1M18 13.1h-8M6 13.1H2M14.5 17.5A3.5 3.5 0 0 1 11 21H2M10.5 8.5A3.5 3.5 0 1 1 14 5H2"
const iconPlay = "M5 3l14 9-14 9V3z"


const desktop = {
  January: 186,
  February: 305,
  March: 237,
  April: 73,
  May: 209,
  June: 214,
  July: 300,
}

const mobile = {
  January: 80,
  February: 200,
  March: 120,
  April: 190,
  May: 130,
  June: 140,
  July: 300,
}

</script>

<template>
  
  
  <Button buttonName="Ejecutar Simulación" :iconPath="iconPlay"></Button>

  <InputCard label="Nombre"/>

  <Container label = "Parámetros de Simulación" maxSize = 'max-w-xs'>
   
    <InputCard label="Nombre"/>
    <InputCard label="Densidad Aprox. (kg/L)"/>
    <InputCard label="Temperatura (°C)"/>

  </Container>

  <Container maxSize = 'max-w-xl'>
    <AreaChart
      :series-a="desktop"
      :series-b="mobile"
      name-a="Producción acumulada"
      name-b="Producción diaria"
      color-a="#5470c6"
      color-b="#91cc75"
      title=""
    />
  </Container>

</template>

<style scoped></style>
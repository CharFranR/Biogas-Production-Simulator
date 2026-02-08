import { reactive, ref } from 'vue'

export function useSimulation() {
  const inputs = reactive({
    name: '',
    approxDensity: '',
    temperature: '',
    lagTime: '',
    fillingMass: '',
    moistureFilling: '',
    addedWater: '',
    totalSolidsPercent: '',
    volatileSolidsPercent: '',
    potentialBiogas: ''
  })

  const seriesAccum = ref([{ name: 'Acumulada', data: [] as number[] }])
  const seriesDaily = ref([{ name: 'Diaria', data: [] as number[] }])

  const formattedOutputs = reactive({
    potentialProduction: '0',
    monod: '0',
    TotalSolids: '0',
    VolatileSolids: '0'
  })

  function runSimulation() {
    const days = 30
    const accum: number[] = []
    const daily: number[] = []
    let acc = 0
    for (let i = 1; i <= days; i++) {
      const d = Math.random() * 5
      acc += d
      daily.push(parseFloat(d.toFixed(2)))
      accum.push(parseFloat(acc.toFixed(2)))
    }

    seriesAccum.value = [{ name: 'Producción acumulada', data: accum }]
    seriesDaily.value = [{ name: 'Producción diaria', data: daily }]

    formattedOutputs.potentialProduction = acc.toFixed(2)
    formattedOutputs.monod = (Math.random() * 0.5).toFixed(3)
    formattedOutputs.TotalSolids = inputs.totalSolidsPercent || '—'
    formattedOutputs.VolatileSolids = inputs.volatileSolidsPercent || '—'
  }

  return { inputs, runSimulation, seriesAccum, seriesDaily, formattedOutputs }
}

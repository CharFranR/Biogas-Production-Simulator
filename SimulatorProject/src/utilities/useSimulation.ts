import { ref, reactive, computed } from 'vue'
import { BasicParams } from '../models/BasicParams'
import { Fill } from '../models/Fill'
import { EnvironmentalParams } from '../models/EnvironmentalParams'
import { SimulationParams } from '../models/SimulationParams'

export function useSimulation() {
  const inputs = reactive({
    name: 'Material',
    approxDensity: 1000, // kg/m3 ~ 1 kg/L
    temperature: 30,
    lagTime: 1,
    fillingMass: 100,
    moistureFilling: 50,
    addedWater: 0,
    totalSolidsPercent: 20,
    volatileSolidsPercent: 0.79,
    potentialBiogas: 0.5
  })

  const outputs = reactive({
    monod: 0,
    potentialProduction: 0,
    TotalSolids: 0,
    VolatileSolids: 0
  })

  const seriesAccum = ref<Array<number>>([])
  const seriesDaily = ref<Array<number>>([])

  function runSimulation() {
    // build model instances
    const basic = new BasicParams(
      inputs.name,
      Number(inputs.totalSolidsPercent),
      Number(inputs.volatileSolidsPercent),
      Number(inputs.potentialBiogas)
    )

    const fill = new Fill(
      Number(inputs.fillingMass),
      Number(inputs.moistureFilling),
      Number(inputs.addedWater),
      basic,
      Number(inputs.lagTime),
      Number(inputs.approxDensity)
    )

    const env = new EnvironmentalParams(Number(inputs.temperature), 0)

    const sim = new SimulationParams(fill, env)

    const raw: number[] = []
    const result = sim.calculateSimulationData(fill, env, raw)

    // parse returned simulationData (expected pairs: [i, value, i2, value2, ...])
    const xs: number[] = []
    const ys: number[] = []
    for (let i = 0; i < result.simulationData.length; i += 2) {
      const x = result.simulationData[i]
      const y = result.simulationData[i + 1]
      if (typeof y === 'number') {
        xs.push(Number(x))
        ys.push(Number(y))
      }
    }

    seriesAccum.value = ys.slice()

    // daily production = difference between cumulative values
    const daily: number[] = []
    for (let i = 0; i < ys.length; i++) {
      const prev = i === 0 ? 0 : (ys[i - 1] ?? 0)
      const curr = ys[i] ?? 0
      daily.push(Number((curr - prev).toFixed(6)))
    }
    seriesDaily.value = daily

    outputs.monod = result.monod
    outputs.potentialProduction = sim.potentialProduction
    outputs.TotalSolids = result.TotalSolids
    outputs.VolatileSolids = result.VolatileSolids
  }

  const formattedOutputs = computed(() => ({
    monod: outputs.monod.toFixed(4),
    potentialProduction: outputs.potentialProduction.toFixed(3),
    TotalSolids: outputs.TotalSolids.toFixed(2),
    VolatileSolids: outputs.VolatileSolids.toFixed(2)
  }))

  return {
    inputs,
    runSimulation,
    seriesAccum,
    seriesDaily,
    outputs,
    formattedOutputs
  }
}

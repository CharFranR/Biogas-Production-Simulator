import { ref, reactive, computed, watch } from 'vue'
import {
  BasicParams,
  Fill,
  EnvironmentalParams,
  SimulationParams,
  createDefaultSimulationConfig,
  getMaterialPreset,
  normalizeCoreInputFactsV1,
  type SimulationData,
  type MaterialCustomConfig,
  type MaterialSelectionConfig,
  type SimulationConfig
} from '@biogas-simulator/core'

export function useSimulation() {
  const config = reactive<SimulationConfig>(createDefaultSimulationConfig())

  // Force new-domain config shape (material selection) even if core returns legacy defaults
  if (!(config.basic as unknown as { material?: unknown }).material) {
    ;(config.basic as unknown as { material: MaterialSelectionConfig }).material = {
      mode: 'preset',
      presetId: 'bovino'
    }
  }

  if (config.physical.moistureFilling === undefined) {
    config.physical.moistureFilling = null
  }

  // UX state: moisture defaults to material TS unless user overrides
  const moistureManuallyOverridden = ref(false)

  const resolvedMaterial = computed<MaterialCustomConfig>(() => {
    const sel: MaterialSelectionConfig = (config.basic as unknown as { material: MaterialSelectionConfig }).material
    if (sel.mode === 'preset') {
      return getMaterialPreset(sel.presetId)
    }
    return sel.custom
  })

  const totalSolidsFraction = computed(() => Number(resolvedMaterial.value.totalSolidsFraction))
  const moistureDefault = computed(() => {
    const ts = totalSolidsFraction.value
    const moisture = (1 - ts) * 100
    if (Number.isNaN(moisture)) return 0
    return Math.min(100, Math.max(0, moisture))
  })

  const moistureDefaultRounded = computed(() => Number(moistureDefault.value.toFixed(2)))

  const moistureModel = computed<number | null>({
    get() {
      const v = config.physical.moistureFilling
      return v === undefined || v === null ? null : Number(v)
    },
    set(v) {
      if (v === null) {
        moistureManuallyOverridden.value = false
        config.physical.moistureFilling = moistureDefaultRounded.value
        return
      }
      moistureManuallyOverridden.value = true
      config.physical.moistureFilling = Number(v)
    }
  })

  watch(
    totalSolidsFraction,
    () => {
      if (!moistureManuallyOverridden.value) {
        config.physical.moistureFilling = moistureDefaultRounded.value
      }
    },
    { immediate: true }
  )

  const outputs = reactive({
    monod: 0,
    potentialProduction: 0,
    TotalSolids: 0,
    VolatileSolids: 0
  })

  const seriesAccum = ref<Array<number>>([])
  const seriesDaily = ref<Array<number>>([])
  const simulationData = ref<SimulationData | null>(null)

  function runSimulation() {
    const material = resolvedMaterial.value
    const basic = new BasicParams(
      material.name,
      Number(material.totalSolidsFraction),
      Number(material.volatileSolidsFraction),
      Number(material.potentialBiogas)
    )

    const fill = new Fill(
      Number(config.basic.fillingMass),
      config.physical.moistureFilling,
      Number(config.physical.addedWater),
      basic,
      Number(config.biological.lagTime),
      Number(config.physical.approxDensity)
    )

    const env = new EnvironmentalParams(Number(config.environmental.temperature), 0)

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

    const data: SimulationData = {
      inputs: normalizeCoreInputFactsV1(config),
      outputs: {
        monod: outputs.monod,
        potentialProduction: outputs.potentialProduction,
        TotalSolids: outputs.TotalSolids,
        VolatileSolids: outputs.VolatileSolids
      },
      timeSeries: {
        time: xs,
        accumulated: ys,
        daily
      },
      metadata: {
        simulationName: material.name || 'Simulación Biogás',
        createdAt: new Date().toISOString(),
        version: '1.0'
      }
    }

    simulationData.value = data
    return data
  }

  const formattedOutputs = computed(() => ({
    monod: outputs.monod.toFixed(4),
    potentialProduction: outputs.potentialProduction.toFixed(3),
    TotalSolids: outputs.TotalSolids.toFixed(2),
    VolatileSolids: outputs.VolatileSolids.toFixed(2)
  }))

  return {
    config,
    resolvedMaterial,
    moistureDefault: moistureDefaultRounded,
    moistureModel,
    moistureManuallyOverridden,
    runSimulation,
    seriesAccum,
    seriesDaily,
    simulationData,
    outputs,
    formattedOutputs
  }
}

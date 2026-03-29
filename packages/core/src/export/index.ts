import * as XLSX from 'xlsx'
import { stringify } from 'csv-stringify/sync'
import {
  isSimulationConfig,
  legacyInputsFromConfig,
  type LegacySimulationInputs,
  type SimulationConfig
} from '../config/simulationConfig'

export type SimulationInputs = LegacySimulationInputs

export interface SimulationOutputs {
  monod: number
  potentialProduction: number
  TotalSolids: number
  VolatileSolids: number
}

export interface TimeSeriesData {
  time: number[]
  accumulated: number[]
  daily: number[]
}

export interface SimulationData {
  /**
   * inputs puede ser el shape legacy (plano) o el nuevo SimulationConfig.
   * Esto permite migrar la UI por fases sin romper exportación.
   */
  inputs: SimulationInputs | SimulationConfig
  outputs: SimulationOutputs
  timeSeries: TimeSeriesData
  metadata?: {
    simulationName?: string
    createdAt?: string
    version?: string
  }
}

function normalizeInputs(inputs: SimulationInputs | SimulationConfig): SimulationInputs {
  return isSimulationConfig(inputs) ? legacyInputsFromConfig(inputs) : inputs
}

export function exportToExcel(simulationData: SimulationData): ArrayBuffer {
  const workbook = XLSX.utils.book_new()
  const inputs = normalizeInputs(simulationData.inputs)
  
  // Hoja 1: Parámetros de entrada
  const inputsSheet = XLSX.utils.json_to_sheet([
    {
      Parámetro: 'Nombre del material',
      Valor: inputs.name,
      Unidad: ''
    },
    {
      Parámetro: 'Densidad aproximada',
      Valor: inputs.approxDensity,
      Unidad: 'kg/m³'
    },
    {
      Parámetro: 'Temperatura',
      Valor: inputs.temperature,
      Unidad: '°C'
    },
    {
      Parámetro: 'Tiempo de retardo',
      Valor: inputs.lagTime,
      Unidad: 'días'
    },
    {
      Parámetro: 'Masa de llenado',
      Valor: inputs.fillingMass,
      Unidad: 'kg'
    },
    {
      Parámetro: 'Humedad del llenado',
      Valor: inputs.moistureFilling,
      Unidad: '%'
    },
    {
      Parámetro: 'Agua agregada',
      Valor: inputs.addedWater,
      Unidad: 'kg'
    },
    {
      Parámetro: 'Sólidos totales',
      Valor: inputs.totalSolidsPercent,
      Unidad: '%'
    },
    {
      Parámetro: 'Sólidos volátiles',
      Valor: inputs.volatileSolidsPercent,
      Unidad: 'fracción (VS/TS)'
    },
    {
      Parámetro: 'Producción potencial de biogás',
      Valor: inputs.potentialBiogas,
      Unidad: 'm³/kg SV'
    }
  ])
  XLSX.utils.book_append_sheet(workbook, inputsSheet, 'Parámetros')
  
  // Hoja 2: Resultados
  const outputsSheet = XLSX.utils.json_to_sheet([
    {
      Resultado: 'Producción potencial',
      Valor: simulationData.outputs.potentialProduction,
      Unidad: 'm³'
    },
    {
      Resultado: 'Crecimiento Monod',
      Valor: simulationData.outputs.monod,
      Unidad: 'día⁻¹'
    },
    {
      Resultado: 'Sólidos totales',
      Valor: simulationData.outputs.TotalSolids,
      Unidad: 'kg'
    },
    {
      Resultado: 'Sólidos volátiles',
      Valor: simulationData.outputs.VolatileSolids,
      Unidad: 'kg'
    }
  ])
  XLSX.utils.book_append_sheet(workbook, outputsSheet, 'Resultados')
  
  // Hoja 3: Serie temporal
  const timeSeriesData = simulationData.timeSeries.time.map((time, index) => ({
    Día: time,
    'Producción acumulada (m³)': simulationData.timeSeries.accumulated[index],
    'Producción diaria (m³)': simulationData.timeSeries.daily[index]
  }))
  
  const timeSeriesSheet = XLSX.utils.json_to_sheet(timeSeriesData)
  XLSX.utils.book_append_sheet(workbook, timeSeriesSheet, 'Serie Temporal')
  
  // Hoja 4: Metadatos
  const metadata = simulationData.metadata || {}
  const metadataSheet = XLSX.utils.json_to_sheet([
    {
      Campo: 'Nombre de simulación',
      Valor: metadata.simulationName || 'Simulación Biogás'
    },
    {
      Campo: 'Fecha de creación',
      Valor: metadata.createdAt || new Date().toISOString()
    },
    {
      Campo: 'Versión',
      Valor: metadata.version || '1.0'
    }
  ])
  XLSX.utils.book_append_sheet(workbook, metadataSheet, 'Metadatos')
  
  // Generar buffer
  return XLSX.write(workbook, { type: 'array', bookType: 'xlsx' })
}

export function exportToCSV(simulationData: SimulationData): string {
  const sections: string[] = []
  const inputs = normalizeInputs(simulationData.inputs)
  
  // Sección 1: Parámetros
  sections.push('# PARÁMETROS DE ENTRADA')
  sections.push('Parámetro,Valor,Unidad')
  sections.push(`Nombre del material,${inputs.name},`)
  sections.push(`Densidad aproximada,${inputs.approxDensity},kg/m³`)
  sections.push(`Temperatura,${inputs.temperature},°C`)
  sections.push(`Tiempo de retardo,${inputs.lagTime},días`)
  sections.push(`Masa de llenado,${inputs.fillingMass},kg`)
  sections.push(`Humedad del llenado,${inputs.moistureFilling},%`)
  sections.push(`Agua agregada,${inputs.addedWater},kg`)
  sections.push(`Sólidos totales,${inputs.totalSolidsPercent},%`)
  sections.push(`Sólidos volátiles,${inputs.volatileSolidsPercent},%`)
  sections.push(`Producción potencial de biogás,${inputs.potentialBiogas},m³/kg SV`)
  sections.push('')
  
  // Sección 2: Resultados
  sections.push('# RESULTADOS')
  sections.push('Resultado,Valor,Unidad')
  sections.push(`Producción potencial,${simulationData.outputs.potentialProduction},m³`)
  sections.push(`Crecimiento Monod,${simulationData.outputs.monod},día⁻¹`)
  sections.push(`Sólidos totales,${simulationData.outputs.TotalSolids},kg`)
  sections.push(`Sólidos volátiles,${simulationData.outputs.VolatileSolids},kg`)
  sections.push('')
  
  // Sección 3: Serie temporal (usando csv-stringify para formato CSV puro)
  const timeSeriesData = simulationData.timeSeries.time.map((time, index) => ({
    Día: time,
    'Producción acumulada (m³)': simulationData.timeSeries.accumulated[index],
    'Producción diaria (m³)': simulationData.timeSeries.daily[index]
  }))
  
  const timeSeriesCSV = stringify(timeSeriesData, { header: true })
  sections.push('# SERIE TEMPORAL')
  sections.push(timeSeriesCSV.trim())
  
  // Sección 4: Metadatos
  const metadata = simulationData.metadata || {}
  sections.push('')
  sections.push('# METADATOS')
  sections.push('Campo,Valor')
  sections.push(`Nombre de simulación,${metadata.simulationName || 'Simulación Biogás'}`)
  sections.push(`Fecha de creación,${metadata.createdAt || new Date().toISOString()}`)
  sections.push(`Versión,${metadata.version || '1.0'}`)
  
  return sections.join('\n')
}

export function createDownloadBlob(data: ArrayBuffer | string, type: string): Blob {
  if (typeof data === 'string') {
    return new Blob([data], { type })
  }
  return new Blob([data], { type })
}

export function downloadFile(blob: Blob, filename: string): void {
  // Esta función es para uso en navegador
  // En Node.js lanzaría error, así que verificamos
  if (typeof window === 'undefined') {
    throw new Error('downloadFile solo puede usarse en navegador')
  }
  
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

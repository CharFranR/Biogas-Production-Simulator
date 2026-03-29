export interface SimulationOutputs {
  potentialProduction?: number
  [key: string]: unknown
}

export interface TimeSeriesData {
  time?: number[]
  accumulated?: number[]
  daily?: number[]
  [key: string]: unknown
}

export interface SimulationData {
  inputs?: Record<string, unknown>
  outputs?: SimulationOutputs
  timeSeries?: TimeSeriesData
  metadata?: Record<string, unknown>
}

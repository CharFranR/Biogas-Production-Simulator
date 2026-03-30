export interface SimulationOutputs {
  /**
   * Keep this structural type compatible with `@biogas-simulator/core`.
   * We only type the fields the advisor actually reads; extra fields can exist
   * at runtime, but we don't model them here to preserve assignability.
   */
  potentialProduction?: number
  TotalSolids?: number
  VolatileSolids?: number
}

export interface TimeSeriesData {
  time?: number[]
  accumulated?: number[]
  daily?: number[]
}

export interface SimulationData {
  /**
   * Keep this structural/adapter type very permissive.
   * In the app we pass either a SimulationConfig or a legacy inputs object.
   * The advisor flattener handles `unknown` safely.
   */
  inputs?: unknown
  outputs?: SimulationOutputs
  timeSeries?: TimeSeriesData
  metadata?: Record<string, unknown>
}

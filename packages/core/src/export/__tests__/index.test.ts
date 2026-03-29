import { describe, it, expect } from 'vitest'
import { exportToExcel, exportToCSV, createDownloadBlob, type SimulationData } from '../index'

describe('export module', () => {
  const mockSimulationData: SimulationData = {
    inputs: {
      name: 'Maize',
      approxDensity: 1000,
      temperature: 30,
      lagTime: 1,
      fillingMass: 100,
      moistureFilling: 50,
      addedWater: 0,
      totalSolidsPercent: 20,
      volatileSolidsPercent: 0.79,
      potentialBiogas: 0.5
    },
    outputs: {
      monod: 0.274,
      potentialProduction: 7.9,
      TotalSolids: 50,
      VolatileSolids: 39.5
    },
    timeSeries: {
      time: [1, 2, 3, 4, 5],
      accumulated: [0.1, 0.3, 0.6, 1.0, 1.5],
      daily: [0.1, 0.2, 0.3, 0.4, 0.5]
    },
    metadata: {
      simulationName: 'Test Simulation',
      createdAt: '2024-01-01T00:00:00Z',
      version: '1.0'
    }
  }

  it('exportToExcel returns ArrayBuffer with data', () => {
    const result = exportToExcel(mockSimulationData)
    
    expect(result).toBeInstanceOf(ArrayBuffer)
    expect(result.byteLength).toBeGreaterThan(0)
  })

  it('exportToCSV returns string with CSV data', () => {
    const result = exportToCSV(mockSimulationData)
    
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
    expect(result).toContain('# PARÁMETROS DE ENTRADA')
    expect(result).toContain('# RESULTADOS')
    expect(result).toContain('# SERIE TEMPORAL')
    expect(result).toContain('# METADATOS')
    expect(result).toContain('Maize')
    expect(result).toContain('Test Simulation')
  })

  it('createDownloadBlob creates Blob from ArrayBuffer', () => {
    const arrayBuffer = new ArrayBuffer(10)
    const blob = createDownloadBlob(arrayBuffer, 'application/test')
    
    expect(blob).toBeInstanceOf(Blob)
    expect(blob.type).toBe('application/test')
    expect(blob.size).toBe(10)
  })

  it('createDownloadBlob creates Blob from string', () => {
    const text = 'test data'
    const blob = createDownloadBlob(text, 'text/plain')
    
    expect(blob).toBeInstanceOf(Blob)
    expect(blob.type).toBe('text/plain')
    expect(blob.size).toBe(text.length)
  })
})
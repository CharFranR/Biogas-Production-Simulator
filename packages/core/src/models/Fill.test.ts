import { describe, it, expect } from 'vitest'
import { BasicParams } from './BasicParams'
import { Fill } from './Fill'

describe('Fill', () => {
  const basic = new BasicParams('Maize', 20, 0.79, 0.5)
  
  it('creates instance with correct values', () => {
    const fill = new Fill(100, 50, 0, basic, 1, 1000)
    
    expect(fill.fillingMass).toBe(100)
    expect(fill.moistureFilling).toBe(50)
    expect(fill.addedWater).toBe(0)
    expect(fill.typeOfMaterial).toBe(basic)
    expect(fill.lagTime).toBe(1)
    expect(fill.approxDensity).toBe(1000)
  })
  
  it('calculates total solids correctly', () => {
    const fill = new Fill(100, 50, 0, basic, 1, 1000)
    // total solids = fillingMass * (1 - moistureFilling/100)
    expect(fill.calculateTotalSolids()).toBe(100 * (1 - 50/100)) // 50
  })
  
  it('calculates volatile solids correctly', () => {
    const fill = new Fill(100, 50, 0, basic, 1, 1000)
    const totalSolids = fill.calculateTotalSolids()
    expect(fill.calculateVolatileSolids()).toBe(totalSolids * basic.volatileSolids)
  })
  
  it('calculates potential production correctly', () => {
    const fill = new Fill(100, 50, 0, basic, 1, 1000)
    const volatileSolids = fill.calculateVolatileSolids()
    expect(fill.calculatePotentialProduction()).toBe(volatileSolids * basic.potentialBiogasProduction)
  })
})
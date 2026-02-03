export class BasicParams {
    name: string;
    totalSolids: number;                     // 20% TS
    volatileSolids: number;                  // 79% VS/TS
    potentialBiogasProduction: number;       // m³ biogas per kg VS  m³/kg VS

    constructor (name: string, totalSolids: number, volatileSolids: number, potentialBiogasProduction: number) {
        this.name = name;
        this.totalSolids = totalSolids;
        this.volatileSolids = volatileSolids;
        this.potentialBiogasProduction = potentialBiogasProduction;
    }
}

import { Fill } from "./Fill";
import { EnvironmentalParams } from "./EnvironmentalParams";

export class SimulationParams {
    // input
    fill: Fill;
    env: EnvironmentalParams;
    simulationTime: number;
    specificMu: number;
    initialConcentration: number;
    concentrationT: number;
    cumulativeProduction: number;
    lagTime: number;
    solventVolume: number;
    maxMu: number;

    // output
    monod: number;
    potentialProduction: number;
    TotalSolids: number;
    VolatileSolids: number;
    simulationData: Record<number, number>;

    constructor (fill: Fill, env: EnvironmentalParams) {
        // input
        this.fill = fill;
        this.env = env;
        this.simulationTime = 0;
        this.specificMu = 0;
        this.initialConcentration = 0;
        this.concentrationT = 0;
        this.cumulativeProduction = 0;
        this.potentialProduction = 0;
        this.lagTime = 0;
        this.solventVolume = 0;
        this.maxMu = 0;


        // output
        this.simulationData = [];
        this.monod = 0
        this.TotalSolids = 0
        this.VolatileSolids = 0
    }

    static calculateSimulationTime (fill: Fill, simulationTime: number): number {
        if (fill.moistureFilling != 0) {
            return Math.ceil(3200 / fill.moistureFilling);
        }
        else simulationTime = 40;

        return simulationTime;
    }

    calculateSimulationData(fill: Fill, env: EnvironmentalParams, simulationData: number[]): { simulationData: number[]; monod: number; TotalSolids: number; VolatileSolids: number } {
        
        this.simulationTime = SimulationParams.calculateSimulationTime(fill, this.simulationTime);
        this.solventVolume = fill.calculateSolventVolume();
        this.potentialProduction = fill.calculatePotentialProduction();
        this.initialConcentration = fill.calculateInitialConcentration();
        this.maxMu = env.calculateMaxMu();
        this.lagTime = fill.lagTime; // Asignar lagTime desde fill

        let concentrationT = this.initialConcentration;
        let cumulativeProductionPrev = 0;

        for (let i = 1; i <= this.simulationTime; i++) {
            this.specificMu = fill.calculateSpecificMu(this.maxMu, concentrationT);

            this.cumulativeProduction = fill.calculateGompertzAccumulated(
                this.specificMu,
                this.lagTime,
                this.potentialProduction,
                i,
                Math.E
            );

            simulationData.push(i, this.cumulativeProduction);

            // Actualiza concentración acumulativamente
            concentrationT = concentrationT - (this.cumulativeProduction - cumulativeProductionPrev);
            cumulativeProductionPrev = this.cumulativeProduction;
        }


        this.monod = this.maxMu;
        this.TotalSolids = fill.calculateTotalSolids();
        this.VolatileSolids = fill.calculateVolatileSolids();


        return {
            simulationData: simulationData,
            monod: this.monod,
            TotalSolids: this.TotalSolids,
            VolatileSolids: this.VolatileSolids
        };
    }
}
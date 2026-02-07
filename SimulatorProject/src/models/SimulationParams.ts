import { Fill } from "./Fill";
import { EnvironmentalParams } from "./EnvironmentalParams";

export class SimulationParams {

    fill: Fill;
    env: EnvironmentalParams;
        
    simulationTime: number;
    simulationData: number[];

    specificMu: number;
    initialConcentration: number;
    concentrationT: number;
    cumulativeProduction: number;
    potentialProduction: number;
    lagTime: number;
    solventVolume: number;
    maxMu: number;

    constructor (fill: Fill, env: EnvironmentalParams) {
        this.fill = fill;
        this.env = env;
        this.simulationTime = 0;
        this.simulationData = [];
        this.specificMu = 0;
        this.initialConcentration = 0;
        this.concentrationT = 0;
        this.cumulativeProduction = 0;
        this.potentialProduction = 0;
        this.lagTime = 0;
        this.solventVolume = 0;
        this.maxMu = 0;
    }

    static calculateSimulationTime (fill: Fill, simulationTime: number): number {
        if (fill.moistureFilling != 0) {
            return Math.ceil(3200 / fill.moistureFilling);
        }
        else simulationTime = 40;

        return simulationTime;
    }

    calculateSimulationData(fill: Fill, env: EnvironmentalParams, simulationData: number[]): number[] {
        
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

            simulationData.push(this.cumulativeProduction);

            // Actualiza concentración acumulativamente
            concentrationT = concentrationT - (this.cumulativeProduction - cumulativeProductionPrev);
            cumulativeProductionPrev = this.cumulativeProduction;
        }
        return simulationData;
    }
}

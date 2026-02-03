import { BasicParams } from "./models";
import { EnvironmentalParams } from "./models";
import { Biodigester } from "./models";
import { Fill } from "./models";

export function calculateTotalSolids (fill: Fill): number {
    return fill.calculateTotalSolids();
}

export function calculateVolatileSolids (totalSolids: number, typeOfMaterial: BasicParams): number {
    return totalSolids * typeOfMaterial.volatileSolids;
}

export function calculatePotentialProduction (volatileSolids: number, typeOfMaterial: BasicParams): number {
    return volatileSolids * typeOfMaterial.potentialBiogasProduction;
}

export function calculateMuMaxima (env: EnvironmentalParams): number {
    return env.calculateMuMaxima();
}

export function calculateSolventVolume (addedWater: number, fillingMass: number, approxDensity: number): number {
    throw new Error('calculateSolventVolume: use calculateSolventVolumeFromFill(fill, approxDensity) instead');
}

export function calculateSolventVolumeFromFill(fill: Fill, approxDensity: number): number {
    return fill.calculateSolventVolume(approxDensity);
}

export function calculateInitialConcentration (volatileSolids: number, solventVolume: number): number {
    return volatileSolids / solventVolume;
}

export function calculateSpecificMu (muMaxima: number, concentration: number): number {
    const ks: number = concentration;
    return muMaxima * (concentration / (ks + concentration));
}

export function calculateGompertzAccumulated (
    specificMu: number,
    lagTime: number,
    potentialProduction: number,
    time: number,
    e: number
): number {
    const c: number = (specificMu * e) / potentialProduction;
    const b: number = e ** ((lagTime * c) + 1);
    const y: number = potentialProduction * (e ** (-b * (e ** (-c * time))));
    return y;
}


export function calculateSimulationTime (moistureFilling: number): number {
    let simulationTime: number;

    if (moistureFilling != 0) {
        simulationTime = Math.ceil(3200 / moistureFilling);
    }
    else simulationTime = 40;

    return simulationTime;
}


export function calculateTimeSimulation (
    simulationTime: number,
    fill: Fill,
    approxDensity: number,
    env: EnvironmentalParams): number[] {


    let simulation: number[] = [];

    let specificMu: number;
    let initialConcentration: number;
    let concentrationT: number;
    let cumulativeProduction: number;
    let potentialProduction: number;
    let lagTime: number;
    let solventVolume: number;

    solventVolume = fill.calculateSolventVolume(approxDensity);

    lagTime = calculateSimulationTime(fill.moistureFilling);

    potentialProduction = fill.calculatePotentialProduction();

    initialConcentration = fill.calculateInitialConcentration(approxDensity);

    concentrationT = initialConcentration;

    const maxMu = env.calculateMuMaxima();

    for (let i = 0; i <= simulationTime; i++) {

        specificMu = fill.calculateSpecificMu(maxMu, concentrationT);

        cumulativeProduction = fill.calculateGompertzAccumulated(
            specificMu,
            lagTime,
            potentialProduction,
            i,
            Math.E
        );

        simulation.push(cumulativeProduction);

        concentrationT = initialConcentration - cumulativeProduction;

    }
    return simulation;
}
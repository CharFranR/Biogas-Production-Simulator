import { BasicParams } from "./BasicParams.js";

export class Fill {
    fillingMass: number;
    moistureFilling: number;
    addedWater: number;
    typeOfMaterial: BasicParams;
    lagTime: number;

    constructor (fillingMass: number, moistureFilling: number, addedWater: number, typeOfMaterial: BasicParams, lagTime: number) {
        this.fillingMass = fillingMass;
        this.moistureFilling = moistureFilling;
        this.addedWater = addedWater;
        this.typeOfMaterial = typeOfMaterial;
        this.lagTime = lagTime;
    }
    calculateTotalSolids(): number {
        if (this.moistureFilling !== 0) {
            return this.fillingMass * (1 - (this.moistureFilling / 100));
        }
        return this.typeOfMaterial.totalSolids * this.fillingMass;
    }

    calculateVolatileSolids(): number {
        const total = this.calculateTotalSolids();
        return total * this.typeOfMaterial.volatileSolids;
    }

    calculatePotentialProduction(): number {
        const vs = this.calculateVolatileSolids();
        return vs * this.typeOfMaterial.potentialBiogasProduction;
    }

    calculateSolventVolume(approxDensity: number): number {
        return (this.fillingMass + this.addedWater) / approxDensity;
    }

    calculateInitialConcentration(approxDensity: number): number {
        const vs = this.calculateVolatileSolids();
        const vol = this.calculateSolventVolume(approxDensity);
        return vs / vol;
    }

    calculateSpecificMu(muMaxima: number, concentration: number): number {
        const ks = concentration;
        return muMaxima * (concentration / (ks + concentration));
    }

    calculateGompertzAccumulated(specificMu: number, lagTime: number, potentialProduction: number, time: number, e = Math.E): number {
        const c = (specificMu * e) / potentialProduction;
        const b = e ** ((lagTime * c) + 1);
        const y = potentialProduction * (e ** (-b * (e ** (-c * time))));
        return y;
    }
}
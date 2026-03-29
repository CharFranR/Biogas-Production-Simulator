import { BasicParams } from "./BasicParams";

export class Fill {
    fillingMass: number;
    moistureFilling?: number | null;
    addedWater: number;
    typeOfMaterial: BasicParams;
    lagTime: number;
    approxDensity: number;

    constructor (fillingMass: number, moistureFilling: number | null | undefined, addedWater: number, typeOfMaterial: BasicParams, lagTime: number, approxDensity: number) {
        this.fillingMass = fillingMass;
        this.moistureFilling = moistureFilling;
        this.addedWater = addedWater;
        this.typeOfMaterial = typeOfMaterial;
        this.lagTime = lagTime;
        this.approxDensity = approxDensity;
    }
    calculateTotalSolids(): number {
        const moisture = this.moistureFilling;
        if (moisture !== null && moisture !== undefined && moisture !== 0) {
            return this.fillingMass * (1 - (moisture / 100));
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

    calculateSolventVolume(): number {
        return (this.fillingMass + this.addedWater) / this.approxDensity;
    }

    calculateInitialConcentration(): number {
        const vs = this.calculateVolatileSolids();
        const vol = this.calculateSolventVolume();
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

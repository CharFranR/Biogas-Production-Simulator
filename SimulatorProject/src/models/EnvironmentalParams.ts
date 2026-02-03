export class EnvironmentalParams {
    temperature: number;
    sunlightHours: number;

    constructor (temperature: number, sunlightHours: number) {
        this.temperature = temperature;
        this.sunlightHours = sunlightHours;
    }
    calculateMuMaxima(): number {
        return (0.012 * this.temperature) - 0.086;
    }
}

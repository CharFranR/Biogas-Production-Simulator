import { SimulationParams } from "./models/SimulationParams";
import { BasicParams } from "./models/BasicParams";
import { Fill } from "./models/Fill";
import { EnvironmentalParams } from "./models/EnvironmentalParams";

// Parámetros de entrada
const approxDensity = 900;
const temp = 28;
const lagTime = 13;
const fillingMass = 500;
const moistureFilling = 60;
const addedWater = 500;


const name = 'bovino';
const totalSolids = 0.20;
const volatileSolids = 0.79;
const potentialBiogasProduction = 0.0158;


// Instancias de los modelos
const basicParams = new BasicParams(name, totalSolids, volatileSolids, potentialBiogasProduction);
const fill = new Fill(fillingMass, moistureFilling, addedWater, basicParams, lagTime, approxDensity);
const env = new EnvironmentalParams(temp, lagTime);

// Instancia de SimulationParams
const simulationParams = new SimulationParams(fill, env);

// Prueba de métodos
const simTime = SimulationParams.calculateSimulationTime(fill, 0);
console.log("Tiempo de simulación calculado:", simTime);

const simData = simulationParams.calculateSimulationData( fill, env, []);
console.log("Datos de simulación:", simData);
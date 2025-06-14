// appdata/gameData/waveDefinitions.ts
import { WaveDefinition } from '../types';
import { 
    WAVES_01_10, 
    WAVES_11_20, 
    WAVES_21_30, 
    WAVES_31_40, 
    WAVES_41_50,
    VERDANT_PLAINS_WAVES, // Importiere das Array für Verdant Plains
    WHISPERING_WOODS_WAVES // Importiere das Array für Whispering Woods
} from './waves/index'; 

export const WAVE_DEFINITIONS: WaveDefinition[] = [
  ...WAVES_01_10,
  ...WAVES_11_20,
  ...WAVES_21_30,
  ...WAVES_31_40,
  ...WAVES_41_50,
  ...VERDANT_PLAINS_WAVES, // Füge Verdant Plains Wellen hinzu
  ...WHISPERING_WOODS_WAVES, // Füge Whispering Woods Wellen hinzu
];

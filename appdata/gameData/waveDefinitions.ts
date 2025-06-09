
import { WaveDefinition } from '../types';
import { WAVES_01_10 } from './waves/waves_01-10';
import { WAVES_11_20 } from './waves/waves_11-20';
import { WAVES_21_30 } from './waves/waves_21-30';
import { WAVES_31_40 } from './waves/waves_31-40';
import { WAVES_41_50 } from './waves/waves_41-50';
import { MAP_GOBLIN_CAMP_WAVES } from './waves/mapSpecificWaves'; 

// Add IDs to existing waves - ensure waveNumber is used for ID if it exists, otherwise use index
const addIdsToWaves = (waves: WaveDefinition[], prefix: string): WaveDefinition[] => 
  waves.map((wave, index) => ({ ...wave, id: wave.id || `${prefix}_${wave.waveNumber || index + 1}` }));


export const WAVE_DEFINITIONS: WaveDefinition[] = [
  ...addIdsToWaves(WAVES_01_10, 'wave'),
  ...addIdsToWaves(WAVES_11_20, 'wave'),
  ...addIdsToWaves(WAVES_21_30, 'wave'),
  ...addIdsToWaves(WAVES_31_40, 'wave'),
  ...addIdsToWaves(WAVES_41_50, 'wave'),
  ...MAP_GOBLIN_CAMP_WAVES, 
];

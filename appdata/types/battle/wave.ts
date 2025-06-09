
import { Cost } from '../common';

export interface WaveDefinition {
  id: string; // New unique string ID for the wave
  waveNumber?: number; // Optional: Can still be used for main progression waves
  enemies: Array<{ enemyId: string; count: number; isElite?: boolean; }>; // Added isElite
  reward?: Cost[];
}
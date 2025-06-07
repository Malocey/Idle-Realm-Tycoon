import { Cost } from '../common';

export interface WaveDefinition {
  waveNumber: number;
  enemies: Array<{ enemyId: string; count: number }>;
  reward?: Cost[];
}

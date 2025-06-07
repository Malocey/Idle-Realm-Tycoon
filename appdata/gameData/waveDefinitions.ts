
import { WaveDefinition } from '../types';
import { WAVES_01_10 } from './waves/waves_01-10';
import { WAVES_11_20 } from './waves/waves_11-20';
import { WAVES_21_30 } from './waves/waves_21-30';
import { WAVES_31_40 } from './waves/waves_31-40';
import { WAVES_41_50 } from './waves/waves_41-50';

export const WAVE_DEFINITIONS: WaveDefinition[] = [
  ...WAVES_01_10,
  ...WAVES_11_20,
  ...WAVES_21_30,
  ...WAVES_31_40,
  ...WAVES_41_50,
];

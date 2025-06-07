import { HeroStats } from './hero';
import { RunBuffRarity } from './enums';
import { Cost } from './common';

export interface RunBuffEffect {
  stat?: keyof HeroStats;
  value: number;
  type: 'FLAT' | 'PERCENTAGE_ADDITIVE' | 'PERCENTAGE_MULTIPLICATIVE';
}

export interface RunBuffDefinition {
  id: string;
  name: string;
  description: string;
  iconName: string;
  rarity: RunBuffRarity;
  effects: RunBuffEffect[];
  maxStacks?: number;
  isBaseUnlocked?: boolean;
  unlockCost?: Cost[];
  maxLibraryUpgradeLevel?: number;
  libraryUpgradeCostPerLevel?: (currentUpgradeLevel: number) => Cost[];
  libraryEffectsPerUpgradeLevel?: (upgradeLevel: number) => RunBuffEffect[];
}

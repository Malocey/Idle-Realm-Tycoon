import { GlobalEffectTarget } from '../enums'; // For globalEffectTarget
import { HeroStats } from '../hero';
import { TownHallUpgradeCostDefinition, TownHallUpgradeEffectParams } from './townHall'; // Re-use cost & effect param types

// Guild Hall Upgrades
export interface GuildHallUpgradeEffectDefinition {
  stat?: keyof HeroStats;
  heroClassTarget?: string;
  globalEffectTarget?: GlobalEffectTarget;
  effectParams: TownHallUpgradeEffectParams; // Re-uses TownHall effect params
}

export interface GuildHallUpgradeDefinition {
  id: string;
  name: string;
  description: string;
  costs: TownHallUpgradeCostDefinition[]; // Re-uses TownHall cost definitions
  effects: GuildHallUpgradeEffectDefinition[];
  maxLevel: number;
  iconName: string;
  unlockRequirements: Array<{
    guildHallLevel?: number;
    heroRecruited?: string;
    otherGuildUpgradeId?: string;
    otherGuildUpgradeLevel?: number;
  }>;
}

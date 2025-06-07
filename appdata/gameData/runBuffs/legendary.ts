
import { RunBuffDefinition, RunBuffRarity, HeroStats, ResourceType, RunBuffEffect } from '../../types';

export const LEGENDARY_RUN_BUFFS: Record<string, RunBuffDefinition> = {
  'RUN_BUFF_LEGENDARY_ALL_STATS': {
    id: 'RUN_BUFF_LEGENDARY_ALL_STATS',
    name: 'Blessing of the Ancients',
    description: 'Grants +25% Max HP, +25% Damage, and +25% Defense for this run.',
    iconName: 'UPGRADE',
    rarity: RunBuffRarity.LEGENDARY,
    effects: [
      { stat: 'maxHp' as keyof HeroStats, value: 0.25, type: 'PERCENTAGE_ADDITIVE' },
      { stat: 'damage' as keyof HeroStats, value: 0.25, type: 'PERCENTAGE_ADDITIVE' },
      { stat: 'defense' as keyof HeroStats, value: 0.25, type: 'PERCENTAGE_ADDITIVE' },
    ],
    maxStacks: 1,
    isBaseUnlocked: false,
    unlockCost: [{ resource: ResourceType.AETHERIUM, amount: 2 }, { resource: ResourceType.GOLD, amount: 50000 }, {resource: ResourceType.META_CURRENCY, amount: 5}],
    maxLibraryUpgradeLevel: 0,
  },
};

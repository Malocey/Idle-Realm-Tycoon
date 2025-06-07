
import { RunBuffDefinition, RunBuffRarity, HeroStats, ResourceType, RunBuffEffect } from '../../types';

export const MYTHIC_RUN_BUFFS: Record<string, RunBuffDefinition> = {
  'RUN_BUFF_MYTHIC_TRANSCENDENCE': {
    id: 'RUN_BUFF_MYTHIC_TRANSCENDENCE',
    name: 'Transcendent Power',
    description: 'A massive surge of power: All primary stats +35%, Attack Speed +0.15, Crit Chance +10%.',
    iconName: 'ATOM_ICON',
    rarity: RunBuffRarity.MYTHIC,
    effects: [
        { stat: 'maxHp' as keyof HeroStats, value: 0.35, type: 'PERCENTAGE_ADDITIVE' },
        { stat: 'damage' as keyof HeroStats, value: 0.35, type: 'PERCENTAGE_ADDITIVE' },
        { stat: 'defense' as keyof HeroStats, value: 0.35, type: 'PERCENTAGE_ADDITIVE' },
        { stat: 'attackSpeed' as keyof HeroStats, value: 0.15, type: 'FLAT' },
        { stat: 'critChance' as keyof HeroStats, value: 0.10, type: 'FLAT' },
    ],
    maxStacks: 1,
    isBaseUnlocked: false,
    unlockCost: [{ resource: ResourceType.AETHERIUM, amount: 10 }, { resource: ResourceType.META_CURRENCY, amount: 50 }],
    maxLibraryUpgradeLevel: 0,
  },
};

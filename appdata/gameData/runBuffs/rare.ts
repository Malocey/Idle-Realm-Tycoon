
import { RunBuffDefinition, RunBuffRarity, HeroStats, ResourceType, RunBuffEffect } from '../../types';

export const RARE_RUN_BUFFS: Record<string, RunBuffDefinition> = {
  'RUN_BUFF_RARE_ATTACK': {
    id: 'RUN_BUFF_RARE_ATTACK',
    name: 'Major Strength',
    description: 'Increases Attack Damage by 15%, plus 1.5% per Library level.',
    iconName: 'SWORD',
    rarity: RunBuffRarity.RARE,
    effects: [{ stat: 'damage' as keyof HeroStats, value: 0.15, type: 'PERCENTAGE_ADDITIVE' }],
    maxStacks: 3,
    isBaseUnlocked: false,
    unlockCost: [{ resource: ResourceType.GOLD, amount: 2500 }, { resource: ResourceType.IRON, amount: 200 }],
    maxLibraryUpgradeLevel: 10,
    libraryUpgradeCostPerLevel: (level) => [{ resource: ResourceType.GOLD, amount: 1250 + (level * 500) }, { resource: ResourceType.CRYSTALS, amount: 20 + level * 10 }],
    libraryEffectsPerUpgradeLevel: (level) => [{ stat: 'damage' as keyof HeroStats, value: 0.015 * level, type: 'PERCENTAGE_ADDITIVE' }],
  },
  'RUN_BUFF_RARE_HEALTH': {
    id: 'RUN_BUFF_RARE_HEALTH',
    name: 'Major Vitality',
    description: 'Increases Max HP by 15%, plus 1.5% per Library level.',
    iconName: 'SHIELD',
    rarity: RunBuffRarity.RARE,
    effects: [{ stat: 'maxHp' as keyof HeroStats, value: 0.15, type: 'PERCENTAGE_ADDITIVE' }],
    maxStacks: 3,
    isBaseUnlocked: false,
    unlockCost: [{ resource: ResourceType.GOLD, amount: 2500 }, { resource: ResourceType.LEATHER, amount: 200 }],
    maxLibraryUpgradeLevel: 10,
    libraryUpgradeCostPerLevel: (level) => [{ resource: ResourceType.GOLD, amount: 1250 + (level * 500) }, { resource: ResourceType.IRON, amount: 20 + level * 10 }],
    libraryEffectsPerUpgradeLevel: (level) => [{ stat: 'maxHp' as keyof HeroStats, value: 0.015 * level, type: 'PERCENTAGE_ADDITIVE' }],
  },
  'RUN_BUFF_RARE_DEFENSE': {
    id: 'RUN_BUFF_RARE_DEFENSE',
    name: 'Steel Skin',
    description: 'Increases Defense by 6, plus 1 per Library level.',
    iconName: 'STONE',
    rarity: RunBuffRarity.RARE,
    effects: [{ stat: 'defense' as keyof HeroStats, value: 6, type: 'FLAT' }],
    maxStacks: 3,
    isBaseUnlocked: false,
    unlockCost: [{ resource: ResourceType.IRON, amount: 400 }, { resource: ResourceType.CRYSTALS, amount: 100 }],
    maxLibraryUpgradeLevel: 10,
    libraryUpgradeCostPerLevel: (level) => [{ resource: ResourceType.IRON, amount: 300 + (level * 120) }, { resource: ResourceType.CRYSTALS, amount: 50 + level * 20 }],
    libraryEffectsPerUpgradeLevel: (level) => [{ stat: 'defense' as keyof HeroStats, value: 1 * level, type: 'FLAT' }],
  },
  'RUN_BUFF_RARE_CRIT_CHANCE': {
    id: 'RUN_BUFF_RARE_CRIT_CHANCE',
    name: 'Major Keen Edge',
    description: 'Increases Crit Chance by 3%, plus 0.4% per Library level.',
    iconName: 'MAGIC_ARROW',
    rarity: RunBuffRarity.RARE,
    effects: [{ stat: 'critChance' as keyof HeroStats, value: 0.03, type: 'FLAT' }],
    maxStacks: 3,
    isBaseUnlocked: false,
    unlockCost: [{ resource: ResourceType.GOLD, amount: 3000 }, { resource: ResourceType.CRYSTALS, amount: 150 }],
    maxLibraryUpgradeLevel: 10,
    libraryUpgradeCostPerLevel: (level) => [{ resource: ResourceType.GOLD, amount: 1500 + (level * 600) }, { resource: ResourceType.CRYSTALS, amount: 75 + level * 25 }],
    libraryEffectsPerUpgradeLevel: (level) => [{ stat: 'critChance' as keyof HeroStats, value: 0.004 * level, type: 'FLAT' }],
  },
  'RUN_BUFF_RARE_CRIT_DAMAGE': {
    id: 'RUN_BUFF_RARE_CRIT_DAMAGE',
    name: 'Devastating Strikes',
    description: 'Increases Crit Damage by 15%, plus 1.5% per Library level.',
    iconName: 'SWORD',
    rarity: RunBuffRarity.RARE,
    effects: [{ stat: 'critDamage' as keyof HeroStats, value: 0.15, type: 'PERCENTAGE_ADDITIVE' }],
    maxStacks: 3,
    isBaseUnlocked: false,
    unlockCost: [{ resource: ResourceType.GOLD, amount: 3500 }, { resource: ResourceType.CRYSTALS, amount: 180 }],
    maxLibraryUpgradeLevel: 10,
    libraryUpgradeCostPerLevel: (level) => [{ resource: ResourceType.GOLD, amount: 1750 + (level * 700) }, { resource: ResourceType.CRYSTALS, amount: 90 + level * 30 }],
    libraryEffectsPerUpgradeLevel: (level) => [{ stat: 'critDamage' as keyof HeroStats, value: 0.015 * level, type: 'PERCENTAGE_ADDITIVE' }],
  },
  'RUN_BUFF_RARE_SPEED_BOOST': {
    id: 'RUN_BUFF_RARE_SPEED_BOOST',
    name: 'Major Swiftness',
    description: 'Increases Attack Speed by 0.08, plus 0.01 per Library level.',
    iconName: 'WIND_SLASH',
    rarity: RunBuffRarity.RARE,
    effects: [{ stat: 'attackSpeed' as keyof HeroStats, value: 0.08, type: 'FLAT' }],
    maxStacks: 3,
    isBaseUnlocked: false,
    unlockCost: [{ resource: ResourceType.GOLD, amount: 2800 }, { resource: ResourceType.IRON, amount: 220 }],
    maxLibraryUpgradeLevel: 10,
    libraryUpgradeCostPerLevel: (level) => [{ resource: ResourceType.GOLD, amount: 1400 + (level * 550) }, { resource: ResourceType.CRYSTALS, amount: 25 + level * 12 }],
    libraryEffectsPerUpgradeLevel: (level) => [{ stat: 'attackSpeed' as keyof HeroStats, value: 0.01 * level, type: 'FLAT' }],
  },
  'RUN_BUFF_LOOT_FIND': {
    id: 'RUN_BUFF_LOOT_FIND',
    name: 'Fortune Finder',
    description: 'Increases gold from dungeon loot cells by 20% (base), plus an additional 2% per Library level.',
    iconName: 'LOOT_BAG',
    rarity: RunBuffRarity.RARE,
    effects: [],
    maxStacks: 2,
    isBaseUnlocked: false,
    unlockCost: [{ resource: ResourceType.GOLD, amount: 3000 }, { resource: ResourceType.CRYSTALS, amount: 100 }],
    maxLibraryUpgradeLevel: 10,
    libraryUpgradeCostPerLevel: (level) => [{ resource: ResourceType.GOLD, amount: 1500 + (level * 750) }, {resource: ResourceType.CRYSTALS, amount: 50 + level * 25}],
    libraryEffectsPerUpgradeLevel: (level) => [{ stat: 'maxHp' as keyof HeroStats, value: 0.02 * level, type: 'PERCENTAGE_ADDITIVE' }],
  },
};

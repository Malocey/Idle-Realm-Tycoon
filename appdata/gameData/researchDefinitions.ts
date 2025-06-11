
import { ResearchDefinition, ResourceType, ResearchCategory, TownHallUpgradeEffectType, GlobalEffectTarget } from '../types';

export const RESEARCH_DEFINITIONS: Record<string, ResearchDefinition> = {
  // --- WIRTSCHAFT (Economic) ---
  'ECO_EFFICIENT_MASONRY': {
    id: 'ECO_EFFICIENT_MASONRY',
    name: 'Efficient Stonemasonry',
    description: 'Reduces the stone cost of constructing and upgrading buildings.',
    category: 'Economic',
    iconName: 'STONE',
    costPerLevel: (level) => [{ resource: ResourceType.RESEARCH_POINTS, amount: 150 + (level-1)*50 }, { resource: ResourceType.STONE, amount: 1000 + (level-1)*300 }],
    researchTimeTicks: 6000,
    prerequisites: [],
    effects: [{
      stat: 'buildingStoneCostReduction' as keyof GlobalEffectTarget,
      effectParams: { type: TownHallUpgradeEffectType.PercentageBonus, baseAmount: 0.02, additiveStep: 0.01 },
      description: "-X% Stone cost for buildings",
    }],
    maxLevel: 5,
    position: { x: 0, y: 0 },
  },
  'ECO_ADVANCED_LOGGING': {
    id: 'ECO_ADVANCED_LOGGING',
    name: 'Advanced Logging',
    description: 'Improves wood harvesting techniques, increasing global wood production.',
    category: 'Economic',
    iconName: 'WOOD',
    costPerLevel: (level) => [{ resource: ResourceType.RESEARCH_POINTS, amount: 200 + (level-1)*60 }, { resource: ResourceType.WOOD, amount: 1200 + (level-1)*350 }],
    researchTimeTicks: 7000,
    prerequisites: [{ researchId: 'ECO_EFFICIENT_MASONRY', level: 1 }],
    effects: [{
      stat: 'woodProductionBonus' as any, // Specific bonus type
      effectParams: { type: TownHallUpgradeEffectType.PercentageBonus, baseAmount: 0.03, additiveStep: 0.015 },
      description: "+X% Wood Production",
    }],
    maxLevel: 5,
    position: { x: 1, y: 0 },
  },
  'ECO_MASTER_FARMERS': {
    id: 'ECO_MASTER_FARMERS',
    name: 'Master Farmers',
    description: 'Develops advanced farming methods, increasing global food production.',
    category: 'Economic',
    iconName: 'FOOD',
    costPerLevel: (level) => [{ resource: ResourceType.RESEARCH_POINTS, amount: 250 + (level-1)*70 }, { resource: ResourceType.FOOD, amount: 800 + (level-1)*250 }],
    researchTimeTicks: 8000,
    prerequisites: [{ researchId: 'ECO_ADVANCED_LOGGING', level: 1 }],
    effects: [{
      stat: 'foodProductionBonus' as any, // Specific bonus type
      effectParams: { type: TownHallUpgradeEffectType.PercentageBonus, baseAmount: 0.03, additiveStep: 0.015 },
      description: "+X% Food Production",
    }],
    maxLevel: 5,
    position: { x: 2, y: 0 },
  },
  'ECO_GOLD_PROD_1': {
    id: 'ECO_GOLD_PROD_1',
    name: 'Improved Mining',
    description: 'Improves gold extraction, increasing global gold production.',
    category: 'Economic',
    iconName: 'GOLD',
    costPerLevel: (level) => [{ resource: ResourceType.RESEARCH_POINTS, amount: 300 + (level-1)*80 }, { resource: ResourceType.GOLD, amount: 2000 + (level-1)*500 }],
    researchTimeTicks: 9000,
    prerequisites: [{ researchId: 'ECO_MASTER_FARMERS', level: 1 }],
    effects: [{
      stat: 'goldProductionBonus' as any, // Specific bonus type
      effectParams: { type: TownHallUpgradeEffectType.PercentageBonus, baseAmount: 0.02, additiveStep: 0.01 },
      description: "+X% Gold Production",
    }],
    maxLevel: 5,
    position: { x: 3, y: 0 },
  },
  'ECO_GUILD_ACCOUNTING': {
    id: 'ECO_GUILD_ACCOUNTING',
    name: 'Guild Accounting',
    description: 'Streamlines guild finances, reducing hero recruitment costs.',
    category: 'Economic',
    iconName: 'GUILD_HALL_TOKEN',
    costPerLevel: (level) => [{ resource: ResourceType.RESEARCH_POINTS, amount: 350 + (level-1)*90 }, { resource: ResourceType.GOLD, amount: 5000 + (level-1)*1000 }],
    researchTimeTicks: 10000,
    prerequisites: [{ researchId: 'ECO_MASTER_FARMERS', level: 2 }],
    effects: [{
      stat: 'heroRecruitmentCostReduction' as keyof GlobalEffectTarget,
      effectParams: { type: TownHallUpgradeEffectType.PercentageBonus, baseAmount: 0.03, additiveStep: 0.01 },
      description: "-X% Hero Recruitment Cost",
    }],
    maxLevel: 5,
    position: { x: 2, y: -1 },
  },
  'ECO_TRADE_ROUTES': {
    id: 'ECO_TRADE_ROUTES',
    name: 'Trade Routes',
    description: 'Develops trade routes, increasing gold income from enemy defeats and world map sources.',
    category: 'Economic',
    iconName: 'MAP_ICON', // Better icon for trade routes
    costPerLevel: (level) => [{ resource: ResourceType.RESEARCH_POINTS, amount: 500 + (level-1)*120 }, { resource: ResourceType.WOOD, amount: 2000 + (level-1)*400 }, { resource: ResourceType.STONE, amount: 2000 + (level-1)*400 }],
    researchTimeTicks: 15000,
    prerequisites: [{ researchId: 'ECO_GUILD_ACCOUNTING', level: 1 }, { researchId: 'ECO_GOLD_PROD_1', level: 2 }],
    effects: [
      { stat: 'enemyGoldDropBonus' as keyof GlobalEffectTarget, effectParams: { type: TownHallUpgradeEffectType.PercentageBonus, baseAmount: 0.02, additiveStep: 0.01 }, description: "+X% Gold from Enemies" },
      { stat: 'worldMapGoldRewardBonus' as any, effectParams: { type: TownHallUpgradeEffectType.PercentageBonus, baseAmount: 0.03, additiveStep: 0.015 }, description: "+X% Gold from World Map POIs" }
    ],
    maxLevel: 5,
    position: { x: 3, y: -1 },
  },
  'ECO_ALCHEMY_BREAKTHROUGHS': {
    id: 'ECO_ALCHEMY_BREAKTHROUGHS',
    name: 'Alchemy Breakthroughs',
    description: 'Reduces potion crafting time and resource costs.',
    category: 'Economic',
    iconName: 'STAFF_ICON',
    costPerLevel: (level) => [{ resource: ResourceType.RESEARCH_POINTS, amount: 400 + (level-1)*100 }, { resource: ResourceType.CRYSTALS, amount: 150 + (level-1)*30 }, { resource: ResourceType.HERB_BLOODTHISTLE, amount: 50 + (level-1)*10}],
    researchTimeTicks: 12000,
    prerequisites: [{ researchId: 'ECO_TRADE_ROUTES', level: 1 }],
    effects: [
      { stat: 'potionCraftingTimeReduction' as any, effectParams: { type: TownHallUpgradeEffectType.PercentageBonus, baseAmount: 0.05, additiveStep: 0.02 }, description: "-X% Potion Craft Time" },
      { stat: 'potionCraftingCostReduction' as any, effectParams: { type: TownHallUpgradeEffectType.PercentageBonus, baseAmount: 0.03, additiveStep: 0.01 }, description: "-X% Potion Resource Cost" }
    ],
    maxLevel: 5,
    position: { x: 4, y: -1 },
  },
  'ECO_RESOURCE_CACHE_UPGRADE': {
    id: 'ECO_RESOURCE_CACHE_UPGRADE',
    name: 'Expanded Warehouses',
    description: 'Increases maximum storage for Gold, Wood, Stone, and Food. (Conceptual, no direct stat yet)',
    category: 'Economic',
    iconName: 'BUILDING',
    costPerLevel: (level) => [{ resource: ResourceType.RESEARCH_POINTS, amount: 450 + (level-1)*110 }, { resource: ResourceType.WOOD, amount: 3000 + (level-1)*600 }, { resource: ResourceType.STONE, amount: 3000 + (level-1)*600 }],
    researchTimeTicks: 13000,
    prerequisites: [{ researchId: 'ECO_GOLD_PROD_1', level: 3 }],
    effects: [{
      stat: 'allResourceProductionBonus' as any, 
      effectParams: { type: TownHallUpgradeEffectType.PercentageBonus, baseAmount: 0.10, additiveStep: 0.05 }, 
      description: "+X% Max Resource Storage (Conceptual)",
    }],
    maxLevel: 5,
    position: { x: 4, y: 0 },
  },
   'ECO_EFFICIENT_MINING_DRILLS': {
    id: 'ECO_EFFICIENT_MINING_DRILLS',
    name: 'Efficient Mining Drills',
    description: 'Improves minigame yields.',
    category: 'Economic',
    iconName: 'PICKAXE_ICON',
    costPerLevel: (level) => [{ resource: ResourceType.RESEARCH_POINTS, amount: 320 + (level-1)*80 }, { resource: ResourceType.IRON, amount: 200 + (level-1)*50 }],
    researchTimeTicks: 10000,
    prerequisites: [{ researchId: 'ECO_GOLD_PROD_1', level: 2 }],
    effects: [
        { stat: 'minigameGoldMineYieldBonus' as any, effectParams: { type: TownHallUpgradeEffectType.PercentageBonus, baseAmount: 0.03, additiveStep: 0.01 }, description: "+X% Gold Mine Yield" },
        { stat: 'minigameQuarryYieldBonus' as any, effectParams: { type: TownHallUpgradeEffectType.PercentageBonus, baseAmount: 0.03, additiveStep: 0.01 }, description: "+X% Quarry Yield" }
    ],
    maxLevel: 5,
    position: { x: 3, y: 1 },
  },
  'ECO_MASTER_CRAFTSMEN': {
    id: 'ECO_MASTER_CRAFTSMEN',
    name: 'Master Craftsmen',
    description: 'Reduces resource costs for equipment crafting in the Forge.',
    category: 'Economic',
    iconName: 'ANVIL',
    costPerLevel: (level) => [{ resource: ResourceType.RESEARCH_POINTS, amount: 600 + (level-1)*150 }, { resource: ResourceType.IRON, amount: 1000 + (level-1)*200 }],
    researchTimeTicks: 18000,
    prerequisites: [{ researchId: 'ECO_ALCHEMY_BREAKTHROUGHS', level: 2 }],
    effects: [{ // This needs a specific GlobalBonus, for now a placeholder effect
      stat: 'buildingCostReduction' as any, // Placeholder, should be 'equipmentCraftingCostReduction'
      effectParams: { type: TownHallUpgradeEffectType.PercentageBonus, baseAmount: 0.02, additiveStep: 0.01 },
      description: "-X% Equipment Crafting Cost",
    }],
    maxLevel: 5,
    position: { x: 5, y: -1 },
  },


  // --- MILITÄR (Military) ---
  'MIL_BASIC_TRAINING': {
    id: 'MIL_BASIC_TRAINING',
    name: 'Basic Combat Drills',
    description: 'Fundamental combat training, increasing the base damage of all heroes.',
    category: 'Military',
    iconName: 'SWORD',
    costPerLevel: (level) => [{ resource: ResourceType.RESEARCH_POINTS, amount: 100 + (level-1)*30 }, { resource: ResourceType.GOLD, amount: 750 + (level-1)*200 }],
    researchTimeTicks: 5000,
    prerequisites: [],
    effects: [{
      stat: 'heroDamageBonus' as keyof GlobalEffectTarget,
      effectParams: { type: TownHallUpgradeEffectType.PercentageBonus, baseAmount: 0.01, additiveStep: 0.005 },
      description: "+X% Base Damage (All Heroes)",
    }],
    maxLevel: 10,
    position: { x: 0, y: 2 }, // Adjusted position
  },
  'MIL_IMPROVED_ARMOR': {
    id: 'MIL_IMPROVED_ARMOR',
    name: 'Improved Armor Forging',
    description: 'Advanced armor smithing techniques, increasing the defense of all heroes.',
    category: 'Military',
    iconName: 'SHIELD',
    costPerLevel: (level) => [{ resource: ResourceType.RESEARCH_POINTS, amount: 180 + (level-1)*50 }, { resource: ResourceType.IRON, amount: 300 + (level-1)*75 }],
    researchTimeTicks: 7500,
    prerequisites: [{ researchId: 'MIL_BASIC_TRAINING', level: 2 }],
    effects: [{
      stat: 'heroHpBonus' as keyof GlobalEffectTarget, // Should be 'heroDefenseBonus'
      effectParams: { type: TownHallUpgradeEffectType.PercentageBonus, baseAmount: 0.01, additiveStep: 0.005 },
      description: "+X% Defense (All Heroes)",
    }],
    maxLevel: 10,
    position: { x: 1, y: 2 }, // Adjusted position
  },
   'MIL_ENDURANCE_REGIMEN': {
    id: 'MIL_ENDURANCE_REGIMEN',
    name: 'Endurance Regimen',
    description: 'Intense physical conditioning, increasing the Max HP of all heroes.',
    category: 'Military',
    iconName: 'HERO',
    costPerLevel: (level) => [{ resource: ResourceType.RESEARCH_POINTS, amount: 220 + (level-1)*60 }, { resource: ResourceType.FOOD, amount: 1000 + (level-1)*200 }],
    researchTimeTicks: 8500,
    prerequisites: [{ researchId: 'MIL_BASIC_TRAINING', level: 3 }],
    effects: [{
      stat: 'heroHpBonus' as keyof GlobalEffectTarget,
      effectParams: { type: TownHallUpgradeEffectType.PercentageBonus, baseAmount: 0.02, additiveStep: 0.01 },
      description: "+X% Max HP (All Heroes)",
    }],
    maxLevel: 8,
    position: { x: 0, y: 3 }, // Adjusted position
  },
  'MIL_ADVANCED_HEALING_LORE': {
    id: 'MIL_ADVANCED_HEALING_LORE',
    name: 'Advanced Healing Lore',
    description: 'Increases the effectiveness of all healing abilities and effects for heroes.',
    category: 'Military',
    iconName: 'HEALTH_POTION',
    costPerLevel: (level) => [{ resource: ResourceType.RESEARCH_POINTS, amount: 350 + (level-1)*90 }, { resource: ResourceType.HERB_BLOODTHISTLE, amount: 75 + (level-1)*15 }, { resource: ResourceType.HERB_IRONWOOD_LEAF, amount: 75 + (level-1)*15 }],
    researchTimeTicks: 12000,
    prerequisites: [{ researchId: 'MIL_ENDURANCE_REGIMEN', level: 2 }],
    effects: [{
      stat: 'magicUserManaAndHealBonus' as any, // Assuming this impacts healPower
      effectParams: { type: TownHallUpgradeEffectType.PercentageBonus, baseAmount: 0.05, additiveStep: 0.02 },
      description: "+X% Healing Effectiveness (All Heroes)",
    }],
    maxLevel: 5,
    position: { x: 0, y: 4 }, // Adjusted position
  },
  'MIL_SIEGE_TACTICS': {
    id: 'MIL_SIEGE_TACTICS',
    name: 'Siege Tactics',
    description: 'Specialized tactics for engaging large foes, increasing hero damage against bosses.',
    category: 'Military',
    iconName: 'FIGHT',
    costPerLevel: (level) => [{ resource: ResourceType.RESEARCH_POINTS, amount: 400 + (level-1)*100 }, { resource: ResourceType.IRON, amount: 500 + (level-1)*120 }],
    researchTimeTicks: 14000,
    prerequisites: [{ researchId: 'MIL_MELEE_MASTERY', level: 2 }, { researchId: 'MIL_RANGED_PRECISION', level: 2 }],
    effects: [{ // This requires a new GlobalBonus: `heroDamageBonusVsBosses`
      stat: 'heroDamageBonus' as any, // Placeholder
      effectParams: { type: TownHallUpgradeEffectType.PercentageBonus, baseAmount: 0.03, additiveStep: 0.015 },
      description: "+X% Damage to Bosses",
    }],
    maxLevel: 5,
    position: { x: 2, y: 3 },
  },

  // --- ERKUNDUNG (Exploration) ---
  'EXP_CARTOGRAPHY_BASICS': {
    id: 'EXP_CARTOGRAPHY_BASICS',
    name: 'Cartography Basics',
    description: 'Basic map-making skills, increasing gold found in dungeon loot cells.',
    category: 'Exploration',
    iconName: 'COMPASS',
    costPerLevel: (level) => [{ resource: ResourceType.RESEARCH_POINTS, amount: 120 + (level-1)*40 }, { resource: ResourceType.WOOD, amount: 500 + (level-1)*100 }],
    researchTimeTicks: 6000,
    prerequisites: [],
    effects: [{
      stat: 'dungeonGoldRewardBonus' as keyof GlobalEffectTarget,
      effectParams: { type: TownHallUpgradeEffectType.PercentageBonus, baseAmount: 0.05, additiveStep: 0.02 },
      description: "+X% Gold from Dungeon Loot Cells",
    }],
    maxLevel: 5,
    position: { x: 0, y: 5 }, // Adjusted position
  },
   'EXP_SURVIVAL_INSTINCTS': {
    id: 'EXP_SURVIVAL_INSTINCTS',
    name: 'Survival Instincts',
    description: 'Reduces damage taken from dungeon traps by a small percentage.',
    category: 'Exploration',
    iconName: 'TRAP_ICON',
    costPerLevel: (level) => [{ resource: ResourceType.RESEARCH_POINTS, amount: 300 + (level-1)*70 }, { resource: ResourceType.LEATHER, amount: 600 + (level-1)*120 }],
    researchTimeTicks: 10000,
    prerequisites: [{ researchId: 'EXP_DUNGEON_LORE', level: 2 }],
    effects: [{
      stat: 'dungeonTrapDamageReduction' as any,
      effectParams: { type: TownHallUpgradeEffectType.PercentageBonus, baseAmount: 0.03, additiveStep: 0.015 },
      description: "-X% Damage from Dungeon Traps",
    }],
    maxLevel: 5,
    position: { x: 1, y: 6 },
  },
  'EXP_ANCIENT_KNOWLEDGE': {
    id: 'EXP_ANCIENT_KNOWLEDGE',
    name: 'Ancient Knowledge',
    description: 'Decipher ancient texts, small chance to gain Research Points from dungeon events.',
    category: 'Exploration',
    iconName: 'BOOK_ICON',
    costPerLevel: (level) => [{ resource: ResourceType.RESEARCH_POINTS, amount: 450 + (level-1)*110 }, { resource: ResourceType.CRYSTALS, amount: 200 + (level-1)*50 }],
    researchTimeTicks: 16000,
    prerequisites: [{ researchId: 'EXP_AETHERIC_SENSITIVITY', level: 2 }],
    effects: [{ // This needs a specific mechanism to grant RP on event completion
      stat: 'researchPointProductionBonus' as any, // Placeholder
      effectParams: { type: TownHallUpgradeEffectType.PercentageBonus, baseAmount: 0.01, additiveStep: 0.002 }, // Represents a general small gain
      description: "+X% Chance for Research Points from Dungeon Events",
    }],
    maxLevel: 5,
    position: { x: 3, y: 5 },
  },

  // --- SPEZIAL (Special) ---
  'SPC_AETHERIC_CONDUITS': {
    id: 'SPC_AETHERIC_CONDUITS',
    name: 'Aetheric Conduits',
    description: 'Enhances the flow of aether, increasing the bonus granted by each Resonance Mote.',
    category: 'Special',
    iconName: 'RESONANCE_MOTE_POTENT',
    costPerLevel: (level) => [{ resource: ResourceType.RESEARCH_POINTS, amount: 750 + (level-1)*200 }, { resource: ResourceType.AETHERIUM, amount: 5 + (level-1)*2 }],
    researchTimeTicks: 25000,
    prerequisites: [{ researchId: 'EXP_AETHERIC_SENSITIVITY', level: 3 }, { researchId: 'MIL_IMPROVED_ARMOR', level: 2 }],
    effects: [{
      stat: 'aethericMoteEffectivenessBonus' as any,
      effectParams: { type: TownHallUpgradeEffectType.PercentageBonus, baseAmount: 0.02, additiveStep: 0.01 },
      description: "+X% Effectiveness of Resonance Motes",
    }],
    maxLevel: 5,
    position: { x: 2, y: 6 },
  },
  'SPC_ACCELERATED_LEARNING': {
    id: 'SPC_ACCELERATED_LEARNING',
    name: 'Accelerated Learning',
    description: 'Optimizes learning processes, slightly increasing all Account XP gains.',
    category: 'Special',
    iconName: 'XP_ICON',
    costPerLevel: (level) => [{ resource: ResourceType.RESEARCH_POINTS, amount: 1000 + (level-1)*250 }, { resource: ResourceType.CRYSTALS, amount: 500 + (level-1)*100 }],
    researchTimeTicks: 30000,
    prerequisites: [{ researchId: 'ECO_TRADE_ROUTES', level: 2 }, { researchId: 'MIL_RANGED_PRECISION', level: 2 }],
    effects: [{
      stat: 'accountXPGainBonus' as any,
      effectParams: { type: TownHallUpgradeEffectType.PercentageBonus, baseAmount: 0.01, additiveStep: 0.005 },
      description: "+X% Account XP Gain",
    }],
    maxLevel: 5,
    position: { x: 3, y: -2 },
  },
  'SPC_RESEARCH_EFFICIENCY': {
    id: 'SPC_RESEARCH_EFFICIENCY',
    name: 'Research Efficiency',
    description: 'Streamlines the research process, reducing the time for all future research.',
    category: 'Special',
    iconName: 'SETTINGS',
    costPerLevel: (level) => [{ resource: ResourceType.RESEARCH_POINTS, amount: 1200 + (level-1)*300 }, { resource: ResourceType.AETHERIUM, amount: 10 + (level-1)*3 }],
    researchTimeTicks: 35000,
    prerequisites: [{ researchId: 'SPC_ACCELERATED_LEARNING', level: 2 }],
    effects: [{
      stat: 'researchTimeReduction' as any, // New Global Bonus
      effectParams: { type: TownHallUpgradeEffectType.PercentageBonus, baseAmount: 0.01, additiveStep: 0.005 },
      description: "-X% Research Time",
    }],
    maxLevel: 5,
    position: { x: 4, y: -2 },
  },
};

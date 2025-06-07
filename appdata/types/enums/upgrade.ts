export enum TownHallUpgradeCostType {
  ArithmeticIncreasingStep = 'ArithmeticIncreasingStep',
  LinearIncreasing = 'LinearIncreasing',
}

export enum TownHallUpgradeEffectType {
  Additive = 'Additive',
  PercentageBonus = 'PercentageBonus',
}

export enum GlobalEffectTarget {
  ALL_RESOURCE_PRODUCTION = 'ALL_RESOURCE_PRODUCTION',
  WAVE_GOLD_REWARD = 'WAVE_GOLD_REWARD',
  WAVE_XP_REWARD = 'WAVE_XP_REWARD',
  BUILDING_COST_REDUCTION = 'BUILDING_COST_REDUCTION',
  HERO_XP_GAIN = 'HERO_XP_GAIN',
  DUNGEON_BUFF_CHOICES_BONUS = 'DUNGEON_BUFF_CHOICES_BONUS',
  CATACOMB_KEY_COST_REDUCTION = 'CATACOMB_KEY_COST_REDUCTION',
  HERO_RECRUITMENT_COST_REDUCTION = 'HERO_RECRUITMENT_COST_REDUCTION',
}

export enum TownHallUpgradeUnlockRequirementType {
  SpecificUpgradeLevel = 'SpecificUpgradeLevel',
  TotalResourceSpentOnPaths = 'TotalResourceSpentOnPaths',
  BuildingLevel = 'BuildingLevel',
  HeroRecruited = 'HeroRecruited',
}


import { DemoniconMilestoneRewardDefinition, HeroStats } from '../types';

export const DEMONICON_MILESTONE_REWARDS: Record<string, DemoniconMilestoneRewardDefinition[]> = {
  'GOBLIN': [
    {
      id: 'GOBLIN_RANK_9_HP_BONUS',
      enemyId: 'GOBLIN',
      rankToAchieve: 9,
      rewards: [
        {
          type: 'GLOBAL_STAT_MODIFIER',
          stat: 'maxHp' as keyof HeroStats,
          value: 0.05,
          isPercentage: true,
          description: "+5% Max HP for all heroes in Demonicon challenges."
        }
      ]
    },
    {
      id: 'GOBLIN_RANK_19_HP_BONUS',
      enemyId: 'GOBLIN',
      rankToAchieve: 19,
      rewards: [
        {
          type: 'GLOBAL_STAT_MODIFIER',
          stat: 'maxHp' as keyof HeroStats,
          value: 0.10,
          isPercentage: true,
          description: "+10% Max HP for all heroes in Demonicon challenges."
        }
      ]
    },
    {
      id: 'GOBLIN_RANK_29_DEF_BONUS',
      enemyId: 'GOBLIN',
      rankToAchieve: 29,
      rewards: [
        {
          type: 'GLOBAL_STAT_MODIFIER',
          stat: 'defense' as keyof HeroStats,
          value: 0.075,
          isPercentage: true,
          description: "+7.5% Defense for all heroes in Demonicon challenges."
        }
      ]
    }
  ],
  'SKELETON_ARCHER': [
    {
      id: 'SKELETON_ARCHER_RANK_9_ATKSPD_BONUS',
      enemyId: 'SKELETON_ARCHER',
      rankToAchieve: 9,
      rewards: [
        {
          type: 'GLOBAL_STAT_MODIFIER',
          stat: 'attackSpeed' as keyof HeroStats,
          value: 0.05,
          isPercentage: true,
          description: "+5% Attack Speed for all heroes in Demonicon challenges."
        }
      ]
    },
    {
      id: 'SKELETON_ARCHER_RANK_19_CRIT_BONUS',
      enemyId: 'SKELETON_ARCHER',
      rankToAchieve: 19,
      rewards: [
        {
          type: 'GLOBAL_STAT_MODIFIER',
          stat: 'critChance' as keyof HeroStats,
          value: 0.025,
          isPercentage: true,
          description: "+2.5% Crit Chance for all heroes in Demonicon challenges."
        }
      ]
    }
  ],
  'SKELETON_WARRIOR': [
    {
      id: 'SKELETON_WARRIOR_RANK_9_DMG_BONUS',
      enemyId: 'SKELETON_WARRIOR',
      rankToAchieve: 9,
      rewards: [
        {
          type: 'GLOBAL_STAT_MODIFIER',
          stat: 'damage' as keyof HeroStats,
          value: 0.05,
          isPercentage: true,
          description: "+5% Damage for all heroes in Demonicon challenges."
        }
      ]
    },
    {
      id: 'SKELETON_WARRIOR_RANK_19_MAX_MANA_BONUS',
      enemyId: 'SKELETON_WARRIOR',
      rankToAchieve: 19,
      rewards: [
        {
          type: 'GLOBAL_STAT_MODIFIER',
          stat: 'maxMana' as keyof HeroStats,
          value: 0.10,
          isPercentage: true,
          description: "+10% Max Mana for all heroes in Demonicon challenges."
        }
      ]
    }
  ],
  'ORC_BRUTE': [
    {
      id: 'ORC_BRUTE_RANK_9_HP_REGEN_BONUS',
      enemyId: 'ORC_BRUTE',
      rankToAchieve: 9,
      rewards: [
        {
          type: 'GLOBAL_STAT_MODIFIER',
          stat: 'hpRegen' as keyof HeroStats,
          value: 0.5, // Flat +0.5 HP/s
          isPercentage: false,
          description: "+0.5 HP Regen/s for all heroes in Demonicon challenges."
        }
      ]
    },
    {
      id: 'ORC_BRUTE_RANK_19_DEF_PERCENT_BONUS',
      enemyId: 'ORC_BRUTE',
      rankToAchieve: 19,
      rewards: [
        {
          type: 'GLOBAL_STAT_MODIFIER',
          stat: 'defense' as keyof HeroStats,
          value: 0.05,
          isPercentage: true,
          description: "+5% Defense for all heroes in Demonicon challenges."
        }
      ]
    }
  ]
  // Add more enemy milestones here
};

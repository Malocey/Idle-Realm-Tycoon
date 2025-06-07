
import { ResourceType, EnemyDefinition, BossPhaseDefinition, BossPhaseAbilityType, HeroStats } from '../../types';
import { GAME_TICK_MS } from '../../constants'; // Import GAME_TICK_MS

export const BOSS_GOBLIN_OVERLORD_DEFINITION: EnemyDefinition = {
  id: 'BOSS_GOBLIN_OVERLORD',
  name: 'Goblin Overlord',
  stats: { maxHp: 2500, damage: 40, defense: 15, attackSpeed: 0.6, critChance: 0.10, critDamage: 1.6 },
  loot: [
    { resource: ResourceType.GOLD, amount: 750 },
    { resource: ResourceType.IRON, amount: 30 },
    { resource: ResourceType.CRYSTALS, amount: 25 },
    { resource: ResourceType.META_CURRENCY, amount: 1 },
    { resource: ResourceType.HEROIC_POINTS, amount: 300 },
    { resource: ResourceType.CATACOMB_BLUEPRINT, amount: 1 }
  ],
  iconName: 'ENEMY',
  expReward: 500,
  summonAbility: {
    enemyIdToSummon: 'GOBLIN',
    count: 3,
    cooldownMs: 10000,
    initialCooldownMs: 7000,
    scaleWithWave: true,
  },
  phases: [ 
    {
      hpThreshold: 0.50, 
      name: "Enraged Defense",
      abilities: [
        {
          type: BossPhaseAbilityType.STAT_BUFF,
          stat: 'defense' as keyof HeroStats,
          value: 0.50, // +50% Verteidigung
          durationTicks: 60 * (1000 / GAME_TICK_MS), 
        },
      ],
    },
    { // Neue zweite Phase
      hpThreshold: 0.25,
      name: "Overlord's Fury",
      abilities: [
        {
          type: BossPhaseAbilityType.STAT_BUFF,
          stat: 'attackSpeed' as keyof HeroStats, // Erhöht Angriffsgeschwindigkeit
          value: 0.3, // +30%
          durationTicks: 30 * (1000 / GAME_TICK_MS), // 30 Sekunden
        },
        {
          type: BossPhaseAbilityType.SUMMON_MINIONS,
          summonParams: {
            enemyId: 'GOBLIN',
            count: 2,
            isElite: true,
          }
        }
      ]
    }
  ],
};

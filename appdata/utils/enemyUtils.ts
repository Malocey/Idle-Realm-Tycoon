
import { EnemyDefinition, HeroStats, DungeonDefinition, GameContextType, BattleEnemy, GlobalBonuses } from '../types'; // Added GameContextType, BattleEnemy, GlobalBonuses
import { DEFAULT_ENERGY_SHIELD_RECHARGE_DELAY_TICKS, DEFAULT_ENERGY_SHIELD_RECHARGE_RATE_PER_TICK } from '../constants';

export const calculateWaveEnemyStats = (baseEnemyDef: EnemyDefinition, waveNumber: number, isElite?: boolean, strengthModifier: number = 1.0): HeroStats => {
  const scaledStats: HeroStats = { ...baseEnemyDef.stats }; 

  const damageDefenseScalingFactor = 1 + (waveNumber - 1) * 0.07;
  const hpScalingFactor = 1 + (waveNumber - 1) * 0.10;

  scaledStats.maxHp = Math.floor(baseEnemyDef.stats.maxHp * hpScalingFactor);
  scaledStats.damage = Math.floor(baseEnemyDef.stats.damage * damageDefenseScalingFactor);
  scaledStats.defense = Math.floor(baseEnemyDef.stats.defense * damageDefenseScalingFactor);

  if (baseEnemyDef.stats.maxEnergyShield && baseEnemyDef.stats.maxEnergyShield > 0) {
    scaledStats.maxEnergyShield = Math.floor(baseEnemyDef.stats.maxEnergyShield * hpScalingFactor);
    scaledStats.energyShieldRechargeRate = baseEnemyDef.stats.energyShieldRechargeRate || DEFAULT_ENERGY_SHIELD_RECHARGE_RATE_PER_TICK;
    scaledStats.energyShieldRechargeDelay = baseEnemyDef.stats.energyShieldRechargeDelay || DEFAULT_ENERGY_SHIELD_RECHARGE_DELAY_TICKS;
  } else {
    scaledStats.maxEnergyShield = 0;
    scaledStats.energyShieldRechargeRate = 0;
    scaledStats.energyShieldRechargeDelay = 0;
  }

  if (isElite) {
    scaledStats.maxHp *= 1.5; 
    scaledStats.damage *= 1.25; 
    scaledStats.defense *= 1.25; 
    if (scaledStats.maxEnergyShield) {
        scaledStats.maxEnergyShield *= 1.5; 
    }
  }

  // Apply summon strength modifier
  if (strengthModifier !== 1.0) {
    scaledStats.maxHp = Math.floor(scaledStats.maxHp * strengthModifier);
    scaledStats.damage = Math.floor(scaledStats.damage * strengthModifier);
    scaledStats.defense = Math.floor(scaledStats.defense * strengthModifier);
    if (scaledStats.maxEnergyShield) {
        scaledStats.maxEnergyShield = Math.floor(scaledStats.maxEnergyShield * strengthModifier);
    }
  }


  scaledStats.critChance = scaledStats.critChance ?? 0;
  scaledStats.critDamage = scaledStats.critDamage ?? 1.5;
  scaledStats.healPower = scaledStats.healPower ?? 0;
  scaledStats.maxMana = scaledStats.maxMana ?? 0;
  scaledStats.manaRegen = scaledStats.manaRegen ?? 0;
  scaledStats.hpRegen = scaledStats.hpRegen ?? 0;


  return scaledStats;
};

export const calculateDungeonEnemyStats = (
    baseEnemyDef: EnemyDefinition,
    dungeonDef: DungeonDefinition,
    floorIndex: number,
    isEliteEncounter?: boolean
): HeroStats => {
    let scaledStats: HeroStats = { ...baseEnemyDef.stats };

    if (baseEnemyDef.dungeonTierScale) {
        scaledStats.maxHp *= (baseEnemyDef.dungeonTierScale.hpFactor || 1);
        scaledStats.damage *= (baseEnemyDef.dungeonTierScale.damageFactor || 1);
        scaledStats.defense *= (baseEnemyDef.dungeonTierScale.defenseFactor || 1);
        if (scaledStats.maxEnergyShield && baseEnemyDef.dungeonTierScale.hpFactor) { 
            scaledStats.maxEnergyShield *= baseEnemyDef.dungeonTierScale.hpFactor;
        }
    }

    if (dungeonDef.tier > 0) {
        const tierStatMultiplier = 1 + (dungeonDef.tier * 0.5);
        scaledStats.maxHp *= tierStatMultiplier;
        scaledStats.damage *= tierStatMultiplier;
        scaledStats.defense *= tierStatMultiplier;
        if (scaledStats.maxEnergyShield) {
            scaledStats.maxEnergyShield *= tierStatMultiplier;
        }
    }

    const floorScalingFactorHP = 1 + (floorIndex * 0.10);
    const floorScalingFactorDamageDefense = 1 + (floorIndex * 0.06);

    scaledStats.maxHp *= floorScalingFactorHP;
    scaledStats.damage *= floorScalingFactorDamageDefense;
    scaledStats.defense *= floorScalingFactorDamageDefense;
    
    if (baseEnemyDef.stats.maxEnergyShield && baseEnemyDef.stats.maxEnergyShield > 0) {
        scaledStats.maxEnergyShield = (scaledStats.maxEnergyShield || baseEnemyDef.stats.maxEnergyShield) * floorScalingFactorHP; 
        scaledStats.energyShieldRechargeRate = baseEnemyDef.stats.energyShieldRechargeRate || DEFAULT_ENERGY_SHIELD_RECHARGE_RATE_PER_TICK;
        scaledStats.energyShieldRechargeDelay = baseEnemyDef.stats.energyShieldRechargeDelay || DEFAULT_ENERGY_SHIELD_RECHARGE_DELAY_TICKS;
    } else {
        scaledStats.maxEnergyShield = 0;
        scaledStats.energyShieldRechargeRate = 0;
        scaledStats.energyShieldRechargeDelay = 0;
    }

    if (isEliteEncounter) {
        scaledStats.maxHp *= 1.5;
        scaledStats.damage *= 1.25;
        scaledStats.defense *= 1.25;
        if (scaledStats.maxEnergyShield) {
            scaledStats.maxEnergyShield *= 1.5;
        }
    }

    scaledStats.maxHp = Math.floor(scaledStats.maxHp);
    scaledStats.damage = Math.max(1, Math.floor(scaledStats.damage));
    scaledStats.defense = Math.floor(scaledStats.defense);
    scaledStats.maxEnergyShield = Math.floor(scaledStats.maxEnergyShield || 0); 
    scaledStats.energyShieldRechargeRate = scaledStats.energyShieldRechargeRate ?? 0;
    scaledStats.energyShieldRechargeDelay = scaledStats.energyShieldRechargeDelay ?? 0;

    scaledStats.critChance = scaledStats.critChance ?? 0;
    scaledStats.critDamage = scaledStats.critDamage ?? 1.5;
    scaledStats.healPower = scaledStats.healPower ?? 0;
    scaledStats.maxMana = scaledStats.maxMana ?? 0;
    scaledStats.manaRegen = scaledStats.manaRegen ?? 0;
    scaledStats.hpRegen = scaledStats.hpRegen ?? 0;

    return scaledStats;
};

export const calculateDemoniconEnemyStats = (
  baseEnemyDef: EnemyDefinition,
  rank: number,
  staticData: GameContextType['staticData'], 
  globalBonuses: GlobalBonuses 
): BattleEnemy[] => {
  const scaledEnemies: BattleEnemy[] = [];
  const baseStats: HeroStats = { ...baseEnemyDef.stats };
  
  const { enemyCount, statMultiplier } = getDemoniconRankChallengeDetails(rank);


  const finalStats: HeroStats = {
    ...baseStats,
    maxHp: Math.max(1, Math.floor(baseStats.maxHp * statMultiplier)),
    damage: Math.max(1, Math.floor(baseStats.damage * statMultiplier)),
    defense: Math.max(0, Math.floor(baseStats.defense * statMultiplier)),
    attackSpeed: baseStats.attackSpeed,
    critChance: baseStats.critChance ?? 0,
    critDamage: baseStats.critDamage ?? 1.5,
    healPower: baseStats.healPower ?? 0,
    maxMana: baseStats.maxMana ?? 0,
    manaRegen: baseStats.manaRegen ?? 0,
    hpRegen: baseStats.hpRegen ?? 0,
    maxEnergyShield: baseStats.maxEnergyShield ? Math.floor(baseStats.maxEnergyShield * statMultiplier) : 0,
    energyShieldRechargeRate: baseStats.energyShieldRechargeRate || DEFAULT_ENERGY_SHIELD_RECHARGE_RATE_PER_TICK,
    energyShieldRechargeDelay: baseStats.energyShieldRechargeDelay || DEFAULT_ENERGY_SHIELD_RECHARGE_DELAY_TICKS,
  };


  for (let i = 0; i < enemyCount; i++) {
    scaledEnemies.push({
      ...baseEnemyDef, 
      calculatedStats: finalStats, 
      isElite: true, 
      uniqueBattleId: `demonicon_${baseEnemyDef.id}_rank${rank}_num${i}_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      currentHp: finalStats.maxHp,
      currentEnergyShield: finalStats.maxEnergyShield || 0,
      shieldRechargeDelayTicksRemaining: finalStats.energyShieldRechargeDelay || DEFAULT_ENERGY_SHIELD_RECHARGE_DELAY_TICKS,
      attackCooldown: (1000 / finalStats.attackSpeed),
      attackCooldownRemainingTicks: 0,
      movementSpeed: 0, 
      x: Math.random() * (500 - 32), 
      y: Math.random() * (200 - 32), 
      statusEffects: [],
      targetId: null,
      specialAttackCooldownsRemaining: {}, 
      attackType: baseEnemyDef.attackType || 'MELEE',
      rangedAttackRangeUnits: baseEnemyDef.rangedAttackRangeUnits,
      summonStrengthModifier: baseEnemyDef.summonAbility ? 1.0 : undefined, // Initialize summon strength modifier
      currentShieldHealCooldownMs: baseEnemyDef.shieldHealAbility?.initialCooldownMs ?? baseEnemyDef.shieldHealAbility?.cooldownMs,
    });
  }
  return scaledEnemies;
};

export const getDemoniconRankChallengeDetails = (rank: number): { enemyCount: number, statMultiplier: number } => {
  let enemyCount = 1;
  let statMultiplier = 1.0;

  if (rank >= 0 && rank <= 7) {
    enemyCount = 1 + rank;
    statMultiplier = 1.0 + rank * 0.3;
  } else if (rank >= 8) {
    enemyCount = 8;
    statMultiplier = 1.0 + 7 * 0.3; 
    let additionalIncrementFactor = 0.4; 
    for (let r = 8; r <= rank; r++) {
      statMultiplier += additionalIncrementFactor;
      additionalIncrementFactor += 0.1;
    }
  }
  return { enemyCount, statMultiplier };
};
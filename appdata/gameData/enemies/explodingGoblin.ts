
import { ResourceType, EnemyDefinition, ExplosionAbilityDetails } from '../../types';

export const EXPLODING_GOBLIN_DEFINITION: EnemyDefinition = {
  id: 'EXPLODING_GOBLIN',
  name: 'Exploding Goblin',
  stats: { 
    maxHp: 25, 
    damage: 3, // Normaler Angriffsschaden (falls er angreift, bevor er explodiert)
    defense: 0, 
    attackSpeed: 1.0, 
    critChance: 0.01, 
    critDamage: 1.2 
  },
  loot: [{ resource: ResourceType.GOLD, amount: 3 }], // Weniger Loot, da er explodiert
  iconName: 'ENEMY', // Kann später ein spezifisches Icon bekommen
  expReward: 8,
  explosionAbility: {
    timerMs: 15000, // 15 Sekunden
    damage: 40,    // Fester Explosionsschaden
    damageType: 'FIXED', 
  },
  // Explodierende Goblins greifen nicht normal an, sie laufen nur auf ihr Ziel zu oder explodieren.
  // attackType: 'MELEE',
  // specialAttackCooldownsRemaining: {}, // No channeling abilities defined, so not strictly needed here but good practice if others have it.
};
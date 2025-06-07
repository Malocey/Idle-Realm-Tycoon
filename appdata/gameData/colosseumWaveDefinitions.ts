
import { ColosseumWaveDefinition, ResourceType } from '../types';

// Defines waves for the Colosseum Action Battle Mode
// For now, these are simple and just increase goblin count.
// More complex waves with different enemy types and scaling can be added.

export const COLOSSEUM_WAVE_DEFINITIONS: ColosseumWaveDefinition[] = [
  { 
    waveNumber: 1, 
    enemies: [{ enemyId: 'GOBLIN', count: 4 }],
  },
  { 
    waveNumber: 2, 
    enemies: [{ enemyId: 'GOBLIN', count: 6 }],
  },
  { 
    waveNumber: 3, 
    enemies: [{ enemyId: 'GOBLIN', count: 4 }, { enemyId: 'SKELETON_ARCHER', count: 3 }],
  },
  { 
    waveNumber: 4, 
    enemies: [{ enemyId: 'GOBLIN', count: 6 }, { enemyId: 'SKELETON_ARCHER', count: 3 }],
  },
  { 
    waveNumber: 5, 
    enemies: [{ enemyId: 'ORC_BRUTE', count: 2 }],
  },
  { 
    waveNumber: 6, 
    enemies: [{ enemyId: 'GOBLIN', count: 5 }, { enemyId: 'SKELETON_WARRIOR', count: 3 }],
  },
  { 
    waveNumber: 7, 
    enemies: [{ enemyId: 'DIRE_WOLF', count: 1 }, { enemyId: 'SKELETON_ARCHER', count: 2 }, { enemyId: 'SKELETON_WARRIOR', count: 3 }],
  },
  { 
    waveNumber: 8, 
    enemies: [{ enemyId: 'ORC_BRUTE', count: 3 }, { enemyId: 'SKELETON_WARRIOR', count: 6}],
  },
  { 
    waveNumber: 9, 
    enemies: [{ enemyId: 'GIANT_SPIDER', count: 5 }, { enemyId: 'SKELETON_ARCHER', count: 7 }],
  },
  { 
    waveNumber: 10, 
    enemies: [{ enemyId: 'BOSS_GOBLIN_WARLORD', count: 1 }], // Example boss for Colosseum
  },
];

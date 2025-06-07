
import { EnemyDefinition } from '../types';

// Import individual enemy definitions
import { GOBLIN_DEFINITION } from './enemies/goblin';
import { ORC_BRUTE_DEFINITION } from './enemies/orcBrute';
import { SKELETON_ARCHER_DEFINITION } from './enemies/skeletonArcher';
import { SKELETON_WARRIOR_DEFINITION } from './enemies/skeletonWarrior';
import { GIANT_SPIDER_DEFINITION } from './enemies/giantSpider';
import { DIRE_WOLF_DEFINITION } from './enemies/direWolf';
import { BOSS_GOBLIN_WARLORD_DEFINITION } from './enemies/bossGoblinWarlord';
import { BOSS_GOBLIN_OVERLORD_DEFINITION } from './enemies/bossGoblinOverlord';
import { GOBLIN_SHAMAN_DEFINITION } from './enemies/goblinShaman';
import { ORC_RAVAGER_DEFINITION } from './enemies/orcRavager';
import { CRYSTAL_GOLEM_DEFINITION } from './enemies/crystalGolem';
import { TREANT_SAPLING_DEFINITION } from './enemies/treantSapling';
import { TREANT_ADULT_DEFINITION } from './enemies/treantAdult'; 
import { CORPSEBLOOM_SPROUT_DEFINITION } from './enemies/corpsebloomSprout';
import { BOSS_STONE_TITAN_DEFINITION } from './enemies/bossStoneTitan';
import { BOSS_DEMON_LORD_DEFINITION } from './enemies/bossDemonLord';
import { ELITE_GUARDIAN_DEFINITION } from './enemies/eliteGuardian';
import { EXPLODING_GOBLIN_DEFINITION } from './enemies/explodingGoblin';
import { SKELETON_MAGE_DEFINITION } from './enemies/skeletonMage';
import { SHADOW_CREEPER_DEFINITION } from './enemies/shadowCreeper'; 
import { IRONCLAD_GOLEM_DEFINITION } from './enemies/ironcladGolem'; 
import { BANDIT_MARKSMAN_DEFINITION } from './enemies/banditMarksman';
import { ARMORED_GOBLIN_DEFINITION } from './enemies/armoredGoblin';
import { IMP_WARLOCK_DEFINITION } from './enemies/impWarlock';
import { SHIELDED_GOBLIN_DEFINITION } from './enemies/shieldedGoblin'; 
import { ARCANE_SENTRY_DEFINITION } from './enemies/arcaneSentry'; 
import { SHIELD_MENDER_GOBLIN_DEFINITION } from './enemies/shieldMenderGoblin'; // New
import { ARCANE_RESTORER_DEFINITION } from './enemies/arcaneRestorer'; // New


export const ENEMY_DEFINITIONS: Record<string, EnemyDefinition> = {
  'GOBLIN': GOBLIN_DEFINITION,
  'EXPLODING_GOBLIN': EXPLODING_GOBLIN_DEFINITION,
  'ORC_BRUTE': ORC_BRUTE_DEFINITION,
  'SKELETON_ARCHER': SKELETON_ARCHER_DEFINITION,
  'SKELETON_WARRIOR': SKELETON_WARRIOR_DEFINITION,
  'SKELETON_MAGE': SKELETON_MAGE_DEFINITION,
  'GIANT_SPIDER': GIANT_SPIDER_DEFINITION,
  'DIRE_WOLF': DIRE_WOLF_DEFINITION,
  'BOSS_GOBLIN_WARLORD': BOSS_GOBLIN_WARLORD_DEFINITION,
  'BOSS_GOBLIN_OVERLORD': BOSS_GOBLIN_OVERLORD_DEFINITION,
  'GOBLIN_SHAMAN': GOBLIN_SHAMAN_DEFINITION,
  'ORC_RAVAGER': ORC_RAVAGER_DEFINITION,
  'CRYSTAL_GOLEM': CRYSTAL_GOLEM_DEFINITION,
  'TREANT_SAPLING': TREANT_SAPLING_DEFINITION,
  'TREANT_ADULT': TREANT_ADULT_DEFINITION, 
  'CORPSEBLOOM_SPROUT': CORPSEBLOOM_SPROUT_DEFINITION,
  'BOSS_STONE_TITAN': BOSS_STONE_TITAN_DEFINITION,
  'BOSS_DEMON_LORD': BOSS_DEMON_LORD_DEFINITION,
  'ELITE_GUARDIAN': ELITE_GUARDIAN_DEFINITION,
  'SHADOW_CREEPER': SHADOW_CREEPER_DEFINITION, 
  'IRONCLAD_GOLEM': IRONCLAD_GOLEM_DEFINITION, 
  'BANDIT_MARKSMAN': BANDIT_MARKSMAN_DEFINITION,
  'ARMORED_GOBLIN': ARMORED_GOBLIN_DEFINITION,
  'IMP_WARLOCK': IMP_WARLOCK_DEFINITION,
  'SHIELDED_GOBLIN': SHIELDED_GOBLIN_DEFINITION, 
  'ARCANE_SENTRY': ARCANE_SENTRY_DEFINITION, 
  'SHIELD_MENDER_GOBLIN': SHIELD_MENDER_GOBLIN_DEFINITION, // New
  'ARCANE_RESTORER': ARCANE_RESTORER_DEFINITION, // New
};
// /appdata/types/autoBattler.ts
// Remove import:
// import { AutoBattlerBuildingType, AutoBattlerBuildingCard, AutoBattlerUnit, AutoBattlerBaseStructure, AutoBattlerDefense, AutoBattlerEnemyTower, DamagePopup } from './index';

export enum AutoBattlerBuildingType {
  FARM = 'FARM',
  BARRACKS = 'BARRACKS',
  WINDMILL = 'WINDMILL',
  PLAYER_HQ = 'PLAYER_HQ',
  ENEMY_TOWER = 'ENEMY_TOWER',
  ENEMY_BASE = 'ENEMY_BASE',
}

export interface AutoBattlerBuildingCard {
  id: string;
  name: string;
  buildingType: AutoBattlerBuildingType;
  cost: number;
  producesUnitId?: string;
  productionTimeMs?: number;
}

export interface AutoBattlerUnitDefinition {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  damage: number;
  attackSpeed: number; // Milliseconds per attack
  speed: number; // Pixels per second
  attackRange: number; // Pixels
}

export interface AutoBattlerUnit {
  instanceId: string;
  definitionId: string;
  hp: number;
  maxHp: number;
  damage: number;
  attackSpeed: number;
  speed: number;
  attackRange: number;
  x: number;
  y: number;
  isPlayerUnit: boolean;
  isMoving: boolean;
  targetId?: string | null;
  attackCooldownRemainingMs: number;
  stackSize: number;
}

export interface AutoBattlerBuilding {
  id: string; // Instance ID
  type: AutoBattlerBuildingType;
  level: number;
  hp: number;
  maxHp: number;
  position: { x: number; y: number }; // Grid position (col, row)
  x?: number; // World position (center of cell)
  y?: number; // World position (center of cell)
  producesUnitId?: string;
  productionTimeMs?: number;
  productionProgressMs?: number;
}

export interface AutoBattlerBaseStructure {
  id: string;
  type: AutoBattlerBuildingType.PLAYER_HQ | AutoBattlerBuildingType.ENEMY_BASE;
  x: number;
  y: number;
  hp: number; // Made non-optional for consistency, especially for ENEMY_BASE
  maxHp: number; // Made non-optional
  producesUnitId?: string;
  productionTimeMs?: number;
  productionProgressMs?: number;
  damage?: number;
  attackSpeed?: number;
  attackRange?: number;
  attackCooldownRemainingMs?: number;
}

export interface AutoBattlerDefense {
  id: string;
  type: 'WALL' | 'TURRET';
  hp: number;
  maxHp: number;
  position: { x: number; y: number };
  x?: number;
  y?: number;
  damage?: number;
  attackSpeed?: number;
  attackRange?: number;
  attackCooldownRemainingMs?: number;
  targetId?: string | null;
}

export interface AutoBattlerEnemyTower {
  id: string;
  type: AutoBattlerBuildingType.ENEMY_TOWER;
  hp: number;
  maxHp: number;
  x: number;
  y: number;
  damage: number;
  attackSpeed: number;
  attackRange: number;
  attackCooldownRemainingMs: number;
}

export interface DamagePopup {
    id: string;
    text: string;
    x: number;
    y: number;
    targetId?: string;
    lifetimeMs: number;
    initialLifetimeMs: number;
    isCrit?: boolean;
}

export interface AutoBattlerState {
  isActive: boolean;
  supplies: number;
  grid: (AutoBattlerBuilding | null)[][];
  playerUnits: AutoBattlerUnit[];
  builderUnits: AutoBattlerUnit[];
  playerDefenses: AutoBattlerDefense[];
  enemyUnits: AutoBattlerUnit[];
  enemyTowers: AutoBattlerEnemyTower[];
  enemyBase: AutoBattlerBaseStructure & { // Ensured hp and maxHp are required
    hp: number;
    maxHp: number;
    producesUnitId?: string;
    productionTimeMs?: number;
    productionProgressMs?: number;
    damage?: number;
    attackSpeed?: number;
    attackRange?: number;
    attackCooldownRemainingMs?: number;
  };
  enemySpawnRateModifier: number;
  nextEnemySpawnPoolIndex: number;
  towersDestroyedCountThisRun: number;
  gameTime: number;
  popups: DamagePopup[];
  farmBuffs?: Record<string, number>;
  camera: { x: number; y: number };
  deck: AutoBattlerBuildingCard[];
  hand: AutoBattlerBuildingCard[];
  discard: AutoBattlerBuildingCard[];
  currentViewportWidth: number;
  currentViewportHeight: number;
  eliteSpawnCooldownMs: number;
}

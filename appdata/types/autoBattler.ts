
export enum AutoBattlerBuildingType {
  FARM = 'FARM',
  BARRACKS = 'BARRACKS',
  SHOOTING_RANGE = 'SHOOTING_RANGE',
  SIEGE_WORKSHOP = 'SIEGE_WORKSHOP',
  WINDMILL = 'WINDMILL',
  SIGNAL_FIRE = 'SIGNAL_FIRE',
  WATCHTOWER = 'WATCHTOWER',
  BUILDER_HUT = 'BUILDER_HUT',
  // Fixed structures, not from cards typically
  PLAYER_HQ = 'PLAYER_HQ',
  ENEMY_TOWER = 'ENEMY_TOWER',
  ENEMY_BASE = 'ENEMY_BASE',
  BALLISTA = 'BALLISTA', // Defense built by builder
}

export interface AutoBattlerBuildingCard {
  id: string; 
  name: string;
  buildingType: AutoBattlerBuildingType;
  cost: number; // Supplies cost
  producesUnitId?: string;
  productionTimeMs?: number; 
}

export interface AutoBattlerBaseStructure {
  id: string; // Unique instance ID
  type: AutoBattlerBuildingType;
  hp?: number;
  maxHp?: number;
  x?: number; // Visual display X coordinate
  y?: number; // Visual display Y coordinate
  producesUnitId?: string;      
  productionTimeMs?: number;    
  productionProgressMs?: number; 
}

export interface AutoBattlerBuilding extends AutoBattlerBaseStructure {
  level: number;
  position: { x: number; y: number; }; // Grid column x, grid row y
  productionProgressMs?: number; 
  producesUnitId?: string; 
  productionTimeMs?: number; 
}

export interface AutoBattlerUnitDefinition {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  damage: number;
  attackSpeed: number; // Milliseconds between attacks
  speed: number; // Pixels per second
  attackRange: number; // Pixels
}

export interface AutoBattlerUnit {
  instanceId: string; 
  definitionId: string; 
  hp: number;
  maxHp: number;
  damage: number;
  attackSpeed: number; // Cooldown in ms
  attackRange: number; // Range in pixels
  speed: number;
  x: number; 
  y: number;
  targetId?: string | null; 
  isPlayerUnit: boolean;
  attackCooldownRemainingMs?: number; // Time until next attack is ready
  isMoving?: boolean; // To control movement when targeting
  stackSize: number; // Number of units in this stack
}

export interface AutoBattlerEnemyTower extends AutoBattlerBaseStructure {
  type: AutoBattlerBuildingType.ENEMY_TOWER;
}

export interface AutoBattlerDefense extends AutoBattlerBaseStructure {
   type: AutoBattlerBuildingType.BALLISTA;
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
  enemyBase: AutoBattlerBaseStructure & { hp: number; maxHp: number; producesUnitId?: string; productionTimeMs?: number; productionProgressMs?: number; };
  
  enemySpawnRateModifier: number;

  deck: AutoBattlerBuildingCard[];
  hand: AutoBattlerBuildingCard[];
  discard: AutoBattlerBuildingCard[];

  gameTime: number; 
}

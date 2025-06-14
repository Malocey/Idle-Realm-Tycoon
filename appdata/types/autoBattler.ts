
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
  id: string; // e.g., 'FARM_CARD', 'BARRACKS_CARD_LVL1'
  name: string;
  buildingType: AutoBattlerBuildingType;
  cost: number; // Supplies cost
  // Add other card-specific properties like description, icon, etc.
}

export interface AutoBattlerBaseStructure {
  id: string; // Unique instance ID
  type: AutoBattlerBuildingType;
  hp?: number;
  maxHp?: number;
  x: number; // For fixed structures, this is world/path position
  y: number; // For fixed structures, this is world/path position
}

export interface AutoBattlerBuilding extends AutoBattlerBaseStructure {
  level: number;
  // For grid buildings, x and y are grid cell indices (col, row)
  gridX: number;
  gridY: number;
  // Production/buffing state if applicable
}

export interface AutoBattlerUnit {
  id: string; // Unique instance ID
  type: string; // e.g., 'SOLDIER', 'ARCHER', 'BUILDER'
  hp: number;
  maxHp: number;
  damage: number;
  attackSpeed: number;
  x: number; // Position on the battle path
  y: number;
  targetId?: string | null;
  isPlayerUnit: boolean;
  // Other unit stats/state
}

export interface AutoBattlerEnemyTower extends AutoBattlerBaseStructure {
  type: AutoBattlerBuildingType.ENEMY_TOWER; // Ensure type consistency
  // Specific tower properties like attack range, damage
}

export interface AutoBattlerDefense extends AutoBattlerBaseStructure {
   type: AutoBattlerBuildingType.BALLISTA;
  // Ballista specific properties
}

export interface AutoBattlerState {
  isActive: boolean;
  supplies: number;
  grid: (AutoBattlerBuilding | null)[][]; // Represents the 10x6 player grid
  playerUnits: AutoBattlerUnit[];
  builderUnits: AutoBattlerUnit[]; // Specifically builder units
  playerDefenses: AutoBattlerDefense[]; // Ballistas built by player
  
  enemyUnits: AutoBattlerUnit[];
  enemyTowers: AutoBattlerEnemyTower[];
  enemyBase: AutoBattlerBaseStructure & { hp: number; maxHp: number };
  
  enemySpawnRateModifier: number; // Starts at 1.0, increases with tower destruction

  // Card system state
  deck: AutoBattlerBuildingCard[];
  hand: AutoBattlerBuildingCard[];
  discard: AutoBattlerBuildingCard[];

  // UI or game flow state
  currentPhase: 'SETUP' | 'COMBAT' | 'ENDED';
  gameTime: number; // In ticks or ms
}

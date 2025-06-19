

export interface PlayerActiveRunBuff {
  definitionId: string;
  stacks: number;
}

export interface DungeonRunState {
  dungeonDefinitionId: string;
  currentFloorIndex: number;
  heroStatesAtFloorStart: Record<string, { // Keyed by heroDefinitionId
    level: number;                      // Added
    currentExp: number;                 // Added
    expToNextLevel: number;             // Added
    skillPoints: number;                // Added
    currentHp: number;
    currentMana: number;
    maxHp: number; 
    maxMana: number; 
    specialAttackCooldownsRemaining: Record<string, number> 
  }>;
  survivingHeroIds: string[]; // To track who is still up
  runXP: number;
  runLevel: number;
  expToNextRunLevel: number;
  activeRunBuffs: PlayerActiveRunBuff[];
  offeredBuffChoices: string[] | null; // Array of RunBuffDefinition IDs
}
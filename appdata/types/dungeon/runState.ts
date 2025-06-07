export interface PlayerActiveRunBuff {
  definitionId: string;
  stacks: number;
}

export interface DungeonRunState {
  dungeonDefinitionId: string;
  currentFloorIndex: number;
  heroStatesAtFloorStart: Record<string, { // Keyed by heroDefinitionId
    currentHp: number;
    currentMana: number;
    maxHp: number; // Store max for the floor start, in case buffs change it mid-floor
    maxMana: number; // Store max for the floor start
    specialAttackCooldownsRemaining: Record<string, number> // Keyed by specialAttackId
  }>;
  survivingHeroIds: string[]; // To track who is still up
  runXP: number;
  runLevel: number;
  expToNextRunLevel: number;
  activeRunBuffs: PlayerActiveRunBuff[];
  offeredBuffChoices: string[] | null; // Array of RunBuffDefinition IDs
}

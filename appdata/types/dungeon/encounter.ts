export interface DungeonEncounterDefinition {
  id: string;
  name: string;
  description?: string;
  enemies: Array<{ enemyId: string; count: number; position?: 'FRONT' | 'BACK' | 'ANY' }>;
  weight: number; // For random selection probability
  isElite?: boolean;
}

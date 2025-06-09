
import { ICONS } from '../components/Icons';
import { ResourceType } from './enums';

export interface MapNode {
  id: string;
  name: string;
  x: number; // Percentage from left (0-100)
  y: number; // Percentage from top (0-100)
  iconName: keyof typeof ICONS;
  description?: string;
  connections: string[]; // Array of connected node IDs
  isBattleNode?: boolean; // True if this node triggers standard waves
  battleWaveStart?: number;
  battleWaveEnd?: number;
  customWaveDefinitionIds?: string[]; 
  poiType?: 'DUNGEON' | 'RESOURCE' | 'EVENT' | 'MAP_PORTAL' | 'CLERIC_RESCUE_EVENT'; // Added CLERIC_RESCUE_EVENT
  cleric_rescue_battle_node_id?: string; // Optional: ID of the battle node for cleric rescue
  targetMapId?: string; 
  targetNodeId?: string; 
  resourceType?: ResourceType; 
  resourceAmount?: number;  
  grantsShardId?: string; 
  grantsShardLevel?: number; 
}

// WorldMapDefinition was moved to types/dungeon/definition.ts

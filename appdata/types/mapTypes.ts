
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
  customWaveDefinitionIds?: string[]; // New: Array of WaveDefinition IDs for custom sequences
  poiType?: 'DUNGEON' | 'RESOURCE' | 'EVENT' | 'MAP_PORTAL';
  targetMapId?: string; // For MAP_PORTAL nodes
  targetNodeId?: string; // For MAP_PORTAL nodes, specifies the entry node ID on the target map
  resourceType?: ResourceType; // For RESOURCE nodes
  resourceAmount?: number;  // For RESOURCE nodes
}

// WorldMapDefinition was moved to types/dungeon/definition.ts
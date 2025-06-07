
import { MapNode, WorldMapDefinition, ResourceType } from '../../types';

const burningDesertNodes: MapNode[] = [
  {
    id: 'oasis_entry',
    name: 'Desert Oasis',
    x: 20,
    y: 70,
    iconName: 'FOOD', // Placeholder for oasis
    description: 'A life-giving oasis in the harsh desert.',
    connections: ['scorpion_nest', 'portal_to_plains_desert'],
  },
  {
    id: 'scorpion_nest',
    name: 'Scorpion Nest',
    x: 50,
    y: 30,
    iconName: 'ENEMY',
    description: 'A den teeming with giant scorpions.',
    connections: ['oasis_entry', 'ancient_ruins_desert'],
    isBattleNode: true,
    battleWaveStart: 11,
    battleWaveEnd: 14,
  },
  {
    id: 'ancient_ruins_desert',
    name: 'Ancient Desert Ruins',
    x: 80,
    y: 50,
    iconName: 'STONE',
    description: 'Sun-bleached ruins, half-buried in sand.',
    connections: ['scorpion_nest'],
    poiType: 'DUNGEON',
  },
  {
    id: 'portal_to_plains_desert',
    name: 'Trail to the Plains',
    x: 10,
    y: 20,
    iconName: 'COMPASS',
    description: 'A faint trail leads back to the Verdant Plains.',
    connections: ['oasis_entry'],
    poiType: 'MAP_PORTAL',
    targetMapId: 'verdant_plains', // Connects to 'portal_to_desert' on verdant_plains
  },
];

export const BURNING_DESERT_MAP: WorldMapDefinition = {
  id: 'burning_desert',
  name: 'The Burning Desert',
  description: 'A vast, scorching desert with hidden dangers and ancient secrets.',
  nodes: burningDesertNodes,
  entryNodeId: 'oasis_entry',
};

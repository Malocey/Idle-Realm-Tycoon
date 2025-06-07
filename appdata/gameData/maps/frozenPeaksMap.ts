
import { MapNode, WorldMapDefinition, ResourceType } from '../../types';

const frozenPeaksNodes: MapNode[] = [
  {
    id: 'mountain_pass_entry',
    name: 'Icy Mountain Pass',
    x: 50,
    y: 80,
    iconName: 'STONE', // Placeholder for mountain pass
    description: 'A treacherous, ice-covered mountain pass.',
    connections: ['ice_cave_wolves', 'portal_to_woods_peaks'],
  },
  {
    id: 'ice_cave_wolves',
    name: 'Ice Cave',
    x: 30,
    y: 40,
    iconName: 'ENEMY',
    description: 'A glittering ice cave, home to frost wolves.',
    connections: ['mountain_pass_entry', 'summit_shrine'],
    isBattleNode: true,
    battleWaveStart: 6,
    battleWaveEnd: 9,
  },
  {
    id: 'summit_shrine',
    name: 'Summit Shrine',
    x: 70,
    y: 20,
    iconName: 'SETTINGS',
    description: 'A wind-blasted shrine at the mountain\'s peak.',
    connections: ['ice_cave_wolves'],
    poiType: 'EVENT',
  },
  {
    id: 'portal_to_woods_peaks',
    name: 'Descent to the Woods',
    x: 80,
    y: 70,
    iconName: 'COMPASS',
    description: 'A path leading down from the peaks to the Whispering Woods.',
    connections: ['mountain_pass_entry'],
    poiType: 'MAP_PORTAL',
    targetMapId: 'whispering_woods', // Connects to 'portal_to_peaks' on whispering_woods
  },
];

export const FROZEN_PEAKS_MAP: WorldMapDefinition = {
  id: 'frozen_peaks',
  name: 'Frozen Peaks',
  description: 'High, icy mountains where only the hardiest creatures survive.',
  nodes: frozenPeaksNodes,
  entryNodeId: 'mountain_pass_entry',
};

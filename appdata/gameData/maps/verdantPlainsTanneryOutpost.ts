
import { MapNode, WorldMapDefinition, ResourceType } from '../../types';

const verdantPlainsTanneryOutpostNodes: MapNode[] = [
  {
    id: 'tannery_outpost_entry',
    name: 'Path to Tannery Outpost',
    x: 50,
    y: 90,
    iconName: 'ARROW_DOWN',
    description: 'The path leading back to the Verdant Plains.',
    connections: ['tannery_outpost_path_1'],
    poiType: 'MAP_PORTAL',
    targetMapId: 'verdant_plains',
    targetNodeId: 'tannery_guardians', // This is the portal node on verdant_plains
  },
  {
    id: 'tannery_outpost_path_1',
    name: 'Overgrown Path',
    x: 50,
    y: 60,
    iconName: 'COMPASS',
    description: 'A barely visible path leading to a secluded outpost.',
    connections: ['tannery_outpost_entry', 'tannery_blueprint_battle'],
  },
  {
    id: 'tannery_blueprint_battle',
    name: 'Outpost Guardians',
    x: 50,
    y: 30,
    iconName: 'FIGHT',
    description: 'Fierce creatures guard the secrets of leatherworking. Defeat them to obtain the Tannery Blueprint.',
    connections: ['tannery_outpost_path_1'],
    isBattleNode: true,
    customWaveDefinitionIds: ['map_tannery_blueprint_wave_1', 'map_tannery_blueprint_wave_2', 'map_tannery_blueprint_wave_3'], // Wave difficulty 5-7
  },
];

export const VERDANT_PLAINS_TANNERY_OUTPOST_MAP: WorldMapDefinition = {
  id: 'verdant_plains_tannery_outpost_map',
  name: 'Tannery Outpost',
  description: 'A secluded outpost where the art of leatherworking is practiced.',
  nodes: verdantPlainsTanneryOutpostNodes,
  entryNodeId: 'tannery_outpost_entry',
};

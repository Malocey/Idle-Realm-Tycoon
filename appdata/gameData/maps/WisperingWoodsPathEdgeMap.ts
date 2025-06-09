
import { MapNode, WorldMapDefinition, ResourceType } from '../../types';

const wisperingWoodsPathEdgeNodes: MapNode[] = [
  {
    id: 'ww_edge_entry',
    name: 'Path from Plains',
    x: 50,
    y: 90,
    iconName: 'ARROW_DOWN',
    description: 'The path leading back to the Verdant Plains.',
    connections: ['ww_edge_path_1'],
    poiType: 'MAP_PORTAL',
    targetMapId: 'verdant_plains',
    targetNodeId: 'woods_entrance',
  },
  {
    id: 'ww_edge_path_1',
    name: 'Overgrown Trail',
    x: 50,
    y: 70,
    iconName: 'COMPASS',
    description: 'The air grows heavy, and the light dims.',
    connections: ['ww_edge_entry', 'ww_edge_battle_1', 'ww_edge_to_depths', 'ww_edge_loot_1'],
  },
  {
    id: 'ww_edge_battle_1',
    name: 'Forest Ambush',
    x: 30,
    y: 50,
    iconName: 'ENEMY',
    description: 'Creatures of the woods block your way!',
    connections: ['ww_edge_path_1'],
    isBattleNode: true,
    customWaveDefinitionIds: ['map_ww_edge_battle_1_wave_1', 'map_ww_edge_battle_1_wave_2'],
  },
  {
    id: 'ww_edge_loot_1',
    name: 'Herbalist\'s Cache',
    x: 70,
    y: 50,
    iconName: 'LOOT_BAG',
    description: 'A small stash of useful herbs.',
    connections: ['ww_edge_path_1'],
    poiType: 'RESOURCE',
    resourceType: ResourceType.HERB_BLOODTHISTLE,
    resourceAmount: 3,
  },
  {
    id: 'ww_edge_to_depths',
    name: 'Into the Depths',
    x: 50,
    y: 30,
    iconName: 'ARROW_UP',
    description: 'The path descends into the darker, deeper parts of the Whispering Woods.',
    connections: ['ww_edge_path_1'],
    poiType: 'MAP_PORTAL',
    targetMapId: 'whispering_woods_depths_map',
    targetNodeId: 'ww_depths_entry',
  },
];

export const WISPERING_WOODS_PATH_EDGE_MAP: WorldMapDefinition = {
  id: 'wispering_woods_path_edge_map',
  name: 'Whispering Woods - Edge',
  description: 'The outskirts of the eerie Whispering Woods.',
  nodes: wisperingWoodsPathEdgeNodes,
  entryNodeId: 'ww_edge_entry',
};

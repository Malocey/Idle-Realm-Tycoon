
import { MapNode, WorldMapDefinition, ResourceType } from '../../types';

const stoneQuarryExcavationNodes: MapNode[] = [
  {
    id: 'sqe_entry',
    name: 'Quarry Excavation Entrance',
    x: 50,
    y: 10,
    iconName: 'ARROW_DOWN', // Icon indicating entry/exit
    description: 'The path leading back to the quarry approach.',
    connections: ['sqe_path_1'],
    poiType: 'MAP_PORTAL',
    targetMapId: 'verdant_plains',
    targetNodeId: 'stone_quarry_guards',
  },
  {
    id: 'sqe_path_1',
    name: 'Rocky Path',
    x: 50,
    y: 30,
    iconName: 'COMPASS',
    description: 'A path littered with loose stones.',
    connections: ['sqe_entry', 'sqe_battle_1', 'sqe_geode_discovery'],
  },
  {
    id: 'sqe_battle_1',
    name: 'Stone Golem Sentry',
    x: 70,
    y: 50,
    iconName: 'ENEMY',
    description: 'A formidable Stone Golem guards this area.',
    connections: ['sqe_path_1'],
    isBattleNode: true,
    customWaveDefinitionIds: ['map_stone_quarry_golem_wave_1', 'map_stone_quarry_golem_wave_2'],
  },
  {
    id: 'sqe_geode_discovery',
    name: 'Large Geode',
    x: 30,
    y: 50,
    iconName: 'CRYSTALS', // Or a specific Geode icon if available
    description: 'A massive geode, cracked open to reveal valuable shards.',
    connections: ['sqe_path_1', 'sqe_unstable_tunnel'],
    poiType: 'RESOURCE', 
    grantsShardId: 'DEFENSE_SHARD_BASIC',
    grantsShardLevel: 1,
  },
  {
    id: 'sqe_unstable_tunnel',
    name: 'Unstable Tunnel',
    x: 30,
    y: 70,
    iconName: 'STONE',
    description: 'This tunnel looks too dangerous to explore further. Some loose stones might be valuable.',
    connections: ['sqe_geode_discovery'],
    poiType: 'RESOURCE',
    resourceType: ResourceType.STONE,
    resourceAmount: 50,
  },
];

export const STONE_QUARRY_EXCAVATION_MAP: WorldMapDefinition = {
  id: 'stone_quarry_excavation_map',
  name: 'Stone Quarry - Deep Excavation',
  description: 'Delving deeper into the stone quarry reveals new challenges.',
  nodes: stoneQuarryExcavationNodes,
  entryNodeId: 'sqe_entry',
};
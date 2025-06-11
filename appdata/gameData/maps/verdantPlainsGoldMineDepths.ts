
import { MapNode, WorldMapDefinition, ResourceType } from '../../types';

const goldMineDepthsNodes: MapNode[] = [
  {
    id: 'gmd_entry',
    name: 'Mine Entrance (Depths)',
    x: 50,
    y: 90,
    iconName: 'ARROW_UP', 
    description: 'The passage back to the upper mine area.',
    connections: ['gmd_tunnel_1'],
    poiType: 'MAP_PORTAL',
    targetMapId: 'verdant_plains',
    targetNodeId: 'damaged_gold_mine',
  },
  {
    id: 'gmd_tunnel_1',
    name: 'Dusty Tunnel',
    x: 50,
    y: 70,
    iconName: 'COMPASS',
    description: 'A narrow, dusty tunnel winds deeper.',
    connections: ['gmd_entry', 'gmd_battle_1', 'gmd_crystal_vein', 'gmd_blueprint_battle_approach'], // Added connection
  },
  {
    id: 'gmd_battle_1',
    name: 'Goblin Squatters',
    x: 30,
    y: 50,
    iconName: 'ENEMY',
    description: 'A group of Goblins have made a small camp here.',
    connections: ['gmd_tunnel_1'],
    isBattleNode: true,
    customWaveDefinitionIds: ['map_gold_mine_ambush_wave_1', 'map_gold_mine_ambush_wave_2'],
  },
  {
    id: 'gmd_crystal_vein',
    name: 'Glimmering Crystal Vein',
    x: 70,
    y: 50,
    iconName: 'CRYSTALS',
    description: 'A vein of shimmering crystals. Perhaps some shards can be found.',
    connections: ['gmd_tunnel_1', 'gmd_collapsed_passage'],
    poiType: 'RESOURCE',
    grantsShardId: 'ATTACK_SHARD_BASIC',
    grantsShardLevel: 1,
  },
  {
    id: 'gmd_blueprint_battle_approach', // New node to lead to blueprint battle
    name: 'Echoing Chamber',
    x: 50,
    y: 40,
    iconName: 'COMPASS',
    description: 'Faint clanking sounds echo from deeper within this chamber.',
    connections: ['gmd_tunnel_1', 'gmd_blueprint_battle'],
  },
  {
    id: 'gmd_blueprint_battle', // New Battle Node for Blueprint
    name: 'Mine Foremen',
    x: 50,
    y: 20,
    iconName: 'FIGHT',
    description: 'The ghostly foremen of this mine guard its original plans.',
    connections: ['gmd_blueprint_battle_approach'],
    isBattleNode: true,
    customWaveDefinitionIds: ['map_gold_mine_blueprint_wave_1', 'map_gold_mine_blueprint_wave_2'], // Waves difficulty 4-6
  },
  {
    id: 'gmd_collapsed_passage',
    name: 'Collapsed Passage',
    x: 70,
    y: 30,
    iconName: 'STONE',
    description: 'This passage has caved in. Nothing more to see here.',
    connections: ['gmd_crystal_vein'],
    poiType: 'RESOURCE',
    resourceType: ResourceType.GOLD, 
    resourceAmount: 25,
  },
];

export const GOLD_MINE_DEPTHS_MAP: WorldMapDefinition = {
  id: 'gold_mine_depths_map',
  name: 'Gold Mine - Deeper Depths',
  description: 'Further exploration into the abandoned gold mine.',
  nodes: goldMineDepthsNodes,
  entryNodeId: 'gmd_entry',
};

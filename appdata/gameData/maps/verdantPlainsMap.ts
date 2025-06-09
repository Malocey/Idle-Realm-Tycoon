
import { MapNode, WorldMapDefinition, ResourceType } from '../../types';

const verdantPlainsNodes: MapNode[] = [
  {
    id: 'hometown',
    name: 'Hometown',
    x: 10, 
    y: 50,
    iconName: 'BUILDING',
    description: 'Your starting point.',
    connections: ['goblin_camp_early'],
  },
  {
    id: 'goblin_camp_early',
    name: 'Early Goblin Camp',
    x: 25,
    y: 50,
    iconName: 'ENEMY',
    description: 'A small goblin encampment blocking the path forward.',
    connections: ['hometown', 'wood_clearing'],
    isBattleNode: true,
    customWaveDefinitionIds: [
      'map_goblin_camp_wave_1', 
      'map_goblin_camp_wave_2', 
      'map_goblin_camp_wave_3', 
      'map_goblin_camp_wave_4'
    ],
  },
  {
    id: 'wood_clearing',
    name: 'Wooded Clearing',
    x: 40,
    y: 50,
    iconName: 'WOOD',
    description: 'A small clearing with some harvestable wood. Resources found here may attract new allies.',
    connections: ['goblin_camp_early', 'lumber_mill_battle', 'farm_battle'],
    poiType: 'RESOURCE',
    resourceType: ResourceType.WOOD,
    resourceAmount: 10,
  },
  {
    id: 'lumber_mill_battle',
    name: 'Guardians of the Old Mill',
    x: 55,
    y: 35, 
    iconName: 'FIGHT',
    description: 'Defeat them to secure blueprints for a Lumber Mill.',
    connections: ['wood_clearing', 'gold_mine_access_battle'],
    isBattleNode: true,
    customWaveDefinitionIds: [
        'map_lumber_mill_wave_1',
        'map_lumber_mill_wave_2',
        'map_lumber_mill_wave_3',
        'map_lumber_mill_wave_4'
    ],
  },
  {
    id: 'farm_battle',
    name: 'Protectors of the Fertile Land',
    x: 55,
    y: 65, 
    iconName: 'FIGHT',
    description: 'Win this battle to find plans for a Farm.',
    connections: ['wood_clearing', 'gold_mine_access_battle'],
    isBattleNode: true,
    customWaveDefinitionIds: [
        'map_farm_battle_wave_1',
        'map_farm_battle_wave_2',
        'map_farm_battle_wave_3'
    ],
  },
  {
    id: 'gold_mine_access_battle',
    name: 'Gold Mine Approach',
    x: 70,
    y: 50, 
    iconName: 'FIGHT',
    description: 'A final challenge before reaching the gold-rich mountains.',
    connections: ['lumber_mill_battle', 'farm_battle', 'damaged_gold_mine'], 
    isBattleNode: true,
    battleWaveStart: 3, 
    battleWaveEnd: 4,
  },
  {
    id: 'damaged_gold_mine',
    name: 'Damaged Gold Mine',
    x: 85,
    y: 50,
    iconName: 'PICKAXE_ICON',
    description: 'An old gold mine. A passage seems to lead deeper within.',
    connections: ['gold_mine_access_battle', 'woods_entrance', 'quarry_approach'],
    poiType: 'MAP_PORTAL', 
    targetMapId: 'gold_mine_depths_map',
    targetNodeId: 'gmd_entry',
  },
  {
    id: 'woods_entrance',
    name: 'Whispering Woods Path', 
    x: 80, 
    y: 25, 
    iconName: 'PORTAL', // Change icon to portal
    description: 'A winding path leading into the shadowy Whispering Woods.',
    connections: ['damaged_gold_mine', 'tannery_guardians'],
    poiType: 'MAP_PORTAL', // Make this a portal to the new map series
    targetMapId: 'wispering_woods_path_edge_map', // New map
    targetNodeId: 'ww_edge_entry', // Entry node of the new map
  },
  {
    id: 'tannery_guardians',
    name: 'Tannery Guardians',
    x: 70,
    y: 10,
    iconName: 'FIGHT',
    description: 'Fierce creatures guard a hidden path. Defeat them to find plans for a Tannery.',
    connections: ['woods_entrance', 'deep_woods_encounter'],
    isBattleNode: true,
    battleWaveStart: 3,
    battleWaveEnd: 5,
  },
  {
    id: 'deep_woods_encounter', // This remains the portal to the OLD whispering woods
    name: 'Gateway to the Old Whispering Woods', 
    x: 55,
    y: 10,
    iconName: 'PORTAL', 
    description: 'An ancient archway hums with power, leading to the old Whispering Woods.',
    connections: ['tannery_guardians'],
    poiType: 'MAP_PORTAL',
    targetMapId: 'whispering_woods', // Original target
    targetNodeId: 'ww_node_1', // Original target node
    isBattleNode: false, 
  },
  {
    id: 'quarry_approach',
    name: 'Quarry Approach',
    x: 80,
    y: 75, 
    iconName: 'STONE', 
    description: 'A rocky path leading towards a potential stone quarry.',
    connections: ['damaged_gold_mine', 'stone_quarry_guards'],
  },
  {
    id: 'stone_quarry_guards',
    name: 'Stone Quarry Entrance', 
    x: 70,
    y: 90,
    iconName: 'PORTAL', 
    description: 'The entrance to a deeper section of the stone quarry. What lies within?',
    connections: ['quarry_approach'],
    poiType: 'MAP_PORTAL', 
    targetMapId: 'stone_quarry_excavation_map',
    targetNodeId: 'sqe_entry',
    isBattleNode: false, 
  },
];

export const VERDANT_PLAINS_MAP: WorldMapDefinition = {
  id: 'verdant_plains',
  name: 'The Verdant Plains',
  description: 'A vast expanse of green fields and scattered copses, charting your first steps into adventure.',
  nodes: verdantPlainsNodes,
  entryNodeId: 'hometown',
};

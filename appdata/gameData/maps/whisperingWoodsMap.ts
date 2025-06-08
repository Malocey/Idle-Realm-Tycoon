
import { MapNode, WorldMapDefinition, ResourceType } from '../../types';

const whisperingWoodsNodes: MapNode[] = [
  {
    id: 'ww_node_1',
    name: 'Forest Edge',
    x: 10,
    y: 80,
    iconName: 'WOOD',
    description: 'The edge of a dense, ancient forest.',
    connections: ['ww_node_2', 'ww_portal_to_plains'],
  },
  {
    id: 'ww_node_2',
    name: 'Winding Trail',
    x: 30,
    y: 75,
    iconName: 'COMPASS',
    description: 'A barely visible trail winds deeper into the woods.',
    connections: ['ww_node_1', 'ww_node_3', 'ww_node_4'],
  },
  {
    id: 'ww_node_3',
    name: 'Old Clearing',
    x: 30,
    y: 55,
    iconName: 'ENEMY',
    description: 'An old clearing, now home to territorial beasts.',
    connections: ['ww_node_2', 'ww_node_6'],
    isBattleNode: true,
    battleWaveStart: 4, 
    battleWaveEnd: 5,
  },
  {
    id: 'ww_node_4',
    name: 'Murmuring Crossroads',
    x: 50,
    y: 60,
    iconName: 'COMPASS',
    description: 'Several paths diverge here, faint whispers echo through the trees.',
    connections: ['ww_node_2', 'ww_node_5', 'ww_node_7', 'ww_node_8', 'ww_node_9'],
  },
  {
    id: 'ww_node_5',
    name: 'Mystic Spring',
    x: 50,
    y: 35,
    iconName: 'EVENT_ICON', // Changed from CRYSTALS for POI
    description: 'A spring surrounded by glowing flora. You feel a strange energy.',
    connections: ['ww_node_4'],
    poiType: 'EVENT', 
  },
  {
    id: 'ww_node_6',
    name: 'Abandoned Hunter\'s Camp',
    x: 10,
    y: 50,
    iconName: 'LOOT_BAG',
    description: 'A long-abandoned camp. Some supplies might still be salvageable.',
    connections: ['ww_node_3'],
    poiType: 'RESOURCE',
    resourceType: ResourceType.GOLD,
    resourceAmount: 75,
  },
  {
    id: 'ww_node_7',
    name: 'Dark Thicket',
    x: 60,
    y: 80,
    iconName: 'ENEMY',
    description: 'A dense and dark part of the forest, crawling with danger.',
    connections: ['ww_node_4', 'ww_node_9'],
    isBattleNode: true,
    battleWaveStart: 5,
    battleWaveEnd: 7,
  },
  {
    id: 'ww_node_8',
    name: 'Ancient Sentinels',
    x: 70,
    y: 35,
    iconName: 'WOOD',
    description: 'Giant, moss-covered trees stand like silent guardians.',
    connections: ['ww_node_4', 'ww_node_9'],
    poiType: 'EVENT', // Changed for POI
  },
  {
    id: 'ww_node_9',
    name: 'Sunken Pathway',
    x: 75,
    y: 60,
    iconName: 'COMPASS',
    description: 'A path that seems to lead into the very heart of the woods.',
    connections: ['ww_node_4', 'ww_node_7', 'ww_node_8', 'ww_node_10'],
  },
  {
    id: 'ww_node_10',
    name: 'Forgotten Shrine',
    x: 90,
    y: 75,
    iconName: 'SETTINGS',
    description: 'A dilapidated shrine, pulsing with faint magical energy.',
    connections: ['ww_node_9'],
    poiType: 'EVENT', 
  },
  {
    id: 'ww_portal_to_plains',
    name: 'Path to Verdant Plains',
    x: 10,
    y: 90, // Adjusted slightly to be distinct from node 1
    iconName: 'ARROW_ICON', // Changed for portal
    description: 'A worn path leading back to the open plains.',
    connections: ['ww_node_1'],
    poiType: 'MAP_PORTAL',
    targetMapId: 'verdant_plains',
    targetNodeId: 'deep_woods_encounter', // Node on Verdant Plains this portal leads to
  },
];

export const WHISPERING_WOODS_MAP: WorldMapDefinition = {
  id: 'whispering_woods',
  name: 'Whispering Woods',
  description: 'An ancient forest, rumored to hold many secrets and dangers.',
  nodes: whisperingWoodsNodes,
  entryNodeId: 'ww_node_1', // Player enters at Forest Edge
};

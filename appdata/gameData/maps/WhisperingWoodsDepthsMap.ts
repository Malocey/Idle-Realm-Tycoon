
import { MapNode, WorldMapDefinition, ResourceType } from '../../types';

const whisperingWoodsDepthsNodes: MapNode[] = [
  {
    id: 'ww_depths_entry',
    name: 'Edge of the Depths',
    x: 50,
    y: 90,
    iconName: 'ARROW_DOWN',
    description: 'The path back to the woods\' edge.',
    connections: ['ww_depths_path_1'],
    poiType: 'MAP_PORTAL',
    targetMapId: 'wispering_woods_path_edge_map', 
    targetNodeId: 'ww_edge_to_depths',
  },
  {
    id: 'ww_depths_path_1',
    name: 'Shadowed Grove',
    x: 50,
    y: 70,
    iconName: 'COMPASS',
    description: 'Ancient trees loom, and shadows dance.',
    connections: ['ww_depths_entry', 'ww_depths_battle_1', 'ww_cleric_rescue_poi'],
  },
  {
    id: 'ww_depths_battle_1',
    name: 'Deeper Threats',
    x: 30,
    y: 50,
    iconName: 'ENEMY',
    description: 'More formidable denizens of the deep woods.',
    connections: ['ww_depths_path_1'],
    isBattleNode: true,
    customWaveDefinitionIds: ['map_ww_depths_battle_1_wave_1', 'map_ww_depths_battle_1_wave_2'],
  },
  {
    id: 'ww_cleric_rescue_poi',
    name: 'Cleric in Peril',
    x: 70,
    y: 50,
    iconName: 'EVENT_ICON', // Placeholder for cleric/event icon
    description: 'You hear cries for help nearby!',
    connections: ['ww_depths_path_1', 'ww_depths_loot_cache', 'ww_cleric_rescue_battle_node'],
    poiType: 'CLERIC_RESCUE_EVENT',
    cleric_rescue_battle_node_id: 'ww_cleric_rescue_battle_node', // Link to the battle node
  },
  { // This node is only for the battle event, not directly traversable usually.
    id: 'ww_cleric_rescue_battle_node',
    name: 'Rescue Site',
    x: 70, 
    y: 40, // Position it slightly differently for clarity, but it's "part" of the POI
    iconName: 'FIGHT',
    description: 'A desperate fight to save the Cleric!',
    connections: [], // No normal connections, triggered by POI
    isBattleNode: true,
    // customWaveDefinitionIds are set by the POI interaction logic
  },
  {
    id: 'ww_depths_loot_cache',
    name: 'Ancient Cache',
    x: 70,
    y: 30,
    iconName: 'LOOT_BAG',
    description: 'A hidden cache, likely left by the Cleric or other adventurers.',
    connections: ['ww_cleric_rescue_poi'],
    poiType: 'RESOURCE',
    resourceType: ResourceType.CRYSTALS,
    resourceAmount: 25,
  },
];

export const WHISPERING_WOODS_DEPTHS_MAP: WorldMapDefinition = {
  id: 'whispering_woods_depths_map',
  name: 'Whispering Woods - Depths',
  description: 'The dark heart of the Whispering Woods.',
  nodes: whisperingWoodsDepthsNodes,
  entryNodeId: 'ww_depths_entry',
};

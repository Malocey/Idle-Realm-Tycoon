// appdata/gameData/maps/whisperingWoods/WisperingWoodsPathEdgeMap.ts
import { MapNode, WorldMapDefinition, ResourceType } from '../../../types'; // Pfad ggf. anpassen

const wisperingWoodsPathEdgeNodes: MapNode[] = [
  {
    id: 'ww_edge_entry',
    name: 'Path from Plains',
    x: 50,
    y: 90,
    iconName: 'ARROW_DOWN',
    description: 'The path leading back to the Verdant Plains.',
    connections: ['ww_edge_battle_1'],
    poiType: 'MAP_PORTAL',
    targetMapId: 'verdant_plains',
    targetNodeId: 'to_whispering_woods_portal',
  },
  {
    id: 'ww_edge_battle_1',
    name: 'Forest Vanguard',
    x: 50,
    y: 70,
    iconName: 'ENEMY',
    description: 'The outer guardians of the Whispering Woods path.',
    connections: ['ww_edge_entry', 'ww_edge_path_choice_1'], // Verbindet nun zum Auswahlknoten
    isBattleNode: true,
    customWaveDefinitionIds: ['map_ww_edge_battle_1_wave_1', 'map_ww_edge_battle_1_wave_2'],
  },
  {
    id: 'ww_edge_path_choice_1', // Neuer Auswahlknoten
    name: 'Path Division',
    x: 50,
    y: 50,
    iconName: 'COMPASS',
    description: 'The path splits. One way continues deeper, the other leads to a secluded spot.',
    connections: ['ww_edge_battle_1', 'ww_edge_battle_2', 'ww_edge_optional_loot_1'],
    poiType: 'EVENT', // Damit es eine Interaktion geben kann, falls gewollt, sonst EMPTY
  },
  {
    id: 'ww_edge_optional_loot_1', // Neuer optionaler Loot-Knoten
    name: 'Hidden Stash',
    x: 30, 
    y: 50,
    iconName: 'LOOT_BAG',
    description: 'A small, hidden cache of supplies.',
    connections: ['ww_edge_path_choice_1'], // Führt zurück zum Auswahlknoten
    poiType: 'RESOURCE',
    resourceType: ResourceType.GOLD,
    resourceAmount: 75,
    // Optional: grantsShardId: 'DEFENSE_SHARD_BASIC', grantsShardLevel: 1,
  },
  {
    id: 'ww_edge_battle_2', 
    name: 'Path Blockade',
    x: 50, 
    y: 30, // Position angepasst für den Hauptpfad
    iconName: 'ENEMY',
    description: 'A tougher group of creatures block the deeper path.',
    connections: ['ww_edge_path_choice_1', 'ww_edge_to_depths'], // Verbindet vom Auswahlknoten
    isBattleNode: true,
    customWaveDefinitionIds: ['map_ww_edge_battle_2_wave_1', 'map_ww_edge_battle_2_wave_2'],
  },
  {
    id: 'ww_edge_to_depths',
    name: 'Into the Depths',
    x: 50,
    y: 10,
    iconName: 'ARROW_UP',
    description: 'The path descends into the darker, deeper parts of the Whispering Woods.',
    connections: ['ww_edge_battle_2'],
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

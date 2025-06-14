// appdata/gameData/maps/whisperingWoods/WhisperingWoodsDepthsMap.ts
import { MapNode, WorldMapDefinition, ResourceType } from '../../../types'; // Pfad ggf. anpassen

const whisperingWoodsDepthsNodes: MapNode[] = [
  {
    id: 'ww_depths_entry',
    name: 'Edge of the Depths',
    x: 50,
    y: 90,
    iconName: 'ARROW_DOWN',
    description: 'The path back to the woods\' edge.',
    connections: ['ww_depths_battle_1_actual'],
    poiType: 'MAP_PORTAL',
    targetMapId: 'wispering_woods_path_edge_map', 
    targetNodeId: 'ww_edge_to_depths',
  },
  {
    id: 'ww_depths_battle_1_actual',
    name: 'Grove Guardians',
    x: 50,
    y: 75, // Angepasste Position
    iconName: 'ENEMY',
    description: 'The first line of defense in the deeper woods.',
    connections: ['ww_depths_entry', 'ww_cleric_rescue_battle_node'],
    isBattleNode: true,
    customWaveDefinitionIds: ['map_ww_depths_path_turned_battle_wave_1', 'map_ww_depths_path_turned_battle_wave_2'],
  },
  {
    id: 'ww_cleric_rescue_battle_node',
    name: 'Rescue Site Confrontation',
    x: 50,
    y: 60, // Angepasste Position
    iconName: 'FIGHT',
    description: 'A desperate fight to save the Cleric!',
    connections: ['ww_depths_battle_1_actual', 'ww_depths_path_choice_1'], // Verbindet nun zum Auswahlknoten
    isBattleNode: true,
    customWaveDefinitionIds: ['map_ww_cleric_rescue_wave_1', 'map_ww_cleric_rescue_wave_2'],
  },
  {
    id: 'ww_depths_path_choice_1', // Neuer Auswahlknoten
    name: 'Fork in the Path',
    x: 50, 
    y: 45, // Position zwischen Kleriker-Kampf und Loot-Cache
    iconName: 'COMPASS',
    description: 'The main path continues, but a less trodden trail veers off.',
    connections: ['ww_cleric_rescue_battle_node', 'ww_depths_loot_cache', 'ww_depths_optional_battle_1'],
    poiType: 'EVENT',
  },
  {
    id: 'ww_depths_optional_battle_1', // Neuer optionaler Kampfknoten
    name: 'Hidden Grove Protector',
    x: 75, // Abseits des Hauptpfades
    y: 45,
    iconName: 'ENEMY',
    description: 'A formidable creature guards this secluded grove.',
    connections: ['ww_depths_path_choice_1', 'ww_depths_optional_poi_1'],
    isBattleNode: true,
    customWaveDefinitionIds: ['map_ww_depths_optional_battle_wave_1', 'map_ww_depths_optional_battle_wave_2'],
  },
  {
    id: 'ww_depths_optional_poi_1', // Neuer optionaler POI-Knoten
    name: 'Ancient Totem',
    x: 90, // Weiter auf dem optionalen Pfad
    y: 45,
    iconName: 'EVENT_ICON',
    description: 'A moss-covered totem pulses with faint energy. You found some rare herbs!',
    connections: ['ww_depths_optional_battle_1'], // Führt zurück zum optionalen Kampfknoten
    poiType: 'RESOURCE',
    resourceType: ResourceType.HERB_BLOODTHISTLE,
    resourceAmount: 2,
    // Optional: grantsShardId: 'HEALTH_SHARD_BASIC', grantsShardLevel: 1,
  },
  {
    id: 'ww_depths_loot_cache',
    name: 'Recovered Supplies',
    x: 50, 
    y: 30, // Nach dem Auswahlknoten auf dem Hauptpfad
    iconName: 'LOOT_BAG',
    description: 'Supplies recovered after the confrontation.',
    connections: ['ww_depths_path_choice_1', 'ww_depths_battle_2_actual'],
    poiType: 'RESOURCE',
    resourceType: ResourceType.CRYSTALS,
    resourceAmount: 25,
  },
  {
    id: 'ww_depths_battle_2_actual',
    name: 'Deepwood Sentinels',
    x: 50, 
    y: 15, // Weiter auf dem Hauptpfad
    iconName: 'ENEMY',
    description: 'The final guardians before the heartwood passage.',
    connections: ['ww_depths_loot_cache', 'ww_depths_to_main_woods'],
    isBattleNode: true,
    customWaveDefinitionIds: ['map_ww_depths_final_battle_wave_1', 'map_ww_depths_final_battle_wave_2'],
  },
  {
    id: 'ww_depths_to_main_woods',
    name: 'Venture into the Heartwood',
    x: 50,
    y: 0, // Am Ende des Pfades
    iconName: 'PORTAL',
    description: 'A shimmering passage leads to the core of the Whispering Woods.',
    connections: ['ww_depths_battle_2_actual'],
    poiType: 'MAP_PORTAL',
    targetMapId: 'whispering_woods',
    targetNodeId: 'ww_plains_entrance',
  },
];

export const WHISPERING_WOODS_DEPTHS_MAP: WorldMapDefinition = {
  id: 'whispering_woods_depths_map',
  name: 'Whispering Woods - Depths',
  description: 'The dark heart of the Whispering Woods.',
  nodes: whisperingWoodsDepthsNodes,
  entryNodeId: 'ww_depths_entry',
};

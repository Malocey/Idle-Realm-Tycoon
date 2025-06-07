
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
    battleWaveStart: 1,
    battleWaveEnd: 3,
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
    battleWaveStart: 1,
    battleWaveEnd: 4,
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
    battleWaveStart: 1,
    battleWaveEnd: 6,
  },
  {
    id: 'gold_mine_access_battle',
    name: 'Gold Mine Approach',
    x: 70,
    y: 50, 
    iconName: 'FIGHT',
    description: 'A final challenge before reaching the gold-rich mountains.',
    connections: ['lumber_mill_battle', 'farm_battle', 'damaged_gold_mine'], // Connects to the new Damaged Gold Mine node
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
    description: 'An old, seemingly depleted gold mine. Perhaps some resources can still be found, or it leads elsewhere...',
    connections: ['gold_mine_access_battle', 'woods_entrance', 'quarry_approach'],
    poiType: 'RESOURCE', // Placeholder, could be a landmark or trigger for gold mine minigame later
    resourceType: ResourceType.GOLD, // Placeholder resource
    resourceAmount: 50,
  },
  // --- New Forest Branch ---
  {
    id: 'woods_entrance',
    name: 'Whispering Woods Entrance',
    x: 80, 
    y: 25, // North-West from Damaged Gold Mine
    iconName: 'COMPASS', // Or a tree icon if exists
    description: 'A path leading into the shadowy Whispering Woods.',
    connections: ['damaged_gold_mine', 'tannery_guardians'],
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
    id: 'deep_woods_encounter',
    name: 'Deep Woods Encounter',
    x: 55,
    y: 10,
    iconName: 'ENEMY', // Or a more specific event/mystery icon
    description: 'A challenging encounter deep within the woods. Victory might attract a new ally.',
    connections: ['tannery_guardians'],
    isBattleNode: true, // This "event" is a tough fight
    battleWaveStart: 1, // Tougher than its position might suggest
    battleWaveEnd: 6,
  },
  // --- New Quarry Branch ---
  {
    id: 'quarry_approach',
    name: 'Quarry Approach',
    x: 80,
    y: 75, // South-West from Damaged Gold Mine
    iconName: 'STONE', // Or PICKAXE_ICON
    description: 'A rocky path leading towards a potential stone quarry.',
    connections: ['damaged_gold_mine', 'stone_quarry_guards'],
  },
  {
    id: 'stone_quarry_guards',
    name: 'Stone Quarry Guards',
    x: 70,
    y: 90,
    iconName: 'FIGHT',
    description: 'Golems or tough miners guard the entrance to the quarry. Secure plans for a Stone Quarry.',
    connections: ['quarry_approach'],
    isBattleNode: true,
    battleWaveStart: 2,
    battleWaveEnd: 4,
  },
];

export const VERDANT_PLAINS_MAP: WorldMapDefinition = {
  id: 'verdant_plains',
  name: 'The Verdant Plains',
  description: 'A vast expanse of green fields and scattered copses, charting your first steps into adventure.',
  nodes: verdantPlainsNodes,
  entryNodeId: 'hometown',
};

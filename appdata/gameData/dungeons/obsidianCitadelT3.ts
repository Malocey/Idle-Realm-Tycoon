
import { ResourceType, DungeonDefinition, DungeonEncounterDefinition } from '../../types';

export const OBSIDIAN_CITADEL_T3_DEFINITION: DungeonDefinition = {
    id: "OBSIDIAN_CITADEL_T3",
    name: "The Obsidian Citadel - Tier 3",
    description: "A towering fortress of dark rock, pulsating with immense power and guarded by formidable entities. Only the strongest may claim its secrets.",
    entryCost: [
        { resource: ResourceType.CATACOMB_KEY, amount: 3 },
        { resource: ResourceType.GOLD, amount: 1000 },
        { resource: ResourceType.AETHERIUM, amount: 5 }
    ],
    tier: 3,
    minExplorerGuildLevel: 5,
    floors: [
        {
            floorNumber: 1,
            floorName: "Outer Bastion",
            rows: 16, cols: 16,
            enemies: [
                { id: "T3F1_ORC_PATROL", name: "Orc Patrol", enemies: [{ enemyId: 'ORC_BRUTE', count: 2 }, { enemyId: 'GOBLIN', count: 3 }], weight: 10 },
                { id: "T3F1_SKELETAL_SENTINELS", name: "Skeletal Sentinels", enemies: [{ enemyId: 'SKELETON_WARRIOR', count: 2 }, { enemyId: 'SKELETON_ARCHER', count: 2 }], weight: 8 },
                { id: "T3F1_WOLF_PACK", name: "Dire Wolf Pack", enemies: [{ enemyId: 'DIRE_WOLF', count: 3 }], weight: 6 },
            ] as DungeonEncounterDefinition[],
            possibleTraps: [ { definitionId: 'SPIKE_TRAP_TIER1', weight: 10 }, { definitionId: 'POISON_GAS_TRAP_TIER1', weight: 7 } ],
            possibleEvents: [ { definitionId: 'HIDDEN_CACHE_TIER1', weight: 6 }, { definitionId: 'EERIE_SOUNDS_TIER1', weight: 5 } ]
        },
        {
            floorNumber: 2,
            floorName: "Shadowed Corridors",
            rows: 17, cols: 17,
            enemies: [
                { id: "T3F2_SPIDER_INFESTATION", name: "Spider Infestation", enemies: [{ enemyId: 'GIANT_SPIDER', count: 4 }, { enemyId: 'SKELETON_ARCHER', count: 2 }], weight: 10 },
                { id: "T3F2_CORPSEBLOOM_THICKET", name: "Corpsebloom Thicket", enemies: [{ enemyId: 'CORPSEBLOOM_SPROUT', count: 3 }, { enemyId: 'TREANT_SAPLING', count: 1 }], weight: 8 },
                { id: "T3F2_SHAMANISTIC_GUARDS", name: "Shamanistic Guards", enemies: [{ enemyId: 'GOBLIN_SHAMAN', count: 2 }, { enemyId: 'ORC_BRUTE', count: 1 }], weight: 7 },
            ] as DungeonEncounterDefinition[],
            possibleTraps: [ { definitionId: 'ALARM_TRAP_TIER1', weight: 8 }, { definitionId: 'RESOURCE_DRAIN_TRAP_TIER1', weight: 6 } ],
            possibleEvents: [ { definitionId: 'OLD_DIARY_TIER1', weight: 7 }, { definitionId: 'SHRINE_OF_EMPOWERMENT_T1', weight: 5 } ]
        },
        {
            floorNumber: 3,
            floorName: "Infernal Forge",
            rows: 18, cols: 18,
            enemies: [
                { id: "T3F3_FORGE_GUARDIANS", name: "Forge Guardians", enemies: [{ enemyId: 'ORC_RAVAGER', count: 1 }, { enemyId: 'CRYSTAL_GOLEM', count: 1, isElite: true }], weight: 10 },
                { id: "T3F3_ELITE_ORCS", name: "Elite Orc Squad", enemies: [{ enemyId: 'ORC_BRUTE', count: 2, isElite: true }, { enemyId: 'GOBLIN_SHAMAN', count: 1 }], weight: 8 },
                { id: "T3F3_DIRE_WOLF_ALPHA", name: "Dire Wolf Alpha Pack", enemies: [{ enemyId: 'DIRE_WOLF', count: 2, isElite: true }, { enemyId: 'DIRE_WOLF', count: 2 }], weight: 7 },
            ] as DungeonEncounterDefinition[],
            possibleTraps: [ { definitionId: 'SPIKE_TRAP_TIER2', weight: 9 }, { definitionId: 'POISON_GAS_TRAP_TIER2', weight: 6 } ],
            possibleEvents: [ { definitionId: 'FOUNTAIN_OF_CHOICE_T1', weight: 6 }, { definitionId: 'ANCIENT_ARMORY_T2', weight: 5 } ]
        },
        {
            floorNumber: 4,
            floorName: "Crystal Core",
            rows: 19, cols: 19,
            enemies: [
                { id: "T3F4_CRYSTAL_DEFENDERS", name: "Crystal Defenders", enemies: [{ enemyId: 'CRYSTAL_GOLEM', count: 2 }, { enemyId: 'SKELETON_ARCHER', count: 3, isElite: true }], weight: 10 },
                { id: "T3F4_ARCANE_SKELETONS", name: "Arcane Skeletons", enemies: [{ enemyId: 'SKELETON_WARRIOR', count: 3, isElite: true }, { enemyId: 'GOBLIN_SHAMAN', count: 2 }], weight: 8 },
                { id: "T3F4_TREANT_PROTECTORS", name: "Treant Protectors", enemies: [{ enemyId: 'TREANT_SAPLING', count: 2, isElite: true }, { enemyId: 'CORPSEBLOOM_SPROUT', count: 2 }], weight: 7 },
            ] as DungeonEncounterDefinition[],
            possibleTraps: [ { definitionId: 'MANA_DRAIN_TRAP_TIER2', weight: 8 }, { definitionId: 'ALARM_TRAP_TIER2', weight: 7 } ],
            possibleEvents: [ { definitionId: 'RESTFUL_SHRINE_T2', weight: 6 }, { definitionId: 'OLD_MAP_T2', weight: 5 } ]
        },
        {
            floorNumber: 5,
            floorName: "Chamber of Echoes",
            rows: 20, cols: 20,
            enemies: [
                { id: "T3F5_MIXED_ELITE_FORCES", name: "Mixed Elite Forces", enemies: [{ enemyId: 'ORC_RAVAGER', count: 1, isElite: true }, { enemyId: 'CRYSTAL_GOLEM', count: 1 }, { enemyId: 'GOBLIN_SHAMAN', count: 2, isElite: true }], weight: 10 },
                { id: "T3F5_GOBLIN_WARLORD_ECHO", name: "Goblin Warlord's Echo", enemies: [{ enemyId: 'BOSS_GOBLIN_WARLORD', count: 1 }, { enemyId: 'GOBLIN', count: 4 }], weight: 8 }, // Scaled Boss
                { id: "T3F5_SPIDER_QUEEN_NEST", name: "Spider Queen's Nest", enemies: [{ enemyId: 'GIANT_SPIDER', count: 3, isElite: true }, { enemyId: 'GIANT_SPIDER', count: 4 }], weight: 7 },
            ] as DungeonEncounterDefinition[],
            possibleTraps: [ { definitionId: 'COLLAPSING_CEILING_TRAP_TIER2', weight: 7 }, { definitionId: 'SPIKE_TRAP_TIER2', weight: 7 } ],
            possibleEvents: [ { definitionId: 'MYSTERIOUS_PEDESTAL_T2', weight: 6 }, { definitionId: 'EERIE_SOUNDS_TIER2', weight: 5 } ]
        },
        {
            floorNumber: 6,
            floorName: "Guardian's Peak",
            rows: 21, cols: 21,
            enemies: [
                { id: "T3F6_PEAK_GUARDIANS", name: "Peak Guardians", enemies: [{ enemyId: 'ELITE_GUARDIAN', count: 2 }, { enemyId: 'CRYSTAL_GOLEM', count: 1, isElite: true }], weight: 10 },
                { id: "T3F6_ORC_OVERLORD_LIEUTENANTS", name: "Orc Overlord's Lieutenants", enemies: [{ enemyId: 'ORC_RAVAGER', count: 2, isElite: true }, { enemyId: 'ORC_BRUTE', count: 2, isElite: true }], weight: 8 },
                { id: "T3F6_ANCIENT_TREANTS", name: "Ancient Treants", enemies: [{ enemyId: 'TREANT_SAPLING', count: 3, isElite: true }, {enemyId: 'CORPSEBLOOM_SPROUT', count: 3, isElite: true}], weight: 7 },
            ] as DungeonEncounterDefinition[],
            possibleTraps: [ { definitionId: 'MANA_DRAIN_TRAP_TIER2', weight: 8 }, { definitionId: 'COLLAPSING_CEILING_TRAP_TIER2', weight: 8 } ],
            possibleEvents: [ { definitionId: 'SHRINE_OF_GREATER_EMPOWERMENT_T2', weight: 7 } ]
        },
        {
            floorNumber: 7,
            floorName: "Throne of the Void",
            rows: 15, cols: 15, // Smaller arena for the final boss
            enemies: [
                { id: "T3F7_VOID_CHAMPIONS", name: "Void Champions", enemies: [{ enemyId: 'ELITE_GUARDIAN', count: 1 }, { enemyId: 'ORC_RAVAGER', count: 1, isElite: true }, { enemyId: 'CRYSTAL_GOLEM', count: 1, isElite: true }], weight: 10 },
                { id: "T3F7_STONE_TITAN_MINION", name: "Stone Titan's Herald", enemies: [{ enemyId: 'BOSS_STONE_TITAN', count: 1 }], weight: 0, isElite: false }, // Use non-elite flag if you want it as a direct scaled boss encounter. Otherwise make it elite.
                { id: "T3F7_DEMONIC_ASSASSINS", name: "Demonic Assassins", enemies: [{ enemyId: 'DIRE_WOLF', count: 3, isElite: true}, {enemyId: 'GOBLIN_SHAMAN', count: 2, isElite: true}], weight: 7},
            ] as DungeonEncounterDefinition[],
            possibleTraps: [], // Minimal traps on final floor
            possibleEvents: [ { definitionId: 'RESTFUL_SHRINE_T2', weight: 3 } ] // Rare chance for a final heal
        }
    ],
    finalReward: {
        resourceCache: [
            { resource: ResourceType.GOLD, amount: 2500 },
            { resource: ResourceType.CRYSTALS, amount: 150 },
            { resource: ResourceType.IRON, amount: 120 },
            { resource: ResourceType.AETHERIUM, amount: 2 },
            { resource: ResourceType.META_CURRENCY, amount: 1 },
            { resource: ResourceType.HEROIC_POINTS, amount: 1500 },
            { resource: ResourceType.CATACOMB_BLUEPRINT, amount: 2 }
        ],
        permanentBuffChoices: 3,
    },
    possiblePermanentBuffs: [
        { stat: 'damage', value: 5.0 },
        { stat: 'maxHp', value: 75 },
        { stat: 'defense', value: 4.0 },
        { stat: 'attackSpeed', value: 0.06 },
        { stat: 'critChance', value: 0.03 },
        { stat: 'critDamage', value: 0.30 },
        { stat: 'manaRegen', value: 0.5 },
        { stat: 'healPower', value: 2.0 },
        { stat: 'maxMana', value: 30},
        { stat: 'hpRegen', value: 2.0}
    ]
};
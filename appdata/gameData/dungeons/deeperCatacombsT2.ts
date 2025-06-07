
import { ResourceType, DungeonDefinition, DungeonEncounterDefinition } from '../../types';

export const DEEPER_CATACOMBS_T2_DEFINITION: DungeonDefinition = {
    id: "DEEPER_CATACOMBS_T2",
    name: "Deeper Catacombs - Tier 2",
    description: "The catacombs descend further, revealing more resilient foes and greater treasures.",
    entryCost: [{ resource: ResourceType.CATACOMB_KEY, amount: 2 }, { resource: ResourceType.GOLD, amount: 500 }],
    tier: 2,
    minExplorerGuildLevel: 3,
    floors: [
        {
            floorNumber: 1,
            floorName: "Sunken Halls",
            rows: 13, cols: 13,
            enemies: [
                { id: "T2F1_SKELETON_HORDE", name: "Skeleton Horde", enemies: [{ enemyId: 'SKELETON_WARRIOR', count: 2 }, { enemyId: 'SKELETON_ARCHER', count: 3 }], weight: 10 },
                { id: "T2F1_ORC_AMBUSH", name: "Orc Ambush", enemies: [{ enemyId: 'ORC_BRUTE', count: 1 }, { enemyId: 'GOBLIN_SHAMAN', count: 1 }], weight: 8 },
                { id: "T2F1_DIRE_WOLF_PACK", name: "Dire Wolf Pack", enemies: [{ enemyId: 'DIRE_WOLF', count: 2 }], weight: 6 },
                { id: "T2_ELITE_CHAMPION_SECRET", name: "Chamber Champion (Elite)", enemies: [{ enemyId: 'ELITE_GUARDIAN', count: 1 }, { enemyId: 'SKELETON_WARRIOR', count: 1 }], weight: 0, isElite: true },
            ] as DungeonEncounterDefinition[],
            possibleTraps: [ { definitionId: 'SPIKE_TRAP_TIER2', weight: 10 } ],
            possibleEvents: [ { definitionId: 'ANCIENT_ARMORY_T2', weight: 7 }, { definitionId: 'EERIE_SOUNDS_TIER2', weight: 5 } ]
        },
        {
            floorNumber: 2,
            floorName: "Forgotten Crypt",
            rows: 14, cols: 14,
            enemies: [
                { id: "T2F2_UNDEAD_PATROL", name: "Undead Patrol", enemies: [{ enemyId: 'SKELETON_WARRIOR', count: 3 }, { enemyId: 'GIANT_SPIDER', count: 2 }], weight: 10 },
                { id: "T2F2_ORC_RAVAGERS", name: "Orc Ravagers", enemies: [{ enemyId: 'ORC_RAVAGER', count: 1 }], weight: 7 },
                { id: "T2F2_CORPSEBLOOM_OVERGROWTH", name: "Corpsebloom Overgrowth", enemies: [{ enemyId: 'CORPSEBLOOM_SPROUT', count: 3 }, {enemyId: 'TREANT_SAPLING', count: 1}], weight: 6 },
                { id: "T2_ELITE_CHAMPION_SECRET", name: "Chamber Champion (Elite)", enemies: [{ enemyId: 'ELITE_GUARDIAN', count: 1 }, { enemyId: 'SKELETON_WARRIOR', count: 1 }], weight: 0, isElite: true },
            ] as DungeonEncounterDefinition[],
            possibleTraps: [ { definitionId: 'POISON_GAS_TRAP_TIER2', weight: 8 }, { definitionId: 'ALARM_TRAP_TIER2', weight: 5 } ],
            possibleEvents: [ { definitionId: 'RESTFUL_SHRINE_T2', weight: 6 }, { definitionId: 'OLD_MAP_T2', weight: 6 } ]
        },
        {
            floorNumber: 3,
            floorName: "Chamber of Trials",
            rows: 15, cols: 15,
            enemies: [
                { id: "T2F3_ELITE_ORC_PACK", name: "Elite Orc Pack", enemies: [{ enemyId: 'ORC_BRUTE', count: 1, isElite: true }, { enemyId: 'GOBLIN_SHAMAN', count: 2 }], weight: 10 },
                { id: "T2F3_TREANT_GROVE", name: "Treant Grove", enemies: [{ enemyId: 'TREANT_SAPLING', count: 3 }], weight: 8 },
                { id: "T2F3_CRYSTAL_GUARDIANS", name: "Crystal Guardians", enemies: [{ enemyId: 'CRYSTAL_GOLEM', count: 1 }], weight: 5, isElite: true },
                { id: "T2_ELITE_CHAMPION_SECRET", name: "Chamber Champion (Elite)", enemies: [{ enemyId: 'ELITE_GUARDIAN', count: 1 }, { enemyId: 'SKELETON_WARRIOR', count: 1 }], weight: 0, isElite: true },
            ] as DungeonEncounterDefinition[],
            possibleTraps: [ { definitionId: 'COLLAPSING_CEILING_TRAP_TIER2', weight: 7 } ],
            possibleEvents: [ { definitionId: 'MYSTERIOUS_PEDESTAL_T2', weight: 7 }, { definitionId: 'EERIE_SOUNDS_TIER2', weight: 4 }]
        },
        {
            floorNumber: 4,
            floorName: "The Gauntlet",
            rows: 15, cols: 15, // Can keep it same as previous or make it different
            enemies: [
                { id: "T2F4_MIXED_HORDE", name: "Mixed Horde", enemies: [{ enemyId: 'ORC_RAVAGER', count: 1 }, { enemyId: 'DIRE_WOLF', count: 2 }, { enemyId: 'SKELETON_ARCHER', count: 2 }], weight: 10 },
                { id: "T2F4_SHAMANISTIC_DEFENSE", name: "Shamanistic Defense", enemies: [{ enemyId: 'GOBLIN_SHAMAN', count: 2 }, { enemyId: 'ORC_BRUTE', count: 1 }], weight: 8 },
                { id: "T2F4_ELITE_SKELETAL_COMMANDER", name: "Elite Skeletal Commander", enemies: [{ enemyId: 'SKELETON_WARRIOR', count: 1, isElite: true }, { enemyId: 'SKELETON_ARCHER', count: 3 }], weight: 6 },
                { id: "T2_ELITE_CHAMPION_SECRET", name: "Chamber Champion (Elite)", enemies: [{ enemyId: 'ELITE_GUARDIAN', count: 1 }, { enemyId: 'SKELETON_WARRIOR', count: 1 }], weight: 0, isElite: true },
            ] as DungeonEncounterDefinition[],
            possibleTraps: [ { definitionId: 'MANA_DRAIN_TRAP_TIER2', weight: 6 }, { definitionId: 'SPIKE_TRAP_TIER2', weight: 6 } ],
            possibleEvents: [ { definitionId: 'SHRINE_OF_GREATER_EMPOWERMENT_T2', weight: 5 } ]
        },
        {
            floorNumber: 5,
            floorName: "Sanctum of the Lost",
            // Uses default 12x12 grid size
            enemies: [
                { id: "T2F5_SANCTUM_GUARDIANS", name: "Sanctum Guardians (Elite)", enemies: [{ enemyId: 'ELITE_GUARDIAN', count: 1 }, { enemyId: 'CRYSTAL_GOLEM', count: 1}, { enemyId: 'GOBLIN_SHAMAN', count: 1 }], weight: 10, isElite: true },
                { id: "T2F5_FINAL_STAND", name: "Final Stand", enemies: [{ enemyId: 'ORC_RAVAGER', count: 2 }, { enemyId: 'SKELETON_WARRIOR', count: 2 }, {enemyId: 'DIRE_WOLF', count: 1}], weight: 8 },
            ] as DungeonEncounterDefinition[],
            possibleTraps: [ { definitionId: 'COLLAPSING_CEILING_TRAP_TIER2', weight: 8 }],
            possibleEvents: [ { definitionId: 'RESTFUL_SHRINE_T2', weight: 5 }]
        },
    ],
    finalReward: {
        resourceCache: [
            { resource: ResourceType.GOLD, amount: 1200 },
            { resource: ResourceType.IRON, amount: 75 },
            { resource: ResourceType.CRYSTALS, amount: 50 },
            { resource: ResourceType.HEROIC_POINTS, amount: 750 },
            { resource: ResourceType.LEATHER, amount: 40 },
            { resource: ResourceType.CATACOMB_BLUEPRINT, amount: 1 },
            { resource: ResourceType.HERB_BLOODTHISTLE, amount: 3 },
            { resource: ResourceType.HERB_IRONWOOD_LEAF, amount: 3 }
        ],
        permanentBuffChoices: 3,
    },
    possiblePermanentBuffs: [
        { stat: 'damage', value: 4.0 },
        { stat: 'maxHp', value: 50 },
        { stat: 'defense', value: 3.0 },
        { stat: 'attackSpeed', value: 0.05 },
        { stat: 'critChance', value: 0.025 },
        { stat: 'critDamage', value: 0.25 },
        { stat: 'manaRegen', value: 0.25 },
        { stat: 'healPower', value: 1.0 },
        { stat: 'maxMana', value: 20},
        { stat: 'hpRegen', value: 1.0}
    ]
};
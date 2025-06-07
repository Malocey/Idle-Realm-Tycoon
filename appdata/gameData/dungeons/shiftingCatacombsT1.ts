
import { ResourceType, DungeonDefinition, DungeonEncounterDefinition } from '../../types';

export const SHIFTING_CATACOMBS_T1_DEFINITION: DungeonDefinition = {
    id: "SHIFTING_CATACOMBS_T1",
    name: "Shifting Catacombs - Tier 1",
    description: "A mysterious set of passages beneath the old ruins. Rumored to hold ancient powers.",
    entryCost: [{ resource: ResourceType.CATACOMB_KEY, amount: 1 }],
    tier: 1,
    minExplorerGuildLevel: 1,
    floors: [
        {
            floorNumber: 1,
            floorName: "Outer Chambers",
            rows: 10, // Example: Smaller grid for first floor
            cols: 10,
            enemies: [
                { id: "T1F1_GOBLIN_AMBUSH_V2", name: "Goblin Ambush", enemies: [{ enemyId: 'GOBLIN', count: 2 }, { enemyId: 'SKELETON_WARRIOR', count: 1 }, { enemyId: 'SKELETON_ARCHER', count: 1 }], weight: 10 },
                { id: "T1F1_SPIDER_NEST", name: "Spider Nest", enemies: [{ enemyId: 'GIANT_SPIDER', count: 2 }], weight: 7 },
                { id: "T1F1_LONE_SKELETON", name: "Lone Skeleton", enemies: [{ enemyId: 'SKELETON_WARRIOR', count: 1 }], weight: 5 },
                { id: "T1_ELITE_GUARDIAN_SECRET", name: "Treasure Guardian (Elite)", enemies: [{ enemyId: 'ELITE_GUARDIAN', count: 1 }], weight: 0, isElite: true },
            ] as DungeonEncounterDefinition[],
            possibleTraps: [
                { definitionId: 'SPIKE_TRAP_TIER1', weight: 10 },
            ],
            possibleEvents: [
                { definitionId: 'HIDDEN_CACHE_TIER1', weight: 5 },
                { definitionId: 'EERIE_SOUNDS_TIER1', weight: 8 },
            ]
        },
        {
            floorNumber: 2,
            floorName: "Orcish Barracks",
            rows: 11, // Slightly larger
            cols: 11,
            enemies: [
                { id: "T1F2_ORC_PATROL_V2", name: "Orc Patrol", enemies: [{ enemyId: 'ORC_BRUTE', count: 1 }, { enemyId: 'GOBLIN', count: 3 }], weight: 10 },
                { id: "T1F2_SKELETAL_GUARDS", name: "Skeletal Guards", enemies: [{ enemyId: 'SKELETON_WARRIOR', count: 2 }], weight: 8 },
                { id: "T1F2_WOLF_PACK_SMALL", name: "Small Wolf Pack", enemies: [{ enemyId: 'DIRE_WOLF', count: 1 }], weight: 6, isElite: true },
                { id: "T1_ELITE_GUARDIAN_SECRET", name: "Treasure Guardian (Elite)", enemies: [{ enemyId: 'ELITE_GUARDIAN', count: 1 }], weight: 0, isElite: true },
            ] as DungeonEncounterDefinition[],
            possibleTraps: [
                { definitionId: 'SPIKE_TRAP_TIER1', weight: 8 },
                { definitionId: 'POISON_GAS_TRAP_TIER1', weight: 6 },
            ],
            possibleEvents: [
                { definitionId: 'OLD_DIARY_TIER1', weight: 7 },
                { definitionId: 'SHRINE_OF_EMPOWERMENT_T1', weight: 4 },
            ]
        },
        {
            floorNumber: 3,
            floorName: "Altar of Shadows",
            // Rows/Cols not specified, will use default 12x12
            enemies: [
                { id: "T1F3_ALTAR_GUARDIANS_ELITE", name: "Altar Guardians (Elite)", enemies: [{ enemyId: 'ORC_BRUTE', count: 1 }, { enemyId: 'SKELETON_WARRIOR', count: 1 }], weight: 10, isElite: true },
                { id: "T1F3_CORPSEBLOOM_PATCH", name: "Corpsebloom Patch", enemies: [{ enemyId: 'CORPSEBLOOM_SPROUT', count: 2 }, { enemyId: 'GIANT_SPIDER', count: 1 }], weight: 7 },
                { id: "T1F3_SHAMAN_RITUAL", name: "Shaman's Ritual", enemies: [{ enemyId: 'GOBLIN_SHAMAN', count: 1 }, { enemyId: 'GOBLIN', count: 2 }], weight: 6 },
                { id: "T1_ELITE_GUARDIAN_SECRET", name: "Treasure Guardian (Elite)", enemies: [{ enemyId: 'ELITE_GUARDIAN', count: 1 }], weight: 0, isElite: true },
            ] as DungeonEncounterDefinition[],
             possibleTraps: [
                { definitionId: 'POISON_GAS_TRAP_TIER1', weight: 7 },
                { definitionId: 'ALARM_TRAP_TIER1', weight: 5 },
                { definitionId: 'RESOURCE_DRAIN_TRAP_TIER1', weight: 5},
            ],
            possibleEvents: [
                { definitionId: 'FOUNTAIN_OF_CHOICE_T1', weight: 6 },
                { definitionId: 'EERIE_SOUNDS_TIER1', weight: 5 },
            ]
        }
    ],
    finalReward: {
        resourceCache: [
            { resource: ResourceType.GOLD, amount: 350 },
            { resource: ResourceType.IRON, amount: 35 },
            { resource: ResourceType.CRYSTALS, amount: 20 },
            { resource: ResourceType.HEROIC_POINTS, amount: 200 },
            { resource: ResourceType.LEATHER, amount: 10 }
        ],
        permanentBuffChoices: 2,
    },
    possiblePermanentBuffs: [
        { stat: 'damage', value: 2.5 },
        { stat: 'maxHp', value: 30 },
        { stat: 'defense', value: 2 },
        { stat: 'attackSpeed', value: 0.03 },
        { stat: 'critChance', value: 0.015 },
        { stat: 'critDamage', value: 0.15 }
    ]
};
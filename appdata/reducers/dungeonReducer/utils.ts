
export const generateUniqueDungeonLootId = (): string => `shard-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

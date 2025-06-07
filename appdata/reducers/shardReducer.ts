
import { GameState, GameAction, PlayerOwnedShard, GameNotification, GlobalBonuses } from '../types';
// FIX: Import HERO_DEFINITIONS
import { SHARD_DEFINITIONS, HERO_DEFINITIONS } from '../gameData/index';
import { NOTIFICATION_ICONS } from '../constants';
import { formatNumber } from '../utils'; // Assuming formatNumber is in utils

// Helper function to generate a unique ID for new shards
const generateUniqueId = () => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

export const handleShardActions = (
  state: GameState,
  action: Extract<GameAction, { type: 'FUSE_SHARDS' | 'ANIMATION_ACK_FUSED_SHARD' | 'FUSE_ALL_MATCHING_SHARDS_FOR_HERO' }>,
  globalBonuses: GlobalBonuses // Not used in this reducer currently, but passed for consistency
): GameState => {
  switch (action.type) {
    case 'FUSE_SHARDS': {
      const { heroDefinitionId, sourceShardInstanceId1, sourceShardInstanceId2 } = action.payload;

      const heroIndex = state.heroes.findIndex(h => h.definitionId === heroDefinitionId);
      if (heroIndex === -1) {
        console.warn("Hero not found for shard fusion.");
        return state;
      }
      const hero = state.heroes[heroIndex];
      const heroOwnedShards = hero.ownedShards || [];

      const shard1 = heroOwnedShards.find(s => s.instanceId === sourceShardInstanceId1);
      const shard2 = heroOwnedShards.find(s => s.instanceId === sourceShardInstanceId2);

      if (!shard1 || !shard2) {
        console.warn("One or both shards for fusion not found in hero's inventory.");
        return state;
      }

      if (shard1.definitionId !== shard2.definitionId || shard1.level !== shard2.level) {
        const newNotification: GameNotification = { id: Date.now().toString(), message: 'Shards must be of the same type and level to fuse.', type: 'warning', iconName: NOTIFICATION_ICONS.warning, timestamp: Date.now() };
        return { ...state, notifications: [...state.notifications, newNotification] };
      }

      const shardDef = SHARD_DEFINITIONS[shard1.definitionId];
      if (!shardDef) {
        console.warn(`Shard definition ${shard1.definitionId} not found.`);
        return state;
      }

      if (shardDef.maxFusionLevel !== -1 && shard1.level >= shardDef.maxFusionLevel) {
        const newNotification: GameNotification = { id: Date.now().toString(), message: `${shardDef.name} is already at its maximum fusion level.`, type: 'info', iconName: NOTIFICATION_ICONS.info, timestamp: Date.now() };
        return { ...state, notifications: [...state.notifications, newNotification] };
      }

      const newLevel = shard1.level + 1;
      const newShardInstanceId = generateUniqueId();
      const newFusedShard: PlayerOwnedShard = {
        instanceId: newShardInstanceId,
        definitionId: shard1.definitionId,
        level: newLevel,
      };

      const remainingShardsForHero = heroOwnedShards.filter(
        s => s.instanceId !== sourceShardInstanceId1 && s.instanceId !== sourceShardInstanceId2
      );

      const updatedHero = {
        ...hero,
        ownedShards: [...remainingShardsForHero, newFusedShard],
      };

      const updatedHeroes = [...state.heroes];
      updatedHeroes[heroIndex] = updatedHero;
      
      const heroDef = HERO_DEFINITIONS[hero.definitionId];

      const successNotification: GameNotification = {
        id: Date.now().toString(),
        message: `Fused two Lvl ${shard1.level} ${shardDef.name} into one Lvl ${newLevel} ${shardDef.name} for ${heroDef?.name || 'Hero'}!`,
        type: 'success',
        iconName: 'FUSION_ICON', 
        timestamp: Date.now(),
      };

      return {
        ...state,
        heroes: updatedHeroes,
        notifications: [...state.notifications, successNotification],
        justFusedShardInstanceId: newShardInstanceId, 
      };
    }
    case 'FUSE_ALL_MATCHING_SHARDS_FOR_HERO': {
        const { heroDefinitionId } = action.payload;
        const heroIndex = state.heroes.findIndex(h => h.definitionId === heroDefinitionId);
        if (heroIndex === -1) return state;

        let hero = { ...state.heroes[heroIndex] };
        let ownedShards = [...(hero.ownedShards || [])];
        let fusionsMade = 0;
        let fusedShardsSummary: string[] = [];

        // Group shards by definitionId and level
        const shardGroups: Record<string, PlayerOwnedShard[]> = {};
        ownedShards.forEach(shard => {
            const key = `${shard.definitionId}-${shard.level}`;
            if (!shardGroups[key]) shardGroups[key] = [];
            shardGroups[key].push(shard);
        });

        for (const key in shardGroups) {
            let group = shardGroups[key];
            while (group.length >= 2) {
                const shardToFuse1 = group.pop()!;
                const shardToFuse2 = group.pop()!;
                const shardDef = SHARD_DEFINITIONS[shardToFuse1.definitionId];

                if (!shardDef || (shardDef.maxFusionLevel !== -1 && shardToFuse1.level >= shardDef.maxFusionLevel)) {
                    // Cannot fuse further or definition missing, put them back if not processing further for this type/level
                    group.push(shardToFuse1, shardToFuse2); 
                    break; 
                }

                const newLevel = shardToFuse1.level + 1;
                const newFusedShard: PlayerOwnedShard = {
                    instanceId: generateUniqueId(),
                    definitionId: shardToFuse1.definitionId,
                    level: newLevel,
                };
                
                // Add new fused shard to the main list (will be regrouped if further fusions are possible)
                ownedShards.push(newFusedShard);
                fusionsMade++;
                if (!fusedShardsSummary.includes(`${shardDef.name} Lvl ${newLevel}`)) {
                    fusedShardsSummary.push(`${shardDef.name} Lvl ${newLevel}`);
                }

                // Remove the consumed shards from the original list
                ownedShards = ownedShards.filter(s => s.instanceId !== shardToFuse1.instanceId && s.instanceId !== shardToFuse2.instanceId);
            }
        }
        
        // If fusions were made, update hero and send notification
        if (fusionsMade > 0) {
            hero.ownedShards = ownedShards;
            const updatedHeroes = [...state.heroes];
            updatedHeroes[heroIndex] = hero;
            const heroDef = HERO_DEFINITIONS[hero.definitionId];

            const summaryMessage = fusedShardsSummary.length > 0 ? `Created: ${fusedShardsSummary.join(', ')}.` : '';
            const successNotification: GameNotification = {
                id: Date.now().toString(),
                message: `Auto-Fused ${fusionsMade} pair(s) of shards for ${heroDef?.name || 'Hero'}. ${summaryMessage}`,
                type: 'success',
                iconName: 'FUSION_ICON',
                timestamp: Date.now(),
            };
            return { ...state, heroes: updatedHeroes, notifications: [...state.notifications, successNotification], justFusedShardInstanceId: null }; // Set to null for batch, or handle differently
        } else {
            const noFusionNotification: GameNotification = {
                id: Date.now().toString(),
                message: `No shards eligible for auto-fusion for ${HERO_DEFINITIONS[hero.definitionId]?.name || 'Hero'}.`,
                type: 'info',
                iconName: NOTIFICATION_ICONS.info,
                timestamp: Date.now(),
            };
            return { ...state, notifications: [...state.notifications, noFusionNotification] };
        }
    }
    case 'ANIMATION_ACK_FUSED_SHARD': {
        return {
            ...state,
            justFusedShardInstanceId: null,
        };
    }
    default:
      return state;
  }
};

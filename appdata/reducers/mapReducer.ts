
import { GameState, GameAction, GameNotification, ResourceType } from '../types';
import { ICONS } from '../components/Icons';
import { NOTIFICATION_ICONS, RESOURCE_COLORS } from '../constants'; // Corrected import
import { formatNumber } from '../utils';
import { worldMapDefinitions } from '../gameData/maps';

export const handleMapActions = (
  state: GameState,
  action: Extract<GameAction, { type: 'SET_PLAYER_MAP_NODE' | 'REVEAL_MAP_NODES_STATIC' | 'SET_CURRENT_MAP' | 'COLLECT_MAP_RESOURCE' | 'SET_MAP_POI_COMPLETED' }>
): GameState => {
  switch (action.type) {
    case 'SET_PLAYER_MAP_NODE': {
      const { nodeId } = action.payload;
      const currentMapStateForSetNode = state.mapStates?.[state.currentMapId];
      let updatedMapStatesForSetNode = state.mapStates || {};

      if (state.currentMapId && currentMapStateForSetNode) {
        updatedMapStatesForSetNode = {
          ...updatedMapStatesForSetNode,
          [state.currentMapId]: {
            ...currentMapStateForSetNode,
            playerCurrentNodeId: nodeId,
          },
        };
      }
      return {
        ...state,
        playerCurrentNodeId: nodeId, // Keep this for current map quick access
        mapStates: updatedMapStatesForSetNode,
      };
    }

    case 'REVEAL_MAP_NODES_STATIC': {
      const mapStates = state.mapStates || {};
      const currentMapStateForReveal = mapStates[state.currentMapId];
      if (!currentMapStateForReveal) return state; 

      const currentMapRevealed = currentMapStateForReveal.revealedMapNodeIds || [];
      const newNodesToReveal = action.payload.nodeIds.filter(id => !currentMapRevealed.includes(id));

      if (newNodesToReveal.length === 0) return state;

      const newRevealedNodesForCurrentMap = Array.from(new Set([...currentMapRevealed, ...newNodesToReveal]));
      
      return {
        ...state,
        revealedMapNodeIds: newRevealedNodesForCurrentMap, // Update top-level for current map
        mapStates: {
          ...mapStates,
          [state.currentMapId]: {
            ...currentMapStateForReveal,
            revealedMapNodeIds: newRevealedNodesForCurrentMap,
          },
        },
      };
    }

    case 'SET_CURRENT_MAP': {
      const newMapId = action.payload.mapId;
      const targetNodeIdFromPortal = action.payload.targetNodeId; // Correctly access targetNodeId
      const newMapDef = worldMapDefinitions[newMapId];
      if (!newMapDef) {
        console.error(`Map definition not found for ID: ${newMapId}`);
        return state;
      }

      let nextPlayerNodeId: string;
      let nextRevealedNodes: string[];
      let nextPoiStatus: Record<string, boolean>;
      const currentMapStates = state.mapStates || {}; 

      if (currentMapStates[newMapId]) {
        const existingMapState = currentMapStates[newMapId];
        nextPlayerNodeId = targetNodeIdFromPortal || existingMapState.playerCurrentNodeId || newMapDef.entryNodeId;
        nextRevealedNodes = existingMapState.revealedMapNodeIds;
        nextPoiStatus = existingMapState.mapPoiCompletionStatus;
      } else {
        nextPlayerNodeId = targetNodeIdFromPortal || newMapDef.entryNodeId;
        nextRevealedNodes = [nextPlayerNodeId];
        const entryNodeDef = newMapDef.nodes.find(n => n.id === nextPlayerNodeId);
        if (entryNodeDef?.connections) {
            entryNodeDef.connections.forEach(conn => {
                if (!nextRevealedNodes.includes(conn)) nextRevealedNodes.push(conn);
            });
        }
        nextPoiStatus = {}; // Initialize empty POI status for new map
      }

      return {
        ...state,
        currentMapId: newMapId,
        playerCurrentNodeId: nextPlayerNodeId,
        revealedMapNodeIds: nextRevealedNodes,
        mapPoiCompletionStatus: nextPoiStatus,
        mapStates: {
          ...currentMapStates,
          [newMapId]: {
            playerCurrentNodeId: nextPlayerNodeId,
            revealedMapNodeIds: nextRevealedNodes,
            mapPoiCompletionStatus: nextPoiStatus,
          },
        },
      };
    }

    case 'COLLECT_MAP_RESOURCE': {
      const { nodeId, mapId } = action.payload;
      const mapDef = worldMapDefinitions[mapId];
      if (!mapDef) return state;
      const node = mapDef.nodes.find(n => n.id === nodeId);
      
      if (!node || node.poiType !== 'RESOURCE' || !node.resourceType || !node.resourceAmount || node.grantsShardId) {
        return state;
      }

      const newResources = { ...state.resources };
      newResources[node.resourceType] = (newResources[node.resourceType] || 0) + node.resourceAmount;

      const newNotifications = [...state.notifications, {
        id: Date.now().toString(),
        message: `Collected ${formatNumber(node.resourceAmount)} ${node.resourceType.replace(/_/g, ' ')} from ${node.name}.`,
        type: 'success',
        iconName: ICONS[node.resourceType] ? node.resourceType : NOTIFICATION_ICONS.success,
        timestamp: Date.now()
      } as GameNotification];
      return { ...state, resources: newResources, notifications: newNotifications };
    }
    
    case 'SET_MAP_POI_COMPLETED': {
        const mapStates = state.mapStates || {};
        const currentMapStateForPoi = mapStates[state.currentMapId];
        if (!currentMapStateForPoi) return state;

        const newMapPoiCompletionStatus = {
            ...currentMapStateForPoi.mapPoiCompletionStatus,
            [action.payload.poiKey]: true,
        };

        return {
          ...state,
          mapPoiCompletionStatus: newMapPoiCompletionStatus, // Update top-level for current map
          mapStates: {
            ...mapStates,
            [state.currentMapId]: {
              ...currentMapStateForPoi,
              mapPoiCompletionStatus: newMapPoiCompletionStatus,
            },
          },
        };
      }

    default:
      return state;
  }
};
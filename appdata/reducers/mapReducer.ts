

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
    case 'SET_PLAYER_MAP_NODE':
      return { ...state, playerCurrentNodeId: action.payload.nodeId };

    case 'REVEAL_MAP_NODES_STATIC': {
      const newRevealedIds = Array.from(new Set([...state.revealedMapNodeIds, ...action.payload.nodeIds]));
      if (newRevealedIds.length > state.revealedMapNodeIds.length) {
        return { ...state, revealedMapNodeIds: newRevealedIds };
      }
      return state;
    }

    case 'SET_CURRENT_MAP': {
      const { mapId } = action.payload;
      const newMapDef = worldMapDefinitions[mapId];
      if (!newMapDef) {
        console.error(`Map definition not found for ID: ${mapId}`);
        return state;
      }
      const entryNode = newMapDef.nodes.find(node => node.id === newMapDef.entryNodeId);
      if (!entryNode) {
        console.error(`Entry node ${newMapDef.entryNodeId} not found in map ${mapId}`);
        return state;
      }
      const newRevealedMapNodeIds = [entryNode.id];
      // Automatically reveal connections of the entry node if desired
      // entryNode.connections.forEach(connId => {
      //   if (!newRevealedMapNodeIds.includes(connId)) {
      //     newRevealedMapNodeIds.push(connId);
      //   }
      // });
      return {
        ...state,
        currentMapId: mapId,
        playerCurrentNodeId: newMapDef.entryNodeId,
        revealedMapNodeIds: newRevealedMapNodeIds,
        mapPoiCompletionStatus: {}, // Reset POI completion status when changing maps
      };
    }

    case 'COLLECT_MAP_RESOURCE': {
      const { nodeId, mapId } = action.payload;
      const mapDef = worldMapDefinitions[mapId];
      if (!mapDef) return state;
      const node = mapDef.nodes.find(n => n.id === nodeId);
      if (!node || node.poiType !== 'RESOURCE' || !node.resourceType || !node.resourceAmount) return state;

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
        return {
          ...state,
          mapPoiCompletionStatus: {
            ...state.mapPoiCompletionStatus,
            [action.payload.poiKey]: true,
          },
        };
      }

    default:
      return state;
  }
};
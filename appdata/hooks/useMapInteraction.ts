
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { MapNode, ResourceType, GameContextType, GameNotification, GameState, PlayerOwnedShard } from '../types';
import { useGameContext } from '../context'; // To access dispatch and staticData if needed for POI
import { NOTIFICATION_ICONS, RESOURCE_COLORS } from '../constants';
import { ICONS } from '../components/Icons';
import { formatNumber } from '../utils';
import { SHARD_DEFINITIONS } from '../gameData'; // Import SHARD_DEFINITIONS

const ANIMATION_DURATION = 700; // ms
const generateUniqueId = () => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;


export const useMapInteraction = (
  currentMapNodes: MapNode[],
  playerCurrentNodeId: string,
  revealedMapNodeIds: string[],
  dispatch: ReturnType<typeof useGameContext>['dispatch'],
  staticData: GameContextType['staticData'],
  currentMapId: string
) => {
  const { gameState } = useGameContext();
  const [isMoving, setIsMoving] = useState(false);
  const [animationTargetNodeId, setAnimationTargetNodeId] = useState<string | null>(null);
  const [playerVisualPosition, setPlayerVisualPosition] = useState<{ x: number; y: number } | null>(null);
  const [animationPathDetails, setAnimationPathDetails] = useState<{
    pathElement: SVGPathElement;
    totalLength: number;
    startTime: number;
    isPathReversedForAnimation: boolean;
  } | null>(null);

  const [isPoiModalOpen, setIsPoiModalOpen] = useState(false);
  const [poiModalContent, setPoiModalContent] = useState<{ title: string, message: string, nodeName: string } | null>(null);
  const [poiModalOnConfirmAction, setPoiModalOnConfirmAction] = useState<(() => void) | null>(null);
  const [poiModalConfirmButtonText, setPoiModalConfirmButtonText] = useState<string | null>(null);

  const animationFrameRef = useRef<number | null>(null);
  const currentNode = useMemo(() => currentMapNodes.find(node => node.id === playerCurrentNodeId), [playerCurrentNodeId, currentMapNodes]);

  useEffect(() => {
    setIsMoving(false);
    setAnimationTargetNodeId(null);
    setAnimationPathDetails(null);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    const newCurrentNode = currentMapNodes.find(node => node.id === playerCurrentNodeId);
    if (newCurrentNode) {
      setPlayerVisualPosition({ x: newCurrentNode.x, y: newCurrentNode.y });
    }
  }, [currentMapId, playerCurrentNodeId, currentMapNodes]);

  const handlePoiInteraction = useCallback((node: MapNode | undefined) => {
    if (!node) return;

    setPoiModalOnConfirmAction(null);
    setPoiModalConfirmButtonText(null);
    let baseMessage = node.description || `You've arrived at ${node.name}.`;
    let confirmAction: (() => void) | null = null;
    let confirmText: string | null = null;
    let title = node.name;

    let isInteractiveNode = !!node.description;


    if (node.poiType === 'MAP_PORTAL' && node.targetMapId) {
      isInteractiveNode = true;
      const targetMapDef = staticData.worldMapDefinitions[node.targetMapId];
      title = 'Travel to Another Realm';
      baseMessage = `You've found a portal to ${targetMapDef?.name || 'an unknown land'}. Do you wish to travel?`;
      confirmAction = () => () => {
        dispatch({ type: 'SET_CURRENT_MAP', payload: { mapId: node.targetMapId!, targetNodeId: node.targetNodeId } });
        setIsPoiModalOpen(false);
      };
      confirmText = `Travel to ${targetMapDef?.name || '???'}`;
    } else if (node.poiType === 'CLERIC_RESCUE_EVENT' && node.cleric_rescue_battle_node_id) {
      isInteractiveNode = true;
      const battleNodeKey = `${node.id}_completed`;
      const isCompleted = gameState.mapPoiCompletionStatus[battleNodeKey];

      title = isCompleted ? 'Cleric Rescued!' : 'Rescue the Cleric!';
      baseMessage = isCompleted
        ? `You have already rescued the Cleric from this location.`
        : `${node.description || `You find a Cleric in distress!`} Will you help?`;
      
      if (!isCompleted) {
        confirmAction = () => () => {
          dispatch({
            type: 'START_BATTLE_PREPARATION',
            payload: {
              waveNumber: 0, // Placeholder for custom sequence
              sourceMapNodeId: node.cleric_rescue_battle_node_id!,
              customWaveSequence: ['map_ww_cleric_rescue_wave_1', 'map_ww_cleric_rescue_wave_2'], 
              currentCustomWaveIndex: 0,
            }
          });
          setIsPoiModalOpen(false);
        };
        confirmText = 'Start Rescue Battle';
      }
    } else if (node.isBattleNode || (node.customWaveDefinitionIds && node.customWaveDefinitionIds.length > 0)) {
      isInteractiveNode = true;
      const battleNodeKey = `${node.id}_battle_won`;
      const isCompleted = gameState.mapPoiCompletionStatus[battleNodeKey];

      title = isCompleted ? `${node.name} (Cleared)` : `Battle: ${node.name}`;
      baseMessage = isCompleted
        ? `The area around ${node.name} has been secured. You can challenge the foes again if you wish.`
        : `${node.description || `You are at ${node.name}.`} Prepare for battle!`;

      confirmAction = () => () => {
        const payload: any = {
            sourceMapNodeId: node.id,
            waveNumber: 0, // Default wave number, will be overridden if battleWaveStart or custom sequence is present
        };
        if (node.customWaveDefinitionIds && node.customWaveDefinitionIds.length > 0) {
            payload.customWaveSequence = node.customWaveDefinitionIds;
            payload.currentCustomWaveIndex = 0;
        } else if (node.battleWaveStart !== undefined) {
            payload.waveNumber = node.battleWaveStart;
        } else {
            console.error("Battle node configuration error:", node.id, "Missing wave start info.");
            dispatch({ type: 'ADD_NOTIFICATION', payload: { message: `Error: Battle at ${node.name} is misconfigured.`, type: 'error', iconName: NOTIFICATION_ICONS.error }});
            setIsPoiModalOpen(false);
            return;
        }
        dispatch({ type: 'START_BATTLE_PREPARATION', payload });
        setIsPoiModalOpen(false);
      };

      if (node.customWaveDefinitionIds && node.customWaveDefinitionIds.length > 0) {
        confirmText = isCompleted ? 'Replay Encounter' : 'Start Encounter';
      } else if (node.battleWaveStart !== undefined) {
        confirmText = isCompleted ? `Replay Wave ${node.battleWaveStart}` : `Start Wave ${node.battleWaveStart}`;
      } else {
        confirmText = 'Engage'; // Fallback
      }
    } else if (node.poiType === 'RESOURCE') {
      isInteractiveNode = true;
      const poiKey = `${node.id}_resource_collected`;
      const shardDefToGrant = node.grantsShardId ? SHARD_DEFINITIONS[node.grantsShardId] : undefined;

      if (gameState.mapPoiCompletionStatus[poiKey]) {
        baseMessage = `${node.name} has already been claimed.`;
        title = `${node.name} (Claimed)`;
      } else {
        if (shardDefToGrant) {
          title = `Shard Cache: ${node.name}`;
          baseMessage = `You found a ${shardDefToGrant.name} Lvl ${node.grantsShardLevel || 1}!`;
          confirmText = `Claim ${shardDefToGrant.name}`;
        } else if (node.resourceType && node.resourceAmount) {
          const resourceName = node.resourceType.replace(/_/g, ' ');
          title = `Resource Node: ${node.name}`;
          baseMessage = `You can collect ${node.resourceAmount} ${resourceName} here.`;
          confirmText = `Collect ${node.resourceAmount} ${resourceName}`;
        } else {
           baseMessage = `${node.name} seems empty or misconfigured.`;
           title = node.name;
        }

        if (shardDefToGrant || (node.resourceType && node.resourceAmount)) {
            confirmAction = () => () => {
              if (shardDefToGrant && gameState.heroes.length > 0) {
                 dispatch({ type: 'AWARD_SHARD_TO_HERO', payload: { heroDefinitionId: gameState.heroes[0].definitionId, shardDefinitionId: shardDefToGrant.id, shardLevel: node.grantsShardLevel || 1 }});
                 dispatch({
                  type: 'ADD_NOTIFICATION', payload: {
                    message: `Found Shard: ${shardDefToGrant.name} Lvl ${node.grantsShardLevel || 1} for ${staticData.heroDefinitions[gameState.heroes[0].definitionId]?.name || 'First Hero'} at ${node.name}.`,
                    type: 'success',
                    iconName: shardDefToGrant.iconName,
                  }
                });
              } else if (node.resourceType && node.resourceAmount) {
                dispatch({ type: 'COLLECT_MAP_RESOURCE', payload: { nodeId: node.id, mapId: currentMapId } });
              }
              dispatch({ type: 'SET_MAP_POI_COMPLETED', payload: { poiKey } });
              if (node.id === 'wood_clearing' && !gameState.mapPoiCompletionStatus['archer_unlocked_verdant_plains']) {
                dispatch({ type: 'UNLOCK_HERO_DEFINITION', payload: { heroId: 'ARCHER' } });
                dispatch({ type: 'SET_MAP_POI_COMPLETED', payload: { poiKey: 'archer_unlocked_verdant_plains' } });
                const archerNotificationPayload: Omit<GameNotification, 'id' | 'timestamp'> = {
                  message: "The availability of fresh wood has attracted a skilled Archer to your cause! Archer recruitment is now available.",
                  type: "success",
                  iconName: ICONS.BOW_ICON ? 'BOW_ICON' : NOTIFICATION_ICONS.success,
                };
                dispatch({ type: 'ADD_NOTIFICATION', payload: archerNotificationPayload });
              }
              setIsPoiModalOpen(false);
            };
        }
      }
    } else if (node.poiType === 'EVENT') {
      isInteractiveNode = true;
      title = `Event: ${node.name}`;
      baseMessage = `${baseMessage} Something unexpected might happen.`;
    }

    if (isInteractiveNode) {
        setPoiModalContent({ title, message: baseMessage, nodeName: node.name });
        if (confirmAction) setPoiModalOnConfirmAction(confirmAction);
        if (confirmText) setPoiModalConfirmButtonText(confirmText);
        setIsPoiModalOpen(true);
    }

  }, [dispatch, staticData.worldMapDefinitions, currentMapId, gameState.mapPoiCompletionStatus, gameState.heroes, staticData.heroDefinitions]);

  const handleNodeClick = useCallback((nodeId: string) => {
    if (isMoving || !revealedMapNodeIds.includes(nodeId)) return;

    const targetNode = currentMapNodes.find(n => n.id === nodeId);
    if (!targetNode || !currentNode) return;

    if (nodeId === currentNode.id) {
      handlePoiInteraction(targetNode); 
      return;
    }

    const isConnectedToCurrent = currentNode.connections.includes(nodeId);
    if (!isConnectedToCurrent) {
        const notConnectedNotificationPayload: Omit<GameNotification, 'id' | 'timestamp'> = {
            message: `Cannot travel to ${targetNode.name}. No direct path from your current location.`,
            type: "warning",
            iconName: NOTIFICATION_ICONS.warning,
        };
        dispatch({ type: 'ADD_NOTIFICATION', payload: notConnectedNotificationPayload });
        return;
    }

    if (currentNode.connections.includes(nodeId)) {
      setAnimationTargetNodeId(nodeId);
      const sourceNodeId = currentNode.id;
      const pathIdParts = [sourceNodeId, nodeId].sort();
      const pathId = `path-${pathIdParts.join('-')}`;
      const element = document.getElementById(pathId);

      if (element instanceof SVGPathElement) {
        const pathElement = element;
        const totalLength = pathElement.getTotalLength();
        const isPathReversedForAnimation = pathIdParts[0] !== sourceNodeId;

        setAnimationPathDetails({
          pathElement,
          totalLength,
          startTime: performance.now(),
          isPathReversedForAnimation,
        });
        setIsMoving(true);
      } else {
        console.warn(`Path element not found for ${sourceNodeId} to ${nodeId}. ID: ${pathId}`);
        dispatch({ type: 'SET_PLAYER_MAP_NODE', payload: { nodeId } });
      }
    }
  }, [isMoving, revealedMapNodeIds, currentMapNodes, currentNode, dispatch, handlePoiInteraction]);

  useEffect(() => {
    if (!isMoving || !animationPathDetails || !playerVisualPosition) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
      return;
    }

    const animatePlayerMarker = (now: number) => {
      if (!animationPathDetails) return;

      const { pathElement, totalLength, startTime, isPathReversedForAnimation } = animationPathDetails;
      const elapsedTime = now - startTime;
      let progress = elapsedTime / ANIMATION_DURATION;

      if (progress >= 1) {
        progress = 1;
        const targetNode = currentMapNodes.find(n => n.id === animationTargetNodeId);
        if (targetNode) {
          setPlayerVisualPosition({ x: targetNode.x, y: targetNode.y });
          dispatch({ type: 'SET_PLAYER_MAP_NODE', payload: { nodeId: animationTargetNodeId! } });
        }
        setIsMoving(false);
        setAnimationTargetNodeId(null);
        setAnimationPathDetails(null);
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
        return;
      }

      const pointOnPath = pathElement.getPointAtLength(isPathReversedForAnimation ? totalLength * (1 - progress) : totalLength * progress);
      setPlayerVisualPosition({ x: pointOnPath.x, y: pointOnPath.y });
      animationFrameRef.current = requestAnimationFrame(animatePlayerMarker);
    };

    animationFrameRef.current = requestAnimationFrame(animatePlayerMarker);
    return () => { if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current); };
  }, [isMoving, animationPathDetails, dispatch, animationTargetNodeId, currentMapNodes, playerVisualPosition]);

   useEffect(() => {
    if (currentNode && !isMoving && revealedMapNodeIds && currentMapNodes.length > 0) {
        const nodesToRevealThisMap = currentNode.connections
            .filter(id => {
                const targetNode = currentMapNodes.find(n => n.id === id);
                return targetNode && !revealedMapNodeIds.includes(id);
            });
        if (!revealedMapNodeIds.includes(currentNode.id)) { 
            nodesToRevealThisMap.push(currentNode.id);
        }
        if (nodesToRevealThisMap.length > 0) {
            dispatch({ type: 'REVEAL_MAP_NODES_STATIC', payload: { nodeIds: nodesToRevealThisMap } });
        }
    }
  }, [playerCurrentNodeId, isMoving, currentMapNodes, revealedMapNodeIds, dispatch, currentNode]);


  const handleClosePoiModal = () => {
    setIsPoiModalOpen(false);
    setPoiModalContent(null);
    setPoiModalOnConfirmAction(null);
    setPoiModalConfirmButtonText(null);
  };

  return {
    playerVisualPosition,
    handleNodeClick, 
    handlePoiInteraction, 
    isMoving,
    poiModalContent,
    isPoiModalOpen,
    handleClosePoiModal,
    poiModalOnConfirmAction,
    poiModalConfirmButtonText,
    animationTargetNodeId,
    currentNode, 
  };
};

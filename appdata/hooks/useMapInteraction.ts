
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { MapNode, ResourceType, GameContextType, GameNotification, GameState } from '../types';
import { useGameContext } from '../context'; // To access dispatch and staticData if needed for POI
import { NOTIFICATION_ICONS, RESOURCE_COLORS } from '../constants';
import { ICONS } from '../components/Icons';
import { formatNumber } from '../utils';

const ANIMATION_DURATION = 700; // ms

export const useMapInteraction = (
  currentMapNodes: MapNode[],
  playerCurrentNodeId: string,
  revealedMapNodeIds: string[],
  dispatch: ReturnType<typeof useGameContext>['dispatch'],
  staticData: GameContextType['staticData'],
  currentMapId: string
) => {
  const { gameState } = useGameContext(); // Get full gameState for mapPoiCompletionStatus
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

  const handlePoiInteraction = useCallback((node: MapNode) => {
    setPoiModalOnConfirmAction(null);
    setPoiModalConfirmButtonText(null);
    let baseMessage = node.description || `You've arrived at ${node.name}.`;
    let confirmAction: (() => void) | null = null;
    let confirmText: string | null = null;
    let title = node.name;

    if (node.poiType === 'MAP_PORTAL' && node.targetMapId) {
      const targetMapDef = staticData.worldMapDefinitions[node.targetMapId];
      title = 'Travel to Another Realm';
      baseMessage = `You've found a portal to ${targetMapDef?.name || 'an unknown land'}. Do you wish to travel?`;
      confirmAction = () => () => {
        dispatch({ type: 'SET_CURRENT_MAP', payload: { mapId: node.targetMapId! } });
        setIsPoiModalOpen(false);
      };
      confirmText = `Travel to ${targetMapDef?.name || '???'}`;
    } else if (node.id === 'gold_mine_approach' && gameState.mapPoiCompletionStatus['gold_mine_approach_access_granted']) {
      title = 'Gold Mine Entrance';
      baseMessage = `${node.name} - The way to the Gold Mine is clear!`;
      confirmAction = () => () => {
        dispatch({ type: 'GOLD_MINE_MINIGAME_INIT' });
        dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'GOLD_MINE_MINIGAME' });
        setIsPoiModalOpen(false);
      };
      confirmText = 'Enter Gold Mine';
    } else if (node.isBattleNode && node.battleWaveStart !== undefined) {
      const battleNodeKey = `${node.id}_battle_won`; // e.g., 'lumber_mill_battle_battle_won'
      if (gameState.mapPoiCompletionStatus[battleNodeKey]) {
        title = `${node.name} (Cleared)`;
        baseMessage = `The area around ${node.name} has been secured. You can challenge the foes again if you wish.`;
      } else {
        title = `Battle: ${node.name}`;
        baseMessage = `${baseMessage} Prepare for battle! (Waves ${node.battleWaveStart}-${node.battleWaveEnd || node.battleWaveStart})`;
      }
      confirmAction = () => () => {
        dispatch({ type: 'START_BATTLE_PREPARATION', payload: { waveNumber: node.battleWaveStart!, sourceMapNodeId: node.id } });
        setIsPoiModalOpen(false);
      };
      confirmText = gameState.mapPoiCompletionStatus[battleNodeKey] ? 'Replay Battle' : `Start Battle (Waves ${node.battleWaveStart}-${node.battleWaveEnd || node.battleWaveStart})`;
    } else if (node.poiType === 'DUNGEON') {
      title = 'Dungeon Entrance';
      baseMessage = `${baseMessage} A dark and dangerous dungeon awaits exploration.`;
      // Add confirm action to enter dungeon, e.g., dispatch action to open DungeonSelectionModal or directly enter
    } else if (node.poiType === 'RESOURCE' && node.resourceType && node.resourceAmount) {
      const resourceName = node.resourceType.replace(/_/g, ' ');
      title = `Resource: ${node.name}`;
      const poiKey = `${node.id}_resource_collected`;
      if (gameState.mapPoiCompletionStatus[poiKey]) {
        baseMessage = `${node.name} has already been harvested.`;
      } else {
        baseMessage = `You can collect ${node.resourceAmount} ${resourceName} here.`;
        confirmAction = () => () => {
          dispatch({ type: 'COLLECT_MAP_RESOURCE', payload: { nodeId: node.id, mapId: currentMapId } });
          dispatch({ type: 'SET_MAP_POI_COMPLETED', payload: { poiKey } });
          
          // Archer unlock logic for 'wood_clearing'
          if (node.id === 'wood_clearing' && !gameState.mapPoiCompletionStatus['archer_unlocked_verdant_plains']) {
            const archerNotification: GameNotification = {
              id: Date.now().toString() + "-archerUnlock",
              message: "The availability of fresh wood has attracted a skilled Archer to your cause! Archer recruitment is now available.",
              type: "success",
              iconName: ICONS.ARCHER ? 'ARCHER' : NOTIFICATION_ICONS.success, // Assuming 'ARCHER' is a valid IconName
              timestamp: Date.now()
            };
            dispatch({ type: 'ADD_NOTIFICATION', payload: archerNotification });
            dispatch({ type: 'SET_MAP_POI_COMPLETED', payload: { poiKey: 'archer_unlocked_verdant_plains' } });
          }
          setIsPoiModalOpen(false);
        };
        confirmText = `Collect ${node.resourceAmount} ${resourceName}`;
      }
    } else if (node.poiType === 'EVENT') {
      title = `Event: ${node.name}`;
      baseMessage = `${baseMessage} Something unexpected might happen.`;
      // Specific event logic would go here or be triggered by a confirm button
    }

    setPoiModalContent({ title, message: baseMessage, nodeName: node.name });
    if (confirmAction) setPoiModalOnConfirmAction(confirmAction);
    if (confirmText) setPoiModalConfirmButtonText(confirmText);
    setIsPoiModalOpen(true);

  }, [dispatch, staticData.worldMapDefinitions, currentMapId, gameState.mapPoiCompletionStatus]);

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
        // console.warn(`Node ${nodeId} is not directly connected to current node ${currentNode.id}. Cannot move.`);
        const notConnectedNotification: GameNotification = {
            id: Date.now().toString() + "-notConnected",
            message: `Cannot travel to ${targetNode.name}. No direct path from your current location.`,
            type: "warning",
            iconName: NOTIFICATION_ICONS.warning,
            timestamp: Date.now()
        };
        dispatch({ type: 'ADD_NOTIFICATION', payload: notConnectedNotification });
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
        const nextTargetNode = currentMapNodes.find(n => n.id === nodeId);
        if (nextTargetNode) handlePoiInteraction(nextTargetNode);
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
          handlePoiInteraction(targetNode);
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
  }, [isMoving, animationPathDetails, dispatch, animationTargetNodeId, currentMapNodes, playerVisualPosition, handlePoiInteraction]);
  
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
  }, [playerCurrentNodeId, isMoving, dispatch, currentNode, revealedMapNodeIds, currentMapNodes]);


  const handleClosePoiModal = () => {
    setIsPoiModalOpen(false);
    setPoiModalContent(null);
    setPoiModalOnConfirmAction(null);
    setPoiModalConfirmButtonText(null);
  };

  return {
    playerVisualPosition,
    handleNodeClick,
    isMoving,
    poiModalContent,
    isPoiModalOpen,
    handleClosePoiModal,
    poiModalOnConfirmAction,
    poiModalConfirmButtonText,
    animationTargetNodeId,
  };
};
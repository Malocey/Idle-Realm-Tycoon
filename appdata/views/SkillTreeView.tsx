
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useGameContext } from '../context';
import { SkillTreeDefinition, SkillNodeDefinition, ResourceType, GameState } from '../types';
import GenericSkillNode from '../components/GenericSkillNode'; 
import { formatNumber } from '../utils';

interface SkillTreeViewProps {
  heroDefinitionId: string;
  skillTreeDefinition: SkillTreeDefinition;
}

const COMPACT_NODE_WIDTH = 80;
const COMPACT_NODE_HEIGHT = 90; 
const GRID_GAP_X = 40;
const GRID_GAP_Y = 30;
const EXPANDED_NODE_WIDTH_HERO = 320; 
const EXPANDED_NODE_HEIGHT_HERO = 300;
const CURVE_FACTOR_SKILL_TREE = 30; 

const SkillTreeView: React.FC<SkillTreeViewProps> = ({ heroDefinitionId, skillTreeDefinition }) => {
  const { gameState, dispatch, staticData } = useGameContext();
  const heroState = gameState.heroes.find(h => h.definitionId === heroDefinitionId);
  const [expandedSkillId, setExpandedSkillId] = useState<string | null>(null);
  const scrollableContainerRef = useRef<HTMLDivElement>(null);
  const treeContentRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if (expandedSkillId && scrollableContainerRef.current && treeContentRef.current) {
      const nodeElement = document.getElementById(`hero-skill-node-${expandedSkillId}`);
      const container = scrollableContainerRef.current;
      
      if (nodeElement && container) {
        const nodeRect = nodeElement.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const treeContentRect = treeContentRef.current.getBoundingClientRect();

        // Calculate node's position relative to the scrollable content (treeContentRef)
        const nodeOffsetTopInContent = nodeRect.top - treeContentRect.top;
        const nodeOffsetLeftInContent = nodeRect.left - treeContentRect.left;

        // Calculate the scroll position to center the node
        const targetScrollTop = nodeOffsetTopInContent + (nodeRect.height / 2) - (containerRect.height / 2);
        const targetScrollLeft = nodeOffsetLeftInContent + (nodeRect.width / 2) - (containerRect.width / 2);
        
        container.scrollTo({
          top: Math.max(0, targetScrollTop),
          left: Math.max(0, targetScrollLeft),
          behavior: 'smooth',
        });
      }
    }
  }, [expandedSkillId, heroDefinitionId, skillTreeDefinition]);


  if (!heroState) return <p>Hero data not found.</p>;

  let maxX = 0;
  let maxY = 0;
  skillTreeDefinition.nodes.forEach(node => {
    if (node.position) {
      maxX = Math.max(maxX, node.position.x);
      maxY = Math.max(maxY, node.position.y);
    }
  });

  const treeCanvasWidth = (maxX + 1) * (COMPACT_NODE_WIDTH + GRID_GAP_X) + EXPANDED_NODE_WIDTH_HERO; 
  const treeCanvasHeight = (maxY + 1) * (COMPACT_NODE_HEIGHT + GRID_GAP_Y) + EXPANDED_NODE_HEIGHT_HERO; 

  const getNodePositionAndDimensions = (node: SkillNodeDefinition): { x: number, y: number, top: number, left: number, width: number, height: number } => {
    const isExpandedNode = expandedSkillId === node.id;
    const currentWidth = isExpandedNode ? EXPANDED_NODE_WIDTH_HERO : COMPACT_NODE_WIDTH;
    const currentHeight = isExpandedNode ? EXPANDED_NODE_HEIGHT_HERO : COMPACT_NODE_HEIGHT;

    if (!node.position) return { x: 0, y: 0, top: 0, left: 0, width: currentWidth, height: currentHeight };
    
    const offsetX = EXPANDED_NODE_WIDTH_HERO / 2;
    const offsetY = EXPANDED_NODE_HEIGHT_HERO / 2;

    const gridTop = node.position.y * (COMPACT_NODE_HEIGHT + GRID_GAP_Y) + offsetY;
    const gridLeft = node.position.x * (COMPACT_NODE_WIDTH + GRID_GAP_X) + offsetX;
    
    let displayTop = gridTop;
    let displayLeft = gridLeft;

    if (isExpandedNode) {
      displayTop = gridTop - (EXPANDED_NODE_HEIGHT_HERO - COMPACT_NODE_HEIGHT) / 2;
      displayLeft = gridLeft - (EXPANDED_NODE_WIDTH_HERO - COMPACT_NODE_WIDTH) / 2;
    }
    
    const centerX = gridLeft + COMPACT_NODE_WIDTH / 2;
    const centerY = gridTop + COMPACT_NODE_HEIGHT / 2;

    return { 
      x: centerX, 
      y: centerY, 
      top: displayTop, 
      left: displayLeft,
      width: currentWidth,
      height: currentHeight
    };
  };
  
  const getEdgeCoordinates = (
    sourceNodeCenter: { x: number; y: number }, 
    targetNodeCenter: { x: number; y: number },
    sourceWidth: number = COMPACT_NODE_WIDTH,
    sourceHeight: number = COMPACT_NODE_HEIGHT,
    targetWidth: number = COMPACT_NODE_WIDTH,
    targetHeight: number = COMPACT_NODE_HEIGHT
  ): { x1: number; y1: number; x2: number; y2: number } => {
    const dx = targetNodeCenter.x - sourceNodeCenter.x;
    const dy = targetNodeCenter.y - sourceNodeCenter.y;
  
    let x1 = sourceNodeCenter.x;
    let y1 = sourceNodeCenter.y;
    let x2 = targetNodeCenter.x;
    let y2 = targetNodeCenter.y;
  
    const angle = Math.atan2(dy, dx);
  
    // Source node edge point
    if (Math.abs(dx * sourceHeight / 2) > Math.abs(dy * sourceWidth / 2)) { // Intersects with vertical sides
      x1 += (sourceWidth / 2) * Math.sign(dx);
      y1 += Math.tan(angle) * (sourceWidth / 2) * Math.sign(dx);
    } else { // Intersects with horizontal sides
      y1 += (sourceHeight / 2) * Math.sign(dy);
      x1 += (1 / Math.tan(angle)) * (sourceHeight / 2) * Math.sign(dy);
    }
  
    // Target node edge point
    if (Math.abs(dx * targetHeight / 2) > Math.abs(dy * targetWidth / 2)) { // Intersects with vertical sides
      x2 -= (targetWidth / 2) * Math.sign(dx);
      y2 -= Math.tan(angle) * (targetWidth / 2) * Math.sign(dx);
    } else { // Intersects with horizontal sides
      y2 -= (targetHeight / 2) * Math.sign(dy);
      x2 -= (1 / Math.tan(angle)) * (targetHeight / 2) * Math.sign(dy);
    }

    // Handle perfectly horizontal or vertical lines to avoid NaN from tan(0) or 1/tan(PI/2)
    if (Math.abs(dy) < 1e-6) { // Horizontal
        y1 = sourceNodeCenter.y; y2 = targetNodeCenter.y;
        x1 = sourceNodeCenter.x + (sourceWidth / 2) * Math.sign(dx);
        x2 = targetNodeCenter.x - (targetWidth / 2) * Math.sign(dx);
    } else if (Math.abs(dx) < 1e-6) { // Vertical
        x1 = sourceNodeCenter.x; x2 = targetNodeCenter.x;
        y1 = sourceNodeCenter.y + (sourceHeight / 2) * Math.sign(dy);
        y2 = targetNodeCenter.y - (targetHeight / 2) * Math.sign(dy);
    }
  
    return { x1, y1, x2, y2 };
  };
  
  const isPrerequisiteMetForNode = (nodeDef: SkillNodeDefinition): boolean => {
    if (!nodeDef.prerequisites || nodeDef.prerequisites.length === 0) return true;
    return nodeDef.prerequisites.every(prereq =>
      (heroState.skillLevels[prereq.skillId] || 0) >= prereq.level
    );
  };

  const handleNodeClick = (skillId: string) => {
    setExpandedSkillId(prevId => prevId === skillId ? null : skillId); 
  };

  const handleUpgradePrimary = (skillNodeId: string, specialAttackId?: string) => {
    const actionType = specialAttackId ? 'LEARN_UPGRADE_SPECIAL_ATTACK' : 'UPGRADE_SKILL';
    dispatch({
        type: actionType,
        payload: { heroDefinitionId, [specialAttackId ? 'skillNodeId' : 'skillId']: skillNodeId }
    } as any); 
  };


  return (
    <div className="flex w-full bg-slate-800 rounded-lg h-full"> 
      <div ref={scrollableContainerRef} className="flex-grow relative fancy-scrollbar overflow-auto p-4 h-full">
        <div ref={treeContentRef} style={{ width: treeCanvasWidth, height: treeCanvasHeight, position: 'relative', margin: 'auto' }}>
          <svg 
            width={treeCanvasWidth} 
            height={treeCanvasHeight} 
            style={{ position: 'absolute', top: 0, left: 0, zIndex: 0, pointerEvents: 'none' }}
            aria-hidden="true"
          >
            {skillTreeDefinition.nodes.map(node => {
              const targetNodeInfo = getNodePositionAndDimensions(node);
              if (!targetNodeInfo || !node.prerequisites) return null;

              return node.prerequisites.map(prereq => {
                const sourceNodeDef = skillTreeDefinition.nodes.find(n => n.id === prereq.skillId);
                if (!sourceNodeDef) return null;
                const sourceNodeInfo = getNodePositionAndDimensions(sourceNodeDef);
                if (!sourceNodeInfo) return null;

                const isMet = (heroState.skillLevels[prereq.skillId] || 0) >= prereq.level;
                
                const sourceCenter = { x: sourceNodeInfo.x, y: sourceNodeInfo.y }; 
                const targetCenter = { x: targetNodeInfo.x, y: targetNodeInfo.y }; 

                const { x1, y1, x2, y2 } = getEdgeCoordinates(sourceCenter, targetCenter);
                
                const dx = x2 - x1;
                const dy = y2 - y1;

                const lineStroke = isMet ? 'rgba(59, 130, 246, 0.9)' : 'rgba(100, 116, 139, 0.4)';
                const lineStrokeWidth = isMet ? "3" : "2";
                const lineStrokeDasharray = isMet ? 'none' : '4,4';
                const lineClass = isMet ? "skill-tree-line line-active-flow" : "skill-tree-line";


                if (Math.abs(dx) > 5 && Math.abs(dy) > 5) { 
                    const midX = (x1 + x2) / 2;
                    const midY = (y1 + y2) / 2;
                    const length = Math.sqrt(dx * dx + dy * dy);
                    
                    let curveFactorAdjusted = CURVE_FACTOR_SKILL_TREE;
                    // Adjust curve for nearly horizontal/vertical lines to prevent extreme bowing
                    if (Math.abs(dx) > Math.abs(dy) * 3) curveFactorAdjusted *= 0.3;
                    else if (Math.abs(dy) > Math.abs(dx) * 3) curveFactorAdjusted *= 0.3;

                    const controlX = midX - (dy / length) * curveFactorAdjusted; 
                    const controlY = midY + (dx / length) * curveFactorAdjusted;
                    
                    return (
                        <path
                            key={`${sourceNodeDef.id}-${node.id}-path`}
                            d={`M ${x1} ${y1} Q ${controlX} ${controlY} ${x2} ${y2}`}
                            stroke={lineStroke}
                            strokeWidth={lineStrokeWidth}
                            strokeDasharray={lineStrokeDasharray}
                            fill="none"
                            className={lineClass}
                        />
                    );
                } else { 
                    return (
                        <line
                            key={`${sourceNodeDef.id}-${node.id}-line`}
                            x1={x1} y1={y1}
                            x2={x2} y2={y2}
                            stroke={lineStroke}
                            strokeWidth={lineStrokeWidth}
                            strokeDasharray={lineStrokeDasharray}
                            className={lineClass}
                        />
                    );
                }
              });
            })}
          </svg>

          {skillTreeDefinition.nodes.map(nodeDef => {
            const posInfo = getNodePositionAndDimensions(nodeDef);
            if (!posInfo) return null;
            const isExpandedNode = expandedSkillId === nodeDef.id;
            return (
              <div
                key={nodeDef.id}
                id={`hero-skill-node-${nodeDef.id}`} 
                style={{
                  position: 'absolute',
                  top: `${posInfo.top}px`,
                  left: `${posInfo.left}px`,
                  width: `${posInfo.width}px`,
                  minHeight: `${posInfo.height}px`, 
                  height: isExpandedNode ? 'auto' : `${posInfo.height}px`,
                  zIndex: isExpandedNode ? 20 : 10, 
                }}
              >
                <GenericSkillNode
                  skillDefinition={nodeDef}
                  skillType="hero"
                  heroDefinitionId={heroDefinitionId}
                  currentLevel={heroState.skillLevels[nodeDef.id] || heroState.specialAttackLevels[nodeDef.specialAttackId || ''] || 0}
                  primaryUpgradePoints={heroState.skillPoints}
                  secondaryUpgradeResourcePool={gameState.resources}
                  onUpgradePrimary={handleUpgradePrimary}
                  onClick={() => handleNodeClick(nodeDef.id)}
                  isExpanded={isExpandedNode}
                  isPrerequisiteMet={isPrerequisiteMetForNode(nodeDef)}
                  expandedNodeWidth={EXPANDED_NODE_WIDTH_HERO}
                  expandedNodeHeight={EXPANDED_NODE_HEIGHT_HERO}
                  nodeIdForLayout={`hero-skill-node-${nodeDef.id}`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SkillTreeView;

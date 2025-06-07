
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
const CURVE_FACTOR_SKILL_TREE = 30; // For curving diagonal lines

const SkillTreeView: React.FC<SkillTreeViewProps> = ({ heroDefinitionId, skillTreeDefinition }) => {
  const { gameState, dispatch, staticData } = useGameContext();
  const heroState = gameState.heroes.find(h => h.definitionId === heroDefinitionId);
  const [expandedSkillId, setExpandedSkillId] = useState<string | null>(null);
  const scrollableContainerRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if (expandedSkillId && scrollableContainerRef.current) {
      const expandedNodeElement = document.getElementById(`hero-skill-node-${expandedSkillId}`);
      if (expandedNodeElement && scrollableContainerRef.current) {
        const container = scrollableContainerRef.current;
        const containerRect = container.getBoundingClientRect();
        const nodeRect = expandedNodeElement.getBoundingClientRect();

        const scrollTop = container.scrollTop;
        const scrollLeft = container.scrollLeft;
        
        const nodeTopInContainer = nodeRect.top - containerRect.top + scrollTop;
        const nodeLeftInContainer = nodeRect.left - containerRect.left + scrollLeft;

        const targetScrollTop = nodeTopInContainer - (containerRect.height / 2) + (nodeRect.height / 2);
        const targetScrollLeft = nodeLeftInContainer - (containerRect.width / 2) + (nodeRect.width / 2);
        
        container.scrollTo({
          top: Math.max(0, targetScrollTop),
          left: Math.max(0, targetScrollLeft),
          behavior: 'smooth',
        });
      }
    }
  }, [expandedSkillId]);


  if (!heroState) return <p>Hero data not found.</p>;

  let maxX = 0;
  let maxY = 0;
  skillTreeDefinition.nodes.forEach(node => {
    if (node.position) {
      maxX = Math.max(maxX, node.position.x);
      maxY = Math.max(maxY, node.position.y);
    }
  });

  const treeCanvasWidth = (maxX + 1) * (COMPACT_NODE_WIDTH + GRID_GAP_X) + EXPANDED_NODE_WIDTH_HERO; // Add padding for expanded nodes
  const treeCanvasHeight = (maxY + 1) * (COMPACT_NODE_HEIGHT + GRID_GAP_Y) + EXPANDED_NODE_HEIGHT_HERO; // Add padding

  const getNodePositionAndDimensions = (node: SkillNodeDefinition): { x: number, y: number, top: number, left: number, width: number, height: number } => {
    const isExpandedNode = expandedSkillId === node.id;
    const currentWidth = isExpandedNode ? EXPANDED_NODE_WIDTH_HERO : COMPACT_NODE_WIDTH;
    const currentHeight = isExpandedNode ? EXPANDED_NODE_HEIGHT_HERO : COMPACT_NODE_HEIGHT;

    if (!node.position) return { x: 0, y: 0, top: 0, left: 0, width: currentWidth, height: currentHeight };
    
    // Add a fixed offset to center the tree content within the larger canvas
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
    targetNodeCenter: { x: number; y: number }
  ): { x1: number; y1: number; x2: number; y2: number } => {
    const dx = targetNodeCenter.x - sourceNodeCenter.x;
    const dy = targetNodeCenter.y - sourceNodeCenter.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist === 0) return { x1: sourceNodeCenter.x, y1: sourceNodeCenter.y, x2: targetNodeCenter.x, y2: targetNodeCenter.y };

    const halfWidth = COMPACT_NODE_WIDTH / 2;
    const halfHeight = COMPACT_NODE_HEIGHT / 2;
    
    let t1 = 0, t2 = dist;
    // Calculate intersection times for source and target assuming line from center to center
    const ndx = dx / dist;
    const ndy = dy / dist;

    if (Math.abs(ndx) > 1e-6) t1 = Math.max(t1, halfWidth / Math.abs(ndx));
    if (Math.abs(ndy) > 1e-6) t1 = Math.max(t1, halfHeight / Math.abs(ndy));
    
    // This is tricky. The correct way is to find intersection of ray with rectangle.
    // Simplified approach:
    let x1 = sourceNodeCenter.x;
    let y1 = sourceNodeCenter.y;
    let x2 = targetNodeCenter.x;
    let y2 = targetNodeCenter.y;

    // Angle of the line
    const angle = Math.atan2(dy, dx);

    // Source point on edge
    if (Math.abs(Math.cos(angle) * halfHeight) > Math.abs(Math.sin(angle) * halfWidth)) { // Intersects left/right
        x1 = sourceNodeCenter.x + halfWidth * Math.sign(Math.cos(angle));
        y1 = sourceNodeCenter.y + halfWidth * Math.tan(angle) * Math.sign(Math.cos(angle));
    } else { // Intersects top/bottom
        y1 = sourceNodeCenter.y + halfHeight * Math.sign(Math.sin(angle));
        x1 = sourceNodeCenter.x + halfHeight / Math.tan(angle) * Math.sign(Math.sin(angle));
    }
    // Target point on edge
    if (Math.abs(Math.cos(angle) * halfHeight) > Math.abs(Math.sin(angle) * halfWidth)) {
        x2 = targetNodeCenter.x - halfWidth * Math.sign(Math.cos(angle));
        y2 = targetNodeCenter.y - halfWidth * Math.tan(angle) * Math.sign(Math.cos(angle));
    } else {
        y2 = targetNodeCenter.y - halfHeight * Math.sign(Math.sin(angle));
        x2 = targetNodeCenter.x - halfHeight / Math.tan(angle) * Math.sign(Math.sin(angle));
    }
    // Fallback for pure horizontal/vertical to avoid NaN from tan(0) or tan(PI/2) issues
    if (Math.abs(dy) < 1e-6) { // Horizontal
        y1 = sourceNodeCenter.y; y2 = targetNodeCenter.y;
        x1 = sourceNodeCenter.x + halfWidth * Math.sign(dx);
        x2 = targetNodeCenter.x - halfWidth * Math.sign(dx);
    } else if (Math.abs(dx) < 1e-6) { // Vertical
        x1 = sourceNodeCenter.x; x2 = targetNodeCenter.x;
        y1 = sourceNodeCenter.y + halfHeight * Math.sign(dy);
        y2 = targetNodeCenter.y - halfHeight * Math.sign(dy);
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
        <div style={{ width: treeCanvasWidth, height: treeCanvasHeight, position: 'relative', margin: 'auto' }}>
          <svg 
            width={treeCanvasWidth} 
            height={treeCanvasHeight} 
            style={{ position: 'absolute', top: 0, left: 0, zIndex: 0, pointerEvents: 'none' }}
            aria-hidden="true"
          >
            {skillTreeDefinition.nodes.map(node => {
              const sourceNodeInfo = getNodePositionAndDimensions(node);
              if (!sourceNodeInfo || !node.prerequisites) return null;

              return node.prerequisites.map(prereq => {
                const targetNodeDef = skillTreeDefinition.nodes.find(n => n.id === prereq.skillId);
                if (!targetNodeDef) return null;
                const targetNodeInfo = getNodePositionAndDimensions(targetNodeDef);
                if (!targetNodeInfo) return null;

                const prerequisiteFulfilled = isPrerequisiteMetForNode(node);
                
                const sourceCenter = { x: targetNodeInfo.x, y: targetNodeInfo.y }; 
                const targetCenter = { x: sourceNodeInfo.x, y: sourceNodeInfo.y }; 

                const { x1, y1, x2, y2 } = getEdgeCoordinates(sourceCenter, targetCenter);
                
                const dx = x2 - x1;
                const dy = y2 - y1;

                const lineStroke = prerequisiteFulfilled ? 'rgba(59, 130, 246, 0.9)' : 'rgba(100, 116, 139, 0.4)';
                const lineStrokeWidth = prerequisiteFulfilled ? "3" : "2";
                const lineStrokeDasharray = prerequisiteFulfilled ? 'none' : '4,4';

                if (dx !== 0 && dy !== 0) { 
                    const midX = (x1 + x2) / 2;
                    const midY = (y1 + y2) / 2;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    let curveFactor = CURVE_FACTOR_SKILL_TREE;
                    if (Math.abs(dx) > Math.abs(dy) * 2.5 || Math.abs(dy) > Math.abs(dx) * 2.5) {
                        curveFactor *= 0.5;
                    }
                    // Perpendicular offset
                    const controlX = midX - (dy / dist) * curveFactor; 
                    const controlY = midY + (dx / dist) * curveFactor;
                    
                    return (
                        <path
                            key={`${targetNodeDef.id}-${node.id}-path`}
                            d={`M ${x1} ${y1} Q ${controlX} ${controlY} ${x2} ${y2}`}
                            stroke={lineStroke}
                            strokeWidth={lineStrokeWidth}
                            strokeDasharray={lineStrokeDasharray}
                            fill="none"
                            className="skill-tree-line"
                        />
                    );
                } else { 
                    return (
                        <line
                            key={`${targetNodeDef.id}-${node.id}-line`}
                            x1={x1} y1={y1}
                            x2={x2} y2={y2}
                            stroke={lineStroke}
                            strokeWidth={lineStrokeWidth}
                            strokeDasharray={lineStrokeDasharray}
                            className="skill-tree-line"
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
                  transition: 'all 0.3s ease-in-out', 
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
                  nodeIdForLayout={nodeDef.id} 
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


import React, { useState, useMemo } from 'react';
import { useGameContext } from '../context';
import { SkillTreeDefinition, SkillNodeDefinition, ResourceType, GameState } from '../types';
import GenericSkillNode from './GenericSkillNode'; // New Import
import { formatNumber } from '../utils';

interface SkillTreeViewProps {
  heroDefinitionId: string;
  skillTreeDefinition: SkillTreeDefinition;
}

const COMPACT_NODE_WIDTH = 80;
const COMPACT_NODE_HEIGHT = 90; // Adjusted to better fit typical compact node content
const GRID_GAP_X = 40;
const GRID_GAP_Y = 30;
const EXPANDED_NODE_WIDTH_HERO = 320; // Specific for hero skill tree
const EXPANDED_NODE_HEIGHT_HERO = 300; // Min height for expanded hero skill node

const SkillTreeView: React.FC<SkillTreeViewProps> = ({ heroDefinitionId, skillTreeDefinition }) => {
  const { gameState, dispatch, staticData } = useGameContext();
  const heroState = gameState.heroes.find(h => h.definitionId === heroDefinitionId);
  const [expandedSkillId, setExpandedSkillId] = useState<string | null>(null);

  if (!heroState) return <p>Hero data not found.</p>;

  let maxX = 0;
  let maxY = 0;
  skillTreeDefinition.nodes.forEach(node => {
    if (node.position) {
      maxX = Math.max(maxX, node.position.x);
      maxY = Math.max(maxY, node.position.y);
    }
  });

  const treeCanvasWidth = (maxX + 1) * (COMPACT_NODE_WIDTH + GRID_GAP_X);
  const treeCanvasHeight = (maxY + 1) * (COMPACT_NODE_HEIGHT + GRID_GAP_Y);

  const getNodePositionAndDimensions = (node: SkillNodeDefinition): { x: number, y: number, top: number, left: number, width: number, height: number } => {
    const isExpandedNode = expandedSkillId === node.id;
    const currentWidth = isExpandedNode ? EXPANDED_NODE_WIDTH_HERO : COMPACT_NODE_WIDTH;
    const currentHeight = isExpandedNode ? EXPANDED_NODE_HEIGHT_HERO : COMPACT_NODE_HEIGHT;

    if (!node.position) return { x: 0, y: 0, top: 0, left: 0, width: currentWidth, height: currentHeight };
    
    const gridTop = node.position.y * (COMPACT_NODE_HEIGHT + GRID_GAP_Y);
    const gridLeft = node.position.x * (COMPACT_NODE_WIDTH + GRID_GAP_X);
    
    let displayTop = gridTop;
    let displayLeft = gridLeft;

    // If expanded, adjust top/left to center the expanded node over its grid position
    if (isExpandedNode) {
      displayTop = gridTop - (EXPANDED_NODE_HEIGHT_HERO - COMPACT_NODE_HEIGHT) / 2;
      displayLeft = gridLeft - (EXPANDED_NODE_WIDTH_HERO - COMPACT_NODE_WIDTH) / 2;
    }
    
    // Center for line drawing (always based on compact center)
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
    sourceNodePos: { x: number; y: number }, // Center of compact source
    targetNodePos: { x: number; y: number }  // Center of compact target
  ): { x1: number; y1: number; x2: number; y2: number } => {
    const dx = targetNodePos.x - sourceNodePos.x;
    const dy = targetNodePos.y - sourceNodePos.y;

    let x1 = sourceNodePos.x;
    let y1 = sourceNodePos.y;
    let x2 = targetNodePos.x;
    let y2 = targetNodePos.y;

    // Calculate intersection with compact node bounds
    if (Math.abs(dx) * COMPACT_NODE_HEIGHT > Math.abs(dy) * COMPACT_NODE_WIDTH) { 
      if (dx > 0) { 
        x1 += COMPACT_NODE_WIDTH / 2;
        x2 -= COMPACT_NODE_WIDTH / 2;
      } else { 
        x1 -= COMPACT_NODE_WIDTH / 2;
        x2 += COMPACT_NODE_WIDTH / 2;
      }
    } else if (Math.abs(dy) * COMPACT_NODE_WIDTH > Math.abs(dx) * COMPACT_NODE_HEIGHT ) { // Added check to prevent division by zero or NaN if dy is 0
      if (dy > 0) { 
        y1 += COMPACT_NODE_HEIGHT / 2;
        y2 -= COMPACT_NODE_HEIGHT / 2;
      } else { 
        y1 -= COMPACT_NODE_HEIGHT / 2;
        y2 += COMPACT_NODE_HEIGHT / 2;
      }
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
    } as any); // Type assertion as payload varies
  };


  return (
    <div className="flex w-full bg-slate-800 rounded-lg"> 
      <div className="flex-grow relative fancy-scrollbar overflow-auto p-4">
        <div style={{ width: treeCanvasWidth + EXPANDED_NODE_WIDTH_HERO, height: treeCanvasHeight + EXPANDED_NODE_HEIGHT_HERO, position: 'relative', margin: 'auto' }}>
          <svg 
            width={treeCanvasWidth + EXPANDED_NODE_WIDTH_HERO} 
            height={treeCanvasHeight + EXPANDED_NODE_HEIGHT_HERO} 
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
                const { x1, y1, x2, y2 } = getEdgeCoordinates(
                  {x: targetNodeInfo.x, y: targetNodeInfo.y}, 
                  {x: sourceNodeInfo.x, y: sourceNodeInfo.y}  
                );
                
                return (
                  <line
                    key={`${targetNodeDef.id}-${node.id}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    className="skill-tree-line"
                    stroke={prerequisiteFulfilled ? 'rgba(59, 130, 246, 0.9)' : 'rgba(100, 116, 139, 0.4)'} 
                    strokeWidth={prerequisiteFulfilled ? "3" : "2"} // Adjusted for better visibility
                    strokeDasharray={prerequisiteFulfilled ? 'none' : '4,4'}
                  />
                );
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
                style={{
                  position: 'absolute',
                  top: `${posInfo.top}px`,
                  left: `${posInfo.left}px`,
                  width: `${posInfo.width}px`,
                  minHeight: `${posInfo.height}px`, // Use minHeight for expanded
                  height: isExpandedNode ? 'auto' : `${posInfo.height}px`,
                  zIndex: isExpandedNode ? 20 : 10, // Expanded nodes on top
                  transition: 'all 0.3s ease-in-out', // Smooth transition for size and position
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
                  // onUpgradeSecondary is not applicable for hero skills
                  onClick={() => handleNodeClick(nodeDef.id)}
                  isExpanded={isExpandedNode}
                  isPrerequisiteMet={isPrerequisiteMetForNode(nodeDef)}
                  expandedNodeWidth={EXPANDED_NODE_WIDTH_HERO}
                  expandedNodeHeight={EXPANDED_NODE_HEIGHT_HERO}
                  nodeIdForLayout={nodeDef.id} // For GenericSkillNode internal use if needed
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


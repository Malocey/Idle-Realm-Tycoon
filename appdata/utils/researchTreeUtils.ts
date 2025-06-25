import { Node, Edge } from 'reactflow';
import { ResearchDefinition, ResearchNodeStatus, PlayerResearchState, Cost, ResearchProgress, CompletedResearchEntry, ResearchCategory } from '../types';

const determineNodeStatus = (
  definition: ResearchDefinition,
  playerResearchState: PlayerResearchState
): ResearchNodeStatus => {
  const completedLevel = playerResearchState.completedResearch[definition.id]?.level || 0;

  const isResearchingThisExactNextLevel = Object.values(playerResearchState.researchProgress).some(
    p => p.researchId === definition.id && p.levelBeingResearched === completedLevel + 1
  );

  if (isResearchingThisExactNextLevel) {
    return ResearchNodeStatus.RESEARCHING;
  }

  if (definition.maxLevel !== -1 && completedLevel >= definition.maxLevel) {
    return ResearchNodeStatus.COMPLETED;
  }

  // Check prerequisites for the *first level* of this research node
  const prerequisitesForBaseMet = definition.prerequisites.every(prereq =>
    (playerResearchState.completedResearch[prereq.researchId]?.level || 0) >= prereq.level
  );

  if (prerequisitesForBaseMet) {
    // If base prerequisites are met, and it's not maxed out, it's available for the next level (or level 1 if currentLevel is 0)
    if (definition.maxLevel === -1 || completedLevel < definition.maxLevel) {
        return ResearchNodeStatus.AVAILABLE;
    } else {
        // Should have been caught by the maxLevel check earlier, but as a fallback:
        return ResearchNodeStatus.COMPLETED;
    }
  }

  return ResearchNodeStatus.LOCKED;
};

export const transformResearchToFlowData = (
  researchDefinitions: ResearchDefinition[],
  playerResearchState: PlayerResearchState
): { nodes: Node[]; edges: Edge[] } => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  researchDefinitions.forEach(definition => {
    if (!definition.position) {
      console.warn(`Research definition ${definition.id} is missing position data and will be skipped.`);
      return;
    }

    const currentLevel = playerResearchState.completedResearch[definition.id]?.level || 0;
    const status = determineNodeStatus(definition, playerResearchState);
    
    let costForNode: Cost[] = [];
    if (status === ResearchNodeStatus.AVAILABLE || status === ResearchNodeStatus.RESEARCHING) {
        if (currentLevel < definition.maxLevel || definition.maxLevel === -1) {
            costForNode = definition.costPerLevel(currentLevel + 1);
        }
    } else if (status === ResearchNodeStatus.LOCKED) {
        costForNode = definition.costPerLevel(1); // Show cost for Lvl 1 if locked
    }


    nodes.push({
      id: definition.id,
      position: definition.position,
      type: 'stellarisResearchNode', // Custom node type
      data: {
        id: definition.id, // Pass id for the custom node
        name: definition.name,
        description: definition.description, // The description in definition might be a function
        cost: costForNode,
        iconName: definition.iconName,
        category: definition.category,
        status,
        currentLevel,
        maxLevel: definition.maxLevel,
        // Pass the full definition to the node for more flexibility in rendering
        definition: definition,
        playerResearchState: playerResearchState, // Pass research state for detailed display/actions
      },
    });

    definition.prerequisites.forEach(prereq => {
      // Ensure the source node of the prerequisite exists before creating an edge
      if (researchDefinitions.find(def => def.id === prereq.researchId)) {
        edges.push({
          id: `e-${prereq.researchId}-${definition.id}`,
          source: prereq.researchId,
          target: definition.id,
          animated: true,
          type: 'smoothstep',
        });
      }
    });
  });

  return { nodes, edges };
};

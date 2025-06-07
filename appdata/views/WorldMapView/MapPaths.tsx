
import React, { useMemo } from 'react';
import { MapNode } from '../../types';

const PATH_STROKE_WIDTH = 1.5;
const CURVE_FACTOR = 30; // From original WorldMapView

interface MapPathsProps {
  currentMapNodes: MapNode[];
  revealedMapNodeIds: string[];
}

const MapPaths: React.FC<MapPathsProps> = ({ currentMapNodes, revealedMapNodeIds }) => {
  const paths = useMemo(() => {
    const drawnConnections = new Set<string>();
    return currentMapNodes.flatMap(sourceNode => {
      if (!revealedMapNodeIds.includes(sourceNode.id)) return [];
      return sourceNode.connections.map(targetNodeId => {
        if (!revealedMapNodeIds.includes(targetNodeId)) return null;

        const targetNode = currentMapNodes.find(n => n.id === targetNodeId);
        if (!targetNode) return null;

        const nodeA = sourceNode.id < targetNode.id ? sourceNode : targetNode;
        const nodeB = sourceNode.id < targetNode.id ? targetNode : sourceNode;
        const connectionKey = `${nodeA.id}-${nodeB.id}`;

        if (drawnConnections.has(connectionKey)) return null;
        drawnConnections.add(connectionKey);

        const x1 = nodeA.x; const y1 = nodeA.y;
        const x2 = nodeB.x; const y2 = nodeB.y;

        const mx = (x1 + x2) / 2; const my = (y1 + y2) / 2;
        const dx = x2 - x1; const dy = y2 - y1;
        const length = Math.sqrt(dx * dx + dy * dy);
        if (length === 0) return null;
        const perpX = -dy / length; const perpY = dx / length;

        const curveFactorBase = length * 0.1;
        const curveDirection = (nodeA.id.localeCompare(nodeB.id) % 2 === 0) ? 1 : -1;
        const curveFactor = curveDirection * curveFactorBase;

        const cx = mx + perpX * curveFactor;
        const cy = my + perpY * curveFactor;

        return { id: `path-${connectionKey}`, d: `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}` };
      }).filter(Boolean);
    });
  }, [currentMapNodes, revealedMapNodeIds]);

  return (
    <>
      <defs>
        <filter id="path-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="0.2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {paths.map(path => (
        path && <path
          id={path.id}
          key={path.id}
          d={path.d}
          stroke="rgba(101, 67, 33, 0.7)"
          strokeWidth={PATH_STROKE_WIDTH}
          fill="none"
          strokeDasharray="2 1.5"
          className="transition-all duration-300"
          filter="url(#path-glow)"
        />
      ))}
    </>
  );
};

export default MapPaths;

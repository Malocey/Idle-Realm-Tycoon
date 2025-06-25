import React from 'react';
import ReactFlow from 'reactflow';

export const ResearchTreeView: React.FC = () => {
  return (
    <div style={{ width: '100%', height: '100vh' }} className="bg-slate-800">
      <ReactFlow
        nodes={[]} // We will provide real data later
        edges={[]} // We will provide real data later
        fitView // This utility function centers the view initially
      >
        {/* Background and Minimap could be added here later */}
      </ReactFlow>
    </div>
  );
};

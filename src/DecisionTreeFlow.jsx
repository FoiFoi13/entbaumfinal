import React from 'react';
import ReactFlow, { Background } from 'reactflow';
import 'reactflow/dist/style.css';
import CustomEdge from './CustomEdge';

// KORREKTUR: Definition außerhalb der Komponente.
// Das behebt die React Flow Warnung "[React Flow]: It looks like you've created a new ... object."
const edgeTypes = {
  custom: CustomEdge,
};

function DecisionTreeFlow({ nodes, edges }) {
  return (
    <div style={{ height: '800px', width: '100%', border: '1px solid #E0E0E0', background: '#f8f9fa' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        edgeTypes={edgeTypes} // Hier wird das memoized Objekt übergeben
        fitView
        fitViewOptions={{ padding: 0.2 }} // Etwas mehr padding für eine bessere Ansicht
        nodesDraggable={false}
        nodesConnectable={false}
      >
        <Background />
      </ReactFlow>
    </div>
  );
}

export default DecisionTreeFlow;
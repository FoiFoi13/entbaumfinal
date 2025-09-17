// src/DecisionTreeFlow.js

import React, { useEffect } from 'react';
import ReactFlow, { Background, Controls, useReactFlow, useNodes } from 'reactflow';
import 'reactflow/dist/style.css';

// Diese Wrapper-Komponente enthält die Zoom-Logik
const FlowWithLogic = ({ pathTaken }) => {
  const { fitView } = useReactFlow();
  const nodes = useNodes();

  useEffect(() => {
    if (nodes.length > 0 && pathTaken && pathTaken.length > 0) {
      // Finde den letzten Knoten im Pfad (das Ergebnis)
      const lastNodeId = pathTaken[pathTaken.length - 1];
      
      // Zoome mit einer Animation auf diesen letzten Knoten
      fitView({
        nodes: [{ id: lastNodeId }],
        // HIER IST DIE ÄNDERUNG: Dauer von 800 auf 2500 erhöht
        duration: 5000, // Animationsdauer in ms (2,5 Sekunden)
        maxZoom: 1.2,   // Nicht zu nah heranzoomen
        padding: 0.2
      });
    }
  }, [nodes, pathTaken, fitView]);

  return (
    <>
      <Background variant="dots" gap={12} size={1} />
      <Controls showInteractive={false} />
    </>
  );
};

const DecisionTreeFlow = ({ nodes, edges, pathTaken }) => {
  // Die onNodeClick-Prop wird hier nicht mehr direkt verwendet,
  // aber wir behalten sie für den Fall, dass du sie später brauchst.
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodesDraggable={false}
      panOnDrag={[0, 1, 2]}
      zoomOnPinch={true}
      zoomOnScroll={false}
      proOptions={{ hideAttribution: true }}
    >
      <FlowWithLogic pathTaken={pathTaken} />
    </ReactFlow>
  );
};

export default DecisionTreeFlow;
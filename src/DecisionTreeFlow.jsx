// DecisionTreeFlow.js

import React from 'react';
import ReactFlow, { Background } from 'reactflow';
import 'reactflow/dist/style.css';

// Wir definieren einen leeren Edge-Typ, falls du später benutzerdefinierte Kanten benötigst.
const edgeTypes = {
  // custom: CustomEdge, // Beispiel für eine benutzerdefinierte Kante
};

const DecisionTreeFlow = ({ nodes, edges, onNodeClick }) => {
  return (
    <div style={{ height: '100%', width: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodeClick={(_, node) => onNodeClick(node.id)}
        edgeTypes={edgeTypes}
        // Passt den Graphen automatisch an die Bildschirmgröße an
        fitView
        // Deaktiviert das Scrollrad-Zoomen, was auf dem Handy oft stört
        zoomOnScroll={false}
        // Verhindert versehentliches Verschieben beim Scrollen auf der Seite
        panOnScroll={false}
        // Erlaubt das Zoomen mit zwei Fingern
        zoomOnPinch={true}
        // Versteckt das "React Flow"-Branding, um Platz zu sparen
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={16} color="#e0e0e0" />
      </ReactFlow>
    </div>
  );
};

export default DecisionTreeFlow;
import ReactFlow, { MiniMap, Controls, Background } from 'reactflow';
import 'reactflow/dist/style.css';

function DecisionTreeFlow({ nodes, edges }) {
  return (
    <div style={{ height: '500px', width: '100%', border: '1px solid black', marginTop: '20px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
      >
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}

export default DecisionTreeFlow;

import ReactFlow, { Background } from 'reactflow';
import 'reactflow/dist/style.css';

function DecisionTreeFlow({ nodes, edges }) {
  return (
    <div style={{ height: '1500px', width: '100%', border: '1px solid #E0E0E0' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        fitViewOptions={{ padding: 0.1 }}
      >
        <Background />
      </ReactFlow>
    </div>
  );
}

export default DecisionTreeFlow;

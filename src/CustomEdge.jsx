import React from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from 'reactflow';

// Diese Komponente rendert eine Kante mit einer benutzerdefinierten Beschriftung,
// die einen Hintergrund hat und den Text umbricht.
export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  markerEnd,
}) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            background: '#f0f0f0',
            padding: '4px 8px',
            borderRadius: '5px',
            fontSize: '11px',
            fontWeight: 500,
            color: '#333',
            textAlign: 'center',
            maxWidth: '150px', // Wichtig: Begrenzt die Breite und erzwingt den Umbruch
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          {data.label}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
import React, { useState, useEffect, useCallback, useRef } from 'react';
// Import html5-qrcode
import { Html5QrcodeScanner } from 'html5-qrcode';
// Import Leaflet CSS directly
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// --- Leaflet Icon Fix ---
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

import DecisionTreeFlow from './DecisionTreeFlow';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});
// --- End Leaflet Icon Fix ---

// --- Decision Tree Data ---
const decisionTree = {
  start: {
    id: 'start',
    question: 'Willkommen zur Umwelt-Rallye Oldenburg! Möchtest du mehr über Bäume oder Müllvermeidung lernen?',
    flowLabel: 'Start: Thema wählen',
    isEnd: false,
    location: null,
    qrCode: null,
    answers: [
      { text: 'Bäume!', nextNodeId: 'trees_1' },
      { text: 'Müllvermeidung!', nextNodeId: 'waste_1' },
    ],
    resultText: null,
  },
  trees_1: {
    id: 'trees_1',
    question: 'Super! Gehe zum Alten Stadthafen. Dort gibt es ein Projekt zur Uferbepflanzung. Finde den QR-Code am Info-Schild.',
    flowLabel: 'Bäume: Stadthafen',
    isEnd: false,
    location: { name: 'Alter Stadthafen (Uferbepflanzung)', coords: [53.1484, 8.2145] },
    qrCode: 'QR_STADTHAFEN_TREES',
    answers: null,
    resultText: null,
    nextNodeOnScan: 'trees_2'
  },
  waste_1: {
    id: 'waste_1',
    question: 'Interessant! Besuche den Unverpacktladen in der Innenstadt. Dort lernst du, wie man Verpackungsmüll reduziert. Finde den QR-Code im Schaufenster.',
    flowLabel: 'Müll: Unverpacktladen',
    isEnd: false,
    location: { name: 'Unverpacktladen', coords: [53.1435, 8.214] },
    qrCode: 'QR_UNVERPACKT_WASTE',
    answers: null,
    resultText: null,
    nextNodeOnScan: 'waste_2'
  },
  trees_2: {
    id: 'trees_2',
    question: 'Gut gemacht! Diese Bäume helfen, die Luftqualität zu verbessern. Möchtest du nun etwas über Stadtgärten oder Insektenhotels erfahren?',
    flowLabel: 'Bäume: Nächste Wahl',
    isEnd: false,
    location: null,
    qrCode: null,
    answers: [
        { text: 'Stadtgärten', nextNodeId: 'trees_end_garden' },
        { text: 'Insektenhotels', nextNodeId: 'trees_end_insects' },
    ],
    resultText: null,
  },
  waste_2: {
    id: 'waste_2',
    question: 'Klasse! Unverpackt einkaufen ist ein wichtiger Schritt. Willst du als Nächstes mehr über Recycling oder Kompostierung lernen?',
    flowLabel: 'Müll: Nächste Wahl',
    isEnd: false,
    location: null,
    qrCode: null,
    answers: [
        { text: 'Recycling', nextNodeId: 'waste_end_recycling' },
        { text: 'Kompostierung', nextNodeId: 'waste_end_compost' },
    ],
    resultText: null,
  },
  trees_end_garden: {
    id: 'trees_end_garden',
    question: null,
    flowLabel: 'Ziel: Stadtgärten',
    isEnd: true,
    location: null,
    qrCode: null,
    answers: null,
    resultText: 'Super! Du hast den Pfad "Bäume -> Stadtgärten" gewählt. Stadtgärten bringen Grün in die Stadt und fördern die Gemeinschaft.',
  },
  trees_end_insects: {
    id: 'trees_end_insects',
    question: null,
    flowLabel: 'Ziel: Insektenhotels',
    isEnd: true,
    location: null,
    qrCode: null,
    answers: null,
    resultText: 'Toll! Du hast den Pfad "Bäume -> Insektenhotels" gewählt. Insektenhotels bieten wichtigen Lebensraum für Nützlinge.',
  },
  waste_end_recycling: {
    id: 'waste_end_recycling',
    question: null,
    flowLabel: 'Ziel: Recycling',
    isEnd: true,
    location: null,
    qrCode: null,
    answers: null,
    resultText: 'Prima! Du hast den Pfad "Müllvermeidung -> Recycling" gewählt. Richtiges Recycling schont Ressourcen.',
  },
  waste_end_compost: {
    id: 'waste_end_compost',
    question: null,
    flowLabel: 'Ziel: Kompostierung',
    isEnd: true,
    location: null,
    qrCode: null,
    answers: null,
    resultText: 'Sehr gut! Du hast den Pfad "Müllvermeidung -> Kompostierung" gewählt. Kompostierung verwandelt Bioabfall in wertvollen Dünger.',
  },
};

// Helper to shorten text for node labels
const shortenText = (text, maxLength = 50) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    const words = text.split(' ');
    let shortText = '';
    for (const word of words) {
        if ((shortText + word).length > maxLength && shortText.length > 0) {
            break;
        }
        shortText += (shortText.length > 0 ? ' ' : '') + word;
    }
    return shortText + (shortText.length < text.length ? '...' : '');
};

// Function to generate React Flow nodes and edges for the *entire* tree,
// highlighting the path taken.
const generateFullFlowData = (pathTaken, treeData) => {
    const nodes = [];
    const edges = [];

    // Simple position mapping for a basic tree layout
    const positions = {
        start: { x: 400, y: 0 },
        trees_1: { x: 200, y: 150 },
        waste_1: { x: 600, y: 150 },
        trees_2: { x: 200, y: 300 },
        waste_2: { x: 600, y: 300 },
        trees_end_garden: { x: 0, y: 450 },
        trees_end_insects: { x: 400, y: 450 },
        waste_end_recycling: { x: 400, y: 450 }, // This might overlap, adjust if needed
        waste_end_compost: { x: 800, y: 450 },
    };

    // Create nodes for the entire tree
    for (const nodeId in treeData) {
        const nodeInfo = treeData[nodeId];
        const label = nodeInfo.flowLabel || nodeInfo.question || nodeId;
        const shortLabel = shortenText(label);

        const isInPath = pathTaken.includes(nodeId);

        nodes.push({
            id: nodeId,
            position: positions[nodeId] || { x: 0, y: 0 }, // Use predefined positions or default
            data: { label: shortLabel },
            type: nodeInfo.isEnd ? 'output' : 'default',
            style: {
                opacity: isInPath ? 1 : 0.3, // Reduce opacity for nodes not in path
                border: isInPath ? '1px solid #1a192b' : '1px dashed #a0a0a0', // Change border for clarity
            }
        });
    }

    // Create edges for the entire tree, highlighting the path taken
    for (const nodeId in treeData) {
        const nodeInfo = treeData[nodeId];

        // Edges from answers
        if (nodeInfo.answers) {
            nodeInfo.answers.forEach(answer => {
                const targetId = answer.nextNodeId;
                const edgeId = `e-${nodeId}-${targetId}`;
                const isEdgeInPath = pathTaken.indexOf(nodeId) !== -1 && pathTaken[pathTaken.indexOf(nodeId) + 1] === targetId;

                 edges.push({
                    id: edgeId,
                    source: nodeId,
                    target: targetId,
                    label: shortenText(answer.text, 15), // Shorten edge label
                    animated: isEdgeInPath, // Animate edges in the path
                    style: {
                        stroke: isEdgeInPath ? '#1a192b' : '#a0a0a0', // Change color for edges not in path
                        opacity: isEdgeInPath ? 1 : 0.3, // Reduce opacity
                    },
                    type: 'default', // Or 'step', 'smoothstep'
                 });
            });
        }

        // Edge from QR scan
        if (nodeInfo.nextNodeOnScan) {
             const targetId = nodeInfo.nextNodeOnScan;
             const edgeId = `e-${nodeId}-${targetId}`;
             const isEdgeInPath = pathTaken.indexOf(nodeId) !== -1 && pathTaken[pathTaken.indexOf(nodeId) + 1] === targetId;

              edges.push({
                id: edgeId,
                source: nodeId,
                target: targetId,
                label: 'QR Scan',
                animated: isEdgeInPath,
                 style: {
                     stroke: isEdgeInPath ? '#1a192b' : '#a0a0a0',
                     opacity: isEdgeInPath ? 1 : 0.3,
                 },
                type: 'default',
              });
        }
    }

    return { nodes, edges };
};

// --- Components defined OUTSIDE App ---

function ChangeMapView({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.setView(coords, 15);
    }
  }, [coords, map]);
  return null;
}

function MapDisplay({ location }) {
  if (!location || !location.coords) {
    return null;
  }

  const position = location.coords;
  const locationName = location.name || 'Nächster Ort';
  const geoUri = `geo:${position[0]},${position[1]}?q=${position[0]},${position[1]}(${encodeURIComponent(locationName)})`;
  const osmUrl = `https://www.openstreetmap.org/directions?to=${position[0]},${position[1]}`;

  return (
    <div
      style={{ height: '256px' }}
      className="w-full rounded-lg overflow-hidden shadow-md my-4 border border-gray-300"
    >
      <MapContainer center={position} zoom={15} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            {locationName}.<br />
            <a href={geoUri} target="_blank" rel="noopener noreferrer" className="leaflet-popup-content a">
              Route hierhin starten (Mobil)
            </a>
            <br />
             <a href={osmUrl} target="_blank" rel="noopener noreferrer" className="leaflet-popup-content a mt-1 inline-block">
              Route auf OpenStreetMap zeigen
            </a>
          </Popup>
        </Marker>
        <ChangeMapView coords={position} />
      </MapContainer>
    </div>
  );
}

// --- MODIFIED QRScanner Component ---
function QRScanner({ expectedCode, onScanSuccess }) {
  const [error, setError] = useState('');
  const scannerRef = useRef(null);
  const readerId = "qr-code-reader";
  const readerContainerRef = useRef(null);

  useEffect(() => {
    let localScannerInstance = null;

    const cleanupScanner = () => {
        const instance = scannerRef.current;
        if (instance) {
            try {
                if (instance.getState && instance.getState() === 2 /* SCANNING */) {
                    instance.clear()
                        .catch(err => console.error("QRScanner: Cleanup - Error clearing scanner (async):", err));
                }
            } catch (err) {
                console.warn("QRScanner: Cleanup - Sync error checking scanner state or clearing:", err);
            }
            scannerRef.current = null;
        }
    };

    if (expectedCode && readerContainerRef.current) {
        cleanupScanner();
        setError('');

        const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            rememberLastUsedCamera: true,
        };

        const successCallback = (decodedText, decodedResult) => {
            if (decodedText === expectedCode) {
                setError('');
                onScanSuccess();
            } else {
                setError(`Falscher QR-Code gescannt. Erwartet: ${expectedCode}, Erhalten: ${decodedText}`);
            }
        };

        const errorCallback = (errorMessage) => { };

        try {
            const html5QrcodeScanner = new Html5QrcodeScanner(readerId, config, false);
            scannerRef.current = html5QrcodeScanner;
            localScannerInstance = html5QrcodeScanner;
            html5QrcodeScanner.render(successCallback, errorCallback);
        } catch (initError) {
             console.error(`QRScanner: Error during scanner init or render call for ${expectedCode}:`, initError);
             setError("Fehler beim Initialisieren des Scanners.");
             if (scannerRef.current === localScannerInstance) {
                scannerRef.current = null;
             }
        }
    } else {
        cleanupScanner();
    }

    return () => {
        cleanupScanner();
    };

  }, [expectedCode, onScanSuccess, readerId]);

  if (!expectedCode) {
    return null;
  }

  return (
    <div className="mt-6 p-4 border border-gray-300 rounded-lg shadow-sm bg-gray-50">
      <h3 className="text-lg font-semibold mb-2 text-gray-700">QR-Code Scan</h3>
      <p className="text-sm text-gray-600 mb-3">Richte deine Kamera auf den QR-Code.</p>
      <div ref={readerContainerRef} id={readerId} style={{ width: '100%', minHeight: '250px' }}></div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}


// --- Main App Component ---
function App() {
  const [currentNodeId, setCurrentNodeId] = useState('start');
  const [pathTaken, setPathTaken] = useState(['start']);
  const [message, setMessage] = useState('');
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
     if (!gameStarted) {
         setCurrentNodeId('start');
         setPathTaken(['start']);
         setMessage('');
     }
  }, [gameStarted]);

  const currentNode = decisionTree[currentNodeId];

  const handleAnswer = (nextNodeId) => {
    setMessage('');
    const nextNode = decisionTree[nextNodeId];
    if (nextNode) {
      setCurrentNodeId(nextNodeId);
      setPathTaken(prevPath => [...prevPath, nextNodeId]);
    } else {
      setMessage('Ein Fehler ist aufgetreten. Node nicht gefunden.');
    }
  };

   const handleScanSuccess = useCallback(() => {
      const current = decisionTree[currentNodeId];
      if (!current) {
          setMessage('Fehler: Interner Statusfehler nach Scan.');
          return;
      }
      setMessage('QR-Code erfolgreich gescannt! Lade nächsten Schritt...');
      const nextNodeId = current.nextNodeOnScan;

      if (nextNodeId && decisionTree[nextNodeId]) {
          requestAnimationFrame(() => {
              setCurrentNodeId(nextNodeId);
              setPathTaken(prevPath => [...prevPath, nextNodeId]);
              setMessage('');
          });
      } else {
          setMessage('Ein Fehler ist aufgetreten. Nächster Schritt nach Scan nicht gefunden.');
      }
   }, [currentNodeId]);

  const startGame = () => {
    setGameStarted(true);
  };

  const restartGame = () => {
    setGameStarted(false);
  };

  // --- Render Introduction Screen ---
  if (!gameStarted) {
      return (
        <div className="main-app-container introduction-screen">
            <h1>Willkommen zur Umwelt-Rallye!</h1>
            <h2>Entdecke Oldenburg und lerne!</h2>
            <p>
                Hallo Entdecker! 👋 Bei dieser Rallye folgst du einem Pfad durch Oldenburg.
                Du beantwortest Fragen oder scannst QR-Codes, um zum nächsten Ort zu gelangen.
                So lernst du spielerisch etwas über Umweltthemen wie Bäume und Müllvermeidung.
                Am Ende siehst du deinen Weg - viel Spaß beim Gestalten deiner eigenen Visualisierung!
            </p>
            <p>Bist du bereit, loszulegen?</p>
            <button onClick={startGame} className="start-button">
                Spiel starten!
            </button>
             <footer style={{ textAlign: 'center', fontSize: '0.75rem', color: '#6b7280', marginTop: '32px' }}>
                 Entwickelt von Felix Wehrmann (Wirtschaftsinformatik Student, Uni Oldenburg/OFFIS) mit Project IDX, React & Leaflet.
             </footer>
        </div>
      );
  }

  // --- Render Main Game / Result Screen ---
  if (!currentNode) {
    return (
        <div className="main-app-container text-center">
            <div className="p-4 text-red-600">Fehler: Kritischer Spielstandfehler (Ungültige Node ID: {currentNodeId}). Bitte das Spiel neu starten.</div>
            <button onClick={restartGame} className="answer-button" style={{ backgroundColor: '#ef4444', marginTop: '1rem' }}>
                Zurück zum Start
            </button>
        </div>
    );
  }

    // Generate flow data when game ends
  const { nodes, edges } = currentNode.isEnd ? generateFullFlowData(pathTaken, decisionTree) : { nodes: [], edges: [] };

  return (
    <div className="main-app-container">

      {message && (
        <div
           style={{
              padding: '12px', marginBottom: '16px', borderRadius: '4px', textAlign: 'center',
              fontSize: '0.875rem', fontWeight: 500,
              color: message.includes('Fehler') ? '#991b1b' : '#166534',
              backgroundColor: message.includes('Fehler') ? '#fef2f2' : '#f0fdf4'
           }}
           role="alert"
        >
          {message}
        </div>
      )}

      {currentNode.isEnd ? (
         // --- RESULT BOX ---
         <div className="result-box">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#4338ca', marginBottom: '12px' }}>Geschafft! 🎉</h2>
            <p style={{ color: '#374151', marginBottom: '16px' }}>{currentNode.resultText}</p>

            {/* Render DecisionTreeFlow component */}
            <DecisionTreeFlow nodes={nodes} edges={edges} />

            <div style={{ marginTop: '24px', padding: '15px', backgroundColor: '#f3f4f6', borderRadius: '6px', fontSize: '0.9rem', color: '#4b5563' }}>
              <h4 style={{ fontWeight: 'bold', marginBottom: '8px' }}>Was ist ein Entscheidungsbaum?</h4>
              <p>Ein Entscheidungsbaum ist wie eine Schatzkarte mit vielen Wegen. An jeder Kreuzung wählst du einen Weg basierend auf einer Antwort. Das hier ist der Pfad, den du gewählt hast. Jetzt kannst du deine eigene, tolle Visualisierung dafür bauen!</p>
            </div>

            <button onClick={restartGame} className="start-button" style={{ backgroundColor: '#3b82f6' }}>
                Nochmal spielen
            </button>
        </div>
      ) : (
        // --- CONTENT BOX (Question/Map/Answers/Scanner) ---
        <div className="content-box">
          {currentNode.question && (
             <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '16px', color: '#1f2937' }}>{currentNode.question}</h2>
          )}

          <MapDisplay location={currentNode.location} />

          {currentNode.answers && Array.isArray(currentNode.answers) && currentNode.answers.length > 0 && (
             <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              {currentNode.answers.map((answer, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(answer.nextNodeId)}
                  className="answer-button"
                >
                  {answer.text}
                </button>
              ))}
            </div>
          )}

           {currentNode.qrCode && (
               <QRScanner
                 expectedCode={currentNode.qrCode}
                 onScanSuccess={handleScanSuccess}
               />
            )}
        </div>
      )}

    </div>
  );
}

export default App;

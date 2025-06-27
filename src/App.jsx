import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useWindowSize } from 'react-use';
import Confetti from 'react-confetti';
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

// --- Location constant for OFFIS ---
const offisLocation = { name: 'OFFIS Institut für Informatik', coords: [53.148881112034466, 8.200026064858008] };

// --- FINAL Decision Tree with conditional map display ---
const decisionTree = {
    // START
    start: {
        id: 'start',
        question: 'Willkommen zur OFFIS-Entdeckertour! Bitte gehe zum Haupteingang und scanne den QR-Code, um zu beginnen.',
        flowLabel: 'Start @ OFFIS',
        isEnd: false,
        location: offisLocation, // Show map at start
        qrCode: 'OFFIS_START_2024',
        answers: null,
        nextNodeOnScan: 'q1_question'
    },
    // --- PATH 1: First Question ---
    q1_question: {
        id: 'q1_question',
        question: 'Was interessiert dich mehr?',
        flowLabel: 'Frage 1: Interesse',
        isEnd: false,
        location: null, // No map for question
        qrCode: null,
        answers: [
            { text: 'Technik und Strom', nextNodeId: 'q1_scan_tech' },
            { text: 'Menschen und ihr Alltag', nextNodeId: 'q1_scan_mensch' },
        ],
    },
    q1_scan_tech: {
        id: 'q1_scan_tech',
        question: 'Gute Wahl! Scanne nun den QR-Code für den Bereich "Technik".',
        flowLabel: 'Scan: Technik',
        isEnd: false,
        location: offisLocation, // Show map for scan
        qrCode: 'Q1_TECHNIK',
        answers: null,
        nextNodeOnScan: 'q2_1_question'
    },
    q1_scan_mensch: {
        id: 'q1_scan_mensch',
        question: 'Interessant! Scanne nun den QR-Code für den Bereich "Mensch".',
        flowLabel: 'Scan: Mensch',
        isEnd: false,
        location: offisLocation, // Show map for scan
        qrCode: 'Q1_MENSCH',
        answers: null,
        nextNodeOnScan: 'q2_2_question'
    },
    // --- PATH 2.1: Technik -> Arbeitsweise ---
    q2_1_question: {
        id: 'q2_1_question',
        question: 'Woran arbeitest du am liebsten?',
        flowLabel: 'Frage 2 (Technik)',
        isEnd: false,
        location: null, // No map for question
        qrCode: null,
        answers: [
            { text: 'Ich tüftle gern an Maschinen oder Software', nextNodeId: 'q2_scan_tueftler' },
            { text: 'Ich plane gern Systeme, Netzwerke oder Prozesse', nextNodeId: 'q2_scan_planer' },
        ],
    },
    q2_scan_tueftler: {
        id: 'q2_scan_tueftler',
        question: 'Verstanden, du bist ein Tüftler! Scanne den nächsten QR-Code.',
        flowLabel: 'Scan: Tüftler',
        isEnd: false,
        location: offisLocation, // Show map for scan
        qrCode: 'Q2_TUEFTLER',
        answers: null,
        nextNodeOnScan: 'q3_1_1_question'
    },
    q2_scan_planer: {
        id: 'q2_scan_planer',
        question: 'Verstanden, du bist ein Planer! Scanne den nächsten QR-Code.',
        flowLabel: 'Scan: Planer',
        isEnd: false,
        location: offisLocation, // Show map for scan
        qrCode: 'Q2_PLANER',
        answers: null,
        nextNodeOnScan: 'q3_1_2_question'
    },
    // --- PATH 2.2: Mensch -> Arbeitsweise ---
    q2_2_question: {
        id: 'q2_2_question',
        question: 'Woran arbeitest du am liebsten?',
        flowLabel: 'Frage 2 (Mensch)',
        isEnd: false,
        location: null, // No map for question
        qrCode: null,
        answers: [
            { text: 'Ich will helfen, das Leben älterer oder kranker Menschen zu verbessern', nextNodeId: 'q2_scan_helfer' },
            { text: 'Ich interessiere mich für die Auswirkungen von Digitalisierung auf die Gesellschaft', nextNodeId: 'q2_scan_forscher' },
        ],
    },
    q2_scan_helfer: {
        id: 'q2_scan_helfer',
        question: 'Eine wichtige Aufgabe! Scanne den nächsten QR-Code.',
        flowLabel: 'Scan: Helfer',
        isEnd: false,
        location: offisLocation, // Show map for scan
        qrCode: 'Q2_HELFER',
        answers: null,
        nextNodeOnScan: 'q3_2_1_question'
    },
    q2_scan_forscher: {
        id: 'q2_scan_forscher',
        question: 'Ein spannendes Feld! Scanne den nächsten QR-Code.',
        flowLabel: 'Scan: Forscher',
        isEnd: false,
        location: offisLocation, // Show map for scan
        qrCode: 'Q2_FORSCHER',
        answers: null,
        nextNodeOnScan: 'q3_2_2_question'
    },
    // --- PATH 3 (Final Questions before End) ---
    q3_1_1_question: { // Tüftler
        id: 'q3_1_1_question',
        question: 'Was klingt spannender für dich?',
        flowLabel: 'Frage 3 (Tüftler)',
        isEnd: false,
        location: null, // No map
        qrCode: null,
        answers: [
            { text: 'Roboter in der Produktion programmieren', nextNodeId: 'end_produktion' },
            { text: 'KI für sichere Energiesysteme entwickeln', nextNodeId: 'end_energie' },
        ],
    },
    q3_1_2_question: { // Planer
        id: 'q3_1_2_question',
        question: 'Was klingt spannender für dich?',
        flowLabel: 'Frage 3 (Planer)',
        isEnd: false,
        location: null, // No map
        qrCode: null,
        answers: [
            { text: 'Stromnetze der Zukunft mitgestalten', nextNodeId: 'end_energie' },
            { text: 'An nachhaltigen Fertigungssystemen für die Industrie arbeiten', nextNodeId: 'end_produktion' },
        ],
    },
    q3_2_1_question: { // Helfer
        id: 'q3_2_1_question',
        question: 'Was klingt spannender für dich?',
        flowLabel: 'Frage 3 (Helfer)',
        isEnd: false,
        location: null, // No map
        qrCode: null,
        answers: [
            { text: 'IT-Systeme für Pflegeeinrichtungen bauen', nextNodeId: 'end_gesundheit' },
            { text: 'Medizinische Daten auswerten, um Therapien zu verbessern', nextNodeId: 'end_gesundheit' },
        ],
    },
    q3_2_2_question: { // Forscher
        id: 'q3_2_2_question',
        question: 'Was klingt spannender für dich?',
        flowLabel: 'Frage 3 (Forscher)',
        isEnd: false,
        location: null, // No map
        qrCode: null,
        answers: [
            { text: 'KI und Menschen besser zusammenarbeiten lassen', nextNodeId: 'end_gesellschaft' },
            { text: 'Menschen durch virtuelle Umgebungen miteinander verbinden', nextNodeId: 'end_gesellschaft' },
        ],
    },
    // --- End Nodes ---
    end_produktion: {
        id: 'end_produktion',
        isEnd: true,
        flowLabel: 'Ergebnis: Produktion',
        resultText: 'Zu dir passt vermutlich am besten dieser Bereich im OFFIS: Produktion',
    },
    end_energie: {
        id: 'end_energie',
        isEnd: true,
        flowLabel: 'Ergebnis: Energie',
        resultText: 'Zu dir passt vermutlich am besten dieser Bereich im OFFIS: Energie',
    },
    end_gesundheit: {
        id: 'end_gesundheit',
        isEnd: true,
        flowLabel: 'Ergebnis: Gesundheit',
        resultText: 'Zu dir passt vermutlich am besten dieser Bereich im OFFIS: Gesundheit',
    },
    end_gesellschaft: {
        id: 'end_gesellschaft',
        isEnd: true,
        flowLabel: 'Ergebnis: Gesellschaft',
        resultText: 'Zu dir passt vermutlich am besten dieser Bereich im OFFIS: Gesellschaft',
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
    
    // Define positions for a clearer layout
    const positions = {
        start:              { x: 450, y: 0 },
        q1_question:        { x: 450, y: 120 },
        q1_scan_tech:       { x: 250, y: 240 },
        q1_scan_mensch:     { x: 650, y: 240 },
        q2_1_question:      { x: 250, y: 360 },
        q2_2_question:      { x: 650, y: 360 },
        q2_scan_tueftler:   { x: 50, y: 480 },
        q2_scan_planer:     { x: 300, y: 480 },
        q2_scan_helfer:     { x: 550, y: 480 },
        q2_scan_forscher:   { x: 800, y: 480 },
        q3_1_1_question:    { x: 50, y: 600 },
        q3_1_2_question:    { x: 300, y: 600 },
        q3_2_1_question:    { x: 550, y: 600 },
        q3_2_2_question:    { x: 800, y: 600 },
        end_produktion:     { x: 175, y: 720 },
        end_energie:        { x: 175, y: 840 },
        end_gesundheit:     { x: 675, y: 720 },
        end_gesellschaft:   { x: 675, y: 840 },
    };

    for (const nodeId in treeData) {
        const nodeInfo = treeData[nodeId];
        const label = nodeInfo.flowLabel || nodeInfo.question || nodeId;
        const isInPath = pathTaken.includes(nodeId);

        nodes.push({
            id: nodeId,
            position: positions[nodeId] || { x: Math.random() * 400, y: Math.random() * 400 },
            data: { label: shortenText(label, 25) },
            type: nodeInfo.isEnd ? 'output' : (nodeInfo.answers ? 'default' : 'input'),
            style: {
                opacity: isInPath ? 1 : 0.4,
                border: isInPath ? '2px solid #2c3e50' : '1px solid #ccc',
                minWidth: '150px',
                fontSize: '0.9em',
            }
        });
    }

    for (const nodeId in treeData) {
        const nodeInfo = treeData[nodeId];

        const createEdge = (sourceId, targetId, label, isScan) => {
            const isEdgeInPath = pathTaken.indexOf(sourceId) > -1 && pathTaken[pathTaken.indexOf(sourceId) + 1] === targetId;
            return {
                id: `e-${sourceId}-${targetId}`,
                source: sourceId,
                target: targetId,
                label: shortenText(label, 20),
                animated: isEdgeInPath,
                style: {
                    stroke: isEdgeInPath ? '#2c3e50' : '#ccc',
                    opacity: isEdgeInPath ? 1 : 0.5,
                },
            };
        };

        if (nodeInfo.answers) {
            nodeInfo.answers.forEach(answer => {
                edges.push(createEdge(nodeId, answer.nextNodeId, answer.text, false));
            });
        }

        if (nodeInfo.nextNodeOnScan) {
            edges.push(createEdge(nodeId, nodeInfo.nextNodeOnScan, 'QR Scan', true));
        }
    }
    return { nodes, edges };
};

// --- Components defined OUTSIDE App ---

function ChangeMapView({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.setView(coords, 17); // Zoom in a bit more
    }
  }, [coords, map]);
  return null;
}

function MapDisplay({ location }) {
  if (!location || !location.coords) return null;

  const position = location.coords;
  const locationName = location.name;
  const osmUrl = `https://www.openstreetmap.org/?mlat=${position[0]}&mlon=${position[1]}#map=18/${position[0]}/${position[1]}`;

  return (
    <div style={{ height: '200px', marginBottom: '16px' }} className="w-full rounded-lg overflow-hidden shadow-lg border-2 border-gray-300">
      <MapContainer center={position} zoom={17} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            {locationName}.<br />
            <a href={osmUrl} target="_blank" rel="noopener noreferrer">
              Auf OpenStreetMap ansehen
            </a>
          </Popup>
        </Marker>
        <ChangeMapView coords={position} />
      </MapContainer>
    </div>
  );
}

function QRScanner({ expectedCode, onScanSuccess }) {
  const [error, setError] = useState('');
  const readerId = "qr-code-reader-element";
  
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      readerId, 
      { fps: 10, qrbox: { width: 250, height: 250 }, rememberLastUsedCamera: true },
      false // verbose
    );

    const successCallback = (decodedText, decodedResult) => {
        if (decodedText === expectedCode) {
            setError('');
            scanner.clear().catch(error => console.error("Failed to clear scanner.", error));
            onScanSuccess();
        } else {
            setError(`Falscher QR-Code gescannt. Erwartet: ${expectedCode}`);
        }
    };

    const errorCallback = (errorMessage) => {
      // console.warn(errorMessage);
    };
    
    scanner.render(successCallback, errorCallback);

    return () => {
      // Cleanup function to clear the scanner
      const anElement = document.getElementById(readerId);
      if (anElement) {
        scanner.clear().catch(error => {
            if (!error.message.includes("not found")) {
                console.error("Failed to clear html5QrcodeScanner: ", error);
            }
        });
      }
    };
  }, [expectedCode, onScanSuccess]);

  return (
    <div className="mt-6 p-4 border-2 border-dashed border-gray-400 rounded-lg shadow-inner" style={{backgroundColor: '#34495E'}}>
      <h3 className="text-lg font-semibold mb-2 text-white text-center">Nächster Schritt: QR-Code Scannen</h3>
      <div id={readerId} style={{ width: '100%', minHeight: '250px' }}></div>
      {error && <p className="text-red-400 bg-red-900 p-2 rounded-md text-sm mt-2 text-center">{error}</p>}
    </div>
  );
}


// --- Main App Component ---
function App() {
  const [currentNodeId, setCurrentNodeId] = useState('start');
  const [pathTaken, setPathTaken] = useState(['start']);
  const [message, setMessage] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const { width, height } = useWindowSize();

  const currentNode = useMemo(() => decisionTree[currentNodeId], [currentNodeId]);

  useEffect(() => {
      if (!gameStarted) {
          setCurrentNodeId('start');
          setPathTaken(['start']);
          setMessage('');
      }
  }, [gameStarted]);
  
  const advanceToNode = useCallback((nextNodeId) => {
      if (decisionTree[nextNodeId]) {
          setCurrentNodeId(nextNodeId);
          setPathTaken(prevPath => [...prevPath, nextNodeId]);
          setMessage('');
      } else {
          setMessage('Fehler: Nächster Schritt nicht gefunden.');
      }
  }, []);

  const handleAnswer = (nextNodeId) => {
      advanceToNode(nextNodeId);
  };

  const handleScanSuccess = useCallback(() => {
      setMessage('QR-Code erfolgreich gescannt!');
      setTimeout(() => advanceToNode(currentNode.nextNodeOnScan), 500);
  }, [currentNode, advanceToNode]);

  const startGame = () => setGameStarted(true);
  const restartGame = () => setGameStarted(false);

  const handleMouseDown = (e) => {
    const button = e.currentTarget;
    button.style.setProperty('--x', `${e.clientX - button.getBoundingClientRect().left}px`);
    button.style.setProperty('--y', `${e.clientY - button.getBoundingClientRect().top}px`);
  };

  const { nodes, edges } = useMemo(() => {
      return currentNode?.isEnd ? generateFullFlowData(pathTaken, decisionTree) : { nodes: [], edges: [] };
  }, [currentNode, pathTaken]);

  if (!gameStarted) {
    return (
      <div className="main-app-container introduction-screen">
          <h1>Willkommen zur OFFIS-Entdeckertour!</h1>
          <h2>Finde heraus, was zu dir passt!</h2>
          <p>
              Hallo Entdecker! 👋 Bei dieser interaktiven Tour scannst du QR-Codes und beantwortest Fragen,
              um herauszufinden, welcher Forschungsbereich am OFFIS am besten zu dir passen könnte.
              Dein Weg durch die Entscheidungen wird am Ende visualisiert.
          </p>
          <button onClick={startGame} onMouseDown={handleMouseDown} className="start-button">
              <span className="button-text">Tour starten!</span>
          </button>
           <footer style={{ textAlign: 'center', fontSize: '0.75rem', color: 'white', marginTop: '32px' }}>
                Entwickelt mit Project IDX, React & Leaflet.
           </footer>
      </div>
    );
  }

  if (!currentNode) {
    return (
        <div className="main-app-container text-center">
            <div className="p-4 text-red-600">Fehler: Kritischer Spielstandfehler. Bitte starte die Anwendung neu.</div>
            <button onClick={restartGame} onMouseDown={handleMouseDown} className="answer-button" style={{ backgroundColor: '#ef4444', marginTop: '1rem' }}>
                <span className="button-text">Zurück zum Start</span>
            </button>
        </div>
    );
  }
  
  return (
    <div className="main-app-container">
      {message && (
        <div style={{ padding: '12px', marginBottom: '16px', borderRadius: '4px', textAlign: 'center', color: 'white', backgroundColor: '#2C3E50' }} role="alert">
          {message}
        </div>
      )}

      {currentNode.isEnd ? (
        <div className="result-box" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)', justifyContent: 'space-around', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', color: 'white', textAlign: 'center' }}>Geschafft! 🎉</h2>
          <p style={{ fontSize: '1.2rem', color: 'white', textAlign: 'center', margin: '0 1rem' }}>{currentNode.resultText}</p>
          <DecisionTreeFlow nodes={nodes} edges={edges} />
          <div style={{ padding: '15px', backgroundColor: '#34495E', borderRadius: '6px', fontSize: '0.9rem', color: 'white', textAlign: 'center' }}>
            <h4 style={{ fontWeight: 'bold', marginBottom: '8px' }}>Dein Weg zum Ergebnis</h4>
            <p>Dies ist der Pfad, der dich zu deinem Ergebnis geführt hat. Probiere es doch nochmal aus und entdecke andere Bereiche!</p>
          </div>
          <button onClick={restartGame} onMouseDown={handleMouseDown} className="start-button" style={{ backgroundColor: '#3b82f6' }}>
              <span className="button-text">Nochmal spielen</span>
          </button>
          <Confetti width={width} height={height} recycle={false} numberOfPieces={300} gravity={0.15} />
        </div>
      ) : (
        <div className="content-box">
          {/* MapDisplay is now only rendered if currentNode.location exists */}
          <MapDisplay location={currentNode.location} />
          
          {currentNode.question && <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '16px', color: 'white', textAlign: 'center' }}>{currentNode.question}</h2>}
          
          {currentNode.answers && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              {currentNode.answers.map((answer, index) => (
                <button key={index} onClick={() => handleAnswer(answer.nextNodeId)} onMouseDown={handleMouseDown} className="answer-button">
                  <span className="button-text">{answer.text}</span>
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
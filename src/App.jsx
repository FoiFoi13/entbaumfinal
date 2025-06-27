import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useWindowSize } from 'react-use';
import Confetti from 'react-confetti';
import { Html5QrcodeScanner } from 'html5-qrcode';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

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

const offisLocation = { name: 'OFFIS Institut für Informatik', coords: [53.148881112034466, 8.200026064858008] };

// --- FINAL Decision Tree with Info Texts ---
const decisionTree = {
    // START
    start: {
        id: 'start',
        question: 'Willkommen zur OFFIS-Entdeckertour! Bitte gehe zum Haupteingang und scanne den QR-Code, um zu beginnen.',
        flowLabel: 'Start @ OFFIS',
        isEnd: false,
        location: offisLocation,
        qrCode: 'OFFIS_START_2024',
        answers: null,
        nextNodeOnScan: 'q1_question'
    },
    // Question/Scan nodes... (Rest remains unchanged)
    q1_question: {
        id: 'q1_question',
        question: 'Was interessiert dich mehr?',
        flowLabel: 'Frage 1: Interesse',
        isEnd: false,
        location: null,
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
        location: offisLocation,
        qrCode: 'Q1_TECHNIK',
        answers: null,
        nextNodeOnScan: 'q2_1_question'
    },
    q1_scan_mensch: {
        id: 'q1_scan_mensch',
        question: 'Interessant! Scanne nun den QR-Code für den Bereich "Mensch".',
        flowLabel: 'Scan: Mensch',
        isEnd: false,
        location: offisLocation,
        qrCode: 'Q1_MENSCH',
        answers: null,
        nextNodeOnScan: 'q2_2_question'
    },
    q2_1_question: {
        id: 'q2_1_question',
        question: 'Woran arbeitest du am liebsten?',
        flowLabel: 'Frage 2 (Technik)',
        isEnd: false,
        location: null,
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
        location: offisLocation,
        qrCode: 'Q2_TUEFTLER',
        answers: null,
        nextNodeOnScan: 'q3_1_1_question'
    },
    q2_scan_planer: {
        id: 'q2_scan_planer',
        question: 'Verstanden, du bist ein Planer! Scanne den nächsten QR-Code.',
        flowLabel: 'Scan: Planer',
        isEnd: false,
        location: offisLocation,
        qrCode: 'Q2_PLANER',
        answers: null,
        nextNodeOnScan: 'q3_1_2_question'
    },
    q2_2_question: {
        id: 'q2_2_question',
        question: 'Woran arbeitest du am liebsten?',
        flowLabel: 'Frage 2 (Mensch)',
        isEnd: false,
        location: null,
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
        location: offisLocation,
        qrCode: 'Q2_HELFER',
        answers: null,
        nextNodeOnScan: 'q3_2_1_question'
    },
    q2_scan_forscher: {
        id: 'q2_scan_forscher',
        question: 'Ein spannendes Feld! Scanne den nächsten QR-Code.',
        flowLabel: 'Scan: Forscher',
        isEnd: false,
        location: offisLocation,
        qrCode: 'Q2_FORSCHER',
        answers: null,
        nextNodeOnScan: 'q3_2_2_question'
    },
    q3_1_1_question: {
        id: 'q3_1_1_question',
        question: 'Was klingt spannender für dich?',
        flowLabel: 'Frage 3 (Tüftler)',
        isEnd: false,
        location: null,
        qrCode: null,
        answers: [
            { text: 'Roboter in der Produktion programmieren', nextNodeId: 'end_produktion' },
            { text: 'KI für sichere Energiesysteme entwickeln', nextNodeId: 'end_energie' },
        ],
    },
    q3_1_2_question: {
        id: 'q3_1_2_question',
        question: 'Was klingt spannender für dich?',
        flowLabel: 'Frage 3 (Planer)',
        isEnd: false,
        location: null,
        qrCode: null,
        answers: [
            { text: 'Stromnetze der Zukunft mitgestalten', nextNodeId: 'end_energie' },
            { text: 'An nachhaltigen Fertigungssystemen für die Industrie arbeiten', nextNodeId: 'end_produktion' },
        ],
    },
    q3_2_1_question: {
        id: 'q3_2_1_question',
        question: 'Was klingt spannender für dich?',
        flowLabel: 'Frage 3 (Helfer)',
        isEnd: false,
        location: null,
        qrCode: null,
        answers: [
            { text: 'IT-Systeme für Pflegeeinrichtungen bauen', nextNodeId: 'end_gesundheit' },
            { text: 'Medizinische Daten auswerten, um Therapien zu verbessern', nextNodeId: 'end_gesundheit' },
        ],
    },
    q3_2_2_question: {
        id: 'q3_2_2_question',
        question: 'Was klingt spannender für dich?',
        flowLabel: 'Frage 3 (Forscher)',
        isEnd: false,
        location: null,
        qrCode: null,
        answers: [
            { text: 'KI und Menschen besser zusammenarbeiten lassen', nextNodeId: 'end_gesellschaft' },
            { text: 'Menschen durch virtuelle Umgebungen miteinander verbinden', nextNodeId: 'end_gesellschaft' },
        ],
    },

    // --- End Nodes with Descriptions ---
    end_produktion: {
        id: 'end_produktion',
        isEnd: true,
        flowLabel: 'Ergebnis: Produktion',
        resultText: 'Zu dir passt vermutlich am besten der Bereich Produktion.',
        description: 'In diesem Bereich dreht sich alles um die Fabrik der Zukunft (Industrie 4.0). Hier wird erforscht, wie Roboter, KI und vernetzte Maschinen zusammenarbeiten, um Produktionsprozesse intelligenter, flexibler und nachhaltiger zu gestalten.'
    },
    end_energie: {
        id: 'end_energie',
        isEnd: true,
        flowLabel: 'Ergebnis: Energie',
        resultText: 'Zu dir passt vermutlich am besten der Bereich Energie.',
        description: 'Dieser Bereich beschäftigt sich mit der digitalen Zukunft unserer Energieversorgung. Im Fokus stehen intelligente Stromnetze (Smart Grids), die Integration erneuerbarer Energien und die Entwicklung von IT-Lösungen für eine stabile Energiewende.'
    },
    end_gesundheit: {
        id: 'end_gesundheit',
        isEnd: true,
        flowLabel: 'Ergebnis: Gesundheit',
        resultText: 'Zu dir passt vermutlich am besten der Bereich Gesundheit.',
        description: 'Hier steht die Digitalisierung des Gesundheitswesens im Mittelpunkt. Es werden IT-Systeme für Kliniken und die Pflege entwickelt, an Lösungen für ein selbstbestimmtes Leben im Alter geforscht und medizinische Daten zur Verbesserung von Therapien analysiert.'
    },
    end_gesellschaft: {
        id: 'end_gesellschaft',
        isEnd: true,
        flowLabel: 'Ergebnis: Gesellschaft',
        resultText: 'Zu dir passt vermutlich am besten der Bereich Gesellschaft.',
        description: 'In diesem Bereich wird untersucht, wie die Digitalisierung unser Leben und Zusammenarbeiten verändert. Themen sind die Interaktion zwischen Mensch und KI, die Gestaltung smarter Städte (Smart City) und der Einsatz von virtuellen Umgebungen (VR/AR).'
    },
};

const shortenText = (text, maxLength = 50) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
};

const generateFullFlowData = (pathTaken, treeData) => {
    const nodes = [];
    const edges = [];
    const baseNodeWidth = 160;
    const horizontalGap = 20;
    const verticalGap = 100;
    const centerX = 150;

    const positions = {
        start:              { x: centerX, y: 0 * verticalGap },
        q1_question:        { x: centerX, y: 1 * verticalGap },
        q1_scan_tech:       { x: centerX - (baseNodeWidth/2 + horizontalGap/2), y: 2 * verticalGap },
        q1_scan_mensch:     { x: centerX + (baseNodeWidth/2 + horizontalGap/2), y: 2 * verticalGap },
        q2_1_question:      { x: centerX - (baseNodeWidth/2 + horizontalGap/2), y: 3 * verticalGap },
        q2_2_question:      { x: centerX + (baseNodeWidth/2 + horizontalGap/2), y: 3 * verticalGap },
        q2_scan_tueftler:   { x: centerX - (baseNodeWidth + horizontalGap), y: 4 * verticalGap },
        q2_scan_planer:     { x: centerX, y: 4 * verticalGap },
        q2_scan_helfer:     { x: centerX, y: 4 * verticalGap },
        q2_scan_forscher:   { x: centerX + (baseNodeWidth + horizontalGap), y: 4 * verticalGap },
        q3_1_1_question:    { x: centerX - (baseNodeWidth + horizontalGap), y: 5 * verticalGap },
        q3_1_2_question:    { x: centerX, y: 5 * verticalGap },
        q3_2_1_question:    { x: centerX, y: 5 * verticalGap },
        q3_2_2_question:    { x: centerX + (baseNodeWidth + horizontalGap), y: 5 * verticalGap },
        end_produktion:     { x: centerX - 80, y: 6 * verticalGap },
        end_energie:        { x: centerX + 80, y: 6 * verticalGap },
        end_gesundheit:     { x: centerX - 80, y: 6 * verticalGap },
        end_gesellschaft:   { x: centerX + 80, y: 6 * verticalGap },
    };

    for (const nodeId in treeData) {
        const nodeInfo = treeData[nodeId];
        const label = nodeInfo.flowLabel || nodeInfo.question || nodeId;
        const isInPath = pathTaken.includes(nodeId);

        nodes.push({
            id: nodeId,
            position: positions[nodeId],
            data: { label: shortenText(label, 25) },
            type: nodeInfo.isEnd ? 'output' : (nodeInfo.answers ? 'default' : 'input'),
            style: {
                opacity: isInPath ? 1 : 0.5,
                border: isInPath ? '2px solid #2c3e50' : '1px solid #ccc',
                width: baseNodeWidth,
                fontSize: '11px',
                textAlign: 'center',
            }
        });
    }

    for (const nodeId in treeData) {
        const nodeInfo = treeData[nodeId];
        const createEdge = (sourceId, targetId, label) => {
            const isEdgeInPath = pathTaken.includes(sourceId) && pathTaken.includes(targetId);
            return {
                id: `e-${sourceId}-${targetId}`,
                source: sourceId,
                target: targetId,
                label: shortenText(label, 15),
                animated: isEdgeInPath,
                style: {
                    stroke: isEdgeInPath ? '#2c3e50' : '#ccc',
                    opacity: isEdgeInPath ? 1 : 0.6,
                },
            };
        };

        if (nodeInfo.answers) {
            nodeInfo.answers.forEach(answer => {
                edges.push(createEdge(nodeId, answer.nextNodeId, answer.text));
            });
        }
        if (nodeInfo.nextNodeOnScan) {
            edges.push(createEdge(nodeId, nodeInfo.nextNodeOnScan, 'QR Scan'));
        }
    }
    return { nodes, edges };
};

function ChangeMapView({ coords }) {
  const map = useMap();
  useEffect(() => { if (coords) map.setView(coords, 17) }, [coords, map]);
  return null;
}

function MapDisplay({ location }) {
  if (!location || !location.coords) return null;
  const position = location.coords;
  const osmUrl = `https://www.openstreetmap.org/?mlat=${position[0]}&mlon=${position[1]}#map=18/${position[0]}/${position[1]}`;

  return (
    <div style={{ height: '200px', marginBottom: '16px' }} className="w-full rounded-lg overflow-hidden shadow-lg border-2 border-gray-300">
      <MapContainer center={position} zoom={17} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={position}>
          <Popup>{location.name}.<br /><a href={osmUrl} target="_blank" rel="noopener noreferrer">Auf Karte ansehen</a></Popup>
        </Marker>
        <ChangeMapView coords={position} />
      </MapContainer>
    </div>
  );
}

function QRScanner({ expectedCode, onScanSuccess }) {
  const readerId = "qr-reader";
  const [error, setError] = useState('');
  
  useEffect(() => {
    const html5QrcodeScanner = new Html5QrcodeScanner(
        readerId, { fps: 10, qrbox: { width: 250, height: 250 } }, false);

    function onScanSuccessCb(decodedText, decodedResult) {
        if (decodedText === expectedCode) {
            html5QrcodeScanner.clear();
            onScanSuccess();
        } else {
            setError(`Falscher QR-Code gescannt.`);
        }
    }

    html5QrcodeScanner.render(onScanSuccessCb, (errorMessage) => {});

    return () => {
        const scannerElement = document.getElementById(readerId);
        if (scannerElement) {
           html5QrcodeScanner.clear().catch(err => console.error("Error clearing scanner on unmount", err));
        }
    };
  }, [expectedCode, onScanSuccess]);

  return (
    <div className="mt-6 p-4 border-2 border-dashed border-gray-400 rounded-lg" style={{backgroundColor: '#34495E'}}>
      <h3 className="text-lg font-semibold mb-2 text-white text-center">Nächster Schritt: QR-Code Scannen</h3>
      <div id={readerId} style={{ width: '100%' }}></div>
      {error && <p className="text-red-400 bg-red-900 p-2 rounded-md text-sm mt-2 text-center">{error}</p>}
    </div>
  );
}

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
          setPathTaken(prevPath => [...new Set([...prevPath, nextNodeId])]);
          setMessage('');
      } else {
          setMessage('Fehler: Nächster Schritt nicht gefunden.');
      }
  }, []);

  const handleAnswer = (nextNodeId) => advanceToNode(nextNodeId);
  const handleScanSuccess = useCallback(() => {
      setMessage('QR-Code erfolgreich gescannt!');
      setTimeout(() => advanceToNode(currentNode.nextNodeOnScan), 300);
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
          <p>Hallo! Bei dieser interaktiven Tour scannst du QR-Codes und beantwortest Fragen, um herauszufinden, welcher Forschungsbereich am OFFIS am besten zu dir passen könnte. Dein Weg wird am Ende visualisiert.</p>
          <button onClick={startGame} onMouseDown={handleMouseDown} className="start-button"><span className="button-text">Tour starten!</span></button>
           <footer style={{ textAlign: 'center', fontSize: '0.75rem', color: 'white', marginTop: '32px' }}>Entwickelt mit Project IDX, React & Leaflet.</footer>
      </div>
    );
  }

  if (!currentNode) {
    return (
        <div className="main-app-container text-center">
            <div className="p-4 text-red-600">Kritischer Fehler. Bitte starte die Anwendung neu.</div>
            <button onClick={restartGame} className="answer-button mt-4">Zurück zum Start</button>
        </div>
    );
  }
  
  return (
    <div className="main-app-container">
      {message && <div className="message-banner" role="alert">{message}</div>}

      {currentNode.isEnd ? (
        <div className="result-box">
          <h2 className="result-title">Geschafft! 🎉</h2>
          <p className="result-text">{currentNode.resultText}</p>
          
          {/* Added description paragraph */}
          <p className="result-description">{currentNode.description}</p>
          
          <DecisionTreeFlow nodes={nodes} edges={edges} />
          
          <button onClick={restartGame} onMouseDown={handleMouseDown} className="start-button"><span className="button-text">Nochmal spielen</span></button>
          <Confetti width={width} height={height} recycle={false} numberOfPieces={250} gravity={0.15} />
        </div>
      ) : (
        <div className="content-box">
          <MapDisplay location={currentNode.location} />
          {currentNode.question && <h2 className="question-title">{currentNode.question}</h2>}
          {currentNode.answers && (
            <div className="answers-container">
              {currentNode.answers.map((answer, index) => (
                <button key={index} onClick={() => handleAnswer(answer.nextNodeId)} onMouseDown={handleMouseDown} className="answer-button">
                  <span className="button-text">{answer.text}</span>
                </button>
              ))}
            </div>
          )}
          {currentNode.qrCode && <QRScanner expectedCode={currentNode.qrCode} onScanSuccess={handleScanSuccess} />}
        </div>
      )}
    </div>
  );
}

export default App;
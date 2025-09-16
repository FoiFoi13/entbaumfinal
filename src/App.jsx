import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useWindowSize } from 'react-use';
import Confetti from 'react-confetti';
import { Html5QrcodeScanner } from 'html5-qrcode';
import 'leaflet/dist/leaflet.css';
import DecisionTreeFlow from './DecisionTreeFlow';

const decisionTree = {
    start: {
        id: 'start',
        question: 'Interessiert dich primär die digitale Welt (also alles, was mit Computern, Code und VR zu tun hat) ODER eher die physische und natürliche Welt (Experimente, Natur, Handwerk)?',
        flowLabel: 'Start',
        isEnd: false,
        answers: [
            { text: 'Digitale Welt', nextNodeId: 'scan_path_a' },
            { text: 'Physische / Natürliche Welt', nextNodeId: 'scan_path_b' },
        ],
    },

    // --- SCAN NODES ---
    scan_path_a: {
        id: 'scan_path_a',
        question: 'Super! Finde jetzt den Stand für "Digitale Welt" und scanne den QR-Code, um fortzufahren.',
        flowLabel: 'Scan: Digitale Welt',
        isEnd: false,
        qrCode: 'AHOI_MINT_PATH_A',
        nextNodeOnScan: 'q_a1',
    },
    scan_path_b: {
        id: 'scan_path_b',
        question: 'Klasse! Finde jetzt den Stand für "Physische/Natürliche Welt" und scanne den QR-Code.',
        flowLabel: 'Scan: Physische Welt',
        isEnd: false,
        qrCode: 'AHOI_MINT_PATH_B',
        nextNodeOnScan: 'q_b1',
    },
     scan_a2: {
        id: 'scan_a2',
        question: 'Gute Wahl! Scanne den "Erschaffen"-Code.',
        flowLabel: 'Scan: Erschaffen',
        isEnd: false,
        qrCode: 'AHOI_MINT_ERSCHAFFEN',
        nextNodeOnScan: 'q_a2',
    },
     scan_a3: {
        id: 'scan_a3',
        question: 'Gute Wahl! Scanne den "Erleben"-Code.',
        flowLabel: 'Scan: Erleben',
        isEnd: false,
        qrCode: 'AHOI_MINT_ERLEBEN',
        nextNodeOnScan: 'q_a3',
    },
     scan_b2: {
        id: 'scan_b2',
        question: 'Fast da! Scanne den Code für "Wissenschaft & Technik".',
        flowLabel: 'Scan: Wissenschaft',
        isEnd: false,
        qrCode: 'AHOI_MINT_WISSENSCHAFT',
        nextNodeOnScan: 'q_b2',
    },


    // --- QUESTION NODES (Paths) ---
    // Path A
    q_a1: {
        id: 'q_a1',
        question: 'Möchtest du lieber selbst aktiv etwas erschaffen, programmieren oder steuern ODER möchtest du lieber digitale Welten erleben, spielen und konsumieren?',
        flowLabel: 'Pfad A',
        isEnd: false,
        answers: [
            { text: 'Selbst aktiv erschaffen/programmieren', nextNodeId: 'scan_a2' },
            { text: 'Erleben, spielen, eintauchen', nextNodeId: 'scan_a3' },
        ],
    },
    q_a2: {
        id: 'q_a2',
        question: 'Geht es dir dabei hauptsächlich um Roboter (also Dinge, die sich bewegen und Befehle ausführen) ODER eher um Code, digitale Gestaltung und Elektronik?',
        flowLabel: 'A.2',
        isEnd: false,
        answers: [
            { text: 'Ja, Roboter sind super!', nextNodeId: 'end_roboter' },
            { text: 'Nein, lieber Code & digitale Werkstatt!', nextNodeId: 'end_code' },
        ],
    },
    q_a3: {
        id: 'q_a3',
        question: 'Möchtest du gezielt eine VR-Brille (Virtual Reality) aufsetzen, um komplett in eine andere Welt einzutauchen?',
        flowLabel: 'A.3',
        isEnd: false,
        answers: [
            { text: 'Ja, ich will VR erleben!', nextNodeId: 'end_vr' },
            { text: 'Nein, lieber andere digitale Erlebnisse und Spiele.', nextNodeId: 'end_digital_art' },
        ],
    },
    // Path B
    q_b1: {
        id: 'q_b1',
        question: 'Geht es dir mehr um das Entdecken der Natur (Tiere, Pflanzen, Umwelt, Weltall) ODER mehr um klassische Wissenschaft (Physik, Chemie, Mathe) und technische Experimente?',
        flowLabel: 'Pfad B',
        isEnd: false,
        answers: [
            { text: 'Natur & Umwelt entdecken!', nextNodeId: 'end_natur' },
            { text: 'Klassische Wissenschaft & Technik-Experimente!', nextNodeId: 'scan_b2' },
        ],
    },
    q_b2: {
        id: 'q_b2',
        question: 'Möchtest du dich primär über Studium & Beruf informieren ODER lieber selbst experimentieren und etwas Handwerkliches/Technisches ausprobieren?',
        flowLabel: 'B.2',
        isEnd: false,
        answers: [
            { text: 'Ich will mich über meine Zukunft (Beruf/Studium) informieren.', nextNodeId: 'end_zukunft' },
            { text: 'Ich will selbst experimentieren und werkeln!', nextNodeId: 'end_labor' },
        ],
    },
    // --- ENDPOINTS ---
    end_roboter: {
        id: 'end_roboter',
        isEnd: true,
        flowLabel: 'Endpunkt 1',
        resultText: 'ENDPUNKT 1: "Die Roboter-Werkstatt"',
        description: `
Broetje-Automation: Interagiere mit einem Industrie-Cobot.
Bildungsregion Friesland: Programmiere kleine Bluebots und Ozobots.
Innovationszentrum: Baue und steuere LEGO-Roboter.
Robotikzentrum JadeBay: Programmiere den mobilen Roboter iRobot Root.
Hochschule Emden-Leer: Steuere den Roboterhund "HELDog".
`
    },
    end_code: {
        id: 'end_code',
        isEnd: true,
        flowLabel: 'Endpunkt 2',
        resultText: 'ENDPUNKT 2: "Code, Print & Make"',
        description: `
BZTG: Programmiere einen Arduino nano für Lichteffekte.
BTC AG: Programmiere den BTC-Hamster (und informiere dich über IT-Berufe).
Kreativität trifft Technik: Lerne löten, mit Scratch programmieren und sieh den Lasercutter.
Anna Schwarz RomnoKher: Sieh dir Drucktechniken an, die mit CNC, 3D-Drucker und Lasercutter erstellt wurden.
Robotikzentrum JadeBay: Probiere den 3D-Druck-Stift aus.
OFFIS e.V.: Löse Rätsel am interaktiven Logikboard.
`
    },
    end_vr: {
        id: 'end_vr',
        isEnd: true,
        flowLabel: 'Endpunkt 3',
        resultText: 'ENDPUNKT 3: "Virtual Reality Welten"',
        description: `
Agentur für Arbeit: Berufsorientierung mit VR-Brille.
EWE AG: Virtuelle Führungen durch technische Anlagen.
Innovationszentrum: Tauche in virtuelle Spielwelten ein.
OFFIS e.V.: Spiele "Türme von Hanoi" in der virtuellen Welt.
(Tipp: Auch bei FutureNow! (Pfad B) gibt es VR zum Klimawandel).
`
    },
    end_digital_art: {
        id: 'end_digital_art',
        isEnd: true,
        flowLabel: 'Endpunkt 4',
        resultText: 'ENDPUNKT 4: "Digital Art, Games & History"',
        description: `
CEWE: Erstelle Fotos mithilfe von Künstlicher Intelligenz.
Stadtbibliothek: Mache Fotos von dir vor dem Greenscreen.
Oldenburger Computer-Museum: Erlebe die Geschichte der Datenträger an Retro-Computern.
Weiss Pharmatechnik: Spiele das interaktive Partikelfangspiel.
XperimenT!-Schulen: Nimm an der großen MINT-Olympiade (mit Knobel- und Programmier-Aufgaben) teil.
ROCKID.one: Entdecke digitale Bildung durch Gamification.
`
    },
    end_natur: {
        id: 'end_natur',
        isEnd: true,
        flowLabel: 'Endpunkt 5',
        resultText: 'ENDPUNKT 5: "Die Naturforscher-Station"',
        description: `
Uni Oldenburg (ICBM): Erforsche "Munition im Meer".
FutureNow! / AWI: Verstehe den Klimawandel (Experimente mit Eis, Arktis-Fotos).
Landesmuseum Natur und Mensch: Entdecke die Vielfalt der Insekten (und probiere Snacks).
MOBILUM (NABU): Erlebe die heimische Flora und Fauna.
Nationalpark-Haus & UNESCO: Lerne alles über das Wattenmeer.
OOWV: Entdecke Spannendes rund um das Thema Wasser.
Ländliche Erwachsenenbildung: Beobachte die Sonne im Tiny Observatorium.
Oldenburgische Landschaft: Mach beim Naturkieker-Quiz mit.
`
    },
    end_zukunft: {
        id: 'end_zukunft',
        isEnd: true,
        flowLabel: 'Endpunkt 6',
        resultText: 'ENDPUNKT 6: "Deine Zukunft in MINT"',
        description: `
Agentur für Arbeit: Generelle Berufsorientierung.
BTC AG: Infos zu Ausbildung und Dualem Studium in der IT.
EWE AG: Einblicke in technische Ausbildungsberufe.
Uni Oldenburg (OLELA): Alles über das Lehramtsstudium.
Hochschule Emden-Leer: Infos zum Niedersachsentechnikum und MINT-Studiengängen.
(Tipp: Auch die Uni-Institute für Physik, Chemie, Mathe informieren über ihre Studiengänge!)
`
    },
    end_labor: {
        id: 'end_labor',
        isEnd: true,
        flowLabel: 'Endpunkt 7',
        resultText: 'ENDPUNKT 7: "Das Forscher-Labor"',
        description: `
Uni Oldenburg (Physik): Experimente zu Atomen und Kosmos.
Uni Oldenburg (Chemie): Mach beim "Fisch-Drucken" mit und probiere Stickstoffeis.
Uni Oldenburg (Mathematik): Experimentiere mit Seifenhäuten.
Hochschule Emden-Leer: Verstehe Physik mit dem "Schokoladenschiffsantrieb", extrahiere DNA oder spiele das XXL-Widerstands-Spiel.
EWE AG: Baue kleine Windräder oder teste den Schweißsimulator.
Jade Hochschule (Hörtechnik): Mache Hörversuche und teste deine Ohren.
Oldenburgische Landschaft: Gestalte dein eigenes Glaskunstwerk.
`
    },
};

// Helper to find all reachable end nodes from a given start node
const findAllReachableEndNodes = (startNodeId, tree) => {
    const reachableEndNodes = new Set();
    const visited = new Set();
    const queue = [startNodeId];

    while (queue.length > 0) {
        const currentNodeId = queue.shift();

        if (visited.has(currentNodeId)) {
            continue;
        }
        visited.add(currentNodeId);

        const node = tree[currentNodeId];
        if (!node) {
            continue;
        }

        if (node.isEnd) {
            reachableEndNodes.add(currentNodeId);
            continue;
        }

        if (node.answers) {
            node.answers.forEach(answer => {
                if (!visited.has(answer.nextNodeId)) {
                    queue.push(answer.nextNodeId);
                }
            });
        }
        if (node.nextNodeOnScan) {
            if (!visited.has(node.nextNodeOnScan)) {
                queue.push(node.nextNodeOnScan);
            }
        }
    }
    return Array.from(reachableEndNodes);
};


import dagre from 'dagre';

const getLayoutedElements = (treeData, pathTaken) => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: 'TB', nodesep: 40, ranksep: 100 });

    const nodeWidth = 220;
    const nodeHeight = 100;

    const nodesForFlow = [];
    const edgesForFlow = [];

    // Filter for relevant nodes to draw: questions, scan prompts, and endpoints
    const relevantNodeIds = new Set(['start']);
    const queue = ['start'];
    while(queue.length > 0) {
        const nodeId = queue.shift();
        const node = treeData[nodeId];
        if(!node) continue;

        if(node.answers) {
            node.answers.forEach(ans => {
                if(!relevantNodeIds.has(ans.nextNodeId)) {
                    relevantNodeIds.add(ans.nextNodeId);
                    queue.push(ans.nextNodeId);
                }
            });
        }
        if(node.nextNodeOnScan) {
             if(!relevantNodeIds.has(node.nextNodeOnScan)) {
                relevantNodeIds.add(node.nextNodeOnScan);
                queue.push(node.nextNodeOnScan);
             }
        }
    }


    Object.values(treeData).forEach(nodeInfo => {
        // Only draw nodes that are part of the main flow
        if (!relevantNodeIds.has(nodeInfo.id) && !nodeInfo.isEnd) {
            // Make sure endpoints are always included
            let isReachable = false;
            for(const id of relevantNodeIds) {
                if(findAllReachableEndNodes(id, treeData).includes(nodeInfo.id)) {
                    isReachable = true;
                    break;
                }
            }
            if(!isReachable) return;
        }


        const label = nodeInfo.question;
        const isInPath = pathTaken.includes(nodeInfo.id);

        dagreGraph.setNode(nodeInfo.id, { width: nodeWidth, height: nodeHeight });

        nodesForFlow.push({
            id: nodeInfo.id,
            data: { label: label },
            position: { x: 0, y: 0 },
            type: nodeInfo.isEnd ? 'output' : (nodeInfo.id === 'start' ? 'input' : 'default'),
            style: {
                width: nodeWidth,
                textAlign: 'center',
                fontSize: '12px',
                opacity: isInPath ? 1 : 0.6,
                border: isInPath ? '2px solid #004494' : '1px solid #ccc',
                background: isInPath ? '#e6f0ff' : (nodeInfo.qrCode ? '#fffbe6' : '#ffffff'),
                whiteSpace: 'pre-wrap',
            }
        });

        const connectNodes = (sourceId, targetId, edgeLabel = '') => {
             const isEdgeInPath = pathTaken.includes(sourceId) && pathTaken.includes(targetId);
             edgesForFlow.push({
                id: `e-${sourceId}-${targetId}-${edgeLabel.replace(/\s/g, '')}`,
                source: sourceId,
                target: targetId,
                type: 'custom',
                data: { label: edgeLabel },
                animated: isEdgeInPath,
            });
            dagreGraph.setEdge(sourceId, targetId);
        }

        if (nodeInfo.answers) {
            nodeInfo.answers.forEach(answer => {
                connectNodes(nodeInfo.id, answer.nextNodeId, answer.text)
            });
        }
        if (nodeInfo.nextNodeOnScan) {
            connectNodes(nodeInfo.id, nodeInfo.nextNodeOnScan, '✅ Scan erfolgreich');
        }
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodesForFlow.map(node => {
        const nodeWithPosition = dagreGraph.node(node.id);
        if(nodeWithPosition){
            node.position = {
                x: nodeWithPosition.x - nodeWidth / 2,
                y: nodeWithPosition.y - nodeHeight / 2,
            };
        }
        return node;
    });

    return { nodes: layoutedNodes, edges: edgesForFlow };
};


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
                setError(`Falscher QR-Code gescannt. Erwartet: ${expectedCode}`);
            }
        }
        
        // Wrap render in a timeout to ensure element is in the DOM
        const timeoutId = setTimeout(() => {
            const scannerElement = document.getElementById(readerId);
            if(scannerElement && !html5QrcodeScanner.isScanning) {
               html5QrcodeScanner.render(onScanSuccessCb, (errorMessage) => { });
            }
        }, 100);


        return () => {
            clearTimeout(timeoutId);
            // Ensure scanner is active before trying to clear
            if (html5QrcodeScanner && html5QrcodeScanner.isScanning) {
                 html5QrcodeScanner.clear().catch(err => console.error("Error clearing scanner on unmount", err));
            }
        };
    }, [expectedCode, onScanSuccess]);

    return (
        <div className="mt-6 p-4 border-2 border-dashed border-gray-400 rounded-lg" style={{ backgroundColor: '#34495E' }}>
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
    const [remainingEndLocations, setRemainingEndLocations] = useState(0);

    useEffect(() => {
        if (currentNodeId) {
            const reachable = findAllReachableEndNodes(currentNodeId, decisionTree);
            setRemainingEndLocations(reachable.length);
        }
    }, [currentNodeId]);

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
        if (currentNode && currentNode.nextNodeOnScan) {
            setMessage('QR-Code erfolgreich gescannt!');
            setTimeout(() => advanceToNode(currentNode.nextNodeOnScan), 300);
        }
    }, [currentNode, advanceToNode]);

    const startGame = () => setGameStarted(true);
    const restartGame = () => {
        setGameStarted(false);
        setCurrentNodeId('start');
        setPathTaken(['start']);
    }

    const handleMouseDown = (e) => {
        const button = e.currentTarget;
        button.style.setProperty('--x', `${e.clientX - button.getBoundingClientRect().left}px`);
        button.style.setProperty('--y', `${e.clientY - button.getBoundingClientRect().top}px`);
    };

    const { nodes, edges } = useMemo(() => {
        return getLayoutedElements(decisionTree, pathTaken)
    }, [pathTaken]);

    if (!gameStarted) {
        return (
            <div className="main-app-container introduction-screen">
                <h1>Willkommen zum AHOI MINT Festival!</h1>
                <h2>Finde heraus, was dich am meisten begeistert!</h2>
                <p>Beantworte ein paar Fragen und scanne QR-Codes, um herauszufinden, welche Stände und Experimente am besten zu deinen Interessen passen. Dein Weg wird am Ende visualisiert.</p>
                <button onClick={startGame} onMouseDown={handleMouseDown} className="start-button"><span className="button-text">Tour starten!</span></button>
                <footer style={{ textAlign: 'center', fontSize: '0.75rem', color: 'white', marginTop: '32px' }}>Entwickelt mit Project IDX & React.</footer>
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

            <div className="end-locations-counter">
                Verbleibende Endpunkte: {remainingEndLocations}
            </div>

            {currentNode.isEnd ? (
                <div className="result-box">
                    <h2 className="result-title">Geschafft! 🎉</h2>
                    <p className="result-text">{currentNode.resultText}</p>
                    <p className="result-description" style={{ whiteSpace: 'pre-wrap' }}>{currentNode.description}</p>
                    
                    <h3 className="text-lg font-bold mt-6 mb-2 text-center text-white">Dein Weg durch das Festival:</h3>
                    <div style={{height: '500px', width: '100%', border: '1px solid #ccc', borderRadius: '8px', background: '#f8f8f8' }}>
                         <DecisionTreeFlow nodes={nodes} edges={edges} />
                    </div>

                    <button onClick={restartGame} onMouseDown={handleMouseDown} className="start-button"><span className="button-text">Nochmal spielen</span></button>
                    <Confetti width={width} height={height} recycle={false} numberOfPieces={250} gravity={0.15} />
                </div>
            ) : (
                <div className="content-box">
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
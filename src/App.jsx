import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useWindowSize } from 'react-use';
import Confetti from 'react-confetti';
import { Html5QrcodeScanner } from 'html5-qrcode';
import 'leaflet/dist/leaflet.css';
import DecisionTreeFlow from './DecisionTreeFlow';
import dagre from 'dagre';


const decisionTree = {
    // [DEIN KOMPLETTER decisionTree OBJEKT VON DER VORHERIGEN ANFRAGE]
    // EBENE 1
    start: {
        id: 'start',
        question: 'Geht es dir heute mehr um die digitale Welt (Computer, Code, VR) oder um die anfassbare, reale Welt (Natur, Experimente, Handwerk)?',
        flowLabel: 'Start',
        isEnd: false,
        computerSays: 'Meine erste Analyse: Ich teile die Welt in zwei große Bereiche. Bist du heute eher im Team "Pixel & Bytes" oder im Team "Atome & Natur"? Deine Wahl bestimmt den ganzen weiteren Weg.',
        answers: [
            { text: 'Digitale Welt', nextNodeId: 'scan_1a_digital' },
            { text: 'Reale Welt', nextNodeId: 'scan_1b_real' },
        ],
    },

    // --- SCAN NODES EBENE 1 ---
    scan_1a_digital: {
        id: 'scan_1a_digital',
        question: 'QR-Code für "Digitale Welt" wird übersprungen. Klicke um fortzufahren.',
        flowLabel: 'Scan: 1A_DIGITAL',
        isEnd: false,
        answers: [{ text: 'Weiter', nextNodeId: 'q_2a' }],
    },
    scan_1b_real: {
        id: 'scan_1b_real',
        question: 'QR-Code für "Reale Welt" wird übersprungen. Klicke um fortzufahren.',
        flowLabel: 'Scan: 1B_REAL',
        isEnd: false,
        answers: [{ text: 'Weiter', nextNodeId: 'q_2b' }],
    },

    // EBENE 2
    q_2a: {
        id: 'q_2a',
        question: 'Möchtest du aktiv etwas erschaffen und steuern (z.B. programmieren, bauen) oder lieber passiv etwas erleben (z.B. zuschauen, spielen, eintauchen)?',
        flowLabel: 'Digital: Aktiv/Passiv',
        isEnd: false,
        computerSays: 'Okay, du bist im digitalen Universum. Nun die nächste logische Gabelung: Bist du der Schöpfer, der die Fäden zieht, oder der Entdecker, der die Welt erlebt, wie sie ist? Deine Rolle ist jetzt gefragt.',
        answers: [
            { text: 'Aktiv erschaffen', nextNodeId: 'scan_2a_active' },
            { text: 'Passiv erleben', nextNodeId: 'scan_2b_passive' },
        ],
    },
    q_2b: {
        id: 'q_2b',
        question: 'Zieht es dich mehr zur Natur (Tiere, Pflanzen, Umwelt) oder zu von Menschen gemachter Wissenschaft & Technik (Physik, Chemie, Handwerk)?',
        flowLabel: 'Real: Natur/Technik',
        isEnd: false,
        computerSays: 'Du hast die reale Welt gewählt. Meine Datenbank spaltet das in zwei Hauptkategorien: die organische, gewachsene Welt der Natur oder die konstruierte, erforschte Welt der Wissenschaft und Technik. Wohin neigt dein Interesse?',
        answers: [
            { text: 'Natur', nextNodeId: 'scan_2c_nature' },
            { text: 'Wissenschaft & Technik', nextNodeId: 'scan_2d_science' },
        ],
    },

    // --- SCAN NODES EBENE 2 ---
    scan_2a_active: { id: 'scan_2a_active', question: 'QR-Code für "Aktiv erschaffen" wird übersprungen.', flowLabel: 'Scan: 2A_ACTIVE', isEnd: false, answers: [{ text: 'Weiter', nextNodeId: 'q_3a' }] },
    scan_2b_passive: { id: 'scan_2b_passive', question: 'QR-Code für "Passiv erleben" wird übersprungen.', flowLabel: 'Scan: 2B_PASSIVE', isEnd: false, answers: [{ text: 'Weiter', nextNodeId: 'q_3b' }] },
    scan_2c_nature: { id: 'scan_2c_nature', question: 'QR-Code für "Natur" wird übersprungen.', flowLabel: 'Scan: 2C_NATURE', isEnd: false, answers: [{ text: 'Weiter', nextNodeId: 'q_3c' }] },
    scan_2d_science: { id: 'scan_2d_science', question: 'QR-Code für "Wissenschaft & Technik" wird übersprungen.', flowLabel: 'Scan: 2D_SCIENCE', isEnd: false, answers: [{ text: 'Weiter', nextNodeId: 'q_3d' }] },

    // EBENE 3
    q_3a: {
        id: 'q_3a',
        question: 'Willst du dich auf Roboter und Dinge, die sich bewegen, konzentrieren oder lieber auf Code, Elektronik und digitale Fertigung?',
        flowLabel: 'Aktiv: Roboter/Code',
        isEnd: false,
        computerSays: 'Ein aktiver Schöpfer! Jetzt muss ich genauer werden: Liegt dein Fokus auf der Mechanik und Bewegung von Robotern, oder auf der unsichtbaren Magie von Code und digitalen Bauplänen?',
        answers: [
            { text: 'Roboter', nextNodeId: 'scan_3a_robots' },
            { text: 'Code & digitale Fertigung', nextNodeId: 'scan_3b_code' },
        ],
    },
    q_3b: {
        id: 'q_3b',
        question: 'Suchst du ein immersives Erlebnis, bei dem du in eine andere Welt versetzt wirst (z.B. mit Brille), oder ein interaktives Spiel auf einem normalen Bildschirm?',
        flowLabel: 'Passiv: Immersiv/Interaktiv',
        isEnd: false,
        computerSays: 'Ein passiver Genießer! Die Frage ist nun, wie tief du eintauchen willst. Suchst du das totale Eintauchen mit VR, das deine Sinne täuscht, oder die klassische Interaktion mit einem Spiel auf einem Display?',
        answers: [
            { text: 'Immersives Erlebnis', nextNodeId: 'scan_3c_immersive' },
            { text: 'Interaktives Spiel / Anzeige', nextNodeId: 'scan_3d_interactive' },
        ],
    },
    q_3c: {
        id: 'q_3c',
        question: 'Interessieren dich mehr die Lebewesen (Tiere, Pflanzen) oder die großen Elemente und Systeme (Wasser, Klima, Weltall)?',
        flowLabel: 'Natur: Lebewesen/Systeme',
        isEnd: false,
        computerSays: 'Faszination Natur! Ich filtere weiter: Konzentrierst du dich auf die einzelnen Akteure – die Tiere und Pflanzen – oder auf das große Ganze, die mächtigen Systeme, die unsere Welt formen?',
        answers: [
            { text: 'Lebewesen', nextNodeId: 'scan_3e_living' },
            { text: 'Elemente & Systeme', nextNodeId: 'scan_3f_systems' },
        ],
    },
    q_3d: {
        id: 'q_3d',
        question: 'Möchtest du die fundamentalen Gesetze des Universums erforschen (Physik, Mathe, Chemie) oder lieber angewandte Technik und Handwerk ausprobieren?',
        flowLabel: 'Wissen.: Theorie/Praxis',
        isEnd: false,
        computerSays: 'Ein Kopf für die Wissenschaft! Jetzt die entscheidende Weiche: Willst du die theoretischen Grundlagen verstehen, die alles zusammenhalten, oder willst du die Ärmel hochkrempeln und diese Gesetze in der Praxis anwenden?',
        answers: [
            { text: 'Fundamentale Gesetze', nextNodeId: 'scan_3g_fundamental' },
            { text: 'Angewandte Technik & Handwerk', nextNodeId: 'scan_3h_applied' },
        ],
    },

    // --- SCAN NODES EBENE 3 ---
    scan_3a_robots: { id: 'scan_3a_robots', question: 'QR-Code für "Roboter" wird übersprungen.', flowLabel: 'Scan: 3A_ROBOTS', isEnd: false, answers: [{ text: 'Weiter', nextNodeId: 'q_4a' }] },
    scan_3b_code: { id: 'scan_3b_code', question: 'QR-Code für "Code & digitale Fertigung" wird übersprungen.', flowLabel: 'Scan: 3B_CODE', isEnd: false, answers: [{ text: 'Weiter', nextNodeId: 'q_4b' }] },
    scan_3c_immersive: { id: 'scan_3c_immersive', question: 'QR-Code für "Immersives Erlebnis" wird übersprungen.', flowLabel: 'Scan: 3C_IMMERSIVE', isEnd: false, answers: [{ text: 'Weiter', nextNodeId: 'q_4c' }] },
    scan_3d_interactive: { id: 'scan_3d_interactive', question: 'QR-Code für "Interaktives Spiel" wird übersprungen.', flowLabel: 'Scan: 3D_INTERACTIVE', isEnd: false, answers: [{ text: 'Weiter', nextNodeId: 'q_4d' }] },
    scan_3e_living: { id: 'scan_3e_living', question: 'QR-Code für "Lebewesen" wird übersprungen.', flowLabel: 'Scan: 3E_LIVING', isEnd: false, answers: [{ text: 'Weiter', nextNodeId: 'q_4e' }] },
    scan_3f_systems: { id: 'scan_3f_systems', question: 'QR-Code für "Elemente & Systeme" wird übersprungen.', flowLabel: 'Scan: 3F_SYSTEMS', isEnd: false, answers: [{ text: 'Weiter', nextNodeId: 'q_4f' }] },
    scan_3g_fundamental: { id: 'scan_3g_fundamental', question: 'QR-Code für "Fundamentale Gesetze" wird übersprungen.', flowLabel: 'Scan: 3G_FUNDAMENTAL', isEnd: false, answers: [{ text: 'Weiter', nextNodeId: 'q_4g' }] },
    scan_3h_applied: { id: 'scan_3h_applied', question: 'QR-Code für "Angewandte Technik" wird übersprungen.', flowLabel: 'Scan: 3H_APPLIED', isEnd: false, answers: [{ text: 'Weiter', nextNodeId: 'q_4h' }] },

    // EBENE 4
    q_4a: {
        id: 'q_4a',
        question: 'Möchtest du einen großen, industrienahen Roboter erleben oder lieber mit kleinen, verspielten Lernrobotern arbeiten?',
        flowLabel: 'Roboter: Groß/Klein',
        isEnd: false,
        computerSays: 'Roboter-Spezialisierung! Die binäre Wahl: beeindruckende Kraft und Präzision im Großformat, oder kreativer Spaß und Lernpotenzial im Kleinformat?',
        answers: [
            { text: 'Großer Roboter', nextNodeId: 'end_big_robot' },
            { text: 'Kleine Lernroboter', nextNodeId: 'scan_4b_small_robots' },
        ],
    },
    q_4b: {
        id: 'q_4b',
        question: 'Willst du am Computer reinen Code schreiben oder lieber eine digitale Vorlage für eine reale Maschine (Drucker, Laser) erstellen?',
        flowLabel: 'Code: Software/Hardware',
        isEnd: false,
        computerSays: 'Okay, Coder! Jetzt die Schnittstelle zur Realität: Bleibst du in der reinen, abstrakten Welt des Codes, oder willst du eine Brücke schlagen und mit deinem Code physische Maschinen steuern?',
        answers: [
            { text: 'Reiner Code', nextNodeId: 'scan_4c_pure_code' },
            { text: 'Digitale Vorlage für Maschine', nextNodeId: 'scan_4d_fabrication' },
        ],
    },
    q_4c: {
        id: 'q_4c',
        question: 'Willst du eine Virtual-Reality-Brille aufsetzen oder lieber eine 2D-Technik wie einen Greenscreen nutzen?',
        flowLabel: 'Immersion: VR/2D',
        isEnd: false,
        computerSays: 'Immersionsebene wird kalibriert. Wählst du die vollständige 360°-Illusion einer VR-Brille oder die kreative 2D-Magie eines Greenscreens, der dich in ein Bild zaubert?',
        answers: [
            { text: 'VR-Brille', nextNodeId: 'scan_4e_vr' },
            { text: '2D-Technik', nextNodeId: 'end_greenscreen' },
        ],
    },
    q_4d: {
        id: 'q_4d',
        question: 'Möchtest du ein modernes Geschicklichkeitsspiel spielen oder die Geschichte der Computer interaktiv erleben?',
        flowLabel: 'Interaktiv: Spiel/Historie',
        isEnd: false,
        computerSays: 'Interaktions-Modus gewählt. Zeitliche Dimension wird abgefragt: Richtest du deinen Blick auf die Gegenwart und testest deine Fähigkeiten in einem modernen Spiel, oder reist du in die Vergangenheit und erkundest die Wurzeln der digitalen Welt?',
        answers: [
            { text: 'Modernes Spiel', nextNodeId: 'scan_4g_modern_game' },
            { text: 'Computer-Geschichte', nextNodeId: 'end_history' },
        ],
    },
    q_4e: {
        id: 'q_4e',
        question: 'Willst du dich auf die winzige Welt der Insekten fokussieren oder lieber das große Ökosystem Wattenmeer kennenlernen?',
        flowLabel: 'Lebewesen: Mikro/Makro',
        isEnd: false,
        computerSays: 'Fokus auf Lebewesen! Jetzt zoome ich rein oder raus. Interessiert dich der Mikrokosmos der Insekten, voller faszinierender Details, oder der Makrokosmos eines ganzen Lebensraums wie dem Wattenmeer?',
        answers: [
            { text: 'Welt der Insekten', nextNodeId: 'end_insects' },
            { text: 'Ökosystem Wattenmeer', nextNodeId: 'scan_4j_waddensea' },
        ],
    },
    q_4f: {
        id: 'q_4f',
        question: 'Schaust du lieber nach oben zu den Sternen oder auf die Prozesse hier auf der Erde (Klima, Wasser)?',
        flowLabel: 'Systeme: Kosmos/Planet',
        isEnd: false,
        computerSays: 'Systemanalyse! Deine Perspektive ist entscheidend: Richtest du dein Teleskop ins unendliche All oder dein Mikroskop auf die komplexen Systeme unseres eigenen Planeten?',
        answers: [
            { text: 'Zu den Sternen', nextNodeId: 'end_stars' },
            { text: 'Prozesse auf der Erde', nextNodeId: 'scan_4l_earth' },
        ],
    },
    q_4g: {
        id: 'q_4g',
        question: 'Interessiert dich mehr Chemie (Stoffe und ihre Reaktionen) oder die Welt der Physik und Mathematik (Kräfte, Strukturen, Zahlen)?',
        flowLabel: 'Grundlagen: Chemie/Physik',
        isEnd: false,
        computerSays: 'Analyse der fundamentalen Wissenschaften. Die Frage ist, ob dich die Bausteine der Materie und ihre Verwandlungen (Chemie) mehr fesseln als die universellen Regeln von Energie, Bewegung und Logik (Physik & Mathe).',
        answers: [
            { text: 'Chemie', nextNodeId: 'end_chemistry' },
            { text: 'Physik & Mathematik', nextNodeId: 'scan_4n_physics_math' },
        ],
    },
    q_4h: {
        id: 'q_4h',
        question: 'Möchtest du dich direkt über Ausbildung und Beruf informieren oder lieber frei experimentieren und kreativ sein?',
        flowLabel: 'Anwendung: Karriere/Hobby',
        isEnd: false,
        computerSays: 'Anwendungsmodus! Ich muss wissen, ob dein Ziel heute pragmatisch ist – also Informationen für deine Zukunft zu sammeln – oder ob du einfach nur aus Spaß an der Freude forschen und gestalten willst.',
        answers: [
            { text: 'Ausbildung & Beruf', nextNodeId: 'scan_4o_career' },
            { text: 'Frei experimentieren', nextNodeId: 'scan_4p_experiment' },
        ],
    },

    // --- SCAN NODES EBENE 4 ---
    scan_4b_small_robots: { id: 'scan_4b_small_robots', question: 'QR-Code für "Kleine Lernroboter" wird übersprungen.', flowLabel: 'Scan: 4B_SML_ROBOTS', isEnd: false, answers: [{ text: 'Weiter', nextNodeId: 'q_5a' }] },
    scan_4c_pure_code: { id: 'scan_4c_pure_code', question: 'QR-Code für "Reiner Code" wird übersprungen.', flowLabel: 'Scan: 4C_PURE_CODE', isEnd: false, answers: [{ text: 'Weiter', nextNodeId: 'q_5b' }] },
    scan_4d_fabrication: { id: 'scan_4d_fabrication', question: 'QR-Code für "Digitale Vorlage" wird übersprungen.', flowLabel: 'Scan: 4D_FABRICATION', isEnd: false, answers: [{ text: 'Weiter', nextNodeId: 'q_5c' }] },
    scan_4e_vr: { id: 'scan_4e_vr', question: 'QR-Code für "VR-Brille" wird übersprungen.', flowLabel: 'Scan: 4E_VR', isEnd: false, answers: [{ text: 'Weiter', nextNodeId: 'q_5d' }] },
    scan_4g_modern_game: { id: 'scan_4g_modern_game', question: 'QR-Code für "Modernes Spiel" wird übersprungen.', flowLabel: 'Scan: 4G_MODERN_GAME', isEnd: false, answers: [{ text: 'Weiter', nextNodeId: 'q_5e' }] },
    scan_4j_waddensea: { id: 'scan_4j_waddensea', question: 'QR-Code für "Ökosystem Wattenmeer" wird übersprungen.', flowLabel: 'Scan: 4J_WADDENSEA', isEnd: false, answers: [{ text: 'Weiter', nextNodeId: 'q_5f' }] },
    scan_4l_earth: { id: 'scan_4l_earth', question: 'QR-Code für "Prozesse auf der Erde" wird übersprungen.', flowLabel: 'Scan: 4L_EARTH', isEnd: false, answers: [{ text: 'Weiter', nextNodeId: 'q_5g' }] },
    scan_4n_physics_math: { id: 'scan_4n_physics_math', question: 'QR-Code für "Physik & Mathe" wird übersprungen.', flowLabel: 'Scan: 4N_PHYS_MATH', isEnd: false, answers: [{ text: 'Weiter', nextNodeId: 'q_5h' }] },
    scan_4o_career: { id: 'scan_4o_career', question: 'QR-Code für "Ausbildung & Beruf" wird übersprungen.', flowLabel: 'Scan: 4O_CAREER', isEnd: false, answers: [{ text: 'Weiter', nextNodeId: 'q_5i' }] },
    scan_4p_experiment: { id: 'scan_4p_experiment', question: 'QR-Code für "Frei experimentieren" wird übersprungen.', flowLabel: 'Scan: 4P_EXPERIMENT', isEnd: false, answers: [{ text: 'Weiter', nextNodeId: 'q_5j' }] },

    // EBENE 5
    q_5a: {
        id: 'q_5a',
        question: 'Möchtest du einen Roboter aus bekannten Steinen selbst bauen oder lieber einen fertigen Roboter durch Zeichnen von Linien oder Tastendruck programmieren?',
        flowLabel: 'Kl. Roboter: Bauen/Progr.',
        isEnd: false,
        computerSays: 'Okay, Lernroboter! Bist du der Konstrukteur, der aus Einzelteilen etwas Neues erschafft, oder der Programmierer, der einer fertigen Maschine auf kreative Weise Leben einhaucht?',
        answers: [
            { text: 'Selbst bauen', nextNodeId: 'end_build_robot' },
            { text: 'Fertigen Roboter programmieren', nextNodeId: 'scan_5b_program_robot' },
        ],
    },
    q_5b: {
        id: 'q_5b',
        question: 'Möchtest du Elektronik (Hardware) mit Code zum Leben erwecken oder dich auf reine Software-Logik konzentrieren?',
        flowLabel: 'Code: Hardware/Software',
        isEnd: false,
        computerSays: 'Feinabstimmung für Coder: Willst du, dass dein Code Lichter blinken lässt und Motoren steuert (Hardware)? Oder willst du lieber komplexe Rätsel und Aufgaben rein in der Software lösen?',
        answers: [
            { text: 'Hardware zum Leben erwecken', nextNodeId: 'end_hardware_code' },
            { text: 'Reine Software-Logik', nextNodeId: 'scan_5d_software_code' },
        ],
    },
    q_5c: {
        id: 'q_5c',
        question: 'Möchtest du etwas zweidimensional mit einem Laser ausschneiden lassen oder dreidimensional mit einem 3D-Stift/Drucker arbeiten?',
        flowLabel: 'Fabrikation: 2D/3D',
        isEnd: false,
        computerSays: 'Digitale Fertigung! Es geht um die Dimensionen. Bevorzugst du die Präzision des Schneidens in der Fläche (2D), oder die Freiheit des Aufbauens im Raum (3D)?',
        answers: [
            { text: '2D mit Laser', nextNodeId: 'end_laser_2d' },
            { text: '3D-Druck', nextNodeId: 'scan_5f_print_3d' },
        ],
    },
    q_5d: {
        id: 'q_5d',
        question: 'Willst du in der VR-Welt ein kniffliges Rätsel lösen oder dich über reale Berufe und Umgebungen informieren?',
        flowLabel: 'VR: Spiel/Info',
        isEnd: false,
        computerSays: 'VR-Mission wird definiert: Soll dein Gehirn eine spielerische Herausforderung meistern, oder sollen deine Augen Informationen über die echte Welt sammeln?',
        answers: [
            { text: 'Rätsel lösen', nextNodeId: 'end_vr_puzzle' },
            { text: 'Reale Welt erkunden', nextNodeId: 'scan_5h_vr_realworld' },
        ],
    },
    q_5e: {
        id: 'q_5e',
        question: 'Möchtest du in einer großen Olympiade mit vielen Stationen antreten oder lieber an einem Stand ein gezieltes Spiel spielen?',
        flowLabel: 'Spiel: Olympiade/Einzel',
        isEnd: false,
        computerSays: 'Spielmodus! Bist du der Marathonläufer, der viele kleine Herausforderungen sucht und Stempel sammelt, oder der Sprinter, der sich auf ein einziges, intensives Spiel konzentrieren will?',
        answers: [
            { text: 'Große Olympiade', nextNodeId: 'end_olympics' },
            { text: 'Einzelnes Spiel', nextNodeId: 'scan_5j_single_game' },
        ],
    },
    q_5f: {
        id: 'q_5f',
        question: 'Willst du das Wattenmeer aus der Perspektive der Zugvögel erleben oder die Auswirkungen von Müll im Meer erforschen?',
        flowLabel: 'Watt: Vögel/Müll',
        isEnd: false,
        computerSays: 'Wattenmeer-Fokus! Zwei Perspektiven: die natürliche, rhythmische Welt der Vögel und Gezeiten, oder das vom Menschen verursachte Problem des Mülls und seine ernsten Konsequenzen.',
        answers: [
            { text: 'Perspektive der Zugvögel', nextNodeId: 'end_birds_view' },
            { text: 'Müll im Meer', nextNodeId: 'end_trash_sea' },
        ],
    },
    q_5g: {
        id: 'q_5g',
        question: 'Geht es dir speziell um das Thema Wasser oder um den globalen Klimawandel im Allgemeinen?',
        flowLabel: 'Erde: Wasser/Klima',
        isEnd: false,
        computerSays: 'Planetare Prozesse! Zoom-Level wird justiert. Konzentrierst du dich auf das spezifische, lebenswichtige Element Wasser, oder betrachtest du das allumfassende, komplexe System des Klimawandels?',
        answers: [
            { text: 'Thema Wasser', nextNodeId: 'end_water' },
            { text: 'Globaler Klimawandel', nextNodeId: 'end_climate' },
        ],
    },
    q_5h: {
        id: 'q_5h',
        question: 'Möchtest du die schöne, fast künstlerische Seite der Mathematik sehen oder lieber die Physik hinter alltäglichen Dingen wie Schiffsantrieben verstehen?',
        flowLabel: 'Phy/Ma: Kunst/Alltag',
        isEnd: false,
        computerSays: 'Physik & Mathe! Geht es dir um die abstrakte Schönheit der reinen Logik und Form, oder um die konkrete Anwendung physikalischer Gesetze, die unsere reale Welt antreiben?',
        answers: [
            { text: 'Schöne Mathematik', nextNodeId: 'end_math_art' },
            { text: 'Physik im Alltag', nextNodeId: 'scan_5p_physics_daily' },
        ],
    },
    q_5i: {
        id: 'q_5i',
        question: 'Suchst du eher allgemeine Orientierung oder ganz spezifische Infos zu Ausbildung/Studium in einem Unternehmen oder einer Hochschule?',
        flowLabel: 'Karriere: Allg./Spez.',
        isEnd: false,
        computerSays: 'Karriere-Scan! Brauchst du den großen Überblick, um dich überhaupt erst zu orientieren, oder hast du schon eine grobe Richtung und suchst jetzt gezielt nach konkreten Angeboten?',
        answers: [
            { text: 'Allgemeine Orientierung', nextNodeId: 'end_general_info' },
            { text: 'Spezifische Infos', nextNodeId: 'scan_5r_specific_info' },
        ],
    },
    q_5j: {
        id: 'q_5j',
        question: 'Möchtest du mit Energie und Werkzeug (Windrad, Schweißen) arbeiten oder lieber etwas Kreatives von Hand erschaffen (Glaskunst)?',
        flowLabel: 'Experiment: Technik/Kunst',
        isEnd: false,
        computerSays: 'Experimentier-Modus! Die letzte Unterscheidung: Zieht es dich zur handfesten Technik, wo es um Energie und robuste Werkzeuge geht, oder zur filigranen Kunst, wo du mit Form und Farbe gestaltest?',
        answers: [
            { text: 'Energie & Werkzeug', nextNodeId: 'end_energy_tools' },
            { text: 'Kreativ von Hand', nextNodeId: 'scan_5t_handcraft' },
        ],
    },

    // --- SCAN NODES EBENE 5 ---
    scan_5b_program_robot: { id: 'scan_5b_program_robot', question: 'QR-Code für "Fertigen Roboter programmieren" wird übersprungen.', flowLabel: 'Scan: 5B_PROG_ROBOT', isEnd: false, answers: [{ text: 'Weiter', nextNodeId: 'q_6a' }] },
    scan_5d_software_code: { id: 'scan_5d_software_code', question: 'QR-Code für "Reine Software-Logik" wird übersprungen.', flowLabel: 'Scan: 5D_SOFT_CODE', isEnd: false, answers: [{ text: 'Weiter', nextNodeId: 'q_6b' }] },
    scan_5f_print_3d: { id: 'scan_5f_print_3d', question: 'QR-Code für "3D-Druck" wird übersprungen.', flowLabel: 'Scan: 5F_PRINT_3D', isEnd: false, answers: [{ text: 'Weiter', nextNodeId: 'q_6c' }] },
    scan_5h_vr_realworld: { id: 'scan_5h_vr_realworld', question: 'QR-Code für "Reale Welt erkunden" wird übersprungen.', flowLabel: 'Scan: 5H_VR_REAL', isEnd: false, answers: [{ text: 'Weiter', nextNodeId: 'q_6d' }] },
    scan_5j_single_game: { id: 'scan_5j_single_game', question: 'QR-Code für "Einzelnes Spiel" wird übersprungen.', flowLabel: 'Scan: 5J_SINGLE_GAME', isEnd: false, answers: [{ text: 'Weiter', nextNodeId: 'q_6e' }] },
    scan_5p_physics_daily: { id: 'scan_5p_physics_daily', question: 'QR-Code für "Physik im Alltag" wird übersprungen.', flowLabel: 'Scan: 5P_PHYS_DAILY', isEnd: false, answers: [{ text: 'Weiter', nextNodeId: 'q_6f' }] },
    scan_5r_specific_info: { id: 'scan_5r_specific_info', question: 'QR-Code für "Spezifische Infos" wird übersprungen.', flowLabel: 'Scan: 5R_SPECIFIC', isEnd: false, answers: [{ text: 'Weiter', nextNodeId: 'q_6g' }] },
    scan_5t_handcraft: { id: 'scan_5t_handcraft', question: 'QR-Code für "Kreativ von Hand" wird übersprungen.', flowLabel: 'Scan: 5T_HANDCRAFT', isEnd: false, answers: [{ text: 'Weiter', nextNodeId: 'q_6h' }] },


    // EBENE 6
    q_6a: {
        id: 'q_6a',
        question: 'Möchtest du den Roboter auf einer Bodenmatte steuern oder den putzigen Roboterhund "HELDog" über das Gelände führen?',
        flowLabel: 'Prog. Roboter: Matte/Hund',
        isEnd: false,
        computerSays: 'Fast am Ziel! Die letzte Entscheidung: Bleibst du in einem klar definierten Areal mit dem Bodenroboter, oder willst du die Freiheit und die Interaktion mit dem frei laufenden Roboterhund?',
        answers: [
            { text: 'Bodenmatte', nextNodeId: 'end_floor_robot' },
            { text: 'Roboterhund', nextNodeId: 'end_robodog' },
        ],
    },
    q_6b: {
        id: 'q_6b',
        question: 'Willst du einen Hamster durch ein Labyrinth lotsen oder lieber Logik-Gatter in einem abstrakten Rätsel schalten?',
        flowLabel: 'Software: Hamster/Logik',
        isEnd: false,
        computerSays: 'Finale Logik-Abfrage: Wählst du die niedliche, anwendungsnahe Herausforderung mit dem Hamster, oder die abstrakte, fundamentale Denkaufgabe mit den Logik-Gattern, dem Herzstück jedes Computers?',
        answers: [
            { text: 'Hamster', nextNodeId: 'end_hamster' },
            { text: 'Logik-Gatter', nextNodeId: 'end_logic_gates' },
        ],
    },
    q_6c: {
        id: 'q_6c',
        question: 'Möchtest du die modernen Druckstöcke für klassische Druckverfahren sehen oder lieber frei Hand mit einem 3D-Stift malen?',
        flowLabel: '3D: Druckstock/Stift',
        isEnd: false,
        computerSays: '3D-Finale! Geht es dir darum, wie neue Technologie alte Handwerkskunst revolutioniert (Druckstöcke), oder willst du die pure kreative Freiheit und direkt aus deiner Hand ein 3D-Objekt wachsen lassen (3D-Stift)?',
        answers: [
            { text: 'Moderne Druckstöcke', nextNodeId: 'end_print_blocks' },
            { text: 'Frei Hand mit 3D-Stift', nextNodeId: 'end_3d_pen' },
        ],
    },
    q_6d: {
        id: 'q_6d',
        question: 'Möchtest du die Folgen des Klimawandels erleben oder Einblicke in technische Berufe bekommen?',
        flowLabel: 'VR Real: Klima/Berufe',
        isEnd: false,
        computerSays: 'VR-Zielort wird berechnet: Soll die Simulation dich an die Pole der Erde versetzen, um ein globales Problem zu visualisieren, oder dich in den Arbeitsalltag technischer Berufe blicken lassen?',
        answers: [
            { text: 'Klimawandel', nextNodeId: 'end_vr_climate' },
            { text: 'Technische Berufe', nextNodeId: 'end_vr_jobs' },
        ],
    },
    q_6e: {
        id: 'q_6e',
        question: 'Willst du ein Spiel, das dein Gehör testet, oder eines, das deine Reaktionsgeschwindigkeit fordert?',
        flowLabel: 'Spiel: Gehör/Reaktion',
        isEnd: false,
        computerSays: 'Spieler-Profil wird finalisiert: Testest du lieber deinen auditiven Sinn und wie dein Gehirn Geräusche verarbeitet, oder deine motorischen Reflexe und wie schnell du auf visuelle Reize reagieren kannst?',
        answers: [
            { text: 'Gehör testen', nextNodeId: 'end_hearing_game' },
            { text: 'Reaktion testen', nextNodeId: 'end_reaction_game' },
        ],
    },
    q_6f: {
        id: 'q_6f',
        question: 'Möchtest du die Physik der Schifffahrt mit einem Schoko-Experiment verstehen oder lieber allgemeine physikalische Phänomene an verschiedenen Stationen ausprobieren?',
        flowLabel: 'Physik: Schiffe/Allg.',
        isEnd: false,
        computerSays: 'Physik-Endspurt: Wählst du das eine, charmante und fokussierte Experiment zur Schifffahrt, oder willst du einen breiten Überblick über viele verschiedene, faszinierende Phänomene der Physik bekommen?',
        answers: [
            { text: 'Physik der Schifffahrt', nextNodeId: 'end_ship_physics' },
            { text: 'Allgemeine Phänomene', nextNodeId: 'end_general_physics' },
        ],
    },
    q_6g: {
        id: 'q_6g',
        question: 'Suchst du Infos zu einem Lehramtsstudium oder zu Ausbildungen/Studiengängen in der freien Wirtschaft/Technik?',
        flowLabel: 'Spez. Karriere: Lehramt/Wirt.',
        isEnd: false,
        computerSays: 'Spezifische Karrierepfade! Der letzte Filter: Ist dein Ziel, Wissen an die nächste Generation weiterzugeben (Lehramt), oder es in der Industrie und Wirtschaft anzuwenden und neue Produkte zu entwickeln?',
        answers: [
            { text: 'Lehramtsstudium', nextNodeId: 'end_teaching_degree' },
            { text: 'Wirtschaft & Technik', nextNodeId: 'end_industry_tech' },
        ],
    },
    q_6h: {
        id: 'q_6h',
        question: 'Willst du mit dem faszinierenden Material Glas arbeiten oder lieber DNA aus Zellen extrahieren?',
        flowLabel: 'Handwerk: Glas/DNA',
        isEnd: false,
        computerSays: 'Finale Handwerks-Entscheidung! Die Wahl zwischen Anorganik und Organik: das heiße, formbare und künstlerische Material Glas, oder der geheimnisvolle, fundamentale Baustein des Lebens, die DNA.',
        answers: [
            { text: 'Glaskunst', nextNodeId: 'end_glass_art' },
            { text: 'DNA extrahieren', nextNodeId: 'end_dna_extract' },
        ],
    },

    // --- ENDPOINTS ---
    end_big_robot: { id: 'end_big_robot', isEnd: true, flowLabel: 'Ziel: Gr. Roboter', resultText: 'Empfehlung: Großer Roboter', description: 'Broetje-Automation: Interagiere mit einem Industrie-Cobot.' },
    end_greenscreen: { id: 'end_greenscreen', isEnd: true, flowLabel: 'Ziel: Greenscreen', resultText: 'Empfehlung: 2D-Technik', description: 'Stadt Oldenburg - Stadtbibliothek: Mache Fotos von dir vor dem Greenscreen.' },
    end_history: { id: 'end_history', isEnd: true, flowLabel: 'Ziel: Historie', resultText: 'Empfehlung: Computer-Geschichte', description: 'Oldenburger Computer-Museum: Erlebe die Geschichte der Datenträger an Retro-Computern.' },
    end_insects: { id: 'end_insects', isEnd: true, flowLabel: 'Ziel: Insekten', resultText: 'Empfehlung: Welt der Insekten', description: 'Landesmuseum Natur und Mensch Oldenburg: Entdecke die Vielfalt der Insekten.' },
    end_stars: { id: 'end_stars', isEnd: true, flowLabel: 'Ziel: Sterne', resultText: 'Empfehlung: Blick zu den Sternen', description: 'Ländliche Erwachsenenbildung / Tiny Observatorium: Beobachte die Sonne im Teleskop.' },
    end_chemistry: { id: 'end_chemistry', isEnd: true, flowLabel: 'Ziel: Chemie', resultText: 'Empfehlung: Chemie', description: 'Uni Oldenburg - Institut für Chemie: Entdecke Chemie im Labor und im Moor, probiere Stickstoffeis.' },
    end_build_robot: { id: 'end_build_robot', isEnd: true, flowLabel: 'Ziel: Roboter bauen', resultText: 'Empfehlung: Roboter selbst bauen', description: 'Innovationszentrum für Nachhaltigkeit: Baue und steuere LEGO-Roboter.' },
    end_hardware_code: { id: 'end_hardware_code', isEnd: true, flowLabel: 'Ziel: HW-Code', resultText: 'Empfehlung: Hardware programmieren', description: 'BZTG: Programmiere einen Arduino nano für Lichteffekte.' },
    end_laser_2d: { id: 'end_laser_2d', isEnd: true, flowLabel: 'Ziel: Laser', resultText: 'Empfehlung: 2D mit Laser', description: 'Kreativität trifft Technik e.V.: Lerne löten und sieh den Lasercutter.' },
    end_vr_puzzle: { id: 'end_vr_puzzle', isEnd: true, flowLabel: 'Ziel: VR-Rätsel', resultText: 'Empfehlung: VR-Rätsel lösen', description: 'OFFIS e.V.: Spiele "Türme von Hanoi" in der virtuellen Welt.' },
    end_olympics: { id: 'end_olympics', isEnd: true, flowLabel: 'Ziel: Olympiade', resultText: 'Empfehlung: Die große Olympiade', description: 'XperimenT!-Schulen: Nimm an der großen MINT-Olympiade teil.' },
    end_birds_view: { id: 'end_birds_view', isEnd: true, flowLabel: 'Ziel: Zugvögel', resultText: 'Empfehlung: Perspektive der Zugvögel', description: 'Nationalpark-Haus & UNESCO: Erlebe das Wattenmeer aus Sicht der Zugvögel.' },
    end_trash_sea: { id: 'end_trash_sea', isEnd: true, flowLabel: 'Ziel: Müll im Meer', resultText: 'Empfehlung: Müll im Meer', description: 'Uni Oldenburg - ICBM: Erforsche "Munition im Meer".' },
    end_water: { id: 'end_water', isEnd: true, flowLabel: 'Ziel: Wasser', resultText: 'Empfehlung: Thema Wasser', description: 'OOWV: Entdecke Spannendes rund um das Thema Wasser.' },
    end_climate: { id: 'end_climate', isEnd: true, flowLabel: 'Ziel: Klima', resultText: 'Empfehlung: Globaler Klimawandel', description: 'FutureNow! / AWI: Verstehe den Klimawandel (Experimente mit Eis, Arktis-Fotos).' },
    end_math_art: { id: 'end_math_art', isEnd: true, flowLabel: 'Ziel: Mathe-Kunst', resultText: 'Empfehlung: Schöne Mathematik', description: 'Uni Oldenburg - Institut für Mathematik: Experimentiere mit Seifenhäuten.' },
    end_general_info: { id: 'end_general_info', isEnd: true, flowLabel: 'Ziel: Allg. Karriere', resultText: 'Empfehlung: Allgemeine Berufsorientierung', description: 'Agentur für Arbeit Oldenburg-Wilhelmshaven: Alles rund um Berufsorientierung im MINT-Bereich.' },
    end_energy_tools: { id: 'end_energy_tools', isEnd: true, flowLabel: 'Ziel: Energie', resultText: 'Empfehlung: Energie & Werkzeug', description: 'EWE AG + EWE NETZ GmbH: Baue kleine Windräder oder teste den Schweißsimulator.' },
    end_floor_robot: { id: 'end_floor_robot', isEnd: true, flowLabel: 'Ziel: Boden-Roboter', resultText: 'Empfehlung: Roboter auf der Bodenmatte', description: 'Bildungsregion Friesland: Programmiere kleine Bluebots und Ozobots.' },
    end_robodog: { id: 'end_robodog', isEnd: true, flowLabel: 'Ziel: Robodog', resultText: 'Empfehlung: Roboterhund "HELDog"', description: 'Hochschule Emden-Leer: Steuere den Roboterhund über das Gelände.' },
    end_hamster: { id: 'end_hamster', isEnd: true, flowLabel: 'Ziel: Hamster', resultText: 'Empfehlung: Hamster programmieren', description: 'BTC AG: Programmiere den BTC-Hamster.' },
    end_logic_gates: { id: 'end_logic_gates', isEnd: true, flowLabel: 'Ziel: Logik', resultText: 'Empfehlung: Logik-Gatter', description: 'OFFIS e.V.: Löse Rätsel am interaktiven Logikboard.' },
    end_print_blocks: { id: 'end_print_blocks', isEnd: true, flowLabel: 'Ziel: Druckstöcke', resultText: 'Empfehlung: Moderne Druckstöcke', description: 'Anna Schwarz RomnoKher e.V.: Sieh dir Drucktechniken an, die mit CNC & Co. erstellt wurden.' },
    end_3d_pen: { id: 'end_3d_pen', isEnd: true, flowLabel: 'Ziel: 3D-Stift', resultText: 'Empfehlung: Frei Hand mit dem 3D-Stift', description: 'Robotikzentrum JadeBay: Probiere den 3D-Druck-Stift aus.' },
    end_vr_climate: { id: 'end_vr_climate', isEnd: true, flowLabel: 'Ziel: VR-Klima', resultText: 'Empfehlung: VR-Klimawandel', description: 'FutureNow! / AWI: Erlebe die Folgen des Klimawandels in VR (ab 13 J.).' },
    end_vr_jobs: { id: 'end_vr_jobs', isEnd: true, flowLabel: 'Ziel: VR-Berufe', resultText: 'Empfehlung: VR-Einblicke in Berufe', description: 'EWE AG: Mache eine virtuelle Führung durch technische Anlagen.' },
    end_hearing_game: { id: 'end_hearing_game', isEnd: true, flowLabel: 'Ziel: Hör-Spiel', resultText: 'Empfehlung: Spiel für die Ohren', description: 'Jade Hochschule: Mache Hörversuche und teste deine Ohren.' },
    end_reaction_game: { id: 'end_reaction_game', isEnd: true, flowLabel: 'Ziel: Reaktions-Spiel', resultText: 'Empfehlung: Spiel für die Reaktion', description: 'Weiss Pharmatechnik GmbH: Spiele das interaktive Partikelfangspiel.' },
    end_ship_physics: { id: 'end_ship_physics', isEnd: true, flowLabel: 'Ziel: Schiffsphysik', resultText: 'Empfehlung: Physik der Schifffahrt', description: 'Hochschule Emden-Leer: Verstehe Physik mit dem "Schokoladenschiffsantrieb".' },
    end_general_physics: { id: 'end_general_physics', isEnd: true, flowLabel: 'Ziel: Allg. Physik', resultText: 'Empfehlung: Allgemeine Physik-Phänomene', description: 'Uni Oldenburg - Institut für Physik: Experimente zu Atomen und Kosmos.' },
    end_teaching_degree: { id: 'end_teaching_degree', isEnd: true, flowLabel: 'Ziel: Lehramt', resultText: 'Empfehlung: Lehramtsstudium', description: 'Uni Oldenburg - OLELA: Alles über das Lehramtsstudium.' },
    end_industry_tech: {
        id: 'end_industry_tech', isEnd: true, flowLabel: 'Ziel: Karriere Wirtschaft', resultText: 'Empfehlung: Ausbildung & Studium in Wirtschaft & Technik',
        description: `BTC AG: Infos zu Ausbildung und Dualem Studium in der IT.
EWE AG: Einblicke in technische Ausbildungsberufe.
Hochschule Emden-Leer: Infos zum Niedersachsentechnikum und MINT-Studiengängen.` },
    end_glass_art: { id: 'end_glass_art', isEnd: true, flowLabel: 'Ziel: Glaskunst', resultText: 'Empfehlung: Glaskunst', description: 'Oldenburgische Landschaft: Gestalte dein eigenes Glaskunstwerk.' },
    end_dna_extract: { id: 'end_dna_extract', isEnd: true, flowLabel: 'Ziel: DNA', resultText: 'Empfehlung: DNA extrahieren', description: 'Hochschule Emden-Leer: Extrahiere DNA aus Zellen.' },
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

// ====================================================================
// START: MOBILE OPTIMIZATION
// ====================================================================
const getLayoutedElements = (treeData, pathTaken) => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    // ZURÜCK ZU Top-to-Bottom und großzügigeren Abständen
    dagreGraph.setGraph({ rankdir: 'TB', nodesep: 40, ranksep: 100 });

    // ZURÜCK zu größeren Knoten für eine bessere Lesbarkeit
    const nodeWidth = 220;
    const nodeHeight = 100;

    const nodesForFlow = [];
    const edgesForFlow = [];

    // Dieser Teil bleibt gleich...
    const relevantNodeIds = new Set(['start']);
    const queue = ['start'];
    while (queue.length > 0) {
        const nodeId = queue.shift();
        const node = treeData[nodeId];
        if (!node) continue;

        if (node.answers) {
            node.answers.forEach(ans => {
                if (!relevantNodeIds.has(ans.nextNodeId)) {
                    relevantNodeIds.add(ans.nextNodeId);
                    queue.push(ans.nextNodeId);
                }
            });
        }
    }

    Object.values(treeData).forEach(nodeInfo => {
        if (!relevantNodeIds.has(nodeInfo.id)) {
            return;
        }

        const label = nodeInfo.flowLabel || nodeInfo.question;
        const isInPath = pathTaken.includes(nodeInfo.id);

        dagreGraph.setNode(nodeInfo.id, { width: nodeWidth, height: nodeHeight });

        nodesForFlow.push({
            id: nodeInfo.id,
            data: { label: label },
            position: { x: 0, y: 0 },
            type: nodeInfo.isEnd ? 'output' : (nodeInfo.id === 'start' ? 'input' : 'default'),
            style: {
                width: nodeWidth,
                height: nodeHeight,
                textAlign: 'center',
                fontSize: '12px',
                border: isInPath ? '3px solid #004494' : '1px solid #ccc',
                background: isInPath ? '#e6f0ff' : (nodeInfo.id.startsWith('scan_') ? '#fffbe6' : '#ffffff'),
                whiteSpace: 'pre-wrap',
            }
        });

        const connectNodes = (sourceId, targetId, edgeLabel = '') => {
            const isEdgeInPath = pathTaken.includes(sourceId) && pathTaken.includes(targetId);
            edgesForFlow.push({
                id: `e-${sourceId}-${targetId}-${edgeLabel.replace(/\s/g, '')}`,
                source: sourceId,
                target: targetId,
                type: 'smoothstep',
                data: { label: edgeLabel },
                animated: isEdgeInPath,
                style: {
                    strokeWidth: isEdgeInPath ? 2.5 : 1.5,
                    stroke: isEdgeInPath ? '#004494' : '#b1b1b7',
                }
            });
            dagreGraph.setEdge(sourceId, targetId);
        }

        if (nodeInfo.answers) {
            nodeInfo.answers.forEach(answer => {
                if (treeData[answer.nextNodeId]) {
                    connectNodes(nodeInfo.id, answer.nextNodeId, answer.text)
                }
            });
        }
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodesForFlow.map(node => {
        const nodeWithPosition = dagreGraph.node(node.id);
        if (nodeWithPosition) {
            node.position = {
                x: nodeWithPosition.x - nodeWidth / 2,
                y: nodeWithPosition.y - nodeHeight / 2,
            };
        }
        return node;
    });

    return { nodes: layoutedNodes, edges: edgesForFlow };
};
// ====================================================================
// END: MOBILE OPTIMIZATION
// ====================================================================


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

        const timeoutId = setTimeout(() => {
            const scannerElement = document.getElementById(readerId);
            if (scannerElement && !html5QrcodeScanner.isScanning) {
                html5QrcodeScanner.render(onScanSuccessCb, (errorMessage) => { });
            }
        }, 100);


        return () => {
            clearTimeout(timeoutId);
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

    const handleNodeClick = useCallback((nodeId) => {
        if (pathTaken.includes(nodeId)) {
            setCurrentNodeId(nodeId);
            const clickedNodeIndex = pathTaken.indexOf(nodeId);
            setPathTaken(pathTaken.slice(0, clickedNodeIndex + 1));
            setMessage(`Zurückgesprungen zu: ${decisionTree[nodeId].flowLabel}`);
        } else {
            setMessage('Du kannst nur zu bereits besuchten Knoten zurückspringen.');
        }
    }, [pathTaken]);

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
                <h2>Lass uns gemeinsam die MINT-Welt entdecken!</h2>
                <p>Hier machst du Entscheidungen, wie ein Computer einen "Entscheidungsbaum" benutzt. Jede Wahl führt dich zu neuen, spannenden Abenteuern!</p>
                <p>Achte auf die "verbleibenden Endpunkte" – sie zeigen dir, wie viele verschiedene Wege du noch gehen könntest. Viel Spaß beim Entdecken!</p>
                <p>Beantworte einfach ein paar Fragen und scanne QR-Codes, um herauszufinden, welche Stände und Experimente am besten zu deinen Interessen passen. Dein Weg wird am Ende sichtbar gemacht!</p>
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
                <div 
                  className="result-box" 
                  // NEU: Flex-Layout, das den Bildschirm füllt
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    height: 'calc(100vh - 40px)', // Nahezu volle Bildschirmhöhe
                    padding: '20px' 
                  }}
                >
                    <h2 className="result-title" style={{ flexShrink: 0 }}>Geschafft! 🎉</h2>
                    <p className="result-text" style={{ flexShrink: 0 }}>{currentNode.resultText}</p>
                    <p 
                      className="result-description" 
                      style={{ 
                        whiteSpace: 'pre-wrap', 
                        flexShrink: 0,
                        marginBottom: '1rem', // Kleiner Abstand nach der Beschreibung
                      }}
                    >
                      {currentNode.description}
                    </p>
                    
                    <h3 
                      className="text-lg font-bold mb-2 text-center text-white" 
                      style={{ flexShrink: 0 }}
                    >
                      Dein Weg durch das Festival:
                    </h3>
                    
                    {/* NEU: Dieses div wächst jetzt, um den ganzen freien Platz zu füllen */}
                    <div 
                      style={{
                        flexGrow: 1, 
                        width: '100%', 
                        borderRadius: '8px', 
                        background: '#f8f8f8',
                        minHeight: '300px' // Stellt sicher, dass es nie zu klein wird
                      }}
                    >
                         <DecisionTreeFlow nodes={nodes} edges={edges} onNodeClick={handleNodeClick} />
                    </div>

                    <button 
                      onClick={restartGame} 
                      onMouseDown={handleMouseDown} 
                      className="start-button"
                      // NEU: Button rückt nach unten
                      style={{ flexShrink: 0, marginTop: '20px' }}
                    >
                      <span className="button-text">Nochmal spielen</span>
                    </button>

                    <Confetti width={width} height={height} recycle={false} numberOfPieces={250} gravity={0.15} />
                </div>
            ) : (
                <div className="content-box">
                    {currentNode.question && <h2 className="question-title">{currentNode.question}</h2>}
                    
                    {currentNode.computerSays && <p className="computer-says-text" style={{ fontSize: '0.9rem', color: '#BDC3C7', marginTop: '10px', marginBottom: '20px', fontStyle: 'italic' }}>
                        💡 So denkt der Computer: {currentNode.computerSays}
                    </p>}

                    {currentNode.answers && (
                        <div className="answers-container">
                            {currentNode.answers.map((answer, index) => (
                                <button key={index} onClick={() => handleAnswer(answer.nextNodeId)} onMouseDown={handleMouseDown} className="answer-button">
                                    <span className="button-text">{answer.text}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default App;
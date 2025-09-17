// src/Standplan.js

import React from 'react';
import { MapContainer, ImageOverlay, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import standplanImage from './assets/standplan-karte.png';

const width = 697;
const height = 663;

// VOLLSTÄNDIGE STANDORTE-LISTE MIT ALLEN INFOTEXTEN
const standorte = [
  { nummer: 1, position: [197, 210], name: 'AHOI_MINT Cluster & Landesmuseum', info: 'Am Stand des Schlauen Hauses könnt ihr euch über das AHOI_MINT Cluster informieren. // Landesmuseum: Insekten unter dem Binokular betrachten, skizzieren und Insekten-Snacks probieren.' },
  { nummer: 2, position: [230, 210], name: 'Oldenburgische Landschaft und MOBILUM', info: 'Glaskunst & Naturentdecker: Gestalte ein kreatives Glaskunstwerk und lerne heimische Pflanzenarten kennen. // MOBILUM: Erlebe die Wunderwelt der Natur mit allen Sinnen – von Vögeln bis zum Leben im Boden.' },
  { nummer: 3, position: [306, 215], name: 'Broetje-Automation GmbH', info: 'Transformers im realen Leben: Interagiere live mit high-tech Robotern aus der Industrie und probiere selbst zu programmieren.' },
  { nummer: 4, position: [298, 243], name: 'Innovationszentrum & Anna-Schwarz RomnoKher', info: 'Innovationszentrum: Tauche mit VR-Brillen in virtuelle Welten ein und erwecke einen LEGO-Roboter zum Leben. // Drucktechniken 4.0: Erlebe moderne Drucktechniken wie Lasercutter-Radierung und 3D-Druck.' },
  { nummer: 5, position: [293, 278], name: 'UNESCO-Weltnaturerbe & Nationalpark-Haus', info: 'Das Weltnaturerbe Wattenmeer erleben: Verschiedene Mitmach-Aktionen wie Mikroskope, Spiele und Experimente.' },
  { nummer: 6, position: [287, 311], name: 'Agentur für Arbeit & Stadtbibliothek', info: 'Berufsorientierung mit VR-Brillen und Exponaten. // Greenscreen: Lass dich in fantastische Welten fotografieren und nimm das Foto direkt mit.' },
  { nummer: 7, position: [283, 345], name: 'Jade Hochschule', info: 'Hörtechnik & Audiologie: Entdecke in Hörversuchen, wie deine Ohren zusammenarbeiten. // Robotikzentrum: Programmiere mobile Roboter und gestalte Bauteile mit einem 3D-Druck-Stift.'},
  { nummer: 8, position: [311, 352], name: 'Uni Oldenburg: Institut für Chemie', info: 'Chemie im Labor und im Moor: Probiere torffreie Erde aus, erlebe 3D-Biodrucken und genieße leckeres Stickstoffeis.'},
  { nummer: 9, position: [319, 321], name: 'Uni Oldenburg: Oldenburger Lehr-Lern-Räume (OLELA)', info: 'Experimentieren, Forschen, Konstruieren in den Schülerlaboren und Infos zum Lehramtsstudium an der Uni Oldenburg.'},
  { nummer: 10, position: [323, 289], name: 'Uni Oldenburg: Institut für Physik und Mathe', info: 'Physik: Erlebe Experimente zu Atomen und Kosmos. // Mathematik: Entdecke die schöne Seite der Mathe mit Seifenhaut-Experimenten.'},
  { nummer: 11, position: [330, 256], name: 'Uni Oldenburg: ICBM', info: 'Munition im Meer: Finde an interaktiven Stationen heraus, woher die Munition kommt und wie gefährlich sie ist.'},
  { nummer: 12, position: [335, 221], name: 'Oldenburgisch-Ostfriesischer Wasserverband (OOWV)', info: 'Wasser – alltäglich und doch außergewöhnlich? Entdecke, was eine Controllerbox mit Wetterdaten zu tun hat.'},
  { nummer: 13, position: [333, 140], name: 'CEWE Stiftung & Co. KGaA', info: 'Erstelle Fotos mit Hilfe von künstlicher Intelligenz und gestalte anschließend einen eigenen Bilderrahmen dafür.'},
  { nummer: 14, position: [366, 168], name: 'ROCKID.one e.V. & OFFIS e.V.', info: 'ROCKID.one: Erlebe digitale Bildung und Medienkompetenz mit Gamification. // OFFIS: Löse Rätsel am Logikboard und spiele "Türme von Hanoi" in der virtuellen Realität.'},
  { nummer: '15-19', position: [449, 240], name: 'XperimenT!-Schulen', info: 'Mach mit bei der großen MINT-Olympiade! Beim Knobeln, Programmieren und Experimentieren sammelst du Stempel für eine kleine Überraschung.'},
  { nummer: 20, position: [525, 385], name: 'Oldenburger Computer-Museum & Kreativität trifft Technik', info: 'Computer-Museum: Erlebe die Geschichte der Datenträger von den 70ern bis heute. // KtT: Probiere den Lasercutter aus, programmiere mit Scratch und lerne löten.'},
  { nummer: 21, position: [524, 423], name: 'Hochschule Emden-Leer', info: 'Physik zum Anfassen mit dem "Schokoladenschiffsantrieb", steuere den Roboterhund "HELDog", extrahiere DNA und spiele das XXL-Widerstands-Spiel.'},
  { nummer: 22, position: [524, 471], name: 'BTC AG', info: 'Mach mit und entdecke unsere IT-Welt: Lerne Hardware kennen, programmiere den BTC-Hamster und informiere dich über Ausbildung und duale Studiengänge.'},
  { nummer: 23, position: [524, 509], name: 'Bildungsregionen in Niedersachsen', info: 'Programmieren entdecken: Steuere kleine, bunte Bluebots und Ozobots und lerne dabei erste Grundlagen des logischen Denkens.'},
  { nummer: 24, position: [519, 554], name: 'Weiss Pharmatechnik GmbH', info: 'Digitale Innovationen: Erlebe die Zukunft der digitalen Technologie mit unserem interaktiven Mock-up und dem innovativen Partikelfangspiel.'},
  { nummer: 25, position: [520, 594], name: 'BZTG & Alfred-Wegener-Institut (AWI)', info: 'BZTG: Programmiere den Arduino nano und gestalte interessante Lichteffekte. // AWI: Verstehe den Klimawandel mit Arktis-Fotos, VR-Brillen und Experimenten.'},
  { nummer: 26, position: [397, 284], name: 'Tiny Observatorium', info: 'Astronomie zum Anfassen: Beobachte bei gutem Wetter die Sonne durch ein Sonnenteleskop und lerne etwas über Lichtverschmutzung.'},
  { nummer: '27-28', position: [446, 364], name: 'EWE Schulmobil und EWE NETZ GmbH', info: 'Baue selbst kleine Windräder, versuche dich am Schweißsimulator und erhalte mit VR-Brillen Einblicke in verschiedene Ausbildungsberufe.' }
];

const createNumberedIcon = (number) => {
  const isLong = String(number).length > 2;
  const className = isLong ? 'custom-div-icon long-icon' : 'custom-div-icon';

  return L.divIcon({
    html: `<span>${number}</span>`,
    className: className,
    iconSize: L.point(30, 30),
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
  });
};

const Standplan = () => {
  const bounds = [[0, 0], [height, width]];

  return (
    <MapContainer 
      crs={L.CRS.Simple}
      bounds={bounds}
      minZoom={-1}
      style={{ height: '100%', width: '100%', backgroundColor: '#fff' }}
    >
      <ImageOverlay
        url={standplanImage}
        bounds={bounds}
      />
      
      {standorte.map(stand => (
        <Marker 
            key={stand.nummer} 
            position={stand.position} 
            icon={createNumberedIcon(stand.nummer)}
        >
          <Popup>
            <b>Stand {stand.nummer}: {stand.name}</b>
            <br /><br />
            {stand.info}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default Standplan;
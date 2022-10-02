// Oscar Saharoy 2022

import { dist } from "./utility.js";


const svgCanvas = document.getElementById( "canvas" );

var currentPath = null;
var currentPathID = 0;
var provisionalPoint = null;

export var strokesCoords = {};


const coordToDEntry = (coord,idx) => `${idx ? "L" : "M"}${coord.x} ${coord.y}`;
const coordListToD = coordList => coordList.reduce( 
	(acc,val,idx) => acc + coordToDEntry(val, idx), "" );


export function strokeStart( svgCoords ) {
	
	currentPath = document.querySelector( "svg#canvas #templates path" ).cloneNode();
	svgCanvas.appendChild( currentPath );
	
	currentPathID++;
	currentPath.id = `path${currentPathID}`;

	strokesCoords[currentPathID] = [svgCoords];
}


export function strokeContinue( svgCoords ) {

	const currentStroke = strokesCoords[currentPathID];
	const lastStrokePoint = currentStroke[currentStroke.length - 1];

	if( dist( svgCoords, lastStrokePoint ) < 10 ) provisionalPoint = lastStrokePoint;
	
	strokesCoords[currentPathID].push( svgCoords );
	currentPath.setAttribute( 
		"d", coordListToD( strokesCoords[currentPathID] ) );
}


export function strokeCancel() {

	if( !currentPath ) return;
	
	currentPath.remove();
	delete strokesCoords[currentPathID];
	strokeEnd();
}


export function strokeEnd() {

	if( strokesCoords.hasOwnProperty(currentPathID) && strokesCoords[currentPathID].length == 1 ) {
		currentPath.remove();
		delete strokesCoords[currentPathID];
	}
	
	currentPath = null;

	console.log(strokesCoords);
}


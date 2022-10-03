// Oscar Saharoy 2022

import { dist } from "./utility.js";


const svgCanvas = document.getElementById( "canvas" );
const strokesGroup = document.getElementById( "strokes" );

var currentPath = null;
var currentPathID = 0;
var provisionalPoint = null;

export var strokesCoords = {};


const coordToDEntry = (coord,idx) => `${idx ? "L" : "M"}${coord.x} ${coord.y}`;
const coordListToD = coordList => coordList.reduce( 
	(acc,val,idx) => acc + coordToDEntry(val, idx), "" );

const getPathCoordList = elm => dToCoordList( elm.getAttribute('d') );
const dToCoordList = d => 
	d.replace( /M/gi, '' )
	 .split( "L" )
	 .map( coordString => coordString.split( " " ) )
	 .map( coords => ({ x: +coords[0], y: +coords[1] }) );

const getPathID = elm => +(elm.id.replace( /path/gi, '' ));


export function strokeStart( svgCoords ) {
	
	currentPath = document.querySelector( "svg#canvas defs path" ).cloneNode();
	strokesGroup.appendChild( currentPath );
	
	currentPathID++;
	currentPath.id = `path${currentPathID}`;

	strokesCoords[currentPathID] = [svgCoords];
}


export function strokeContinue( svgCoords ) {

	const currentStroke = strokesCoords[currentPathID];
	const lastStrokePoint = currentStroke[currentStroke.length - 1];

	if( dist( svgCoords, lastStrokePoint ) < 10 )
		provisionalPoint = lastStrokePoint;

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
}


export function reloadStrokesCoords() {

	const strokes = document.querySelectorAll( "#strokes path" );

	strokesCoords = {};

	for( const stroke of strokes ) {
		strokesCoords[ getPathID(stroke) ] = getPathCoordList( stroke );
		currentPathID = Math.max( getPathID(stroke), currentPathID );
	}
}


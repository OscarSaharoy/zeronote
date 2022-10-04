// Oscar Saharoy 2022

import { dist, dot, direction } from "./utility.js";
import { Stroke } from "./stroke.js";


const svgCanvas  = document.getElementById( "canvas"  );
var strokesGroup = document.getElementById( "strokes" );

var currentPath = null;
var currentPathID = 0;
var currentStroke = null;

export var strokesCoords = {};


const crPaddingPoint = coordList => 
	({x: 2*(coordList[0].x-coordList[2].x) + coordList[3].x, y: 2*(coordList[0].y-coordList[2].y) + coordList[3].y});
const catmullRomPad = coordList =>
	coordList.length < 4 ? 
		[ coordList[0], ...coordList, coordList[coordList.length-1] ] :
	    [ crPaddingPoint(coordList), ...coordList, crPaddingPoint(coordList.slice().reverse()) ];
const formFourTuples = coordList => 
	coordList.slice(1, -2)
		     .map( (_,idx) => coordList.slice(idx, idx+4) );
const catmullRomDEntry = fourTuple =>
	`C${(-fourTuple[0].x + 6*fourTuple[1].x + fourTuple[2].x)/6},${(-fourTuple[0].y + 6*fourTuple[1].y + fourTuple[2].y)/6} ` +
	`${(fourTuple[1].x + 6*fourTuple[2].x - fourTuple[3].x)/6},${(fourTuple[1].y + 6*fourTuple[2].y - fourTuple[3].y)/6} ` +
	`${fourTuple[2].x},${fourTuple[2].y}`;
const coordListToCatmullRomD = coordList => 
	`M${coordList[0].x},${coordList[0].y} ` +
	formFourTuples( catmullRomPad(coordList) ).reduce( (acc,val) => acc + " " + catmullRomDEntry(val), "" )


const getCatmullRomPathCoordList = elm => catmullRomDToCoordList( elm.getAttribute('d') );
const catmullRomDToCoordList = d =>
	d.replace( /M/gi, '' )
	 .split( /[CL]/ )
	 .map( coordString => coordString.split( " " )[0] )
	 .map( coordString => coordString.split( "," ) )
	 .map( coords => ({ x: +coords[0], y: +coords[1] }) );


const getPathID = elm => +(elm.id.replace( /path/gi, '' ));


const filterPath = coordList => {

	const filteredPath = [ coordList[0] ];
	
	for( const coord of coordList.slice(1, -1) ) {

		if( dist( coord, filteredPath[filteredPath.length-1] ) > 3 )
			filteredPath.push(coord);
	}

	filteredPath.push( coordList[coordList.length-1] );
	return filteredPath; 
}


export function strokeStart( svgCoords ) {

	currentPath = document.querySelector( "svg#canvas defs path" ).cloneNode();
	strokesGroup.appendChild( currentPath );
	
	currentPathID++;
	currentPath.id = `path${currentPathID}`;

	strokesCoords[currentPathID] = [svgCoords];

	currentStroke = new Stroke();
}


export function strokeContinue( svgCoords ) {

	const currentStroke = strokesCoords[currentPathID];
	const lastStrokePoint = currentStroke[currentStroke.length - 1];

	strokesCoords[currentPathID].push( svgCoords );
	strokesCoords[currentPathID] = filterPath( strokesCoords[currentPathID] );
	currentPath.setAttribute( 
		"d", coordListToCatmullRomD( strokesCoords[currentPathID] ) );
}


export function strokeCancel() {

	if( !currentPath ) return;

	currentPath.remove();
	delete strokesCoords[currentPathID];
	strokeEnd();
}


export function strokeEnd() {

	if( strokesCoords.hasOwnProperty(currentPathID) && strokesCoords[currentPathID].length == 1 ) {
		strokesCoords[currentPathID].push(strokesCoords[currentPathID][0]);
		currentPath.setAttribute( 
			"d", coordListToCatmullRomD( strokesCoords[currentPathID] ) );
	}
	
	currentPath = null;
}


export function reloadStrokesCoords() {

	const strokes = document.querySelectorAll( "#strokes path" );

	strokesCoords = {};

	for( const stroke of strokes ) {
		strokesCoords[ getPathID(stroke) ] = getCatmullRomPathCoordList( stroke );
		currentPathID = Math.max( getPathID(stroke), currentPathID );
	}
}


// Oscar Saharoy 2022

import { dist } from "./utility.js";


const svgCanvas  = document.getElementById( "canvas"  );
var strokesGroup = document.getElementById( "strokes" );

var currentPath = null;
var currentPathID = 0;
var provisionalPoint = null;

export var strokesCoords = {};


const coordToDEntry = (coord,idx) => `${idx ? "L" : "M"}${coord.x},${coord.y}`;
const coordListToD = coordList => coordList.reduce( 
	(acc,val,idx) => acc + " " + coordToDEntry(val, idx), "" );

const catmullRomStartEntry = threeTuple =>
	`M${threeTuple[0].x},${threeTuple[0].y} L${threeTuple[1].x},${threeTuple[1].y}`;
const catmullRomEndEntry = threeTuple =>
	`L${threeTuple[2].x},${threeTuple[2].y}`;

const catmullRomDEntry = fourTuple =>
	`C${(-fourTuple[0].x + 6*fourTuple[1].x + fourTuple[2].x)/6},${(-fourTuple[0].y + 6*fourTuple[1].y + fourTuple[2].y)/6} ` +
	`${(fourTuple[1].x + 6*fourTuple[2].x - fourTuple[3].x)/6},${(fourTuple[1].y + 6*fourTuple[2].y - fourTuple[3].y)/6} ` +
	`${fourTuple[2].x},${fourTuple[2].y}`;

const formFourTuples = coordList => 
	coordList.slice(1, -2)
		     .map( (_,idx) => coordList.slice(idx, idx+4) )
const coordListToCatmullRomD = coordList => 
	catmullRomStartEntry( coordList.slice(0, 3) ) + " " +
	formFourTuples( coordList ).reduce( (acc,val) => acc + " " + catmullRomDEntry(val), "" ) + " " +
	(coordList.length > 4 ? catmullRomEndEntry( coordList.slice(-3) ) : "");


const getPathCoordList = elm => dToCoordList( elm.getAttribute('d') );
const dToCoordList = d => 
	d.replace( /M/gi, '' )
	 .split( "L" )
	 .map( coordString => coordString.split( "," ) )
	 .map( coords => ({ x: +coords[0], y: +coords[1] }) );

const getCatmullRomPathCoordList = elm => catmullRomDToCoordList( elm.getAttribute('d') );
const catmullRomDToCoordList = d =>
	d.replace( /M/gi, '' )
	 .split( /[CL]/ )
	 .map( coordString => coordString.split( " " )[0] )
	 .map( coordString => coordString.split( "," ) )
	 .map( coords => ({ x: +coords[0], y: +coords[1] }) );


const getPathID = elm => +(elm.id.replace( /path/gi, '' ));


const filterPath = coordsList => {

	const filteredPath = [ coordsList[0] ];
	
	for( const coord of coordsList.slice(1, -1) ) {

		if( dist( coord, filteredPath[filteredPath.length-1] ) > 10 )
			filteredPath.push(coord);
	}

	filteredPath.push( coordsList[coordsList.length-1] );
	return filteredPath; 
}


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


// Oscar Saharoy 2022

import { strokesCoords } from "./stroke.js";


var lastEraseCoords = null;


export function erase( eraseCoords ) {
	
	if( !lastEraseCoords ) return lastEraseCoords = eraseCoords;

	Object.keys(strokesCoords).forEach( strokeID => 
		tryEraseStroke(strokeID, strokesCoords[strokeID], eraseCoords, lastEraseCoords) );	

	lastEraseCoords = eraseCoords;
}


function tryEraseStroke( strokeID, strokeCoords, eraseCoords, lastEraseCoords ) {
	
	const strokeSegments = strokeCoords.slice(0, -1).map( 
		(_, i) => ({ start: strokeCoords[i], end: strokeCoords[i+1] }) );

	const eraseSegment = { start: eraseCoords, end: lastEraseCoords };

	if( strokeSegments.some( 
			strokeSegment => intersectSegments( strokeSegment, eraseSegment ) ) ) {

		delete strokesCoords[strokeID];
		document.querySelector( `#canvas #path${strokeID}` ).remove();
	}
}

export function resetErase() {
	lastEraseCoords = null;
}


function ccw( A, B, C ) {
	return (C.y-A.y) * (B.x-A.x) > (B.y-A.y) * (C.x-A.x);
}

function dist( A, B ) {
	return Math.sqrt( (A.x-B.x) * (A.x-B.x) + (A.y-B.y) * (A.y-B.y) );
}

function intersectSegments( segA, segB ) {
	return dist( segB.end, segA.start ) < 5	
		|| ccw(segA.start, segB.start, segB.end  ) != ccw(segA.end,   segB.start, segB.end) 
	    && ccw(segA.start, segA.end,   segB.start) != ccw(segA.start, segA.end,   segB.end);
}

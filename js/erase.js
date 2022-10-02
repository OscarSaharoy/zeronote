// Oscar Saharoy 2022

import { strokesCoords } from "./stroke.js";
import { dist, ccw, intersectSegments } from "./utility.js";


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



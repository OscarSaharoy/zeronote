// Oscar Saharoy 2022

import { strokesCoords } from "./stroke.js";
import { dist, ccw, intersectSegments } from "./utility.js";


// track last erase coord so we can get the segment we have erased along
var lastEraseCoords = null;


export function erase( eraseCoords ) {
	
	// if last erase coords is unset it is the first erase step so
	// just use the current coords as last
	if( !lastEraseCoords ) lastEraseCoords = eraseCoords;

	// loop over the strokes in strokesCoords and try to erase each one
	Object.keys(strokesCoords).forEach( strokeID => 
		tryEraseStroke(strokeID, strokesCoords[strokeID], eraseCoords, lastEraseCoords) );	

	// set current erase coords to last erase coords for the next step
	lastEraseCoords = eraseCoords;
}


function tryEraseStroke( strokeID, strokeCoords, eraseCoords, lastEraseCoords ) {
	
	// split the stroke coords into segments of adjacent (start, end) points
	const strokeSegments = strokeCoords.slice(0, -1).map( 
		(_, i) => ({ start: strokeCoords[i], end: strokeCoords[i+1] }) );

	// create a segment representing the line we are erasing along
	const eraseSegment = { start: eraseCoords, end: lastEraseCoords };

	// if any of the stroke segments intersect the erase segment
	if( strokeSegments.some( 
			strokeSegment => intersectSegments( strokeSegment, eraseSegment ) ) ) {
	
		// delete the stroke
		delete strokesCoords[strokeID];
		document.querySelector( `#canvas #path${strokeID}` ).remove();
	}
}

export function resetErase() {
	lastEraseCoords = null;
}



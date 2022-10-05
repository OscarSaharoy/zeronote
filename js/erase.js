// Oscar Saharoy 2022

import { strokesArray } from "./stroke.js";
import { dist, ccw, intersectSegments, segment } from "./utility.js";


// track last erase coord so we can get the segment we have erased along
var lastEraseCoords = null;


export function erase( eraseCoords ) {

	// if last erase coords is unset it is the first erase step so
	// just use the current coords as last
	if( !lastEraseCoords ) lastEraseCoords = eraseCoords;

	// loop over the strokes in strokesArray and try to erase each one
	strokesArray.forEach( stroke => 
		tryEraseStroke( stroke, segment(eraseCoords, lastEraseCoords) ) );	

	// set current erase coords to last erase coords for the next step
	lastEraseCoords = eraseCoords;
}


function tryEraseStroke( stroke, eraseSegment ) {

	// split the stroke coords into segments of adjacent (start, end) points
	const strokeSegments = stroke.vertices.slice(0, -1).map( 
		(_, i) => ({ start: stroke.vertices[i], end: stroke.vertices[i+1] }) );

	// if any of the stroke segments intersect the erase segment
	if( strokeSegments.some( 
			strokeSegment => intersectSegments( strokeSegment, eraseSegment ) ) )
	
		// delete the stroke
		stroke.remove();
}

export function resetErase() {
	lastEraseCoords = null;
}



// Oscar Saharoy 2022

import { strokesArray } from "./stroke.js";
import { dist, ccw, intersectSegments, segment } from "./utility.js";
import { actions, rebaseActions } from "./undo-redo.js";


// track last erase coord so we can get the segment we have erased along
var lastEraseCoords = null;


export function erase( eraseCoords ) {

	console.log("erase")

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
		(_, i) => segment( stroke.vertices[i], stroke.vertices[i+1] ) );

	// if any of the stroke segments intersect the erase segment
	if( strokeSegments.some( 
			strokeSegment => intersectSegments( strokeSegment, eraseSegment ) )
		|| dist( stroke.vertices[0], eraseSegment.start ) < 5 ) {
	
		// delete the stroke
		stroke.remove();

		rebaseActions();
		actions.push( { type: "erase", stroke: stroke } );
	}
}

export function resetErase() {
	lastEraseCoords = null;
}



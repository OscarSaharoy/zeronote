// Oscar Saharoy 2022

import { Stroke } from "./stroke.js";
import { actions, rebaseActions } from "./undo-redo.js";


// keep track of the current stroke being drawn
var currentStroke = null;


export function strokeStart( svgCoords ) {

	// start a new stroke and add the first vertex
	currentStroke = new Stroke();
	currentStroke.addVertex( svgCoords );
}


export function strokeContinue( svgCoords ) {

	// add the next vertex to the stroke
	currentStroke.addVertex( svgCoords );
}


export function strokeCancel() {

	// remove the stroke and stop tracking it
	currentStroke?.remove();
	currentStroke = null;
}


export function strokeEnd() {

	if( currentStroke === null ) return;

	// rebase the action stack to branch from the current state
	// and add the new stroke drawn
	rebaseActions();
	actions.push( { type: "draw", stroke: currentStroke } );

	// complete the stroke and stop tracking it
	currentStroke.complete();
	currentStroke = null;
}




// Oscar Saharoy 2022

import { Stroke } from "./stroke.js";


// keep track of the current stroke being drawn
var currentStroke = null;


export function strokeStart( svgCoords ) {

	currentStroke = new Stroke();
	currentStroke.vertices.push( svgCoords );
}


export function strokeContinue( svgCoords ) {

	currentStroke.addVertex( svgCoords );
}


export function strokeCancel() {

	currentStroke?.remove();
	currentStroke = null;
}


export function strokeEnd() {

	currentStroke = null;
}




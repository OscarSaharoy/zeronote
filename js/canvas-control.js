// Oscar Saharoy 2022

import { strokeStart, strokeContinue, strokeCancel, strokeEnd } from "./draw-stroke.js";
import { erase, resetErase } from "./erase.js";
import { eraseButtonClicked } from "./erase-button.js";
import { drawWithTouch } from "./draw-with-touch.js";



const svgCanvas = document.getElementById( "canvas" );
const toolbox = document.getElementById( "toolbox" );

// object containing map of pointers id to position
let activePointers = {};

// list of elements that can't be dragged over
let clickables = [ toolbox ];

// mean pointer position and that of last frame
let meanPointer     = { x: 0, y: 0 };
let lastMeanPointer = { x: 0, y: 0 };

// spread of pointers and that of last frame
let pointerSpread     = 0;
let lastPointerSpread = 0;

// we need to keep a bool telling us to
// skip a frame when a new pointer is added
let skip1Frame = false;

// counter to say how far through a stroke we are
let strokeSteps = 0;

// flag is true if we are erasing
let erasing = false;

// get mean and spread of a list of pointer positions
const getMeanPointer = arr => arr.reduce( (acc, val) => ({ x: acc.x + val.x/arr.length, y: acc.y+val.y/arr.length }), {x: 0, y: 0} );
const getPointerSpread = (positions, mean) => positions.reduce( (acc, val) => acc + ((val.x-mean.x)**2 + (val.y-mean.y)**2)**0.5, 0 );

// these control the canvas zoom and position
let canvasScale  = 1;
let canvasOffset = { x: 0, y: 0 };

// link all the pointer events
document.addEventListener( "pointerdown",  pointerdown );
document.addEventListener( "pointerup",    pointerup   );
document.addEventListener( "pointerleave", pointerup   );
document.addEventListener( "pointermove",  pointermove );
document.addEventListener( "wheel",        wheel, {passive: false} );

// function that gets a coords vector object from an event
const clientCoords = event => ({ x: event.clientX, y: event.clientY });

// limit x to within a and b
const clamp = (x, a, b) => x < a ? a : ( x > b ? b : x );

// a timeout ID for resetting the state after a while of inactivity (in a bugged state)
let resetTimeout = null;

// function that resets the canvas control state
function resetState() {
	
	activePointers = {};
	skip1Frame = false;
	strokeSteps = 0;
	erasing = false;
	strokeEnd();
}


function pointerdown( event ) {
	
    // if the event's target element is in the clickables array then return
    if( clickables.reduce( (result, elm) => result || elm.contains(event.target), false) ) return;

	// if we are into a stroke, ignore this pointer
	if( strokeSteps > 5 ) return;
	// but if we are just starting a stroke and get another pointer down, cancel the stroke
	else if( strokeSteps > 0 ) {
		strokeSteps = 0;
		strokeCancel();
	}

	const eventClientCoords = clientCoords( event );

	// if these conditions are true we ignore a single touch
	const ignoreAs1Touch = event.pointerType == "touch" && !drawWithTouch;

	// if this is the first pointer and it's not an ignored touch, assume we are starting to draw a stroke
	if( !Object.keys(activePointers).length && !ignoreAs1Touch && !event.shiftKey )
		strokeSteps = 1;

	// if it's the first pointer and it's not an ignored touch, and it's not an erase stroke, and the ctrl key isn't pressed, call strokeStart
	if( !Object.keys(activePointers).length && !( ignoreAs1Touch || event.buttons > 1 || eraseButtonClicked || event.shiftKey ) )
		strokeStart( clientCoordsToSVG(eventClientCoords) );

    // add the pointer to activePointers
    activePointers[event.pointerId] = eventClientCoords;

    // we added a new pointer so skip a frame to prevent
    // a step change in pan position
    skip1Frame = true;
}

function pointermove( event ) {

    // if this pointer isn't an active pointer then do nothing
    if( !Object.keys(activePointers).includes(event.pointerId.toString()) ) return;

	const eventClientCoords = clientCoords( event );
    
    // keep track of the pointer pos
    activePointers[event.pointerId] = eventClientCoords;

	// if we are in a stroke and the event buttons are greater than 1 
	// (pen button is being clicked) or the erase button is clicked,
	// cancel the stroke and start erasing
	if( !erasing && strokeSteps > 0 && (event.buttons > 1 || eraseButtonClicked) ) {
		erasing = true;
		strokeSteps = 0;
		strokeCancel();
	}

	if( erasing ) erase( clientCoordsToSVG(eventClientCoords) );

	// update the stroke steps counter and continue drawing
	if( !erasing && strokeSteps > 0 ) {
		strokeSteps++;
		strokeContinue( clientCoordsToSVG(eventClientCoords) );
	}

	const timeoutID = setTimeout( () => resetTimeout == timeoutID ? resetState() : null, 500 );
	resetTimeout = timeoutID;
}

function pointerup( event ) {

	if( !activePointers[event.pointerId] ) return;
    
    // remove the pointer from activePointers
    // (does nothing if it wasnt in them)
    delete activePointers[event.pointerId];
    
    // we lost a pointer so skip a frame to prevent
    // a step change in pan position
    skip1Frame = true;

	// if we are erasing then stop erasing
	if( erasing && !Object.keys(activePointers).length ) {
		erasing = false;
		resetErase();
	}

	// if this is the last pointer up, the stroke is done
	if( strokeSteps > 0 && !Object.keys(activePointers).length ) {
		strokeSteps = 0;
		strokeEnd();
	}
	
	svgCanvas.style.cursor = "auto";
}

// pan/zoom loop
( function panAndZoom() {
    
    // call again next frame
    requestAnimationFrame( panAndZoom );
    
    // if theres no active pointers or a stroke is in progress or we are erasing do nothing
    if( !Object.keys(activePointers).length || strokeSteps != 0 || erasing ) return;

	// set the pointer to grabbing
	svgCanvas.style.cursor = "grabbing";
    
    // get the mean pointer and spread
    const pointers = Object.values( activePointers );
    meanPointer    = getMeanPointer( pointers );
    pointerSpread  = getPointerSpread( pointers, meanPointer );
    
    // we have to skip a frame when we change number of
    // pointers to avoid a jump
    if( !skip1Frame ) {

        // shift the container by the pointer movement
        canvasOffset.x -= clamp( meanPointer.x - lastMeanPointer.x, -100, 100 ) * canvasScale;
        canvasOffset.y -= clamp( meanPointer.y - lastMeanPointer.y, -100, 100 ) * canvasScale;

		const scrollDelta = clamp( (lastPointerSpread - pointerSpread) * 2.7, -100, 100 );
        
		// call the wheel handler with a pseudo event to zoom
        wheel( { clientX: meanPointer.x,
                 clientY: meanPointer.y,
                 deltaY:  scrollDelta } );

        // update the canvas viewBox
        updateCanvasViewBox();
    }
    
    // update the lets to prepare for the next frame
    lastMeanPointer   = meanPointer;
    lastPointerSpread = pointerSpread;
    skip1Frame        = false;
    
} )();

function wheel( event ) {
    
    // prevent browser from doing anything
    event.preventDefault?.();
    
	// calculate amount of zooming from scoll delta
    const zoomAmount = event.deltaY / 600;

    // shift the container so that the pointer stays in the same place relative to it
    canvasOffset.x += canvasScale * ( zoomAmount / (zoomAmount - 1) ) * event.clientX;
    canvasOffset.y += canvasScale * ( zoomAmount / (zoomAmount - 1) ) * event.clientY;

    // change the container scale
    canvasScale /= 1 - zoomAmount;

	// update the canvas viewBox
	updateCanvasViewBox();
}

function updateCanvasViewBox() {

	// limit canvas offset to edge of page
	canvasOffset.x = Math.max( 0, canvasOffset.x );
	canvasOffset.y = Math.max( 0, canvasOffset.y );
    
	// get the x and y offsets, height and width of the viewBox
	const x = canvasOffset.x;
	const y = canvasOffset.y;
    const width  = svgCanvas.clientWidth * canvasScale;
    const height = svgCanvas.clientHeight * canvasScale;
	
	// set the viewBox
	svgCanvas.setAttribute( "viewBox", `${x} ${y} ${width} ${height}` );
}

new ResizeObserver( updateCanvasViewBox ).observe( svgCanvas );


function clientCoordsToSVG( clientCoords ) {
	
	const svgX = canvasOffset.x + clientCoords.x * canvasScale;
	const svgY = canvasOffset.y + clientCoords.y * canvasScale;

	return {x: svgX, y: svgY};
}

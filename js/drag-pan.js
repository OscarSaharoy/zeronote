// Oscar Saharoy 2023

import { adjustCanvasOffset } from "./canvas-control.js";


const dragPanButton = document.getElementById( "pan" );

dragPanButton.addEventListener( "pointerdown", panStart );
dragPanButton.addEventListener( "pointermove", panMove );

window.addEventListener( "pointerup",    panEnd );
window.addEventListener( "pointerleave", panEnd );

let moving = false;
let [ dx, dy ] = [0, 0];
let [ x, y ] = [ null, null ];


async function panStart( event ) {
	moving = true;
	dragPanButton.setPointerCapture(event.pointerId);
	[ x, y ] = [ event.clientX, event.clientY ];
	await dragPanButton.requestPointerLock();
}

function panMove( event ) {

	if( !moving ) return;

	dragPanButton.style.cursor = "grabbing";

	[ dx, dy ] = [ event.clientX - x, event.clientY - y ];
	[ dx, dy ] = [ event.movementX, event.movementY ];
	[ x, y ] = [ event.clientX, event.clientY ];

	adjustCanvasOffset( -dx, -dy );
}

async function panEnd( event ) {
	dragPanButton.style.cursor = "grab";
	moving = false;
	dragPanButton.releasePointerCapture(event.pointerId);
	await dragPanButton.exitPointerLock();
}

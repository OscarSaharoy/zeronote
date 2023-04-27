// Oscar Saharoy 2022

import { back } from "./utility.js";


// undo and redo buttons
const undoButton = document.getElementById( "undo" );
const redoButton = document.getElementById( "redo" );

// list of actions performed
export const actions = [];
let undoOffset = -1;
let loopTimeout = null;

// add callbacks to ui
undoButton.addEventListener( "pointerdown", () => loop(undo) );
redoButton.addEventListener( "pointerdown", () => loop(redo) );

window.addEventListener( "pointerleave", () => clearTimeout( loopTimeout ) );
window.addEventListener( "pointerup",    () => clearTimeout( loopTimeout ) );
window.addEventListener( "touchend",     () => clearTimeout( loopTimeout ) );


function loop( func, steps=0 ) {
	
	// call the looped func
	func();
	
	// loop again after a delay with 1 extra step
	const delay = Math.max( 500 / (2*steps + 1), 100 );
	loopTimeout = setTimeout( () => loop(func, ++steps), delay );
}


function undo() {

	// if we're at the bottom of the undo stack do nothing
	if( undoOffset === - actions.length - 1 ) return;

	// get the action we are trying to undo
	const action = back( actions, undoOffset );

	// perform the opposite to undo it
	if( action.type === "draw" )
		action.stroke.remove();

	if( action.type === "erase" )
		action.stroke.reinsert();

	// decrement the offset to aim at the action before
	--undoOffset;
}


function redo() {

	// if we are at the top of the undo stack do nothing
	if( undoOffset === -1 ) return;

	// increment the offset to un-undo the next action
	++undoOffset;

	// get the action we are trying to redo
	const action = back( actions, undoOffset );

	// un-undo the action
	if( action.type === "draw" )
		action.stroke.reinsert();

	if( action.type === "erase" )
		action.stroke.remove();

}


export function rebaseActions() {

	// trim the undo stack to the current position to continue
	// building it up from a previous position
	actions.splice( actions.length + undoOffset + 1 );
	undoOffset = -1;
}

export function resetActions() {

	// clear the undo stack
	actions.length = 0;
	undoOffset = -1;
}


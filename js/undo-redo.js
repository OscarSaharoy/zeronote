// Oscar Saharoy 2022

import { back } from "./utility.js";


// undo and redo buttons
const undoButton = document.getElementById( "undo" );
const redoButton = document.getElementById( "redo" );

// list of actions performed
export const actions = [];
let undoOffset = -1;


undoButton.addEventListener( "click", undo );
redoButton.addEventListener( "click", redo );


function undo() {

	console.log(actions);
	if( undoOffset === - actions.length - 1 ) return;

	const action = back( actions, undoOffset );

	if( action.type === "draw" )
		action.stroke.remove();

	if( action.type === "erase" )
		action.stroke.reinsert();

	--undoOffset;
}


function redo() {

	if( undoOffset === -1 ) return;
	++undoOffset;

	const action = back( actions, undoOffset );

	if( action.type === "draw" )
		action.stroke.reinsert();

	if( action.type === "erase" )
		action.stroke.remove();

}


export function rebaseActions() {

	actions.splice( actions.length + undoOffset + 1 );
	undoOffset = -1;
}

export function resetActions() {
	
	actions.length = 0;
	undoOffset = -1;
}


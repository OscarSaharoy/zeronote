// Oscar Saharoy 2023

const toolbox = document.getElementById( "toolbox" );
const grip = document.getElementById( "grip" );
const logo = document.getElementById( "logo" );

let moving = false;
let [ dx, dy ] = [0, 0];
let [ x, y ] = [ null, null ];


grip.addEventListener( "pointerdown", gripStart );
grip.addEventListener( "pointermove", gripMove );

logo.addEventListener( "pointerdown", gripStart );
logo.addEventListener( "pointermove", gripMove );

window.addEventListener( "pointerup",    gripEnd );
window.addEventListener( "pointerleave", gripEnd );


// clamp x between min and max
const clamp = (x, min, max) => x < min ? min : ( x > max ? max : x );


function gripStart( event ) {
	moving = true;
	grip.setPointerCapture(event.pointerId);
	[ x, y ] = [ event.clientX, event.clientY ];
}

function gripMove( event ) {

	if( !moving ) return;

	[ grip, logo ].forEach( elm => elm.style.cursor="grabbing" );

	[ dx, dy ] = [ dx + event.clientX - x, dy + event.clientY - y ];
	[ x, y ] = [ event.clientX, event.clientY ];

	dx = clamp( dx, 0, window.innerWidth  - toolbox.clientWidth  );
	dy = clamp( dy, 0, window.innerHeight - toolbox.clientHeight );

	console.log( event.movementX, event.movementY );

	toolbox.style.transform = `translateX(${dx}px) translateY(${dy}px)`;
}

function gripEnd( event ) {
	[ grip, logo ].forEach( elm => elm.style.cursor="grab" )
	moving = false;
	grip.releasePointerCapture(event.pointerId);
}

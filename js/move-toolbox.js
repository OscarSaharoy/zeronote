// Oscar Saharoy 2023

const toolbox = document.getElementById( "toolbox" );
const grip = document.getElementById( "grip" );
const logo = document.getElementById( "logo" );

let moving = false;
let [ dx, dy ] = [0, 0];


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
}

function gripMove( event ) {

	if( !moving ) return;

	[ grip, logo ].forEach( elm => elm.style.cursor="grabbing" )

	dx += event.movementX;
	dy += event.movementY;

	dx = clamp( dx, 0, window.innerWidth  - toolbox.clientWidth  );
	dy = clamp( dy, 0, window.innerHeight - toolbox.clientHeight );

	toolbox.style.transform = `translateX(${dx}px) translateY(${dy}px)`;
}

function gripEnd( event ) {
	[ grip, logo ].forEach( elm => elm.style.cursor="grab" )
	moving = false;
	grip.releasePointerCapture(event.pointerId);
}

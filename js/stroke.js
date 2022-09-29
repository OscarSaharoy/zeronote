
const svgCanvas = document.getElementById( "canvas" );

var currentLine = null;
var currentLineD = null;


function strokeStart( svgCoords ) {
	
	currentLine = document.querySelector( "svg#canvas #templates path" ).cloneNode();
	currentLineD = `M${svgCoords.x} ${svgCoords.y} `;
	currentLine.setAttribute( "d", currentLineD );
	svgCanvas.appendChild( currentLine );
}


function strokeContinue( svgCoords ) {
	
	if( !currentLine ) return;

	currentLineD += `L${svgCoords.x} ${svgCoords.y} `;
	currentLine.setAttribute( "d", currentLineD );
}


function strokeCancel() {
	
	currentLine.remove();
	strokeEnd();
}


function strokeEnd() {
	
	currentLine = null;
	currentLineD = null;
}


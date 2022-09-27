
const svgCanvas = document.getElementById( "canvas" );

svgCanvas.addEventListener( "pointerdown", pointerdown );
svgCanvas.addEventListener( "pointermove", pointermove );
svgCanvas.addEventListener( "pointerup"  , pointerup   );


var currentLine = null;
var currentLineD = null;

function pointerdown( event ) {
	
	currentLine = document.querySelector( "svg#canvas #templates path" ).cloneNode();
	currentLineD = `M${event.clientX} ${event.clientY} `;
	currentLine.setAttribute( "d", currentLineD );
	svgCanvas.appendChild(currentLine);
}

function pointerup( evnt ) {
	
	currentLine = null;
	currentLineD = null;
}


function pointermove( event ) {
	
	if( !currentLine ) return;
	
	currentLineD += `L${event.clientX} ${event.clientY} `;
	currentLine.setAttribute( "d", currentLineD );
}


function resizeSvgCanvasToWindow() {

    const width  = svgCanvas.clientWidth;
    const height = svgCanvas.clientHeight;
	
	svgCanvas.setAttribute( "viewBox", `0 0 ${width} ${height}` );
}

new ResizeObserver( resizeSvgCanvasToWindow ).observe( canvas );


document.addEventListener( "keydown", event => event.key == 'd' ? downloadSVG() : null );

// svg downloading function
function downloadSVG() {

    // get svg data and make into a blob
    const data = svgCanvas.outerHTML;
    const blob = new Blob( [data], {type: 'image/svg+xml'} );

    // create a dummy link with the blob
    const elem = window.document.createElement('a');
    elem.href = window.URL.createObjectURL(blob);
    elem.download = "zeronote.svg";
    elem.click();
}


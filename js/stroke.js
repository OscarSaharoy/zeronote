// Oscar Saharoy 2022

const svgCanvas = document.getElementById( "canvas" );

var currentPath = null;
var currentPathD = null;
var currentPathID = 0;

export var strokesCoords = {};


export function strokeStart( svgCoords ) {
	
	currentPath = document.querySelector( "svg#canvas #templates path" ).cloneNode();
	currentPathD = `M${svgCoords.x} ${svgCoords.y} `;
	currentPathID++;

	currentPath.setAttribute( "d", currentPathD );
	svgCanvas.appendChild( currentPath );
	currentPath.id = `path${currentPathID}`;

	strokesCoords[currentPathID] = [svgCoords];
}


export function strokeContinue( svgCoords ) {
	
	currentPathD += `L${svgCoords.x} ${svgCoords.y} `;
	currentPath.setAttribute( "d", currentPathD );

	strokesCoords[currentPathID].push( svgCoords );
}


export function strokeCancel() {

	if( !currentPath ) return;
	
	currentPath.remove();
	delete strokesCoords[currentPathID];
	strokeEnd();
}


export function strokeEnd() {

	if( Object.hasOwn(strokesCoords, currentPathID) && strokesCoords[currentPathID].length == 1 ) {
		currentPath.remove();
		delete strokesCoords[currentPathID];
	}
	
	currentPath = null;
	currentPathD = null;

	console.log(strokesCoords);
}


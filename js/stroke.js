// Oscar Saharoy 2022


const svgCanvas = document.getElementById( "canvas" );
const strokeTemplate = document.querySelector( "svg#canvas defs path" );

export class Stroke {

	constructor() {

		this.vertices = [];
		this.pathElm = strokeTemplate.cloneNode();
		this.id = "p" + (new Date()).valueOf();
	}

	
}


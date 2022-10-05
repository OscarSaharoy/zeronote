// Oscar Saharoy 2022

import { dist } from "./utility.js";


export const strokesArray = [];


const svgCanvas = document.getElementById( "canvas" );
const strokeTemplate = document.querySelector( "svg#canvas defs path" );
const strokesGroup = document.getElementById( "strokes" );


const crPaddingPoint = coordList => 
	({x: 2*(coordList[0].x-coordList[2].x) + coordList[3].x, y: 2*(coordList[0].y-coordList[2].y) + coordList[3].y});
const catmullRomPad = coordList =>
	coordList.length < 4 ? 
		[ coordList[0], ...coordList, coordList[coordList.length-1] ] :
	    [ crPaddingPoint(coordList), ...coordList, crPaddingPoint(coordList.slice().reverse()) ];
const formFourTuples = coordList => 
	coordList.slice(1, -2)
		     .map( (_,idx) => coordList.slice(idx, idx+4) );
const catmullRomDEntry = fourTuple =>
	`C${(-fourTuple[0].x + 6*fourTuple[1].x + fourTuple[2].x)/6},${(-fourTuple[0].y + 6*fourTuple[1].y + fourTuple[2].y)/6} ` +
	`${(fourTuple[1].x + 6*fourTuple[2].x - fourTuple[3].x)/6},${(fourTuple[1].y + 6*fourTuple[2].y - fourTuple[3].y)/6} ` +
	`${fourTuple[2].x},${fourTuple[2].y}`;
const coordListToCatmullRomD = coordList => 
	`M${coordList[0].x},${coordList[0].y} ` +
	formFourTuples( catmullRomPad(coordList) ).reduce( (acc,val) => acc + " " + catmullRomDEntry(val), "" )


const filterPath = coordList => {

	const filteredPath = [ coordList[0] ];
	
	for( const coord of coordList.slice(1, -1) ) {

		if( dist( coord, filteredPath[filteredPath.length-1] ) > 3 )
			filteredPath.push(coord);
	}

	filteredPath.push( coordList[coordList.length-1] );
	return filteredPath; 
}


const verticesFromPathElm = elm => catmullRomDToCoordList( elm.getAttribute('d') );
const catmullRomDToCoordList = d =>
	d.replace( /M/gi, '' )
	 .split( /[CL]/ )
	 .map( coordString => coordString.split( " " )[0] )
	 .map( coordString => coordString.split( "," ) )
	 .map( coords => ({ x: +coords[0], y: +coords[1] }) );


export class Stroke {

	constructor( pathElm ) {

		strokesArray.push( this );

		if( pathElm ) return this.fromPathElm(pathElm);

		this.vertices = [];
		this.pathElm = strokeTemplate.cloneNode();
		strokesGroup.appendChild( this.pathElm );
	}

	fromPathElm( pathElm ) {
		
		this.vertices = verticesFromPathElm( pathElm );
		this.pathElm = pathElm;
	}

	addVertex( point ) {
		this.vertices.push( point );
		this.vertices = filterPath( this.vertices );
		this.updateElm();
	}

	updateElm() {
		this.pathElm.setAttribute( "d", coordListToCatmullRomD(this.vertices) );	
	}

	remove() {
		this.pathElm.remove();
	}
}


export function reloadStrokes() {

	// get all the path elms in the strokesGroup
	const pathElms = document.querySelectorAll( "#strokes path" );

	// empty and repopulate the strokesArray
	strokesArray.length = 0;
	pathElms.forEach( pathElm => ( new Stroke(pathElm) ) );
}


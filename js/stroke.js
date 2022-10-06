// Oscar Saharoy 2022

import { add, back, commaSep, dist, div, mul, sub } from "./utility.js";
import { currentColour } from "./colour-picker.js";


export const strokesArray = [];


const svgCanvas = document.getElementById( "canvas" );
const strokeTemplate = document.querySelector( "svg#canvas defs path" );
const strokesGroup = document.getElementById( "strokes" );


const dStart = firstPoint =>
	`M${firstPoint.x},${firstPoint.y} L${firstPoint.x},${firstPoint.y} `

const padShort = vertices =>
	[ vertices[0], ...vertices, back(vertices) ];

const catmullRomDEntry = ft =>
	`C${ commaSep( div( add( mul(ft[1], 6), sub(ft[2], ft[0]) ), 6 ) ) }` +
	` ${ commaSep( div( add( mul(ft[2], 6), sub(ft[1], ft[3]) ), 6 ) ) }` +
	` ${ commaSep( ft[2] ) } `;

const catmullRomD = vertices =>
	formFourTuples( vertices ).reduce( (acc,val) => acc + catmullRomDEntry(val), "" )

const shortD = vertices =>
	dStart( vertices[0] ) +
	catmullRomD( padShort(vertices) );


const crPaddingPoint = vs =>
	add( mul( sub( vs[0], vs[2] ), 2), vs[3] );

const formFourTuples = vertices =>
	vertices.slice(1, -2)
		    .map( (_,idx) => vertices.slice(idx, idx+4) );

const catmullRomPadStart = vertices =>
	[ crPaddingPoint(vertices), ...vertices ];

const catmullRomPadEnd = vertices =>
	[ ...vertices, crPaddingPoint(vertices.slice().reverse()) ];

const catmullRomPad = vertices =>
	[ crPaddingPoint(vertices), ...vertices, crPaddingPoint(vertices.slice().reverse()) ];

const longD = vertices =>
	dStart( vertices[0] ) +
	catmullRomD( catmullRomPad(vertices) );


const verticesFromPathElm = elm => 
	elm.getAttribute('d')
	   .replace( /M/gi, '' )
	   .split( /[CL]/ )
	   .map( coordString => coordString.split( " " )[0] )
	   .map( coordString => coordString.split( "," ) )
	   .map( coords => ({ x: +coords[0], y: +coords[1] }) );


export class Stroke {

	constructor( pathElm ) {

		// add this stroke to the strokesArray
		strokesArray.push( this );

		// if a pathElm is provided then use that to construct from
		if( pathElm ) return this.fromPathElm(pathElm);

		// start vertices array blank and create and add a new path to the dom
		this.vertices = [];
		this.pathElm = strokeTemplate.cloneNode();
		this.pathElm.setAttribute( "stroke", currentColour );
		strokesGroup.appendChild( this.pathElm );

		// cache the pathElm's d attribute so we don't have to regenerate it fully
		this.sureD = "";
		this.unsureD = "";
	}

	fromPathElm( pathElm ) {
	
		// set the Stroke's attributes to match the provided pathElm
		this.vertices = verticesFromPathElm( pathElm );
		this.pathElm  = pathElm;
	}

	addVertex( point ) {

		// filter the path (removes vertices that are too close together)
		const lastVertex        = back(this.vertices, -1);
		const penultimateVertex = back(this.vertices, -2);

		this.changedLastVertex = lastVertex && penultimateVertex 
			&& dist( lastVertex, penultimateVertex ) < 3;

		if( this.changedLastVertex ) this.vertices.pop();

		// add the new vertex and update the dom with the change
		this.vertices.push( point );
		this.updateElm();
	}

	updateD() {

		// generate the d attribute for the path, caching previous results to speed up

		if( this.sureD && !this.changedLastVertex )
			this.sureD += catmullRomD( this.vertices.slice(-5,-1) );

		else if( !this.sureD )
			this.sureD = dStart(this.vertices[0]) 
					   + catmullRomD( catmullRomPadStart(this.vertices.slice(0,-1)) );

		this.unsureD = catmullRomD( catmullRomPadEnd(this.vertices.slice(-4)) );

		return this.sureD + this.unsureD;
	}

	updateElm() {

		let d;
	
		if( this.vertices.length < 4 )
			d = shortD( this.vertices );
		else if( this.vertices.length < 6 )
			d = longD( this.vertices );
		else
			d = this.updateD();

		// set the d entry for the pathElm
		this.pathElm.setAttribute( "d", d );	
	}

	remove() {

		// remove the pathElm from the dom and remove this from the strokesArray
		this.pathElm.remove();
		const index = strokesArray.indexOf(this);
		if( index != -1 ) strokesArray.splice( index, 1 );
	}
}


export function reloadStrokes() {

	// get all the path elms in the strokesGroup
	const pathElms = document.querySelectorAll( "#strokes path" );

	// empty and repopulate the strokesArray
	strokesArray.length = 0;
	pathElms.forEach( pathElm => ( new Stroke(pathElm) ) );
}


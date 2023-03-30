// Oscar Saharoy 2022

import { reloadStrokes } from "./stroke.js";
import { resetActions } from "./undo-redo.js";

const svgCanvas    = document.getElementById( "canvas"  );
const strokesGroup = document.getElementById( "strokes" );
const saveButton   = document.getElementById( "save"    );
const loadButton   = document.getElementById( "load"    );
const uploadInput  = document.getElementById( "upload"  );

document.addEventListener( "keydown", event => event.key == 'd' ? downloadSVG() : null );
saveButton.addEventListener( "click", downloadSVG );
uploadInput.addEventListener( "input", uploadSVG );


function getDate() {

	const dateFormat = {hour12: true, month: "short", day: "numeric", hour: "numeric", minute: "numeric"};

	return (new Date())
		.toLocaleDateString( undefined, dateFormat )
		.replace(/, /g, "_")
		.replace(/[: ]/g, "-");
}


function downloadSVG() {

    // get svg data and make into a blob
    const data = svgCanvas.outerHTML;
    const blob = new Blob( [data], {type: 'image/svg+xml'} );

    // create a dummy link with the blob and click it to start download
    const elem = window.document.createElement('a');
    elem.href = window.URL.createObjectURL(blob);
    elem.download = `zeronote_${getDate()}.svg`;
    elem.click();

	// change the save icon for a bit to show success
	saveButton.src = "svg/saved.svg";
	setTimeout( () => saveButton.src = "svg/save.svg", 2000 );
}


function uploadSVG() {

	// get uploaded file and create a file reader object
	const uploadedFile = uploadInput.files[0];
	const fileReader = new FileReader();

	// once the file is read, insert the stroke into the dom
	fileReader.onload = () => insertStrokes( fileReader.result );

	// extract the content from the uploaded file
	fileReader.readAsText( uploadedFile );
}


function insertStrokes( fileReaderResult ) {

	// create a dummy element and insert the loaded svg file into it
	const dummy = document.createElement("div");
	dummy.innerHTML = fileReaderResult;
	
	// set the actual strokesGroup innerHTML to that of the one in the
	// uploaded file
	strokesGroup.innerHTML = dummy.querySelector( "#strokes" ).innerHTML;

	reloadStrokes();
	resetActions();
}


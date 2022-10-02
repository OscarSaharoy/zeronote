// Oscar Saharoy 2022

const svgCanvas = document.getElementById( "canvas" );
const saveButton = document.getElementById( "save" );
const loadButton = document.getElementById( "load" );

document.addEventListener( "keydown", event => event.key == 'd' ? downloadSVG() : null );
saveButton.addEventListener( "click", downloadSVG );
//loadButton.addEventListener( "click", downloadSVG );


function getDate() {

	const now = new Date();
	let date = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();
	let time = now.getHours() + "-" + now.getMinutes() + "-" + now.getSeconds();
	return date + "_" + time;
}

// svg downloading function
function downloadSVG() {

    // get svg data and make into a blob
    const data = svgCanvas.outerHTML;
    const blob = new Blob( [data], {type: 'image/svg+xml'} );

    // create a dummy link with the blob
    const elem = window.document.createElement('a');
    elem.href = window.URL.createObjectURL(blob);
    elem.download = `zeronote_${getDate()}.svg`;
    elem.click();
}


document.addEventListener( "keydown", event => event.key == 'u' ? uploadSVG() : null );

// svg uploading function
function uploadSVG() {

    // get svg data and make into a blob
    const data = svgCanvas.outerHTML;
    const blob = new Blob( [data], {type: 'image/svg+xml'} );

    // create a dummy link with the blob
    const elem = window.document.createElement('a');
    elem.href = window.URL.createObjectURL(blob);
    elem.download = "zeronote.svg";
    elem.click();
}

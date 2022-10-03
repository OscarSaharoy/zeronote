// Oscar Saharoy 2022

const svgCanvas    = document.getElementById( "canvas"  );
const strokesGroup = document.getElementById( "strokes" );
const saveButton   = document.getElementById( "save"    );
const loadButton   = document.getElementById( "load"    );
const uploadInput  = document.getElementById( "upload"  );

document.addEventListener( "keydown", event => event.key == 'd' ? downloadSVG() : null );
saveButton.addEventListener( "click", downloadSVG );
uploadInput.addEventListener( "input", uploadSVG );


function getDate() {

	const now = new Date();
	let date = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();
	let time = now.getHours() + "-" + now.getMinutes() + "-" + now.getSeconds();
	return date + "_" + time;
}

// svg downloading function
function downloadSVG() {

    // get svg data and make into a blob
    const data = strokesGroup.innerHTML;
    const blob = new Blob( [data], {type: 'image/svg+xml'} );

    // create a dummy link with the blob and click it to start download
    const elem = window.document.createElement('a');
    elem.href = window.URL.createObjectURL(blob);
    elem.download = `zeronote_${getDate()}.svg`;
    elem.click();
}


// svg uploading function
function uploadSVG() {

	// get uploaded file and create a file reader object
	const uploadedFile = uploadInput.files[0];
	const fileReader = new FileReader();

	fileReader.onload = function(e) {
		strokesGroup.innerHTML = fileReader.result;
	}

	fileReader.readAsText( uploadedFile );
}

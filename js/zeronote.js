// Oscar Saharoy 2022

const svgCanvas = document.getElementById( "canvas" );


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


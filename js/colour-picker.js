// Oscar Saharoy 2022

const penTip = document.getElementById( "pen-tip" );
const pickerInput = document.getElementById( "colour-picker-input" );
const eraseButton = document.getElementById( "erase" );

// variable that holds the current selected stroke colour
export let currentColour = "#ffffff";

// define function to update pen tip colour and call it
const updatePenTip = () => penTip.setAttribute( "fill", currentColour );
updatePenTip();

// link input on colour picker to update ui
pickerInput.addEventListener( "input", () => currentColour = pickerInput.value );
pickerInput.addEventListener( "input", updatePenTip );
pickerInput.addEventListener( "input", () => eraseButton.click() );


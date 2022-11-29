// Oscar Saharoy 2022

import { eraseButtonClicked, eraseButton } from "./erase-button.js";

const penTip = document.getElementById( "pen-tip" );
const pickerInput = document.getElementById( "colour-picker-input" );

// variable that holds the current selected stroke colour
export let currentColour = "#ffffff";

// define function to update pen tip colour and call it
const updatePenTip = () => penTip.setAttribute( "fill", currentColour );
updatePenTip();

// link input on colour picker to update ui
pickerInput.addEventListener( "input", () => currentColour = pickerInput.value );
pickerInput.addEventListener( "input", updatePenTip );
pickerInput.addEventListener( "input", () => eraseButtonClicked ? eraseButton.click()  : null );


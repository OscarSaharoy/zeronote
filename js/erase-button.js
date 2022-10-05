// Oscar Saharoy 2022

const eraseButton = document.getElementById( "erase" );

export let eraseButtonClicked = false;

eraseButton.addEventListener( "click", () => 
	eraseButtonClicked = eraseButton.classList.toggle( "active" ) );


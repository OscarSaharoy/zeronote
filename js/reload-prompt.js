// Oscar Saharoy 2022


// this code provides the warning before the page is reloaded/closed

const handleBeforeUnload = event => {
	event.preventDefault();
	const message =
		"Are you sure you want to leave? Your notes will be lost.";
	event.returnValue = message;
	return message;
}

window.addEventListener("beforeunload", handleBeforeUnload);


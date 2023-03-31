// Oscar Saharoy 2023


const cacheName = "zeronote-v1";
const contentToCache = [
	"./",
	"./serviceWorker.js",
	"./screenshot.jpg",
	"./index.html",
	"./css/zeronote.css",
	"./svg/redo.svg",
	"./svg/undo.svg",
	"./svg/pen.svg",
	"./svg/save.svg",
	"./svg/saved.svg",
	"./svg/erase.svg",
	"./svg/grab.svg",
	"./svg/logo.svg",
	"./svg/load.svg",
	"./js/utility.js",
	"./js/undo-redo.js",
	"./js/reload-prompt.js",
	"./js/erase.js",
	"./js/draw-stroke.js",
	"./js/erase-button.js",
	"./js/colour-picker.js",
	"./js/download-upload.js",
	"./js/canvas-control.js",
	"./js/stroke.js",
	"./js/draw-with-touch.js",
	"./LICENSE.md",
];


self.addEventListener( "install", e => e.waitUntil(   install(e) ) );
self.addEventListener( "fetch",   e => e.respondWith( fetch(e)   ) );


async function install( e ) {

	const cache = await caches.open( cacheName );
	console.log( "[serviceWorker.js] Caching content" );
	await cache.addAll(contentToCache);
}


async function fetch( e ) {

	const cacheResponse = await caches.match( e.request );

	if( cacheResponse )
		return cacheResponse;
	
	const response = await fetch( e.request );

	const cache = await caches.open(cacheName);
	cache.put(e.request, response.clone());

	return response;
}


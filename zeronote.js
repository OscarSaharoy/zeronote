// Oscar Saharoy 2021



// rewrite me!!!!
function controller() {
    
    // don't even try if the angle is too far off upright
    if( Math.abs(theta) > 0.5 ) return 0;
    
    // pid controller (i=0)
    return ( ptheta*theta + dtheta*thetadot + px*x + dx*xdot ) * controllerOn;
}




// get some of the elements
const svgs              = Array.from( document.querySelectorAll( "svg"         ) );
const sliderElements    = Array.from( document.querySelectorAll( ".slider"     ) );
const topCircleElements = Array.from( document.querySelectorAll( ".top-circle" ) );
const poleElements      = Array.from( document.querySelectorAll( ".pole"       ) );
const preventDrag       = Array.from( document.querySelectorAll( "input, button, #drag-target" ) );

const [pendulumSVG, shadowSVG] = svgs;
const background = document.querySelector( "#background"  );
const container  = document.querySelector( "#container"   );
const railRect   = document.querySelector( "#rail"        );
const dragTarget = document.querySelector( "#drag-target" );


// ---------- pan and zoom code ----------

// arrays of pointer positions and active pointers
let activePointers   = [];
let pointerPositions = {};

// mean pointer position and that of last frame
let meanPointer     = { x: 0, y: 0 };
let lastMeanPointer = { x: 0, y: 0 };

// spread of pointers and that of last frame
let pointerSpread     = 0;
let lastPointerSpread = 0;

// we need to keep a bool telling us to
// skip a frame when a new pointer is added
let skip1Frame = false;

// get mean and spread of a list of pointer positions
const getMeanPointer = arr => arr.reduce( (acc, val) => ({ x: acc.x + val.x/arr.length, y: acc.y+val.y/arr.length }), {x: 0, y: 0} );
const getPointerSpread = (positions, mean) => positions.reduce( (acc, val) => acc + ((val.x-mean.x)**2 + (val.y-mean.y)**2)**0.5, 0 );

// these control the overall screen zoom and position
let containerScale  = 1;
let containerOffset = { x: 0, y: 0 };

// link all the pointer events
background.addEventListener( "pointerdown",  pointerdown );
background.addEventListener( "pointerup",    pointerup   );
background.addEventListener( "pointermove",  pointermove );
background.addEventListener( "wheel",        wheel       );

function pointerdown( event ) {
    
    // if the event's target element is in the preventDrag array then return
    if( preventDrag.reduce( (result, elm) => result || elm == event.target, false) ) return;
    
    // otherwise add the pointer to pointerPositions and activePointers
    pointerPositions[event.pointerId] = { x: event.clientX, y: event.clientY };
    activePointers.push( event.pointerId );
    
    // we added a new pointer so skip a frame to prevent
    // a step change in pan position
    skip1Frame = true;
}

function pointermove( event ) {
    
    event.preventDefault();
    
    // if this pointer isn't an active pointer
    // (pointerdown occured over a preventDrag element)
    // then do nothing
    if( !activePointers.includes(event.pointerId) ) return;
    
    // keep track of the pointer pos
    pointerPositions[event.pointerId] = { x: event.clientX, y: event.clientY };
}

function pointerup( event ) {
    
    // remove the pointer from active pointers and pointerPositions
    // (does nothing if it wasnt in them)
    activePointers = activePointers.filter( id => id != event.pointerId );
    delete pointerPositions[event.pointerId];
    
    // we lost a pointer so skip a frame to prevent
    // a step change in pan position
    skip1Frame = true;
}

// pan/zoom loop
( function panAndZoomScreen() {
    
    // call again next frame
    requestAnimationFrame( panAndZoomScreen );
    
    // if theres no active pointers do nothing
    if( !activePointers.length ) return;
    
    // get the mean pointer and spread
    const pointers = Object.values( pointerPositions );
    meanPointer    = getMeanPointer( pointers );
    pointerSpread  = getPointerSpread( pointers, meanPointer );
    
    // we have to skip a frame when we change number of
    // pointers to avoid a jump
    if( !skip1Frame ) {
        
        // shift the container by the pointer movement
        containerOffset.x += meanPointer.x - lastMeanPointer.x;
        containerOffset.y += meanPointer.y - lastMeanPointer.y;
        
        wheel( { clientX: meanPointer.x,
                 clientY: meanPointer.y,
                 deltaY: (lastPointerSpread - pointerSpread) * 2.7 } );
    
        // update the container's transform
        updateContainerTransform();
    }
    
    // update the lets to prepare for the next frame
    lastMeanPointer   = meanPointer;
    lastPointerSpread = pointerSpread;
    skip1Frame        = false;
    
} )();

function wheel( event ) {
    
    // prevent browser from doing anything
    event.preventDefault?.();
    
    // adjust the zoom level and update the container
    const zoomAmount = event.deltaY / 600;
    
    // find the centre of the container so we can find the offset of 
    // the pointer and make sure it stays in the same place relative to the container
    let containerBBox = container.getBoundingClientRect();
    centreX = containerBBox.left + containerBBox.width /2;
    centreY = containerBBox.top  + containerBBox.height/2;
    
    // shift the container so that the pointer stays in the same place relative to it
    containerOffset.x += zoomAmount * (event.clientX - centreX);
    containerOffset.y += zoomAmount * (event.clientY - centreY);
    
    // zoom and update the container
    containerScale *= 1 - zoomAmount;
    updateContainerTransform();
}

function updateContainerTransform() {
    
    // set the transform of the container to account for its scale and offset
    container.style.transform = `translateX( ${containerOffset.x}px ) translateY( ${containerOffset.y}px ) scale( ${containerScale} )`;
}

// fit the container div to the screen
let containerBBox = container.getBoundingClientRect();

containerScale = Math.min( 1,
                           window.innerHeight / containerBBox.height * 0.8,
                           window.innerWidth  / containerBBox.width  * 0.8 );

updateContainerTransform();

// ---------- end of pan and zoom code ----------


// ---------- slider code ----------

class Slider {
    
    constructor( sliderId, pId = null, inputId = null ) {
        
        // get the slider and throw an error if it wasn't found
        this.slider = document.getElementById( sliderId );
        if( !this.slider ) throw `Slider instatiated with invalid slider id: "${sliderId}"`;
        
        // get the p and throw an error if it wasn't found
        this.p = pId ? document.getElementById( pId ) : null;
        if( pId && !this.p ) throw `Slider instatiated with invalid p id: "${pId}"`;
        
        // get the input and throw an error if it wasn't found
        this.input = inputId ? document.getElementById( inputId ) : null;
        if( inputId && !this.input ) throw `Slider instatiated with invalid input id: "${inputId}"`;
        
        // this._value is the current value of the slider
        this._value = this.sliderValue;
        
        // connect the callback to be called when the slider is changed
        this.slider.addEventListener( "input", () => this.sliderChange() );

        // if there's an input connect it to its callback
        this.input?.addEventListener( "input", () => this.inputChange()  );
        
        // decimal places of the slider
        this.decimalPlaces = this.slider.step.split(".")[1]?.length || 0;

        // method that can be overridden to change number formatting
        this.format = x => x.toString();

        // add an onchange callback that can be set by the user
        this.onchange = () => {};
    }

    get sliderValue() {

        return +this.slider.value;
    }

    set sliderValue( newValue ) {

        this.slider.value = newValue;
    }

    sliderChange() {

        // get the value from the slider
        this._value = this.sliderValue;

        // put the value into the p or input if they were supplied
        if( this.p     ) this.p.innerHTML = this.format( this._value );
        if( this.input ) this.input.value = this.format( this._value );

        this.onchange();
    }

    inputChange() {

        // get the value from the input
        this._value = +this.input.value;

        // put the value into the slider
        this.sliderValue = this._value;

        this.onchange();
    }

    get value() {

        return this._value;
    }

    set value( newValue ) {

        this._value = newValue;
        
        // put the value into the slider
        this.sliderValue = this._value;

        // put the value into the p or input if they were supplied
        if( this.p )
            this.p.innerHTML = this.format( this._value );
        
        if( this.input && this.input != document.activeElement )
            this.input.value = this.format( this._value );
    }
}

class LogSlider extends Slider {
    
    constructor( sliderId, pId = null, numberId = null) {
        
        super( sliderId, pId, numberId );
        
        // cache the initial value of the slider
        const initialValue = this.value;
        
        // make the slider step small as log space is much smaller than actual space
        this.slider.setAttribute( "step", "0.00000001" );
        
        // map the slider to log space
        this.slider.max = Math.log(this.slider.max);
        this.slider.min = Math.log(this.slider.min);
        
        // map the initial slider value into log space
        this.slider.value = Math.log( initialValue );
        
        this.format = x => x.toPrecision(3);
    }

    get sliderValue() {

        return Math.exp( +this.slider.value );
    }

    set sliderValue( newValue ) {

        this.slider.value = Math.log( newValue );
    }
}

// ---------- end of slider code ----------


// ---------- pendulum dragging code ----------

// 2 vars used to track the pendulum dragging
let pendulumDraggingPointer    = null;
let pendulumDraggingPointerPos = null;

// add event listeners
dragTarget.addEventListener( "pointerdown" , pointerdownOnPendulum   );
background.addEventListener( "pointermove" , pendulumDragPointermove );
background.addEventListener( "pointerup"   , pointerupOnPendulum     );
background.addEventListener( "pointerleave", pointerupOnPendulum     );

function pointerdownOnPendulum( evt ) {
    
    // store the pointer ID and position
    pendulumDraggingPointer    = evt.pointerId;
    pendulumDraggingPointerPos = pointerToPendulumSpace( evt );
}

function pointerupOnPendulum( evt ) {
    
    // only act for the pointer being used
    if( evt.pointerId != pendulumDraggingPointer ) return;
    
    // unset all the pointer vars as the pointer has been released
    pendulumDraggingPointer    = null;
    pendulumDraggingPointerPos = null;
}

function pendulumDragPointermove( evt ) {
    
    if( evt.pointerId != pendulumDraggingPointer ) return;
    
    // update the pendulum dragging pointer pos
    pendulumDraggingPointerPos = pointerToPendulumSpace( evt );
}

function pointerToPendulumSpace( evt ) {
    
    // find pendulum origin in pendulum space
    railBBox = railRect.getBoundingClientRect();
    originX  = railBBox.left + railBBox.width  * 0.5;
    originY  = railBBox.top  + railBBox.height * 0.5;

    // return the pointer position in pendulum space
    return { x: (evt.clientX - originX) * 0.05 / railBBox.height,
             y: (originY - evt.clientY) * 0.05 / railBBox.height };    
}

// ---------- end of pendulum dragging code ----------


// ---------- simulation code ----------

function toggleController() {
    
    controllerOn ^= 1;
    controllerButton.innerHTML = `turn ${controllerOn ? "off" : "on"} controller`;
}

function nudge() {
    
    // give an impulse to theta
    const randomValue = ( Math.random() - 0.5 ) / 2;
    thetadot += ( randomValue + Math.sign( randomValue ) ) / l ;
}

// vector operations
const mul      = (vec , k   ) => vec.map( v => v*k );
const add      = (vec1, vec2) => vec1.map( (_,k) => vec1[k] + vec2[k] );
const dot      = (vec1, vec2) => vec1.reduce( (acc, val, k) => acc + vec1[k] * vec2[k], 0 );
const mod      =  vec         => vec.reduce( (acc,val) => acc + val**2, 0 ) ** 0.5;
const norm     =  vec         => mul( vec, 1/mod(vec) );
const rotm90   =  vec         => [ vec[1], -vec[0] ];
const crossmod = (vec1, vec2) => vec1[0] * vec2[1] - vec1[1] * vec2[0];

function stateDot( state ) {
    
    // get vars out of state vector
    const [theta, x, thetadot, xdot] = state;
    
    // equations of motion under gravity and controller
    let xddot     = M / ( m + M*Math.sin(theta)**2 ) 
                  * ( l * thetadot**2 * Math.sin(theta) 
                    - g * Math.sin(theta)*Math.cos(theta) )
                  - f * xdot + controller();
    
    let thetaddot = g/l * Math.sin(theta)
                  - xddot/l * Math.cos(theta);
    
    // add dragging forces if there is a dragging pointer
    if( pendulumDraggingPointer ) {
        
        // direction vector of the pendulum pole
        const poleDir = [ Math.sin(theta), Math.cos(theta) ];
        
        // displacement vector to pendulum from mouse
        const dist = [ pendulumDraggingPointerPos.x - x - l*Math.sin(theta),
                       pendulumDraggingPointerPos.y     - l*Math.cos(theta) ];
        
        // create a force on the pendulum
        const springForce  = mul( dist, 600 );
        const thetaddotInc = crossmod( springForce, poleDir ) / ( M * l );
        const xddotInc     = dot( springForce, [1,0] ) / m - thetaddotInc * M*l/m * Math.cos(theta);
        
        // superpose the accelerations from the spring force onto those from the equations of motion
        // and add damping too
        thetaddot += thetaddotInc - thetadot * 40;
        xddot     += xddotInc     - xdot     * 40;
    }
    
    // return stateDot vector
    return [thetadot, xdot, thetaddot, xddot];
}

 
function updateCoordinates() {
    
    // increment time
    t += dt;
    
    // avoid division by 0
    if( l == 0 ) return;
    
    // handle bounce off edge of rail
    const bounce = Math.abs(x) > 0.875 && xdot*x > 0;
    thetadot    += 2*xdot*( Math.cos(theta)**2 ) / ( l*Math.cos(theta) ) * bounce;
    xdot        += -2*xdot * bounce;
    
    // get state vector
    const state = [theta, x, thetadot, xdot];
    
    // calculate RK4 intermediate values
    const k1 = stateDot( state );
    const k2 = stateDot( add( state, mul( k1, dt/2 ) ) );
    const k3 = stateDot( add( state, mul( k2, dt/2 ) ) );
    const k4 = stateDot( add( state, mul( k3, dt   ) ) );
    
    // calculate the overall RK4 step and increment the state vector
    const RK4step = mul( add( add( k1, mul( k2, 2) ), add( mul( k3, 2 ), k4 ) ), 1/6 * dt );
    
    // update the vars
    [theta, x, thetadot, xdot] = add( state, RK4step );
    
    // keep theta between -pi and pi
    if( theta >  pi ) theta -= 2*pi;
    if( theta < -pi ) theta += 2*pi;
}


function updateGraphics() {
    
    // translate all the slider elements by sliderX
    sliderTranslate = `translateX( ${100*x}px )`
    sliderElements.forEach( elm => elm.style.transform = sliderTranslate );
    
    // translate the pole to connect to the slider then rotate it around by theta
    poleTranslate = sliderTranslate + `rotateZ( ${theta*57.296}deg ) scaleY( ${l/0.65} )`;
    poleElements.forEach( elm => elm.style.transform = poleTranslate );
    
    // place the circle on top of the pole
    topCircleTranslate = sliderTranslate + `translateX( ${100*l*Math.sin(theta)}px ) translateY( ${-100*l*Math.cos(theta)}px )`
    topCircleElements.forEach( elm => elm.style.transform = topCircleTranslate );
}


function mainloop(millis) {

	dt = ( millis / 1000 - t ) / stepsPerFrame;
    
    // do the physics step as many times as needed 
    for(var s=0; s<stepsPerFrame; ++s) updateCoordinates();
    
    // update the graphics
    updateGraphics();
    
    // print energy of system
    // console.log( 1/2*m*xdot**2 + 1/2*M*( ( xdot + l*thetadot*Math.cos(theta) )**2+ (l*thetadot*Math.sin(theta))**2 ) + M*g*l*Math.cos(theta) );
    
    // call this again after 1 frame
    requestAnimationFrame( mainloop );
}

// ---------- end of simulation code ----------



// number of physics steps per frame
const stepsPerFrame = 10;

// true when pid controller is active
let controllerOn = false;

// simulation constants
var pi = 3.1415926535897932384;
var g  = 9.81;                  // gravitational acceleration
var l  = 0.65;                  // pendulum length
var dt = 0.016 / stepsPerFrame; // time step
var M  = 1;                     // pendulum mass
var m  = 1;                     // slider mass
var f  = 0;                     // slider friction

/// pd controller variables
var ptheta = 100;
var dtheta = 10;
var px     = 20;
var dx     = 10;

// simulation vars
var t, x, xdot, xddot, theta, thetadot, thetaddot;

function reset() {
   
    // set all vars to inital values
    t         = 0;     // time
    x         = 0;     // slider position
    xdot      = 0;     // slider velocity
    xddot     = 0;     // slider acceleration
    theta     = 0.001; // pendulum angle
    thetadot  = 0;     // pendulum angular velocity
    thetaddot = 0;     // pendulum acceleration
}

reset();

// setup all the sliders
const pthetaSlider         = new Slider(    "ptheta-slider"         , null, "ptheta-input"          );
const dthetaSlider         = new Slider(    "dtheta-slider"         , null, "dtheta-input"          );
const pxSlider             = new Slider(    "px-slider"             , null, "px-input"              );
const dxSlider             = new Slider(    "dx-slider"             , null, "dx-input"              );
const gravitySlider        = new Slider(    "g-slider"              , null, "g-input"               );
const pendulumLengthSlider = new Slider(    "pendulum-length-slider", null, "pendulum-length-input" );
const pendulumMassSlider   = new LogSlider( "pendulum-mass-slider"  , null, "pendulum-mass-input"   );
const sliderMassSlider     = new LogSlider( "slider-mass-slider"    , null, "slider-mass-input"     );

// link the sliders to change the sim variables
const sliders = [ pthetaSlider, dthetaSlider, pxSlider, dxSlider,
                  gravitySlider, pendulumLengthSlider, pendulumMassSlider, sliderMassSlider ];

sliders.forEach( elm => elm.onchange = () =>
                [ptheta, dtheta, px, dx, g, l, M, m] = sliders.map( elm => elm.value ) );

// get buttons
const resetButton      = document.getElementById("reset");
const controllerButton = document.getElementById("toggle-controller");
const nudgeButton      = document.getElementById("nudge");

// link buttons to callbacks
resetButton.onpointerdown      = reset;
controllerButton.onpointerdown = toggleController;
nudgeButton.onpointerdown      = nudge;


mainloop(0);

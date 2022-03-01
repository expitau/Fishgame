let currentUrl = window.location.href;
const SERVER_IP = currentUrl.replace("8080", "3000");
const socket = io(SERVER_IP || prompt("Enter server IP:Port", "localhost:3000"));
//p5.disableFriendlyErrors = true;
let debugMode = false;

/** Socket Connection **/
socket.on('connect', () => {
    console.log("You have connected as " + socket.id)
    id = socket.id;
    window.requestAnimationFrame(ENGINE_DoFrameTick);
})

/* On connection initialized */
let serverConnectionInitialized = false;
socket.on('init', (res) => {
    // set game data
    players = res.players;
    gameMap = new Map(res.gameMap);

    // set server flag ready
    serverConnectionInitialized = true;
})

/* Server-client time sync*/
let timeOffset = 0;
let timeSamples = [];
function syncTime() {
    let timeSyncRequest = Date.now();
    socket.emit("timeSync", (res) => {
        // get current time offset
        timeSamples.push((res.time - timeSyncRequest) - (Date.now() - res.time)) / 2;

        // calculate average time offset
        timeOffset = 0;
        for(let i = 0; i < timeSamples.length; i++){
            timeOffset += timeSamples[i];
        }
        timeOffset /= timeSamples.length;

        // TODO: create function to find outlining datasamples and eliminate them from the average

        // print results
        if(debugMode){
            console.log("Time resynced by " + timeOffset + "ms");
        }
    });
}

/* On server update */
let tickBuffer = { doTickBuffer: false }
socket.on('serverUpdate', (res) => {
    // Update to tick buffer
    tickBuffer.res = res;
    if(programReady && serverConnectionInitialized){
        effects.add(tickBuffer.res.effects);
    }
    tickBuffer.doTickBuffer = true;
})

// On p5.js ready
let programReady = false;
var cnv;
function setup() {
    // Create canvas
    cnv = createCanvas(0, 0);
    
    noSmooth();
    pixelDensity(1);

    // Initialize game
    OnInit();

    // resize
    resizeCanvas(frame.screenWidth + 300, frame.screenHeight + 300);
    cnv.style('display', 'block');
    cnv.position(frame.originX - 150, frame.originY - 150, 'fixed');

    // Set program flag ready
    programReady = true;
}

// On window resize
function windowResized() {
    if(programReady && serverConnectionInitialized){
        frame.calculateDimensions();
        resizeCanvas(frame.screenWidth + 300, frame.screenHeight + 300);
        cnv.style('display', 'block');
        cnv.position(frame.originX - 150, frame.originY - 150, 'fixed');
    }
}

// On client update
function ENGINE_DoFrameTick() {
    // Wait for program and server flags
    if(programReady && serverConnectionInitialized){
        // Setup game elements
        input.update();

        // Do physics ticks
        ENGINE_DoPhysicsTick(players);

        // Create Frame (was encapulated, but moved for performance [firebug screenshot before: https://i.gyazo.com/efc59d13b2d4fb7700b13aebe5a41698.png])
        background("#dbba67");
        push();
        translate(150 + effects.screenShake[0] * frame.changeRatio, 150  + effects.screenShake[1] * frame.changeRatio);
        scale(frame.changeRatio);
        fill("#b09554");
        noStroke();
        rect(-gameMap.pixelSize, -gameMap.pixelSize, frame.width + gameMap.pixelSize * 2, frame.height + gameMap.pixelSize * 2);

        // Render game
        OnRender();

        // Draw FPS (rounded to 2 decimal places) at the top right of the screen
        if(debugMode){
            let fps = frameRate();
            if(fps < 45){
                fill(255, 0, 0);
                textSize(20);
                text("FPS DROP: " + fps.toFixed(2), 4, 19);
            }
        }
        
        // Reset matrix
        pop();

        // Cleanup game elements
        input.reset();
    }
    // Rerun this function
    window.requestAnimationFrame(ENGINE_DoFrameTick);
}

// Update physics information
let lastUpdate = Date.now();
function ENGINE_DoPhysicsTick() {
    // Read new tick buffer information
    if (tickBuffer.doTickBuffer) {
        players = tickBuffer.res.players

        tickBuffer.doTickBuffer = false;
        lastUpdate = tickBuffer.res.lastUpdate - timeOffset;
    }

    // Run physics ticks on client as necessary
    deltaTime = (Math.round((Date.now() - lastUpdate) / 16));
    while (deltaTime > 0) {
        deltaTime -= 1;
        OnTick();
    }
    lastUpdate = (Date.now())
}

// Toggle fullscreen mode
function toggleFullScreen() {
    var doc = window.document;
    var docEl = doc.documentElement;

    var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
    var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

    if(!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
        requestFullScreen.call(docEl);
    }
    else {
        cancelFullScreen.call(doc);
    }
}


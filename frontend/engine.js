let currentUrl = window.location.href;
const SERVER_IP = currentUrl.replace("8080", "3000");
const socket = io(SERVER_IP || prompt("Enter server IP:Port", "localhost:3000"));
//p5.disableFriendlyErrors = true;

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
    syncTime()
})

/* Server-client time sync : CURRENTLY ONLY USED AS CONSOLE COMMAND, WILL BE RUN AUTOMATICALLY WHEN USER JOINS A LOBBY */
let timeOffset = 0;
function syncTime() {
    let timeSyncRequest = Date.now();
    socket.emit("timeSync", (res) => {
        timeOffset = ((res.time - timeSyncRequest) - (Date.now() - res.time)) / 2;
        console.log("Time was dsynced by " + timeOffset + "ms");
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
        background("#222222");
        push();
        translate(150 + effects.screenShake[0], 150  + effects.screenShake[1]);
        scale(frame.changeRatio);

        // Render game
        OnRender();

        // Draw FPS (rounded to 2 decimal places) at the top right of the screen
        let fps = frameRate();
        fill(255);
        text("FPS: " + fps.toFixed(2), 0, -10);

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
        console.log(lastUpdate - tickBuffer.res.lastUpdate)
        lastUpdate = tickBuffer.res.lastUpdate - timeOffset;
    }

    // Run physics ticks on client as necessary
    deltaTime = (Math.round((Date.now() - lastUpdate) / 16));
    // deltaTime = 1
    // console.log(deltaTime)
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


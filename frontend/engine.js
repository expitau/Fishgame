const SERVER_IP = "localhost:3000";
const socket = io(SERVER_IP || prompt("Enter server IP:Port", "localhost:3000"));

/** Socket Connection **/
socket.on('connect', () => {
    console.log("You have connected as " + socket.id)
    id = socket.id;
    window.requestAnimationFrame(ENGINE_DoFrameTick)
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

/* On server update */
let tickBuffer = { doTickBuffer: false }
socket.on('serverUpdate', (res) => {
    // Update to tick buffer
    tickBuffer.res = res;
    tickBuffer.doTickBuffer = true;
})

// On p5.js ready
let programReady = false;
function setup() {
    // Create canvas
    createCanvas(windowWidth, windowHeight);
    noSmooth();
    pixelDensity(1);

    // Initialize game
    OnInit();

    // Set program flag ready
    programReady = true;
}

// On window resize
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    frame.calculateDimensions();
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
        fill("#222222");
        rect(0, 0, windowWidth, windowHeight);
        push();
        translate(frame.originX + effects.screenShake[0] * frame.changeRatio, frame.originY + effects.screenShake[1] * frame.changeRatio);
        scale(frame.changeRatio);

        // Render game
        OnRender();

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
        effects.add(tickBuffer.res.effects);

        tickBuffer.doTickBuffer = false;
        lastUpdate = tickBuffer.res.lastUpdate;
    }

    // Run physics ticks on client as necessary
    deltaTime = Math.round(Date.now() / 16) - Math.round(lastUpdate / 16);
    while (deltaTime > 0) {
        deltaTime -= 1;
        OnTick();
        lastUpdate = Date.now()
    }
}
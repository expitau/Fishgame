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
        frame.push();

        // Do physics ticks
        ENGINE_DoPhysicsTick(players);

        // Render game
        OnRender();

        // Cleanup game elements
        frame.pop();
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
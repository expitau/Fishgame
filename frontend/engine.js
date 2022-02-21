const SERVER_IP = "192.168.86.20:3000";
const socket = io(SERVER_IP || prompt("Enter server IP:Port", "localhost:3000"));
//p5.disableFriendlyErrors = true;

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
    $("#defaultCanvas0").css({ 'width': (frame.screenWidth + 300 + "px") });
    $("#defaultCanvas0").css({ 'height': (frame.screenHeight + 300 + "px") });
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
        $("#defaultCanvas0").css({ 'width': (frame.screenWidth + 300 + "px") });
        $("#defaultCanvas0").css({ 'height': (frame.screenHeight + 300 + "px") });
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
        translate(150, 150);
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
const SERVER_IP = "localhost:3000";
const socket = io(SERVER_IP || prompt("Enter server IP:Port", "localhost:3000"));

/** Socket Connection **/
socket.on('connect', () => {
    console.log("You have connected as " + socket.id)
    id = socket.id;
    window.requestAnimationFrame(ENGINE_DoFrameTick)
})

socket.on('init', (res) => {
    players = res.players;
    gameMap = new Map(res.gameMap);
})

let tickBuffer = { doTickBuffer: false }
socket.on('serverUpdate', (res) => {
    tickBuffer.res = res;
    tickBuffer.doTickBuffer = true;
})

let programReady = false;
function setup() {
    OnInit();
    createCanvas(windowWidth, windowHeight);
    noSmooth();
    programReady = true;
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    frame.calculateDimensions()
}


function ENGINE_DoFrameTick() {
    if(programReady){
        ENGINE_DoPhysicsTick(players)
        
        input.update();
        
        frame.display();

        input.reset();
    }
    window.requestAnimationFrame(ENGINE_DoFrameTick);
}

let lastUpdate = Date.now();
function ENGINE_DoPhysicsTick() {
    if (tickBuffer.doTickBuffer) {
        players = tickBuffer.res.players;

        effects.add(tickBuffer.res.effects);

        tickBuffer.doTickBuffer = false;
        lastUpdate = tickBuffer.res.lastUpdate;
    }
    deltaTime = Math.round(Date.now() / 16) - Math.round(lastUpdate / 16);
    while (deltaTime > 0) {
        deltaTime -= 1;
        OnTick();
        lastUpdate = Date.now()
    }
}
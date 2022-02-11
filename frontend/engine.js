const SERVER_IP = "localhost:3000";
const socket = io(SERVER_IP || prompt("Enter server IP:Port", "localhost:3000"));
/** Socket Connection **/
socket.on('connect', () => {
    console.log("You have connected as " + socket.id)
    id = socket.id;
    OnInit()
    window.requestAnimationFrame(ENGINE_DoFrameTick)
})

let OnTick = () => {};

socket.on('init', (res) => {
    players = res.players;
    eval(`OnTick = function ${res.OnTick}`);
})

let tickBuffer = { doTickBuffer: false }
socket.on('serverUpdate', (res) => {
    tickBuffer.res = res;
    tickBuffer.doTickBuffer = true;
})

function setup() {
    createCanvas(windowWidth, windowHeight);
    calculateVirtualScreen();
    for (let element of document.getElementsByClassName("p5Canvas")) {
        //element.addEventListener("contextmenu", (e) => e.preventDefault());
    }   
}
// Dynamically change the size of the canvas on window resize
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    calculateVirtualScreen();
}

function calculateVirtualScreen(){
    width = aspectRatio > (windowHeight - margins * 2) / (windowWidth - margins * 2) ? 
        (windowHeight - margins * 2) / aspectRatio : windowWidth - margins * 2;
    height = width * aspectRatio;
    originX = (windowWidth - width)/2;
    originY = (windowHeight - height)/2;
}

let lastUpdate = Date.now()
function ENGINE_DoFrameTick() {
    ENGINE_DoPhysicsTick(players)
    OnRender();
    window.requestAnimationFrame(ENGINE_DoFrameTick)
}

function ENGINE_DoPhysicsTick() {
    if (tickBuffer.doTickBuffer) {
        players = tickBuffer.res.players;
        tickBuffer.doTickBuffer = false;
        lastUpdate = tickBuffer.res.lastUpdate;
    }
    deltaTime += Date.now() - lastUpdate;
    while (deltaTime > 16) {
        deltaTime -= 16;
    }
    OnTick(players);
    lastUpdate = Date.now()
}

function mousePressed() {
    OnInput(mouseX, mouseY)
}
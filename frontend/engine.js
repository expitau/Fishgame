const SERVER_IP = "localhost:3000";
const socket = io(SERVER_IP || prompt("Enter server IP:Port", "localhost:3000"));
/** Socket Connection **/
socket.on('connect', () => {
    console.log("You have connected as " + socket.id)
    id = socket.id;
    OnInit()
    window.requestAnimationFrame(ENGINE_DoFrameTick)
})

socket.on('init', (res) => {
    players = res.players;
    gameMap = res.gameMap;
})

let tickBuffer = { doTickBuffer: false }
socket.on('serverUpdate', (res) => {
    tickBuffer.res = res;
    tickBuffer.doTickBuffer = true;
})

let Frame;

function setup() {
    createCanvas(windowWidth, windowHeight);
    Frame = new ENGINE_Frame()
    for (let element of document.getElementsByClassName("p5Canvas")) {
        //element.addEventListener("contextmenu", (e) => e.preventDefault());
    }
}
// Dynamically change the size of the canvas on window resize
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    Frame.calculateDimensions()
    calculateVirtualScreen();
}

class ENGINE_Frame{
    constructor(width = 800, height = 600, margin = 100){
        this.width = width;
        this.height = height;
        this.margin = margin;
        this.aspectRatio = width / height
        this.calculateDimensions()
    }

    calculateDimensions() {
        this.screenWidth = this.aspectRatio > (windowHeight - this.margin * 2) / (windowWidth - this.margin * 2) ?
            (windowHeight - this.margin * 2) / this.aspectRatio : windowWidth - this.margin * 2;
        this.screenHeight = this.width * this.aspectRatio;
        this.originX = (windowWidth - this.width) / 2;
        this.originY = (windowHeight - this.height) / 2;
    }
}

function calculateVirtualScreen() {
}

let lastUpdate = Date.now()
function ENGINE_DoFrameTick() {
    ENGINE_DoPhysicsTick(players)
    
    background(palette.frame)
    push();
    translate(Frame.originX, Frame.originY);
    scale(Frame.screenWidth / Frame.width);
    OnRender();
    pop();
    
    window.requestAnimationFrame(ENGINE_DoFrameTick)
}

function ENGINE_DoPhysicsTick() {
    if (tickBuffer.doTickBuffer) {
        players = tickBuffer.res.players;
        tickBuffer.doTickBuffer = false;
        lastUpdate = tickBuffer.res.lastUpdate;
    }
    deltaTime = Math.round(Date.now() / 16) - Math.round(lastUpdate / 16);
    while (deltaTime > 0) {
        deltaTime -= 1;
        OnTick(players);
        lastUpdate = Date.now()
    }
}

function mousePressed() {
    OnInput(mouseX, mouseY)
}
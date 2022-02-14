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
    gameMap = new Map(res.gameMap);
})

let tickBuffer = { doTickBuffer: false }
socket.on('serverUpdate', (res) => {
    tickBuffer.res = res;
    tickBuffer.doTickBuffer = true;
})

let Frame;
let spritesheet;

function setup() {
    createCanvas(windowWidth, windowHeight);
    Frame = new ENGINE_Frame()
    spritesheet = new Spritesheet();

    noSmooth();
}
// Dynamically change the size of the canvas on window resize
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    Frame.calculateDimensions()
}

class ENGINE_Frame{
    constructor(width = 800, height = 600, marginRatio = 1/10){
        this.width = width;
        this.height = height;
        this.marginRatio = marginRatio;
        this.aspectRatio = height / width;
        this.calculateDimensions();
    }

    calculateDimensions() {
        if(this.aspectRatio > windowHeight / windowWidth){
            this.margin = windowHeight * this.marginRatio;
            this.screenHeight = windowHeight - this.margin * 2;
            this.screenWidth = this.screenHeight / this.aspectRatio;
        }else{
            this.margin = windowWidth * this.marginRatio;
            this.screenWidth = windowWidth - this.margin * 2;
            this.screenHeight = this.screenWidth * this.aspectRatio;
        }
        this.originX = (windowWidth - this.screenWidth) / 2;
        this.originY = (windowHeight - this.screenHeight) / 2;
    }
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
        OnTick(gameMap, players);
        lastUpdate = Date.now()
    }
}

function mousePressed() {
    OnInput(mouseX, mouseY)
}
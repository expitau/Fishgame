const SERVER_IP = "localhost:3000";
const socket = io(SERVER_IP || prompt("Enter server IP:Port", "localhost:3000"));
/** Socket Connection **/
socket.on('connect', () => {
    console.log("You have connected as " + socket.id)
    id = socket.id;
    OnInit();
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
let graphics;

function setup() {
    document.body.requestPointerLock = document.body.requestPointerLock || document.body.mozRequestPointerLock || document.body.webkitRequestPointerLock;
    document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock || document.webkitExitPointerLock;
    document.addEventListener("mousemove", this.moveCallback, false);

    createCanvas(windowWidth, windowHeight);
    Frame = new ENGINE_Frame()
    graphics = new Graphics();
    //pixelDensity(1);
    noSmooth();
}
// Dynamically change the size of the canvas on window resize
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    Frame.calculateDimensions()
}

function moveCallback(e) {
    let movementX = e.movementX || e.mozMovementX || e.webkitMovementX || mouseX-pmouseX;
    let movementY = e.movementY || e.mozMovementY || e.webkitMovementY || mouseY-pmouseY;
    caclulateCursor(movementX, movementY);
}

class ENGINE_Frame{
    constructor(width = 800, height = 600, marginRatio = 1/20){
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
    
    OnInput();
    graphics.OnScreenShake();

    background(palette.frame)
    push();
    translate(Frame.originX + graphics.screenShake[0] * Frame.screenWidth / Frame.width, Frame.originY + graphics.screenShake[1] * Frame.screenWidth / Frame.width);
    scale(Frame.screenWidth / Frame.width);
    OnRender();
    pop();
    
    window.requestAnimationFrame(ENGINE_DoFrameTick);
    mouseIsReleased = false;
}

function ENGINE_DoPhysicsTick() {
    if (tickBuffer.doTickBuffer) {
        players = tickBuffer.res.players;
        if(tickBuffer.res.effects && tickBuffer.res.effects.length){
            for(let i = 0; i < tickBuffer.res.effects.length; i++){
                effects.push([tickBuffer.res.effects[i][0], tickBuffer.res.effects[i][1], 19]);
                graphics.screenShakeTime = 5;
            }
        }
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
    mouseIsPressed = true;
    cursorData.x = 0;
    cursorData.y = 0;
    document.body.requestPointerLock();
}
function mouseReleased(){
    mouseIsPressed = false;
    mouseIsReleased = true;
}
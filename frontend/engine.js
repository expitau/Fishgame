const SERVER_IP = "localhost:3000";
const socket = io(SERVER_IP || prompt("Enter server IP:Port", "localhost:3000"));
/** Socket Connection **/
socket.on('connect', () => {
    console.log("You have connected as " + socket.id)
    id = socket.id;
    OnInit()
    window.requestAnimationFrame(ENGINE_DoFrameTick)
})

let OnTick = (players) => {
    for (const [id, player] of Object.entries(players)) {
        // Update player
        player.physics.x+=player.physics.vx;
        player.physics.y += player.physics.vy;
        if (player.physics.y >= 600){
            player.physics.y = 600;
            player.physics.vy *= -0.6;
        }
        
        if (player.physics.x >= 800){
            player.physics.x = 800
            player.physics.vx *= -0.6
        }
        if (player.physics.x <= 0){
            player.physics.x = 0
            player.physics.vx *= -0.6
        }
        player.physics.vy += 0.05;
        
        player.physics.vy *= 0.999;
        player.physics.vx *= 0.995;
    }
}

socket.on('init', (res) => {
    players = res.players;
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
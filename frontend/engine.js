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
        player.physics.x+=1;
    }
}
socket.on('init', (res) => {
    players = res.players;
})

socket.on('serverUpdate', (x) => {
    players = x;
})

function setup() {
    createCanvas(windowWidth, windowHeight);
    pixelDensity(1);

    for (let element of document.getElementsByClassName("p5Canvas")) {
        element.addEventListener("contextmenu", (e) => e.preventDefault());
    }
}
// Dynamically change the size of the canvas on window resize
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

let lastUpdate = Date.now()
function ENGINE_DoFrameTick(){
    OnRender();
    deltaTime += Date.now() - lastUpdate;
    while (deltaTime > 16){
        OnTick(players)
        deltaTime -= 16;
    }
    lastUpdate = Date.now()
    window.requestAnimationFrame(ENGINE_DoFrameTick)
}

function ENGINE_DoPhysicsTick(){
    OnTick(players);
}

function mousePressed(){
    OnInput(mouseX, mouseY)
}
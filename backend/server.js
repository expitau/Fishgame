const io = require("socket.io")(3000, {
    cors: {
        origin: "*",
    }
})

gameState = {
    playerData: {},
    map: {
        width: 800,
        height: 800
    }
};

playerInputs = {}

io.on("connection", (socket) => {
    console.log(socket.id + " connected");
    playerInputs[socket.id] = {}
    
    socket.on('keyEntered', (inputs) => {
        playerInputs[socket.id] = {left: inputs.left ?? false, right: inputs.right ?? false}
    });

    socket.on('disconnect', () => {
        console.log(socket.id + " disconnected")
        delete playerInputs[socket.id]
    });

    // Debug test
    socket.on('test', () => {
        console.log(socket.id + " sent a test message");
    });
});

let lastUpdate = Date.now()
setInterval(update, 16)

function update() {
    let deltaTime = Date.now() - lastUpdate;
    if (deltaTime == 0){
        return;  // Skip the frame
    }
    
    for(id of Object.keys(playerInputs)){
        updatePlayer(id, deltaTime)
    }

    lastUpdate = Date.now()
    
    io.emit('broadcastGlobalState', gameState)
}

// Updates gameState.playerData from gamestate.playerInputs
function updatePlayer (id, dt){
    let playerState = gameState.playerData[id];
    let inputState = playerInputs[id];

    playerState ??= {
        cameraX: 0,
        cameraY: 0,
        x: 500,
        y: 500,
        r: 0,
    };

    let speed = 70 * dt / 1000;
    
    if(inputState.right){
        playerState.r += 2 * speed;
    }
    if(inputState.left){
        playerState.r -= 2 * speed;
    }
    
    playerState.x += Math.sin(degToRad(playerState.r)) * speed;
    playerState.y -= Math.cos(degToRad(playerState.r)) * speed;
    
    playerState.x = Math.min(Math.max(playerState.x, 0), gameState.map.width);
    playerState.y = Math.min(Math.max(playerState.y, 0), gameState.map.height);
    
    playerState.cameraX = -playerState.x;
    playerState.cameraY = -playerState.y;
    
    gameState.playerData[id] = playerState
}

function degToRad(r){
    return r *(Math.PI / 180);
}
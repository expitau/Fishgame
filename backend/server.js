const io = require("socket.io")(3000, {
    cors: {
        origin: "*",
    }
})

gameState = {
    users: {},
    map: {
        width: 800,
        height: 800
    }
};

io.on("connection", (socket) => {
    console.log(socket.id + " connected");
    
    socket.on('broadcastLocalState', (inputState) => {
        playerState = UpdatePlayer(inputState, gameState.users[socket.id]);
        gameState.users[socket.id] = playerState;
    });

    socket.on('getGlobalState', () => {
        socket.emit('broadcastGlobalState', gameState)
    });

    socket.on('disconnect', () => {
        console.log(socket.id + " disconnected")
    });

    // Debug test
    socket.on('test', () => {
        console.log(socket.id + " sent a test message");
    });
});

function UpdatePlayer (inputState, globalPlayerState){
    let playerState = globalPlayerState;
    if(playerState == null){
        playerState = {
            cameraX: 0,
            cameraY: 0,
            x: 500,
            y: 500,
            r: 0
        };
    }

    let speed = 3;

    if(inputState.rightKey){
        playerState.r += 4;
    }
    if(inputState.leftKey){
        playerState.r -= 4;
    }
    
    playerState.x += Math.sin(degToRad(playerState.r)) * speed;
    playerState.y -= Math.cos(degToRad(playerState.r)) * speed;

    playerState.x = clamp(playerState.x, 0, gameState.map.width);
    playerState.y = clamp(playerState.y, 0, gameState.map.height);

    playerState.cameraX = -playerState.x;
    playerState.cameraY = -playerState.y;

    return playerState;
}

function clamp(n, min, max) {
    if(n > max){
        return max;
    } else if(n < min){
      return min
    } else{
        return n;
    }
}
function degToRad(r){
    return r *(Math.PI / 180);
}
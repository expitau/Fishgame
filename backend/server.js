let Player = require('./player')
let Map = require('./map')

const io = require("socket.io")(3000, {
    cors: {
        origin: "*",
    }
})

players = {};

gameState = {
    map: new Map(30,30)
};

playerInputs = {}

io.on("connection", (socket) => {
    console.log(socket.id + " connected");
    players[socket.id] ??= new Player(socket.id); // Create new player if does not already exist
    
    socket.on('keyEntered', (keyCode, value) => {
        players[socket.id].updateInput(keyCode, value) // Update the input of the player
    });

    socket.on('disconnect', () => {
        console.log(socket.id + " disconnected")
        delete players[socket.id]
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
    
    for([id, player] of Object.entries(players)){
        player.tick(deltaTime)
    }

    lastUpdate = Date.now()
    
    io.emit('broadcastGlobalState', 
    {
        players: Object.fromEntries(Object.entries(players, ([id, player]) => [id, player.getClientProps()])),
        map: gameState.map
    }
    )
}

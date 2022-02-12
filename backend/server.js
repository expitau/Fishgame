let Player = require('./player')
let Map = require('./map')
let Physics = require('./physics')

const io = require("socket.io")(3000, {
    cors: {
        origin: "*",
    }
})

players = {};
currentMap = new Map(0);

io.on("connection", (socket) => {
    console.log(socket.id + " connected");
    players[socket.id] ??= new Player(socket.id); // Create new player if does not already exist
    let myobj = {
        players: players, 
        map: currentMap
    }
    socket.emit("init", myobj)
    
    socket.on('clientUpdate', (playerInput) => {
        players[socket.id].input = playerInput // Update the input of the player
        Physics.OnInput(players[socket.id])
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
let deltaTime = 0;
setInterval(() => {
    deltaTime = Math.round(Date.now() / 16) - Math.round(lastUpdate / 16);
    while (deltaTime > 0) {
        deltaTime -= 1;
        Physics.OnTick(players);
        lastUpdate = Date.now()
    }
}, 16) // 62.5 times per second
setInterval(() => {io.emit("serverUpdate", {lastUpdate: lastUpdate, players: players})}, 20)
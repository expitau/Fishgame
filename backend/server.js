// Require global classes
let Player = require('./DATATYPES/DEF_Player')
let Map = require('./DATATYPES/DEF_Map')
let Physics = require('./DATATYPES/DEF_Physics')

// Require io
const io = require("socket.io")(3000, {
    cors: {
        origin: "*",
    }
})

// Global variables
players = {};
effects = [];
gameMap = new Map(0);

// Socket handler
io.on("connection", (socket) => {
    // Create new Player instance if necessary
    console.log(socket.id + " connected");
    players[socket.id] ??= new Player(socket.id);

    // Send initial world data
    let initialWorldData = {
        players: players, 
        gameMap: gameMap
    }
    socket.emit("init", initialWorldData);
    
    // Handle client update
    socket.on('clientUpdate', (playerInput) => {
        players[socket.id].input = playerInput;
        Physics.OnInput(players[socket.id]);
    });

    // Handle client disconnet
    socket.on('disconnect', () => {
        console.log(socket.id + " disconnected");
        delete players[socket.id];
    });

    // Time sync
    socket.on('timeSync', () => {
        io.emit("timeSync", Date.now());
    });

    // Debug test
    socket.on('test', () => {
        console.log(socket.id + " sent a test message");
    });
});

// Update serverside physics
let lastUpdate = Date.now()
let deltaTime = 0;
setInterval(() => {
    deltaTime = Math.round(Date.now() / 16) - Math.round(lastUpdate / 16);
    while (deltaTime > 0) {
        deltaTime -= 1;
        Physics.OnTick(players, gameMap);
        lastUpdate = Date.now()
    }
}, 16) // 62.5 times per second

// Emit server update to client
setInterval(() => {
    io.emit("serverUpdate", {lastUpdate: lastUpdate, players: players, effects: effects});
    effects = [];
}, 20)
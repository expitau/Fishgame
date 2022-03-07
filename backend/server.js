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

const os = require("os")
const cliSelect = require('cli-select');
const chalk = require('chalk');

let roomCode = function () {
    // Characters that are allowed to exist in a room code
    // let permittedChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ" + "1234567890"// + "abcdefghijklmnopqrstuvwxyz"
    let permittedChars = "ABCDEFGHJKLMNPQRTUVWXYZ" + "2346789"

    function fromIP(ip) {
        let bitSequence = ip.split(".").reduce((p, c) => p * 256 + parseInt(c), 0)
        let out = []
        while (bitSequence > 0) {
            let x = bitSequence % permittedChars.length
            bitSequence = (bitSequence - x) / permittedChars.length
            out = out.concat(permittedChars[x])
        }
        return out.reverse().join("")
    }
    function toIP(code) {
        let bitSequence = code.split('').reduce((p, c) => p * permittedChars.length + permittedChars.indexOf(c), 0)
        let out = []
        while (bitSequence > 0) {
            let x = bitSequence % 256
            bitSequence = (bitSequence - x) / 256
            out = out.concat([x])
        }
        return out.reverse().join(".")
    }
    return { fromIP, toIP }
}()

let networks = os.networkInterfaces()
let available = Object.fromEntries(Object.entries(networks).map(x => [x[0], x[1].filter(y => y.family == 'IPv4')[0]]).filter(x => !x[0].includes("vEthernet") && !x[0].includes("Loopback")))
// console.log(process.argv)
if (process.argv.length > 2){
    startServer(process.argv[2])
}
else if (Object.keys(available).length > 1) {
    console.log("Select Network:")
    cliSelect({
        values: Object.entries(available),
        selected: '>',
        unselected: ' ',
        indentation: 3,
        valueRenderer: (value, selected) => {
            return `${value[0]}${' '.repeat(Math.max(0, 25 - value[0].length))} (${value[1].cidr})`
        }
    }, (response) => {
        let [valueId, value] = [response.id, response.value]
        if (valueId !== null) {
            console.log(`   ${value[0]}${' '.repeat(Math.max(0, 25 - value[0].length))} (${value[1].cidr})`);
            startServer(value[1].address);
        } else {
            console.log("   Cancelled")
            process.exit()
        }
    })
} else {
    startServer(Object.entries(available)[0][1].address)
}

// Global variables

function startServer(ip) {
    console.log("\n            ______   __     ______     __  __        ______     ______     __    __     ______    \n           /\\  ___\\ /\\ \\   /\\  ___\\   /\\ \\_\\ \\      /\\  ___\\   /\\  __ \\   /\\ \"-./  \\   /\\  ___\\   \n           \\ \\  __\\ \\ \\ \\  \\ \\___  \\  \\ \\  __ \\     \\ \\ \\__ \\  \\ \\  __ \\  \\ \\ \\-./\\ \\  \\ \\  __\\   \n            \\ \\_\\    \\ \\_\\  \\/\\_____\\  \\ \\_\\ \\_\\     \\ \\_____\\  \\ \\_\\ \\_\\  \\ \\_\\ \\ \\_\\  \\ \\_____\\ \n             \\/_/     \\/_/   \\/_____/   \\/_/\\/_/      \\/_____/   \\/_/\\/_/   \\/_/  \\/_/   \\/_____/ \n                                                                                                  \n           ");
    console.log(`Room code: ${roomCode.fromIP(ip)}`)
    console.log(`Server running on ${ip}:3000`)
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
        socket.on('timeSync', (callback) => {
            let currentTime = Date.now();
            callback({ time: currentTime });
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
        io.emit("serverUpdate", { lastUpdate: lastUpdate, players: players, effects: effects });
        effects = [];
    }, 20)

}
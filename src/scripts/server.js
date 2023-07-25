let server;

function startServer() {
    server = new Peer()

    let gameState = {
        map: 0,
        players: [],
        effects: []
    }

    server.on('open', () => {

        console.log("\n            ______   __     ______     __  __        ______     ______     __    __     ______    \n           /\\  ___\\ /\\ \\   /\\  ___\\   /\\ \\_\\ \\      /\\  ___\\   /\\  __ \\   /\\ \"-./  \\   /\\  ___\\   \n           \\ \\  __\\ \\ \\ \\  \\ \\___  \\  \\ \\  __ \\     \\ \\ \\__ \\  \\ \\  __ \\  \\ \\ \\-./\\ \\  \\ \\  __\\   \n            \\ \\_\\    \\ \\_\\  \\/\\_____\\  \\ \\_\\ \\_\\     \\ \\_____\\  \\ \\_\\ \\_\\  \\ \\_\\ \\ \\_\\  \\ \\_____\\ \n             \\/_/     \\/_/   \\/_____/   \\/_/\\/_/      \\/_____/   \\/_/\\/_/   \\/_/  \\/_/   \\/_____/ \n                                                                                                  \n           ");
        console.log(`Room code: ${server.id}`)

        let connections = {}

        server.on("connection", (conn) => {
            console.log("Added connection " + conn.peer);

            connections[conn.peer] = conn

            conn.on('open', () => {
                gameState.players.push({
                    id: conn.peer,
                    x: maps[gameState.map].spawnPoint[0],
                    y: maps[gameState.map].spawnPoint[1],
                    r: 0,
                    vx: 0,
                    vy: 0,
                    vr: 0,
                    health: 3,
                    color: Math.floor(Math.random() * 360)
                })

                conn.on('data', (data) => {
                    switch (data.type) {
                        case CONN_EVENTS.clientUpdate:
                            fg_physicsInput(gameState, data.data, conn.peer)
                            break;
                    }
                })

                conn.on('close', () => {
                    delete connections[conn.peer]
                    gameState.players = gameState.players.filter(player => player.id !== conn.peer)
                })

                conn.send({type: CONN_EVENTS.clientInit, data: gameState})
            })
        })

        // // Socket handler
        // server.on("connection", (conn) => {
        //     // Create new Player instance if necessary
        //     console.log(conn);
        //     players[conn.peer] ??= Player(conn.peer, gameMap);
        //     connections[conn.peer] = conn;

        //     // Send initial world data
        //     let initialWorldData = {
        //         players: players,
        //         gameMap: gameMap
        //     }
        //     conn.send({ type: "init", data: initialWorldData });

        //     // Handle client update
        //     conn.on('data', (message) => {
        //         if (message.type == 'clientUpdate') {
        //             let playerInput = message.data

        //             players[conn.peer].input = playerInput;
        //             doPhysicsInput(players[conn.peer], gameMap);
        //         }
        //         else if (message.type == 'disconnect') {
        //             console.log(conn.peer + " disconnected");
        //             delete players[conn.peer];
        //         }
        //         else if (message.type == 'timeSync') {
        //             let callback = message.data

        //             let currentTime = Date.now();
        //             callback({ time: currentTime });
        //         }
        //         else if (message.type == 'test') {
        //             console.log(conn.peer + " sent a test message");
        //         }
        //     })
        // });

        // Update serverside physics
        let lastUpdate = Date.now()
        let deltaTime = 0;
        setInterval(() => {
            deltaTime = Math.round(Date.now() / 16) - Math.round(lastUpdate / 16);
            while (deltaTime > 0) {
                deltaTime -= 1;
                fg_physicsTick(gameState);
                lastUpdate = Date.now()
            }
        }, 1000 / 60) // 60 times per second

        // // Emit server update to client
        setInterval(() => {
            Object.values(connections).forEach(conn => {
                conn.send({ type: CONN_EVENTS.serverUpdate, data: { lastUpdate: lastUpdate, state: gameState } });
            })
        }, 200)

        startClient(server.id);
    })
}

if (isServer) {
    startServer();
}

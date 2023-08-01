let server;
let serverId;

function startServer() {
    function generateServerID() {
        let result = '';
        let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

        for (let i = 0; i < 4; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }

        return result;
    }

    serverId = generateServerID();
    server = new Peer(SERVER_PREFIX + serverId);

    let lastInputUpdate;

    let savedInput = []

    let lastTickUpdate = Date.now();
    let gameState = {
        map: 0,
        players: []
    }


    // Compute all physics from state from time until now, with inputs
    function computePhysics(state, time) {
        let effects = []

        function computePartialPhysics(state, timeA, timeB) {
            let deltaFrames = Math.round(timeB / 16) - Math.round(timeA / 16);
            while (deltaFrames > 0) {
                deltaFrames -= 1;
                state = physicsTick(state).state;
            }
            return state
        }

        // Last known correct state
        let lastTime = time;

        // Compute all physics from last known correct state until first input after lastTime
        let processQueue = savedInput.filter(x => x.time >= lastTime).sort((a, b) => a.time - b.time)
        for (let input of processQueue) {
            state = computePartialPhysics(state, lastTime, input.time);
            input.state = state;
            let newEffects = [];
            ({ state, effects: newEffects } = physicsInput(state, input.type, input.data))

            if (!input.effected) {
                effects = [...effects, ...newEffects]
                input.effected = true
            }
            lastTime = input.time
        }
        state = computePartialPhysics(state, lastTime, Date.now())
        lastTickUpdate = Date.now()
        return { state, effects }
    }

    // Server specific rollback handling
    function serverInput(time, type, data) {

        function rollback(input) {
            lastTickUpdate = input.time
            time = input.time
            gameState = input.state
        }

        function saveInput(time) {
            savedInput.push({ time: time, state: structuredClone(gameState), type: type, data: data, effected: false })
        }

        // If no saved input, rollback as far as possible
        if (savedInput.length == 0) {
            time = Date.now()
            saveInput(Date.now())

        } else if (savedInput.filter(input => input.time < time).length == 0) {

            let lastInput = savedInput.sort((a, b) => a.time - b.time)[0]
            time = lastInput.time

            saveInput(lastInput.time)
            rollback(lastInput)
        } else {
            saveInput(time)

            let lastInput = savedInput.filter(input => input.time < time).sort((a, b) => a.time - b.time).slice(-1)[0]

            // Rollback to last known correct state
            rollback(lastInput)
        }
        savedInput = savedInput.filter(x => x.time >= Date.now() - 10000)
        return computePhysics(gameState, time)
    }

    let effects = []

    server.on('open', () => {

        console.log("\n            ______   __     ______     __  __        ______     ______     __    __     ______    \n           /\\  ___\\ /\\ \\   /\\  ___\\   /\\ \\_\\ \\      /\\  ___\\   /\\  __ \\   /\\ \"-./  \\   /\\  ___\\   \n           \\ \\  __\\ \\ \\ \\  \\ \\___  \\  \\ \\  __ \\     \\ \\ \\__ \\  \\ \\  __ \\  \\ \\ \\-./\\ \\  \\ \\  __\\   \n            \\ \\_\\    \\ \\_\\  \\/\\_____\\  \\ \\_\\ \\_\\     \\ \\_____\\  \\ \\_\\ \\_\\  \\ \\_\\ \\ \\_\\  \\ \\_____\\ \n             \\/_/     \\/_/   \\/_____/   \\/_/\\/_/      \\/_____/   \\/_/\\/_/   \\/_/  \\/_/   \\/_____/ \n                                                                                                  \n           ");
        console.log(`[server] Room code: ${server.id}`)
        // alert(`${location.origin}/Fishgame/src/game.html?room=${server.id}&server=0`)

        let connections = {}

        server.on("connection", (conn) => {
            console.log("[server] Added connection " + conn.peer);

            connections[conn.peer] = { heartbeat: 0, connection: conn }

            conn.on('open', () => {
                gameState = serverInput(Date.now(), INPUT_TYPES.connect, { id: conn.peer, color: Math.floor(Math.random() * 360) }).state

                conn.on('data', (data) => {
                    switch (data.type) {
                        case CONN_EVENTS.clientUpdate:
                            ({ state: newState, effects: newEffects } = serverInput(data.time, INPUT_TYPES.move, { input: data.data, id: conn.peer }))
                            effects = [...effects, ...newEffects]
                            gameState = newState
                            break;
                        case CONN_EVENTS.heartbeat:
                            conn.send({ type: CONN_EVENTS.heartbeatResponse })
                            break;
                        case CONN_EVENTS.heartbeatResponse:
                            connections[conn.peer].heartbeat = 0
                            break;
                        case CONN_EVENTS.metaDataChange:
                            ({ state: newState, effects: newEffects } = serverInput(Date.now(), INPUT_TYPES.settings, { name: data.data.name, color: data.data.color, id: conn.peer }))
                            effects = [...effects, ...newEffects]
                            gameState = newState
                            break;
                    }
                })

                conn.on('close', () => {
                    delete connections[conn.peer]
                    gameState = serverInput(Date.now(), INPUT_TYPES.disconnect, { id: conn.peer }).state
                })

                conn.send({ type: CONN_EVENTS.clientInit, data: gameState })
            })
        })

        // Update serverside physics
        setInterval(() => {
            ({ state: gameState } = computePhysics(gameState, lastTickUpdate))
        }, 1000 / 20) // 60 times per second

        // Emit server update to client
        setInterval(() => {
            Object.values(connections).forEach(conn => {
                conn.connection.send({ type: CONN_EVENTS.serverUpdate, data: { timeStamp: lastTickUpdate, state: gameState } });
                if (effects.length > 0)
                    conn.connection.send({ type: CONN_EVENTS.serverEffect, data: effects })
            })
            effects = []
        }, 1000 / 10)

        setInterval(() => {
            Object.values(connections).forEach(conn => {
                conn.connection.send({ type: CONN_EVENTS.heartbeat })
                conn.heartbeat++
                if (conn.heartbeat > 5) {
                    conn.connection.close()
                    delete connections[conn.peer]
                    gameState.players = gameState.players.filter(player => player.id !== conn.peer)
                }
            })
        }, 1000)

        setInterval(() => {
            gameState = serverInput(Date.now(), INPUT_TYPES.cache, {}).state
        }, 1000 / 0.5)

        startClient(serverId);
    })
}

if (isServer) {
    startServer();
}

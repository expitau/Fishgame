let client, serverConnection
let id

let connected = false;

let maps = [
    {
        currentMap: 0,
        colliders: "#$X",
        tilemap: [
            "                ",
            "      0S        ",
            "   ___[]___     ",
            "   ########     ",
            "   $          3E",
            "             _[]",
            "E     ____   ###",
            "]_    ####   $$$",
            "##              ",
            "$$  10    24 *  ",
            "$$__[]____[]_c__",
            "$$##############"
        ],
        spawnPoint: [
            375,
            75
        ],
        width: 16,
        height: 12,
        pixelSize: 6.25,
        tileSize: 50
    }
]

let gameState = {
    map: 0
}

function startClient(roomCode) {
    client = new Peer()

    client.on('open', (clientId) => {
        id = clientId
        console.log("Client connecting...")
        let conn = client.connect(roomCode)

        conn.on('open', () => {
            console.log("Client connected")
            serverConnection = conn
            conn.on('data', (data) => {
                switch (data.type) {
                    case CONN_EVENTS.clientInit:
                        gameState = data.data
                        connected = true
                        break;
                    case CONN_EVENTS.serverUpdate:
                        gameState = data.data.state
                        lastUpdate = data.data.timeStamp
                        timeOffset = Date.now() - lastUpdate;
                        break;
                }
            })
        })
    })
}


let timeOffset = 0;
let lastUpdate = Date.now()

function syncedTime() {
    return Date.now() - timeOffset
}

if (!isServer) {
    startClient(roomCode)
}

let client, serverConnection
let id

let connected = false;

let gameState = {
    map: 0
}

let screenShakeTime = 0;
let graphicsEffects = [];

let serverHeartbeat = 0;

function startClient(serverId) {
    client = new Peer();

    client.on('open', (clientId) => {
        id = clientId
        console.log("[client] connecting...");
        let conn = client.connect(SERVER_PREFIX + serverId);

        conn.on('open', () => {
            console.log("[client] connected");
            new p5(p => { window._p5 = p; p.setup = setupGame});
            serverConnection = conn;
            conn.on('data', (data) => {
                switch (data.type) {
                    case CONN_EVENTS.clientInit:
                        gameState = data.data;
                        connected = true;
                        sendClientPlayerData();
                        break;
                    case CONN_EVENTS.serverUpdate:
                        gameState = data.data.state;
                        lastUpdate = data.data.timeStamp;
                        timeOffset = 0.7 * timeOffset + 0.3 * (Date.now() - lastUpdate);
                        break;
                    case CONN_EVENTS.heartbeatResponse:
                        serverHeartbeat = 0;
                        break;
                    case CONN_EVENTS.heartbeat:
                        conn.send({ type: CONN_EVENTS.heartbeatResponse });
                        break;
                    case CONN_EVENTS.serverEffect:
                        graphicsEffects = [...graphicsEffects, ...data.data];
                        break;
                }
            })


            setInterval(() => {
                conn.send({ type: CONN_EVENTS.heartbeat });
                serverHeartbeat++;
                if (serverHeartbeat > 5) {
                    conn.close();
                    connected = false;
                    serverTimedOut();
                }
            }, 1000);
        });

        setTimeout(() => {
            if (connected === false) {
                conn.close();
                serverTimedOut();
            }
        }, 5000);
    })
}


let timeOffset = 0;
let lastUpdate = Date.now();

function syncedTime() {
    return Date.now() - timeOffset;
}

if (isClient && !isServer) {
    startClient(serverId);
}

function sendClientPlayerData(){
    let searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('name')) {
        displayName = searchParams.get('name');
    }

    if(displayName !== ''){
        serverConnection.send({ 
            type: CONN_EVENTS.metaDataChange, 
            data: {
                name: displayName, 
                color: displayColor
            } 
        });
    }
}

function renderLoop() {
    renderGraphics(gameState);
    window.requestAnimationFrame(renderLoop);
}

function setupGame() {
    setupGraphics(gameState);
    registerInputs();

    if (!(isMobile())) {
        document.body.requestPointerLock = document.body.requestPointerLock || document.body.mozRequestPointerLock || document.body.webkitRequestPointerLock;
        document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock || document.webkitExitPointerLock;
    }

    window.requestAnimationFrame(renderLoop);


    setInterval(() => {
        let deltaTime = Math.round(syncedTime() / 16) - Math.round(lastUpdate / 16);
        while (deltaTime > 0) {
            deltaTime -= 1;
            if (connected) {
                gameState = physicsTick(gameState).state;
            }
            lastUpdate = syncedTime();
        }
    }, 1000 / 60); // 60 times per second
}

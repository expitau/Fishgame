let isServer = false;
let isClient = false;
let roomCode;
let params = new URLSearchParams(window.location.search)

if (params.get('m')) {
    let mode = params.get('m')
    isServer = mode % 2 == 1;
    isClient = Math.floor(mode / 2) % 2 == 1;
} else {
    isClient = true
}

let mustConnect = isClient && !isServer

if (isClient && !isServer) {
    if (params.get("room")) {
        // Room code valid
        roomCode = params.get("room")
    } else {
        // Must connect, but no room code
        window.location.href = 'index.html'
    }
}
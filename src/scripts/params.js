let isServer = false;
let isClient = false;
let roomCode;
let params = new URLSearchParams(window.location.search)

if (params.get('m')) {
    let mode = params.get('m')
    isServer = mode % 2 == 1;
    isClient = Math.floor(mode / 2) % 2 == 1;
} else {
    window.location.href = 'index.html'
}
{
    let mustConnect = isClient && !isServer

    if (mustConnect && params.get("room") && params.get("room").toUpperCase() == params.get("room")) {
        // Room code valid
        roomCode = params.get("room")

    } else if (mustConnect && params.get("room")) {
        // Room code invalid
        roomCode = params.get("room").toUpperCase()
        params.set("room", roomCode)
        window.location.href = `?${params}`

    } else if (mustConnect) {
        // Must connect, but no room code
        window.location.href = 'index.html'
    }
}

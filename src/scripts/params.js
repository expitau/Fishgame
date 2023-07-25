let isServer = 0;
let roomCode;
let params = new URLSearchParams(window.location.search)

if (params.get("server") == 1) {
    isServer = true
} else if (params.get("server") == 0) {
    isServer = false
    if (params.get("room")) {
        roomCode = params.get("room")
    } else {
        code = prompt("Enter room code", "").toLowerCase()
        params.set("room", code)
        window.location.href = `?${params}`
    }
} else {
    params.set("server", 0)
    window.location.href = `?${params}`
}

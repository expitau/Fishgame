const socket = io(env.server);

let globalState = {
    playerData: {}
}

let localState = {
    leftKey: false,
    rightKey: false
}

let id = null;


/** Socket Connection **/
socket.on('connect', () => {
    console.log("You have connected as " + socket.id)
    id = socket.id;
})

socket.on('broadcastGlobalState', (state) => {
    globalState = state;
})

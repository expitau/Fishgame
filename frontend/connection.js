const socket = io(env.server);

let globalState = {}

let inputs = {}

let id = null;

/** Socket Connection **/
socket.on('connect', () => {
    console.log("You have connected as " + socket.id)
    id = socket.id;
})

socket.on('broadcastGlobalState', (state) => {
    globalState = state;
})

const socket = io(env.server);

let globalState = {}

let inputs = {}

let id = null;

function setInput(keyCode, value){

    let key;
    if (keyCode == 37 || keyCode == 65){
        key = "left"
    }
    if (keyCode == 39 || keyCode == 68){
        key = "right"
    }

    if (typeof key === 'undefined')
        return
    
    inputs[key] = value;
    socket.emit("keyEntered", inputs)
}

/** Socket Connection **/
socket.on('connect', () => {
    console.log("You have connected as " + socket.id)
    id = socket.id;
})

socket.on('broadcastGlobalState', (state) => {
    globalState = state;
})

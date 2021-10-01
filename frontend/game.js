document.addEventListener('DOMContentLoaded', init)
let canvas;
let context;
let mouseX;
let mouseY;

let localState = {
    x: 0,
    y: 0
}

let globalState = {
    players: {}
}

socket.on("return", (state) => {
    globalState = state;
})

function updateMousePos(evt) {
    let r = canvas.getBoundingClientRect();
    mouseX = evt.clientX - r.left;
    mouseY = evt.clientY - r.top;
    localState.x = mouseX;
    localState.y = mouseY;
}

String.prototype.toHex = function() {
    var hash = 0;
    if (this.length === 0) return hash;
    for (var i = 0; i < this.length; i++) {
        hash = this.charCodeAt(i) + ((hash << 5) - hash);
        hash = hash & hash;
    }
    var color = '#';
    for (var i = 0; i < 3; i++) {
        var value = (hash >> (i * 8)) & 255;
        color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
}

function init() {
    canvas = document.getElementById('canvas');
    context = canvas.getContext("2d")
    socket.emit('post', localState)
    window.requestAnimationFrame(gameLoop);
}

function gameLoop() {
    draw();
    socket.emit('get')
    socket.emit('post', localState)
    window.requestAnimationFrame(gameLoop);
}

function draw() {
    document.getElementById("counter").innerHTML = globalState.players[socket.id]?.x;
    context.fillStyle = "#FFFFFF";
    context.fillRect(0, 0, canvas.width, canvas.height)
    for(var id in globalState.players){
        context.fillStyle = id.toHex();
        context.fillRect(globalState.players[id].x, globalState.players[id].y, 4, 4)
    }
}
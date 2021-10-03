const socket = io('http://192.168.2.33:3000');

socket.on('connect', () => {
    console.log("You have connected as " + socket.id)
    app.id = socket.id;
})

var app = new Vue({
    el: '#app',
    data: {
        message: 'Hello vue!',
        count: 0,
        grid: {
            selected: -1,
            highlighted: -1,
        },
        id: 'disconnected',
    },
    methods: {
    }
})

document.addEventListener('DOMContentLoaded', () => {
    // display = new Display();
    gameLoop();
})

function gameLoop() {
    // display.background(10);
    socket.emit('getState')
    socket.emit('broadcastLocalState', {})
    window.requestAnimationFrame(gameLoop);
}
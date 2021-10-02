const socket = io('http://192.168.2.33:3000');

socket.on('connect', () => {
    console.log("You have connected as " + socket.id)
})

var app = new Vue({
    el: '#app',
    data: {
        message: 'Hello vue!'
    },
    methods: {
        press() {
            console.log("Meow")
            socket.emit("test")
        }
    }
})

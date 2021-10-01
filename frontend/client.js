const socket = io('http://192.168.2.33:3000');

socket.on('connect', () => {
    console.log("You have connected as " + socket.id)
})

// class Display {
//     colours = {
//         white: "#FFFFFF",
//         black: "#000000"
//     }

//     addEventListener(e, f){
//         this.canvas.addEventListener(e, f);
//     }

//     constructor() {
//         this.canvas = document.getElementById('canvas');
//         this.context = canvas.getContext("2d");
//         this.width = canvas.width;
//         this.height = canvas.height;
//         this.top = canvas.getBoundingClientRect().top;
//         this.left = canvas.getBoundingClientRect().left;
//     }

//     hashColour(str) {
//         var hash = 0;
//         if (str.length === 0) return hash;
//         for (var i = 0; i < str.length; i++) {
//             hash = str.charCodeAt(i) + ((hash << 5) - hash);
//             hash = hash & hash;
//         }
//         var color = '#';
//         for (var i = 0; i < 3; i++) {
//             var value = (hash >> (i * 8)) & 255;
//             color += ('00' + value.toString(16)).substr(-2);
//         }
//         return color;
//     }

//     fill(c1, c2, c3) {
//         if (typeof c1 === "string") {
//             this.context.fillStyle = c1;
//         } else if (typeof c1 === "number" && typeof c2 === "undefined" && typeof c3 === "undefined") {
//             this.context.fillStyle = "rgb(" + c1 + ", " + c1 + ", " + c1 + ")";
//         } else if (typeof c1 === "number") {
//             this.context.fillStyle = "rgb(" + c1 + ", " + c3 + ", " + c3 + ")";
//         } else {
//             this.context.fillStyle = "#000000"
//         }
//     }

//     rect(x, y, w, h) {
//         this.context.fillRect(x, y, w, h)
//     }

//     circle(x, y, r) {
//         this.context.beginPath()
//         this.context.arc(x, y, r, 0, Math.PI * 2)
//         this.context.fill()
//     }

//     background(c) {
//         this.fill(c)
//         this.context.fillRect(0, 0, canvas.width, canvas.height)
//     }
// }

const socket = io(`http://192.168.2.33:3000`);

function hashColour(str) {
    var hash = 0;
    if (str.length === 0) return hash;
    for (var i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
        hash = hash & hash;
    }
    var color = '#';
    for (var i = 0; i < 3; i++) {
        var value = (hash >> (i * 8)) & 255;
        color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
}

globalState = {
    users: {}
}

localState = {
    x: 0,
    y: 0
}
id = null

function setup() {
    createCanvas(400, 400)
}

socket.on('connect', () => {
    console.log("You have connected as " + socket.id)
    id = socket.id;
})

socket.on('broadcastGlobalState', (state) => {
    globalState = state;
})

function draw() {
    socket.emit('getGlobalState')
    if (mouseX >= 0 && mouseX <= 400)
        localState.x = mouseX;
    if (mouseY >= 0 && mouseY <= 400)
        localState.y = mouseY;
    render()
    socket.emit('broadcastLocalState', localState)
}

function render() {
    background(200)
    for (const [userId, user] of Object.entries(globalState.users)) {
        fill(hashColour(userId))
        ellipse(user.x, user.y, 10, 10);
        text(userId, user.x + 10, user.y - 5);
    }
}
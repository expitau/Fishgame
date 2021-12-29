const socket = io(`http://localhost:3000`);

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
    leftKey: false,
    rightKey: false
}
id = null;

/** Canvas Control **/
function setup() {
    createCanvas(windowWidth, windowHeight)
}

// Dynamically change the size of the canvas on window resize
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
 }

/** Socket Connection **/
socket.on('connect', () => {
    console.log("You have connected as " + socket.id)
    id = socket.id;
})

socket.on('broadcastGlobalState', (state) => {
    globalState = state;
})

/** Draw Function **/
function draw() {
    globalStateUpdate();
    if(globalState.users[id] !== undefined){
        render();
    }
}

/** Input Handling **/
let keys = [];
function keyPressed() {
    keys[keyCode] = true;
}
function keyReleased() {
    keys[keyCode] = false;
}

/** Update **/
function globalStateUpdate() {
    socket.emit('getGlobalState');

    localState.leftKey = (keys[37] || keys[65]); // left arrow or A key is pressed
    localState.rightKey = (keys[39] || keys[68]); // right or D key is pressed
    
    socket.emit('broadcastLocalState', localState);
}

/** Local Rendering **/
function render() {
    // Display World
    background('#222');
    
    push();
    translate(windowWidth/2 + globalState.users[id].cameraX, windowHeight/2 + globalState.users[id].cameraY);

    //World Outline
    stroke(255, 255, 255);
    strokeWeight(5);
    noFill();
    rect(0, 0, 800, 800);

    //Loop through players
    for (const [userId, user] of Object.entries(globalState.users)) {
        // Display player
        push();
        translate(user.x, user.y)
        rotate(radians(user.r));
        stroke(hashColour(userId));
        rect(-25, -25, 50, 50);
        point(-15,-18);
        point(15,-18);
        pop();
    }
    pop(); 
}
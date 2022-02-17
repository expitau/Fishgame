let id, gameMap, players = {};
let mouseIsPressed = false, mouseIsReleased = false;

let cursorData = {
    r: 0,
    x: 0, 
    y: 0,
    visible: true,
    max: 25,
    display: 60
};

let palette = {
    frame: '#222222'
};

// On initialize
function OnInit() {
}

function OnTick() {
    Physics.OnTick(players, gameMap);
}

// On frame
function OnRender() {
    image(graphics.background, 0, 0, Frame.width, Frame.height);

    // draw map
    graphics.displayMap();

    // draw players
    for(const [pid, player] of Object.entries(players)){
        fill(typeof pid == 'undefined' ? 0 : hashColour(pid))
        graphics.displayFishSprite(player.physics.x, player.physics.y, player.physics.r, player.physics.action);
    }

    if(mouseIsPressed && cursorData.x !== 0 && cursorData.y !== 0){
        graphics.displayCursorSprite(players[id].physics.x + sin(cursorData.r) * cursorData.display, players[id].physics.y + cos(cursorData.r) * cursorData.display, 0);
    }
}

function caclulateCursor(movementX, movementY){
    cursorData.x += movementX, 
    cursorData.y += movementY;

    let cursorDist = (cursorData.x**2 + cursorData.y**2)**0.5;
    if(cursorDist > cursorData.max){
        cursorData.x *= cursorData.max/cursorDist;
        cursorData.y *= cursorData.max/cursorDist;
    }

    cursorData.r = Math.atan2(cursorData.x, cursorData.y);
}

// On input
function OnInput(cursorR) {
    socket.emit("clientUpdate", {
        cursorR: cursorR
    })
}


///////////////////////////////////////////////////////


function hashColour(str) {
    let hash = 0;
    if (str.length === 0) return hash;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
        hash = hash & hash;
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
        let value = (hash >> (i * 8)) & 255;
        color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
}
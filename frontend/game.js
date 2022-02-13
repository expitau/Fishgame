let id, gameMap, players = {};

//let shared = new SharedFunctions();

let palette = {
    background: '#5EE6EB',
    outline:    '#000000',
    fill:       '#EBDD8D',
    fish:       '#EB75C4',
    water:      '#4A9EA1',
    frame:      '#222222'
};

// On initialize
function OnInit() {
}

function OnTick() {
    shared.physics({players: players}, gameMap);
}

// On frame
function OnRender() {
    fill (palette.background)
    rect(0,0,Frame.width,Frame.height);

    // draw map
    strokeWeight(3);
    stroke(palette.outline);
    fill(palette.fill);
    for(var i = 0; i < gameMap.width; i++){
        for(var j = 0; j < gameMap.height; j++){
            if (shared.getTile(gameMap, i, j) === "#") {
                rect(i * gameMap.tileSize, j * gameMap.tileSize, gameMap.tileSize, gameMap.tileSize);
            }
            if (shared.getTile(gameMap, i , j) === "M") {
                triangle(
                    i * gameMap.tileSize + gameMap.tileSize * 0.5, j * gameMap.tileSize, 
                    i * gameMap.tileSize, (j + 1) * gameMap.tileSize,
                    (i + 1) * gameMap.tileSize, (j + 1) * gameMap.tileSize
                );
            }
        }
    }
    
    // draw players
    for(const [pid, player] of Object.entries(players)){
        fill(typeof pid == 'undefined' ? 0 : hashColour(pid))
        ellipse(player.physics.x, player.physics.y, 20, 20);
    }
}

// On input
function OnInput(mouseX, mouseY) {
    socket.emit("clientUpdate", {
        mouseX: (mouseX - Frame.originX) * (Frame.width / Frame.screenWidth),
        mouseY: (mouseY - Frame.originY) * (Frame.width / Frame.screenWidth)
    })
}


///////////////////////////////////////////////////////


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
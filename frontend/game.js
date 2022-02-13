let id, gameMap, players = {};

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

function OnTick(players) {
    
    for (const [id, player] of Object.entries(players)) {
        // Update player
        let newPosX = player.physics.x + player.physics.vx;
        let newPosY = player.physics.y + player.physics.vy;

        if (getCurrentTile(gameMap, newPosX, player.physics.y) !== "#") {
            player.physics.x = newPosX;
        }else{
            player.physics.vx *= -0.9
        }
        if (getCurrentTile(gameMap, player.physics.x, newPosY) !== "#") {
            player.physics.y = newPosY;
        }else{
            player.physics.vy *= -0.9;
        }

        player.physics.vy += 0.06;
        player.physics.vy *= 0.999;
        player.physics.vx *= 0.995;

        if (getCurrentTile(gameMap, player.physics.x, player.physics.y) === "M") {
            player.physics.x = gameMap.spawnPoint[0];
            player.physics.y = gameMap.spawnPoint[1]; 
            player.physics.vy = 0;
            player.physics.vx = 0;   
        }
    }
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
            if (gameMap.tilemap[j].charAt(i) === "#") {
                rect(i * gameMap.tileSize, j * gameMap.tileSize, gameMap.tileSize, gameMap.tileSize);
            }
            if (gameMap.tilemap[j].charAt(i) === "M") {
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
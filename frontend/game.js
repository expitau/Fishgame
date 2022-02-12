let id, map, players = {},
    originX, originY, 
    bwidth = 800, bheight = 600,
    width, height,
    aspectRatio = 3/4,
    margins = 100;

let palette = {
    background: '#bdadea',
    outline:    '#2b3d41',
    fill:       '#4c5f6b',
    fish:       '#e57a44',
    water:      '#9cf6f6',
    frame:      '#222222'
};

// On initialize
function OnInit() {
}

// On frame
function OnRender() {
    // display canvas
    push();
    translate(originX, originY);
    scale(width / bwidth);
    Canvas();
    pop();

    // mask non-canvas area
    fill(palette.frame);
    noStroke();
    rect(0,0, originX, windowHeight);
    rect(0,0, windowWidth, originY);
    rect(originX + width, 0, originX, windowHeight);
    rect(0, originY + height, windowWidth, originY);
}

function Canvas() {
    background(palette.background);

    // draw map
    strokeWeight(3);
    stroke(palette.outline);
    fill(palette.fill);
    for(var i = 0; i < map.width; i++){
        for(var j = 0; j < map.height; j++){
            if (map.maps[map.currentMap][j].charAt(i) === "#") {
                rect(i * map.tileSize, j * map.tileSize, map.tileSize, map.tileSize);
            }
            if (map.maps[map.currentMap][j].charAt(i) === "M") {
                triangle(
                    i * map.tileSize + map.tileSize * 0.5, j * map.tileSize, 
                    i * map.tileSize, (j + 1) * map.tileSize,
                    (i + 1) * map.tileSize, (j + 1) * map.tileSize
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
        mouseX: (mouseX - originX) * (bwidth / width),
        mouseY: (mouseY - originY) * (bwidth / width)
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
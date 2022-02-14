let id, gameMap, players = {};

//let shared = new SharedFunctions();

let palette = {
    frame:      '#222222'
};

// On initialize
function OnInit() {
}

function OnTick() {
    Physics.OnTick(players, gameMap);
}

// On frame
function OnRender() {
    image(spritesheet.background, 0, 0, Frame.width,Frame.height);

    // draw map
    spritesheet.displayMap();
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
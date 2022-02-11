let id;
let players = {};

// On initialize
function OnInit() {

}

// On frame
function OnRender() {
    background("#222")

    for(const [id, player] of Object.entries(players)){
        stroke('red')
        strokeWeight(10)
        point(player.physics.x, player.physics.y)
    }
}

// On input
function OnInput(mouseX, mouseY) {
    socket.emit("clientUpdate", {
        mouseX: mouseX,
        mouseY: mouseY
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
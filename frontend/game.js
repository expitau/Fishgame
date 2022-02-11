let id;
let players = {};
let originX = 0;
let originY = 0;
let width = 800;
let height = 600;

// On initialize
function OnInit() {

}

// On frame
function OnRender() {
    // set origin point
    originX = (windowWidth - width)/2;
    originY = (windowHeight - height)/2;

    // display canvas
    push();
    translate(originX, originY);
    Canvas();
    pop();

    // mask non-canvas area
    fill("#222");
    noStroke();
    rect(0,0, originX, windowHeight);
    rect(0,0, windowWidth, originY);
    rect(originX + width, 0, originX, windowHeight);
    rect(0, originY + height, windowWidth, originY);
}

function Canvas() {
    background("#111");

    for(const [id, player] of Object.entries(players)){
        noStroke();
        fill(255, 0, 0);
        ellipse(player.physics.x, player.physics.y, 10, 10);
    }
}

// On input
function OnInput(mouseX, mouseY) {
    socket.emit("clientUpdate", {
        mouseX: mouseX - originX,
        mouseY: mouseY - originY
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
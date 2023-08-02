let cursorData = {
    r: 0,
    x: 0,
    y: 0,
    visible: false,
    max: 50,
    display: 60
};
let keys = [];
let mouseIsHeld = false;
let displayName = "";

function registerInputs() {
    _p5.mouseMoved = mouseMoved;
    _p5.mouseDragged = mouseDragged;
    _p5.mousePressed = mousePressed;
    _p5.doubleClicked = doubleClicked;
    _p5.mouseReleased = mouseReleased;
    _p5.keyPressed = keyPressed;
    _p5.keyReleased = keyReleased;
    _p5.windowResized = windowResized;
}

function windowResized() {
    resizeCanvas()
}

function onSettingsChange() {
    displayName = document.getElementById("nameInput").value;
    displayColor = document.getElementById("colorInput").value;
    updateColorDisplay()
    serverConnection.send({ type: CONN_EVENTS.metaDataChange, data: {name: displayName, color: displayColor} });
}

function updateColorDisplay() {
    displayColor = document.getElementById("colorInput").value;
    colorInputDisplay = document.getElementById("colorInputDisplay");
    colorInputDisplay.style.backgroundColor = (() => "rgb(" + HSBToRGB(displayColor, 100, 100).join(", ") + ")")();
}

function mouseMoved(e) {
}

function mouseDragged() {
    let movementX = _p5.mouseX - _p5.pmouseX;
    let movementY = _p5.mouseY - _p5.pmouseY;

    cursorData.x += movementX;
    cursorData.y += movementY;

    let cursorDist = (cursorData.x ** 2 + cursorData.y ** 2) ** 0.5;
    if (cursorDist > cursorData.max) {
        cursorData.x *= cursorData.max / cursorDist;
        cursorData.y *= cursorData.max / cursorDist;
    }

    cursorData.r = Math.atan2(cursorData.x, cursorData.y);
}

function isMobile() {
    return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
}

function mousePressed() {
    mouseIsHeld = true;
    cursorData.x = 0;
    cursorData.y = 0;

    if (!(isMobile())) {
        // document.body.requestPointerLock();
    }
}

function doubleClicked() {
    _p5.fullscreen(!_p5.fullscreen());
}

function mouseReleased() {
    mouseIsHeld = false;

    if (cursorData.x != 0 && cursorData.y != 0) {
        gameState = physicsInput(gameState, INPUT_TYPES.move, { input: { cursorR: cursorData.r }, id: client.id }).state;
        serverConnection.send({ type: CONN_EVENTS.clientUpdate, data: { cursorR: cursorData.r }, time: syncedTime() });
        cursorData.x = 0;
        cursorData.y = 0;
    }
}

function keyPressed() {
    keys[_p5.keyCode] = true;
}

function keyReleased() {
    keys[_p5.keyCode] = false;
}

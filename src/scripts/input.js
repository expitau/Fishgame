let cursorData = {
    r: 0,
    x: 0,
    y: 0,
    visible: false,
    max: 50,
    display: 60
};
let mouseIsHeld = false;
let displayName = '';
let displayColor = Math.floor(Math.random() * 360);
let settingsOpen = false;

function registerInputs() {
    _p5.mouseDragged = mouseDragged;
    _p5.mousePressed = mousePressed;
    _p5.doubleClicked = doubleClicked;
    _p5.mouseReleased = mouseReleased;
    _p5.windowResized = windowResized;
}

function windowResized() {
    resizeCanvas()
}

function onSettingsChange() {
    displayName = document.getElementById('nameInput').value;
    displayColor = document.getElementById('colorInput').value;
    updateColorDisplay()
    serverConnection.send({ 
        type: CONN_EVENTS.metaDataChange, 
        data: {
            name: displayName, 
            color: displayColor
        } 
    });
}


function updateColorDisplay() {
    const colorSlider = document.getElementById('colorInput');
    colorInputDisplay = document.getElementById('colorInputDisplay');
    const colorString = (() => 'rgb(' + HSBToRGB(colorSlider.value, 100, 100).join(', ') + ')')();
    colorInputDisplay.style.color = colorString;
    colorSlider.style['accent-color'] = colorString;
}

function mouseDragged() {
    if(settingsOpen) return;

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
    if(settingsOpen) return;

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
    if(settingsOpen) return;
    
    mouseIsHeld = false;

    if (cursorData.x != 0 && cursorData.y != 0) {
        // gameState = physicsInput(gameState, INPUT_TYPES.move, { input: { cursorR: cursorData.r }, id: client.id }).state;
        serverConnection.send({ type: CONN_EVENTS.clientUpdate, data: { cursorR: cursorData.r }, time: syncedTime() });
        cursorData.x = 0;
        cursorData.y = 0;
    }
}

const cursorData = {
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
const keysPressed = [];

let keyInputs = {
    up: false,
    down: false,
    right: false,
    left: false
};

function registerInputs() {
    keysPressed[37] = false;
    keysPressed[38] = false;
    keysPressed[39] = false;
    keysPressed[40] = false;
    
    _p5.mouseDragged = mouseDragged;
    _p5.mousePressed = mousePressed;
    _p5.doubleClicked = doubleClicked;
    _p5.mouseReleased = mouseReleased;
    _p5.windowResized = windowResized;
    _p5.keyPressed = keyPressed;
    _p5.keyReleased = keyReleased;
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

    cursorData.x += _p5.mouseX - _p5.pmouseX;
    cursorData.y += _p5.mouseY - _p5.pmouseY;

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
    _p5.cursor(_p5.ARROW);
    if (settingsOpen) return;

    mouseIsHeld = true;
    cursorData.x = 0;
    cursorData.y = 0;

    /*if (!(isMobile())) {
        document.body.requestPointerLock();
    }*/
}

function sendInput(){
    if (cursorData.x != 0 || cursorData.y != 0) {
        // gameState = physicsInput(gameState, INPUT_TYPES.move, { input: { cursorR: cursorData.r }, id: client.id }).state;

        serverConnection.send({ 
            type: CONN_EVENTS.clientUpdate,
            data: { cursorR: cursorData.r }, 
            time: syncedTime() 
        });

        cursorData.x = 0;
        cursorData.y = 0;
    }
}

function updateCursorFromKeyboard() {
    const arrowKeyInput = keysPressed[37] || keysPressed[38] || keysPressed[39] || keysPressed[40];
    if (arrowKeyInput) {
        mouseIsHeld = true;
        cursorData.x = keyInputs.left * -50 + keyInputs.right * 50;
        cursorData.y = keyInputs.up * -50 + keyInputs.down * 50;
        cursorData.r = Math.atan2(cursorData.x, cursorData.y);
    } else if (mouseIsHeld) {
        mouseIsHeld = false;
        sendInput();
    }
}

function updateKeyInputs(){
    keyInputs = {
        up: keysPressed[38],
        down: keysPressed[40],
        right: keysPressed[39],
        left: keysPressed[37]
    };
}

function keyPressed() {
    keysPressed[_p5.keyCode] = true;
    updateKeyInputs();
    updateCursorFromKeyboard();
}

function keyReleased() {
    keysPressed[_p5.keyCode] = false;
    setTimeout(() => {
        updateKeyInputs();
        cursorData.x = keyInputs.left * -50 + keyInputs.right * 50;
        cursorData.y = keyInputs.up * -50 + keyInputs.down * 50;
        cursorData.r = Math.atan2(cursorData.x, cursorData.y);
    }, 100);
    updateCursorFromKeyboard();
}

function doubleClicked() {
    if(isMobile()) toggleFullscreen();
}

function mouseReleased() {
    if(settingsOpen) return;

    mouseIsHeld = false;
    sendInput();
}

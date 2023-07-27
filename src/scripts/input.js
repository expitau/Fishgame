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

function registerInputs() {
    _p5.mouseMoved = mouseMoved;
    _p5.mouseDragged = mouseDragged;
    _p5.mousePressed = mousePressed;
    _p5.doubleClicked = doubleClicked;
    _p5.mouseReleased = mouseReleased;
    _p5.keyPressed = keyPressed;
    _p5.keyReleased = keyReleased;
}

function mouseMoved(e) {
    // let movementX = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
    // let movementY = e.movementY || e.mozMovementY || e.webkitMovementY || 0;

    // {
    //     cursorData.x += movementX;
    //     cursorData.y += movementY;

    //     let cursorDist = (cursorData.x ** 2 + cursorData.y ** 2) ** 0.5;
    //     if (cursorDist > cursorData.max) {
    //         cursorData.x *= cursorData.max / cursorDist;
    //         cursorData.y *= cursorData.max / cursorDist;
    //     }

    //     cursorData.r = Math.atan2(cursorData.x, cursorData.y);
    // }
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
    toggleFullScreen();
}

function mouseReleased() {
    mouseIsHeld = false;

    if (cursorData.x != 0 && cursorData.y != 0) {
        // physicsInput(gameState, {
        //     cursorR: cursorData.r
        // }, id);
        serverConnection.send({ type: CONN_EVENTS.clientUpdate, data: { cursorR: cursorData.r } });
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

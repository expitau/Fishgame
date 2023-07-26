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

function setupInputs() {
    document.addEventListener("mousemove", (e) => {mouseMoved(e); mouseIsHeld && mouseDragged(e)}, false);
    document.addEventListener("mousedown", mousePressed, false);
    document.addEventListener("mouseup", mouseReleased, false);
    
}

function mouseMoved(e) {
    console.log("mouseMoved")
    let movementX = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
    let movementY = e.movementY || e.mozMovementY || e.webkitMovementY || 0;

    {
        cursorData.x += movementX;
        cursorData.y += movementY;

        let cursorDist = (cursorData.x ** 2 + cursorData.y ** 2) ** 0.5;
        if (cursorDist > cursorData.max) {
            cursorData.x *= cursorData.max / cursorDist;
            cursorData.y *= cursorData.max / cursorDist;
        }

        cursorData.r = Math.atan2(cursorData.x, cursorData.y);
    }
}

function mouseDragged() {
    console.log("mouseDragged")
    if (isMobile()) {
        let movementX = mouseX - pmouseX;
        let movementY = mouseY - pmouseY;

        {
            cursorData.x += movementX;
            cursorData.y += movementY;

            let cursorDist = (cursorData.x ** 2 + cursorData.y ** 2) ** 0.5;
            if (cursorDist > cursorData.max) {
                cursorData.x *= cursorData.max / cursorDist;
                cursorData.y *= cursorData.max / cursorDist;
            }

            cursorData.r = Math.atan2(cursorData.x, cursorData.y);
        }
    }
}

function isMobile() {
    return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
}

function mousePressed() {
    console.log("mousePressed")
    mouseIsHeld = true;
    cursorData.x = 0;
    cursorData.y = 0;

    if (!(isMobile())) {
        // document.body.requestPointerLock();
    }
}

function doubleClicked() {
    console.log("doubleClicked")
    toggleFullScreen();
}

function mouseReleased() {
    console.log("mouseReleased")
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
    console.log("keyPressed")
    keys[keyCode] = true;
}

function keyReleased() {
    console.log("keyReleased")
    keys[keyCode] = false;
}

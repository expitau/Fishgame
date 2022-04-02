let mouseIsPressed = false;
let mouseIsHeld = false;
let mouseIsReleased = false;

let keys = [];

let cursorData = {
    r: 0,
    x: 0,
    y: 0,
    visible: false,
    max: 50,
    display: 60
};

function OnMouseMove(e) {
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
    mouseIsPressed = !mouseIsHeld;
    mouseIsHeld = true;
}

function doubleClicked() {
    toggleFullScreen();
}

function mouseReleased() {
    mouseIsHeld = false;
    mouseIsReleased = true;
}

function keyPressed() {
    keys[keyCode] = true;
}

function keyReleased() {
    keys[keyCode] = false;
}
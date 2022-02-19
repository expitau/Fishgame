let mouseIsPressed = false, 
    mouseIsHeld = false;;
    mouseIsReleased = false;

let cursorData = {
    r: 0,
    x: 0, 
    y: 0,
    visible: false,
    max: 50,
    display: 60
};

let Input = class{
    constructor() {
        document.body.requestPointerLock = document.body.requestPointerLock || document.body.mozRequestPointerLock || document.body.webkitRequestPointerLock;
        document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock || document.webkitExitPointerLock;
        document.addEventListener("mousemove", this.moveCallback, false);
    }

    update() {
        if(mouseIsPressed){
            cursorData.x = 0;
            cursorData.y = 0;
            document.body.requestPointerLock();
        }

        if(mouseIsReleased && cursorData.x != 0 && cursorData.y != 0){
            socket.emit("clientUpdate", {
                cursorR: cursorData.r
            });
            cursorData.x = 0;
            cursorData.y = 0;
        }
    }

    reset(){
        mouseIsReleased = false;
        mouseIsPressed = false;
    }

    moveCallback(e) {
        let movementX = e.movementX || e.mozMovementX || e.webkitMovementX || mouseX-pmouseX;
        let movementY = e.movementY || e.mozMovementY || e.webkitMovementY || mouseY-pmouseY;
        
        cursorData.x += movementX; 
        cursorData.y += movementY;
    
        let cursorDist = (cursorData.x**2 + cursorData.y**2)**0.5;
        if(cursorDist > cursorData.max){
            cursorData.x *= cursorData.max/cursorDist;
            cursorData.y *= cursorData.max/cursorDist;
        }
    
        cursorData.r = Math.atan2(cursorData.x, cursorData.y);
    }
}

function mousePressed() {
    mouseIsPressed = !mouseIsHeld;
    mouseIsHeld = true;
}

function mouseReleased(){
    mouseIsHeld = false;
    mouseIsReleased = true;
}
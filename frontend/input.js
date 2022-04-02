let mouseIsPressed = false, 
    mouseIsHeld = false;;
    mouseIsReleased = false;

let keys = [];

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
        if(!(isMobile())){
            document.body.requestPointerLock = document.body.requestPointerLock || document.body.mozRequestPointerLock || document.body.webkitRequestPointerLock;
            document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock || document.webkitExitPointerLock;
            document.addEventListener("mousemove", this.moveCallback, false);
        }
    }

    update() {
        // exit pointer lock if "esc" or "p" are pressed
        if(keys[27] || keys[80]){
            document.exitPointerLock();
        }
        
        if(mouseIsPressed){
            cursorData.x = 0;
            cursorData.y = 0;
            
            if(!(isMobile())){
                document.body.requestPointerLock();
            }
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
        let movementX = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
        let movementY = e.movementY || e.mozMovementY || e.webkitMovementY || 0;
        input.cursorMove(movementX, movementY);
    }

    cursorMove(movementX, movementY){
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

function mouseDragged(){
    if(isMobile()){
        let movementX = mouseX - pmouseX; 
        let movementY = mouseY - pmouseY; 
        input.cursorMove(movementX, movementY);
    }
}

function isMobile(){
    return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
}

function mousePressed() {
    mouseIsPressed = !mouseIsHeld;
    mouseIsHeld = true;
}

function doubleClicked() {
    toggleFullScreen();
}

function mouseReleased(){
    mouseIsHeld = false;
    mouseIsReleased = true;
}

function keyPressed(){
    keys[keyCode] = true;
}

function keyReleased(){
    keys[keyCode] = false;
}
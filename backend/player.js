module.exports = class Player{
    constructor(id){
        this.id = id;
        this.x = 500;
        this.y = 500;
        this.r = 0;
        this.cameraX = 0;
        this.cameraY = 0;
        this.input = new PlayerInput();
    };


    // This method extracts and returns data that the client needs to know about.
    getClientProps(){
        return {
            x: this.x, 
            y: this.y, 
            r: this.r,
            cameraX: this.cameraX,
            cameraY: this.cameraY
        }
    }

    updateInput(keyCode, value){
        if (keyCode == 37 || keyCode == 65){
            this.input.left = value;
        }
        if (keyCode == 39 || keyCode == 68){
            this.input.right = value;
        }
    }

    tick(deltaTime){
        let speed = 100 * deltaTime / 1000;
        
        if(this.input.right){
            this.r += 2 * speed;
        }
        if(this.input.left){
            this.r -= 2 * speed;
        }
        
        this.x += Math.sin(degToRad(this.r)) * speed;
        this.y -= Math.cos(degToRad(this.r)) * speed;
        
        this.x = Math.min(Math.max(this.x, 0), gameState.map.width);
        this.y = Math.min(Math.max(this.y, 0), gameState.map.height);
        
        this.cameraX = -this.x;
        this.cameraY = -this.y;
    }
}

function degToRad(r){
    return r *(Math.PI / 180);
}

class PlayerInput{
    constructor(){
        this.left = false;
        this.right = false;
    }
}
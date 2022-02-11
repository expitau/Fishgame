class PlayerPhysics {
    constructor(x = 0, y = 100) {
        this.x = x;
        this.y = y;
        this.r = 0;
        this.vx = 0;
        this.vy = 0;
    }
}

module.exports = class Player{
    constructor(id){
        this.id = id;
        this.physics = new PlayerPhysics();
        this.input = {
            mouseX: 0,
            mouseY: 0
        };
    };
}
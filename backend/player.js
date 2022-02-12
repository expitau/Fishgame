class PlayerPhysics {
    constructor() {
        this.x = gameMap.spawnPoint[0];
        this.y = gameMap.spawnPoint[1];
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
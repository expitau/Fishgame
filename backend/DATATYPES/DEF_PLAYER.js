let Player = class {
    constructor(id){
        this.id = id;
        this.physics = {
            x: gameMap.spawnPoint[0],
            y: gameMap.spawnPoint[1],
            r: 0,
            vx: 0,
            vy: 0
        }
        this.input = {
            mouseX: 0,
            mouseY: 0
        };
    };
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined'){
    module.exports = Player
}
let Player = class {
    constructor(id){
        this.id = id;
        this.color = Math.floor(Math.random() * 360);
        this.health = 3;
        this.physics = {
            x: gameMap.spawnPoint[0],
            y: gameMap.spawnPoint[1],
            r: 0,
            vx: 0,
            vy: 0,
            vr: 0,
            action: 0,
        }
        this.input = {
            cursorR: 0
        };
    };
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined'){
    module.exports = Player
}
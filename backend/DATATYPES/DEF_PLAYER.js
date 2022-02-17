let Player = class {
    constructor(id){
        this.id = id;
        this.physics = {
            x: gameMap.spawnPoint[0],
            y: gameMap.spawnPoint[1],
            r: 0,
            vx: 0,
            vy: 0,
            vr: 0,
            action: 0,
            slap: false
        }
        this.input = {
            cursorR: 0
        };
    };
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined'){
    module.exports = Player
}
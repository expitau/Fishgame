module.exports = Player

function Player (id, gameMap){
    return {
        id: id,
        color: Math.floor(Math.random() * 360),
        health: 3,
        physics: {
            x: gameMap.spawnPoint[0],
            y: gameMap.spawnPoint[1],
            r: 0,
            vx: 0,
            vy: 0,
            vr: 0,
            action: 0,
        },
        input: {
            cursorR: 0
        }
    }
}
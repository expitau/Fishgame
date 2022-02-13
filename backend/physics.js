
module.exports = class Physics{
    static OnTick (players, gameMap) {
        players = shared.physics({players: players}, gameMap);
    }

    static OnInput (player){
        let dx = player.input.mouseX -  player.physics.x 
        let dy = player.input.mouseY - player.physics.y
        dx /= (dx**2 + dy**2)**0.5
        dy /= (dx**2 + dy**2)**0.5
        player.physics.vy += -5*dy;
        player.physics.vx += -5*dx;
    }
}

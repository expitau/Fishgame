let Physics = class {
    static OnTick (players, gameMap) {
        for (const [id, player] of Object.entries(players)) {
            let newPosX = player.physics.x + player.physics.vx;
            let newPosY = player.physics.y + player.physics.vy;
            
            if (gameMap.getCurrentTile(newPosX, player.physics.y) !== "#") {
                player.physics.x = newPosX;
            }else{
                player.physics.vx *= -0.9
            }
            if (gameMap.getCurrentTile(player.physics.x, newPosY) !== "#") {
                player.physics.y = newPosY;
            }else{
                player.physics.vy *= -0.9;
            }

            player.physics.vy += 0.06;
            player.physics.vy *= 0.999;
            player.physics.vx *= 0.995;

            if (gameMap.getCurrentTile(player.physics.x, player.physics.y) === "M") {
                player.physics.x = gameMap.spawnPoint[0];
                player.physics.y = gameMap.spawnPoint[1]; 
                player.physics.vy = 0;
                player.physics.vx = 0;   
            }
        }
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

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined'){
    module.exports = Physics
}

let Physics = class {
    static OnTick (players, gameMap) {
        for (const [id, player] of Object.entries(players)) {
            let newPosX = player.physics.x + player.physics.vx;
            let newPosY = player.physics.y + player.physics.vy;
            
            if (gameMap.getCurrentTile(newPosX, player.physics.y) !== "#") {
                player.physics.x = newPosX;
            }else{
                player.physics.vx *= -0.9;
                player.physics.vr = player.physics.vy * (player.physics.vx > 0 ? 1 : -1) * 0.015;
            }
            if (gameMap.getCurrentTile(player.physics.x, newPosY) !== "#") {
                player.physics.y = newPosY;
            }else{
                player.physics.vy *= -0.9;

                if(Math.abs(player.physics.vx) > 0.7){
                    player.physics.vr = player.physics.vx * (player.physics.vy > 0 ? -0.5 : 1) * 0.02;
                }else{
                    player.physics.vr = player.physics.vx * (player.physics.vy > 0 ? 1 : -1) * 0.005;
                }
                
                if(Math.abs(player.physics.vr) < 0.2){
                    if(player.physics.r < Math.PI/2){
                        player.physics.r *= 0.6;
                    }else if(player.physics.r > Math.PI * 3/2){
                        player.physics.r = 2 * Math.PI + (player.physics.r - 2 * Math.PI) * 0.6;
                    }else{
                        player.physics.r = Math.PI + (player.physics.r - Math.PI) * 0.6;
                    }
                }
            }

            player.physics.vy += 0.06;
            player.physics.vy *= 0.998;
            player.physics.vx *= 0.997;
            player.physics.vr *= 0.995;

            player.physics.r += player.physics.vr;

            player.physics.r = ((Math.PI * 4) + player.physics.r) % (Math.PI * 2);

            
            let vAngle = ((Math.PI * 2) + Math.atan2(player.physics.vy, player.physics.vx)) % (Math.PI * 2);

            if(player.physics.vy**2 + player.physics.vx**2 < 1){
                player.physics.action = 0;
            }else if(Math.abs(((Math.PI * 4) + player.physics.r + Math.PI/2) % (Math.PI * 2) - vAngle) < Math.PI/2){
                player.physics.action = 2;
            }else{
                player.physics.action = 1;
            }
            
            if (gameMap.getCurrentTile(player.physics.x, player.physics.y) === "M") {
                player.physics.x = gameMap.spawnPoint[0];
                player.physics.y = gameMap.spawnPoint[1]; 
                player.physics.vy = 0;
                player.physics.vx = 0;   
            }
        }
    }

    static OnInput (player){
        let inRange = false;
        for(let i = -1; i <= 1; i ++){
            for(let j = -1; j <= 1; j ++){
                if(gameMap.getCurrentTile(player.physics.x + i * gameMap.tileSize * 0.3, player.physics.y + j * gameMap.tileSize * 0.3) === "#"){
                    inRange = true;
                }
            }
        }
        
        let dx = Math.sin(player.input.cursorR);
        let dy = Math.cos(player.input.cursorR);


        for(let i = -1; i <= 1; i ++){
            for(let j = -1; j <= 1; j ++){
                if(gameMap.getCurrentTile(player.physics.x + dx * 60  + i * gameMap.tileSize * 0.3, player.physics.y + dy * 60 + j * gameMap.tileSize * 0.3) === "#"){
                    inRange = true;
                }
            }
        }

        if(inRange){
            player.physics.vy = -7*dy;
            player.physics.vx = -7*dx;
            player.physics.vr = 0.2;
        }
    }
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined'){
    module.exports = Physics
}

let shared;
(function() {
    var SharedFunctions = function() {
        this.getTile = function(gameMap, x, y){
            if (0 <= x && x < gameMap.width && 0 <= y && y < gameMap.height){
                return gameMap.tilemap[y].charAt(x);
            }
            return "#";
        }

        this.getCurrentTile = function(gameMap, x, y){
            if (0 < x && x < gameMap.width * gameMap.tileSize && 0 < y && y < gameMap.height * gameMap.tileSize){
                return gameMap.tilemap[Math.floor(y / gameMap.tileSize)].charAt(Math.floor(x / gameMap.tileSize));
            }
            return "#";
        }

        this.physics = function(players, gameMap) {
            for (const [id, player] of Object.entries(players.players)) {
                // Update player
                let newPosX = player.physics.x + player.physics.vx;
                let newPosY = player.physics.y + player.physics.vy;
                
                if (this.getCurrentTile(gameMap, newPosX, player.physics.y) !== "#") {
                    player.physics.x = newPosX;
                }else{
                    player.physics.vx *= -0.9
                }
                if (this.getCurrentTile(gameMap, player.physics.x, newPosY) !== "#") {
                    player.physics.y = newPosY;
                }else{
                    player.physics.vy *= -0.9;
                }
    
                player.physics.vy += 0.06;
                player.physics.vy *= 0.999;
                player.physics.vx *= 0.995;
    
                if (this.getCurrentTile(gameMap, player.physics.x, player.physics.y) === "M") {
                    player.physics.x = gameMap.spawnPoint[0];
                    player.physics.y = gameMap.spawnPoint[1]; 
                    player.physics.vy = 0;
                    player.physics.vx = 0;   
                }
            }
        }
    }
    
    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined'){
        module.exports = SharedFunctions;
    }
    else{
        shared = new SharedFunctions();
    }
})();
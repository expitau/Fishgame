
module.exports = class Physics{
    static OnTick (players) {
        for (const [id, player] of Object.entries(players)) {
            // Update player
            player.physics.x+=player.physics.vx;
            player.physics.y += player.physics.vy;
            if (player.physics.y >= 600){
                player.physics.y = 600;
                player.physics.vy *= -0.8;
            }
            if (player.physics.x >= 800){
                player.physics.x = 800
                player.physics.vx *= -0.8
            }
            if (player.physics.x <= 0){
                player.physics.x = 0
                player.physics.vx *= -0.8
            }
            
            player.physics.vy += 0.05;
            player.physics.vy *= 0.999;
            player.physics.vx *= 0.995;
        }
    }

    static OnInput (player){
        player.physics.x = player.input.mouseX;
        player.physics.y = player.input.mouseY;
        player.physics.vy = -2;
        player.physics.vx = 10;
    }
}

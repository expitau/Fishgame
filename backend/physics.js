
module.exports = class Physics{
    static OnTick (players) {
        for (const [id, player] of Object.entries(players)) {
            // Update player
            player.physics.x += player.physics.vx;
            player.physics.y += player.physics.vy;
            if (player.physics.y >= 600){
                player.physics.y = 600;
                player.physics.vy *= -0.9;
            }
            if (player.physics.x >= 800){
                player.physics.x = 800
                player.physics.vx *= -0.9
            }
            if (player.physics.x <= 0){
                player.physics.x = 0
                player.physics.vx *= -0.9
            }
            
            player.physics.vy += 0.05;
            player.physics.vy *= 0.999;
            player.physics.vx *= 0.995;
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

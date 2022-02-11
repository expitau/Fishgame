
module.exports = class Physics{
    static OnTick (players) {
        for (const [id, player] of Object.entries(players)) {
            // Update player
            player.physics.x+=1;
        }
    }

    static OnInput (player){
        player.physics.x = player.input.mouseX;
        player.physics.y = player.input.mouseY;
    }
}

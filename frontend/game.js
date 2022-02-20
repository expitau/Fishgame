// Create global variables
let id, players = {};
let gameMap, effects, frame, graphics, input;

// On initialize
function OnInit() {
    effects = new Effects();
    frame = new Frame();
    graphics = new Graphics();
    input = new Input();
}

// On game tick (game logic only)
function OnTick() {
    // calculate physics
    Physics.OnTick(players, gameMap);

    // update effects
    effects.update();
}

// On frame render (visuals only)
function OnRender() {
    // draw background
    image(graphics.background, 0, 0, frame.width, frame.height);

    // draw player shadows
    for(const [pid, player] of Object.entries(players)){
        graphics.displayFishShadowSprite(player);
    }

    // draw map
    for(let i = 0; i < gameMap.width; i++){
        for(let j = 0; j < gameMap.height; j++){
            // Add shadows TEMP, WILL BE REPLACED WITH SPRITE SOLUTION
            strokeWeight(1);
            stroke('#c8b064');
            fill('#c8b064');
            if(gameMap.isCollider(gameMap.getTile(i, j)) && !gameMap.isCollider(gameMap.getTile(i, j+1))){
                rect(i * gameMap.tileSize, (j + 1) * gameMap.tileSize, gameMap.tileSize, gameMap.pixelSize * 2);
            }
            if(gameMap.isCollider(gameMap.getTile(i, j)) && !gameMap.isCollider(gameMap.getTile(i+1, j))){
                rect((i + 1) * gameMap.tileSize, j * gameMap.tileSize, gameMap.pixelSize, gameMap.pixelSize * 10);
            }

            // Draw tiles
            graphics.displayTileSprite(gameMap.getTile(i, j), i, j);
        }
    }

    // icons
    for(let i = 0; i < 3; i++){
        graphics.displayIconSprite((gameMap.width * 8 - (i + 1) * 8) * gameMap.pixelSize, gameMap.pixelSize, 0, (players[id].health > i) ? 0 : 1, 2);
    }

    //for(let i = 0; i < players[id].water; i++){
    //    graphics.displayIconSprite((1 + i * 8) * gameMap.pixelSize, gameMap.pixelSize, 1, (players[id].water > i) ? 0 : 1);
    //}

    // draw players
    for(const [pid, player] of Object.entries(players)){
        graphics.displayFishSprite(player);
    }

    // draw cursor
    if(mouseIsHeld){
        let player = players[id];
        if(cursorData.x !== 0 && cursorData.y !== 0){
            let cursorX = align(player.physics.x) + sin(cursorData.r) * cursorData.display;
            let cursorY = align(player.physics.y) + cos(cursorData.r) * cursorData.display;
            let pvp = false;

            // check if you can attack another player
            for(const [opid, otherPlayer] of Object.entries(players)){
                if(opid !== id){
                    if(((player.physics.x + sin(cursorData.r) * cursorData.display- otherPlayer.physics.x)**2 + (player.physics.y + cos(cursorData.r) * cursorData.display - otherPlayer.physics.y)**2)**0.5 < 5 * gameMap.pixelSize || 
                      ((player.physics.x - otherPlayer.physics.x)**2 + (player.physics.y - otherPlayer.physics.y)**2)**0.5 < 7 * gameMap.pixelSize){
                        pvp = true;
                    }
                }
            }

            graphics.displayCursorSprite(cursorX, cursorY, pvp?0:!gameMap.getCollisionArea(cursorX, cursorY), pvp);
        }
    }

    // draw effects
    effects.display();
}
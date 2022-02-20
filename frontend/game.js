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
            graphics.displayCursorSprite(cursorX, cursorY, !gameMap.getCollisionArea(cursorX, cursorY));
        }
    }

    // draw effects
    effects.display();
}
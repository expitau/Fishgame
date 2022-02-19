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
            graphics.displayTileSprite(gameMap.getTile(i, j), i, j);
        }
    }

    // draw players
    for(const [pid, player] of Object.entries(players)){
        graphics.displayFishSprite(player.physics.x, player.physics.y, player.physics.r, player.physics.action, pid);
    }

    // draw cursor
    if(mouseIsHeld){
        let player = players[id];
        if(cursorData.x !== 0 && cursorData.y !== 0){
            let cursorX = align(player.physics.x) + sin(cursorData.r) * cursorData.display;
            let cursorY = align(player.physics.y) + cos(cursorData.r) * cursorData.display;
            graphics.displayCursorSprite(cursorX, cursorY, !gameMap.getTileCluster(cursorX, cursorY));
        }
    }

    // draw effects
    effects.display();
}